import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { superAdminAPI } from '../../services/superAdminAPI';

function PermissionsManager() {
  const [permissions, setPermissions] = useState({});
  const [rolePermissions, setRolePermissions] = useState({});
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const roles = [
    { value: 'super_admin', label: 'Super Administrateur', color: 'error' },
    { value: 'admin', label: 'Administrateur', color: 'warning' },
    { value: 'agent', label: 'Agent', color: 'primary' },
    { value: 'user', label: 'Utilisateur', color: 'default' }
  ];

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await superAdminAPI.getPermissions();
      setPermissions(response.data.permissions);
      
      // Ouvrir automatiquement toutes les catégories
      const categories = Object.keys(response.data.permissions);
      const expanded = {};
      categories.forEach(category => {
        expanded[category] = true;
      });
      setExpandedCategories(expanded);
      
    } catch (err) {
      console.error('Erreur chargement permissions:', err);
      setError('Erreur lors du chargement des permissions');
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (role) => {
    try {
      const response = await superAdminAPI.getRolePermissions(role);
      
      // Organiser les permissions par catégorie
      const organized = {};
      response.data.permissions.forEach(permission => {
        if (!organized[permission.category]) {
          organized[permission.category] = [];
        }
        organized[permission.category].push(permission);
      });
      
      setRolePermissions(organized);
    } catch (err) {
      console.error('Erreur chargement permissions rôle:', err);
      setError('Erreur lors du chargement des permissions du rôle');
    }
  };

  const handleCategoryToggle = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  const getPermissionIcon = (granted) => {
    return granted ? (
      <CheckCircleIcon color="success" fontSize="small" />
    ) : (
      <CancelIcon color="error" fontSize="small" />
    );
  };

  const getPermissionDescription = (permissionName) => {
    const descriptions = {
      // Paramètres de plateforme
      'platform_settings_read': 'Consulter les paramètres de la plateforme',
      'platform_settings_write': 'Modifier les paramètres de la plateforme',
      'platform_settings_delete': 'Supprimer des paramètres de la plateforme',
      
      // Gestion des utilisateurs
      'user_management_read': 'Consulter les utilisateurs',
      'user_management_write': 'Modifier les utilisateurs',
      'user_management_delete': 'Supprimer des utilisateurs',
      'user_roles_manage': 'Gérer les rôles des utilisateurs',
      
      // Logs et audit
      'audit_logs_read': 'Consulter les logs d\'audit',
      'audit_logs_export': 'Exporter les logs d\'audit',
      
      // Système
      'system_backup': 'Créer des sauvegardes système',
      'system_restore': 'Restaurer des sauvegardes',
      'system_maintenance': 'Accéder au mode maintenance',
      'system_health_monitor': 'Surveiller la santé du système',
      
      // Sécurité
      'security_settings_manage': 'Gérer les paramètres de sécurité',
      'oauth_settings_manage': 'Gérer les paramètres OAuth',
      'api_keys_manage': 'Gérer les clés API',
      
      // Configuration
      'email_settings_manage': 'Gérer la configuration email',
      'notification_settings_manage': 'Gérer les paramètres de notification',
      
      // Permissions
      'permissions_read': 'Consulter les permissions',
      'permissions_manage': 'Gérer les permissions des rôles',
      
      // Entreprises
      'company_management_read': 'Consulter les entreprises',
      'company_management_write': 'Modifier les entreprises',
      'company_management_delete': 'Supprimer des entreprises',
      
      // API et intégrations
      'api_configuration_read': 'Consulter les configurations API',
      'api_configuration_write': 'Modifier les configurations API',
      'integrations_manage': 'Gérer les intégrations'
    };
    
    return descriptions[permissionName] || 'Description non disponible';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'platform': '⚙️',
      'user_management': '👥',
      'audit': '📋',
      'system': '🖥️',
      'security': '🔒',
      'configuration': '🔧',
      'permissions': '🛡️',
      'company': '🏢',
      'api': '🔌'
    };
    return icons[category] || '📁';
  };

  const getCategoryDescription = (category) => {
    const descriptions = {
      'platform': 'Gestion des paramètres globaux de la plateforme',
      'user_management': 'Administration des utilisateurs et de leurs données',
      'audit': 'Consultation et gestion des logs d\'audit',
      'system': 'Administration système et maintenance',
      'security': 'Gestion de la sécurité et de l\'authentification',
      'configuration': 'Configuration des services et intégrations',
      'permissions': 'Gestion des permissions et des rôles',
      'company': 'Administration des entreprises',
      'api': 'Gestion des API et des intégrations'
    };
    return descriptions[category] || 'Catégorie de permissions';
  };

  const getRoleColor = (role) => {
    const roleData = roles.find(r => r.value === role);
    return roleData ? roleData.color : 'default';
  };

  const getRoleLabel = (role) => {
    const roleData = roles.find(r => r.value === role);
    return roleData ? roleData.label : role;
  };

  const getPermissionStats = (categoryPermissions) => {
    const total = categoryPermissions.length;
    const granted = categoryPermissions.filter(p => p.granted === 1).length;
    return { total, granted, percentage: total > 0 ? Math.round((granted / total) * 100) : 0 };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestionnaire de Permissions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visualisation des permissions par rôle. Seuls les Super Administrateurs peuvent modifier les permissions.
        </Typography>
      </Box>

      {/* Sélecteur de rôle */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Rôle à analyser</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  label="Rôle à analyser"
                >
                  {roles.map(role => (
                    <MenuItem key={role.value} value={role.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={role.label} 
                          color={role.color} 
                          size="small"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2">
                  Vous consultez les permissions du rôle <strong>{getRoleLabel(selectedRole)}</strong>. 
                  Les permissions accordées sont marquées en vert, les permissions refusées en rouge.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Permissions par catégorie */}
      {Object.entries(rolePermissions).map(([category, categoryPermissions]) => {
        const stats = getPermissionStats(categoryPermissions);
        
        return (
          <Accordion 
            key={category}
            expanded={expandedCategories[category] || false}
            onChange={() => handleCategoryToggle(category)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6">
                  {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <Chip 
                  label={`${stats.granted}/${stats.total} permissions`}
                  color={stats.percentage === 100 ? 'success' : stats.percentage > 50 ? 'warning' : 'error'}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                  {stats.percentage}% accordées
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {getCategoryDescription(category)}
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Permission</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Statut</TableCell>
                      <TableCell align="center">Accordée</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {permission.permission_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getPermissionDescription(permission.permission_name)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {getPermissionIcon(permission.granted === 1)}
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={permission.granted === 1}
                            disabled={true} // En lecture seule pour l'instant
                            color={permission.granted === 1 ? 'success' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Résumé des permissions */}
      <Card sx={{ mt: 3 }}>
        <CardHeader 
          title="Résumé des Permissions"
          subheader={`Analyse complète pour le rôle ${getRoleLabel(selectedRole)}`}
        />
        <CardContent>
          <Grid container spacing={2}>
            {Object.entries(rolePermissions).map(([category, categoryPermissions]) => {
              const stats = getPermissionStats(categoryPermissions);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Typography>
                    <Typography variant="h4" color={stats.percentage === 100 ? 'success.main' : 'text.primary'}>
                      {stats.percentage}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.granted} sur {stats.total} permissions
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Note importante */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note importante:</strong> La modification des permissions nécessite une intervention directe 
          dans la base de données. Cette interface est en lecture seule pour des raisons de sécurité.
        </Typography>
      </Alert>
    </Box>
  );
}

export default PermissionsManager;