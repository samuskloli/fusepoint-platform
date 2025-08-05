import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { superAdminAPI } from '../../services/superAdminAPI';

function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    action_type: '',
    search: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState(null);

  const actionTypes = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'auth', label: 'Authentification' },
    { value: 'backup', label: 'Sauvegarde' },
    { value: 'database', label: 'Base de données' },
    { value: 'security', label: 'Sécurité' },
    { value: 'system', label: 'Système' }
  ];

  useEffect(() => {
    loadLogs();
  }, [page, rowsPerPage, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage
      };
      
      // Ajouter les filtres appropriés pour les logs système
      if (filters.action_type) {
        params.category = filters.action_type; // Mapper action_type vers category
      }
      if (filters.search) {
        params.search = filters.search;
      }
      
      console.log('📡 Envoi requête logs avec params:', params);
      
      const response = await superAdminAPI.getLogs(params);
      console.log('📊 Réponse API reçue:', response);
      // L'API retourne { success: true, data: { logs: [...], pagination: {...} } }
      const logsData = response.data?.data?.logs || response.data?.logs || response.logs || [];
      console.log('📊 Logs reçus:', logsData.length, 'logs');
      setLogs(logsData);
      setTotalLogs(response.data?.data?.pagination?.total || logsData.length);
    } catch (err) {
      console.error('Erreur chargement logs:', err);
      setError('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
    setPage(0); // Reset à la première page
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'auth': 'primary',
      'backup': 'secondary',
      'database': 'info',
      'security': 'error',
      'system': 'success'
    };
    return colors[category] || 'default';
  };

  const getLevelColor = (level) => {
    const colors = {
      'error': 'error',
      'warning': 'warning',
      'info': 'info',
      'debug': 'default'
    };
    return colors[level] || 'default';
  };

  const getCategoryLabel = (category) => {
    const type = actionTypes.find(t => t.value === category);
    return type ? type.label : category;
  };

  const getLevelLabel = (level) => {
    const labels = {
      'error': 'Erreur',
      'warning': 'Avertissement',
      'info': 'Information',
      'debug': 'Debug'
    };
    return labels[level] || level;
  };

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Niveau', 'Catégorie', 'Message', 'IP', 'User Agent'].join(','),
      ...logs.map(log => [
        formatDate(log.created_at),
        log.level || '',
        log.category || '',
        `"${log.message || ''}",
        log.ip_address || '',
        `"${log.user_agent || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fusepoint-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderLogDetails = (log) => {
    if (!log) return null;
    
    const details = [
      { label: 'ID', value: log.id },
      { label: 'Date/Heure', value: formatDate(log.created_at) },
      { label: 'Niveau', value: getLevelLabel(log.level) },
      { label: 'Catégorie', value: getCategoryLabel(log.category) },
      { label: 'Message', value: log.message },
      { label: 'Utilisateur ID', value: log.user_id },
      { label: 'Adresse IP', value: log.ip_address },
      { label: 'User Agent', value: log.user_agent }
    ];
    
    return (
      <Box>
        {details.map((detail, index) => (
          detail.value && (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {detail.label}:
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {detail.value}
              </Typography>
            </Box>
          )
        ))}
        
        {/* Afficher les anciennes et nouvelles valeurs si disponibles */}
        {(log.old_value || log.new_value) && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Détails des modifications:
            </Typography>
            {log.old_value && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Ancienne valeur:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {typeof log.old_value === 'string' ? log.old_value : JSON.stringify(JSON.parse(log.old_value), null, 2)}
                  </Typography>
                </Paper>
              </Box>
            )}
            {log.new_value && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Nouvelle valeur:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'success.50', mt: 1 }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {typeof log.new_value === 'string' ? log.new_value : JSON.stringify(JSON.parse(log.new_value), null, 2)}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* En-tête avec filtres */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Logs du Système" 
          subheader="Historique des événements et activités du système"
        />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={filters.action_type}
                onChange={(e) => handleFilterChange('action_type', e.target.value)}
                label="Catégorie"
              >
                {actionTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              size="small"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ minWidth: 250 }}
            />
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadLogs}
              disabled={loading}
            >
              Actualiser
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportLogs}
              disabled={logs.length === 0}
            >
              Exporter CSV
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Messages d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Table des logs */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date/Heure</TableCell>
                <TableCell>Niveau</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Utilisateur</TableCell>
                <TableCell>IP</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Aucun log trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(log.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getLevelLabel(log.level)}
                        color={getLevelColor(log.level)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getCategoryLabel(log.category)}
                        color={getCategoryColor(log.category)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 400, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {log.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {log.user_id ? `ID: ${log.user_id}` : 'Système'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {log.ip_address}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Voir les détails">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(log)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalLogs}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
        />
      </Card>

      {/* Dialog pour les détails du log */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Détails du Log
          {selectedLog && (
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <Chip 
                label={getLevelLabel(selectedLog.level)}
                color={getLevelColor(selectedLog.level)}
                size="small"
              />
              <Chip 
                label={getCategoryLabel(selectedLog.category)}
                color={getCategoryColor(selectedLog.category)}
                size="small"
                variant="outlined"
              />
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {renderLogDetails(selectedLog)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SystemLogs;