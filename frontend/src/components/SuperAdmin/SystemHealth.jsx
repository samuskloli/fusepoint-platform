import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';
import { superAdminAPI } from '../../services/superAdminAPI';

function SystemHealth() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [backupDialog, setBackupDialog] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemHealth();
    
    // Auto-refresh toutes les 30 secondes
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadSystemHealth();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadSystemHealth = async () => {
    try {
      setError(null);
      const response = await superAdminAPI.getSystemHealth();
      setHealthData(response.data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur chargement santé système:', err);
      setError('Erreur lors du chargement des données système');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setBackupLoading(true);
      await superAdminAPI.createBackup();
      setBackupDialog(false);
      // Recharger les données pour voir la nouvelle sauvegarde
      await loadSystemHealth();
    } catch (err) {
      console.error('Erreur création sauvegarde:', err);
      setError('Erreur lors de la création de la sauvegarde');
    } finally {
      setBackupLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'good':
      case 'online':
      case 'active':
        return 'success';
      case 'warning':
      case 'degraded':
        return 'warning';
      case 'error':
      case 'critical':
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'good':
      case 'online':
      case 'active':
        return <CheckCircleIcon color="success" />;
      case 'warning':
      case 'degraded':
        return <WarningIcon color="warning" />;
      case 'error':
      case 'critical':
      case 'offline':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}j ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 70) return 'success';
    if (percentage < 85) return 'warning';
    return 'error';
  };

  if (loading && !healthData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !healthData) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={loadSystemHealth}>
          Réessayer
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* En-tête avec contrôles */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            <ComputerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Santé du Système
          </Typography>
          {lastUpdate && (
            <Typography variant="body2" color="text.secondary">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Actualiser">
            <IconButton onClick={loadSystemHealth} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<BackupIcon />}
            onClick={() => setBackupDialog(true)}
          >
            Créer Sauvegarde
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statut général */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                {getStatusIcon(healthData?.overall_status)}
              </Box>
              <Typography variant="h6" gutterBottom>
                Statut Général
              </Typography>
              <Chip 
                label={healthData?.overall_status || 'Inconnu'}
                color={getStatusColor(healthData?.overall_status)}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Temps de fonctionnement
              </Typography>
              <Typography variant="h5" color="primary">
                {healthData?.uptime ? formatUptime(healthData.uptime) : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Charge CPU
              </Typography>
              <Typography variant="h5" color={getProgressColor(healthData?.cpu_usage || 0)}>
                {healthData?.cpu_usage ? `${healthData.cpu_usage.toFixed(1)}%` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MemoryIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Mémoire utilisée
              </Typography>
              <Typography variant="h5" color={getProgressColor(healthData?.memory_usage || 0)}>
                {healthData?.memory_usage ? `${healthData.memory_usage.toFixed(1)}%` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Métriques détaillées */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Utilisation des ressources */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Utilisation des Ressources" />
            <CardContent>
              {/* CPU */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">CPU</Typography>
                  <Typography variant="body2">
                    {healthData?.cpu_usage ? `${healthData.cpu_usage.toFixed(1)}%` : 'N/A'}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={healthData?.cpu_usage || 0}
                  color={getProgressColor(healthData?.cpu_usage || 0)}
                />
              </Box>
              
              {/* Mémoire */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Mémoire</Typography>
                  <Typography variant="body2">
                    {healthData?.memory_usage ? `${healthData.memory_usage.toFixed(1)}%` : 'N/A'}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={healthData?.memory_usage || 0}
                  color={getProgressColor(healthData?.memory_usage || 0)}
                />
              </Box>
              
              {/* Stockage */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Stockage</Typography>
                  <Typography variant="body2">
                    {healthData?.disk_usage ? `${healthData.disk_usage.toFixed(1)}%` : 'N/A'}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={healthData?.disk_usage || 0}
                  color={getProgressColor(healthData?.disk_usage || 0)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Services */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="État des Services" />
            <CardContent>
              <List dense>
                {healthData?.services && Object.entries(healthData.services).map(([service, status]) => (
                  <ListItem key={service}>
                    <ListItemIcon>
                      {getStatusIcon(status)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={service.charAt(0).toUpperCase() + service.slice(1)}
                      secondary={`Statut: ${status}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={status}
                        color={getStatusColor(status)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Informations système */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Informations Système" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Version Node.js</strong></TableCell>
                      <TableCell>{healthData?.node_version || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Version de l'application</strong></TableCell>
                      <TableCell>{healthData?.app_version || '1.0.0'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Environnement</strong></TableCell>
                      <TableCell>
                        <Chip 
                          label={healthData?.environment || 'production'}
                          color={healthData?.environment === 'production' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Démarrage</strong></TableCell>
                      <TableCell>
                        {healthData?.start_time ? 
                          new Date(healthData.start_time).toLocaleString() : 'N/A'
                        }
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Dernières Sauvegardes" />
            <CardContent>
              {healthData?.recent_backups && healthData.recent_backups.length > 0 ? (
                <List dense>
                  {healthData.recent_backups.slice(0, 5).map((backup, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <BackupIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={backup.name || `Sauvegarde ${index + 1}`}
                        secondary={backup.date ? new Date(backup.date).toLocaleString() : 'Date inconnue'}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body2" color="text.secondary">
                          {backup.size ? formatBytes(backup.size) : 'N/A'}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  Aucune sauvegarde récente trouvée
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de confirmation de sauvegarde */}
      <Dialog open={backupDialog} onClose={() => setBackupDialog(false)}>
        <DialogTitle>Créer une Sauvegarde Système</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous créer une sauvegarde complète du système ? Cette opération peut prendre quelques minutes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleBackup} 
            variant="contained"
            disabled={backupLoading}
            startIcon={backupLoading ? <CircularProgress size={20} /> : <BackupIcon />}
          >
            {backupLoading ? 'Création...' : 'Créer Sauvegarde'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SystemHealth;