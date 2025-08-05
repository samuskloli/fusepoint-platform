import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { superAdminAPI } from '../services/superAdminAPI';
import PlatformSettings from '../components/SuperAdmin/PlatformSettings';
import SystemLogs from '../components/SuperAdmin/SystemLogs';
import PermissionsManager from '../components/SuperAdmin/PermissionsManager';
import SystemHealth from '../components/SuperAdmin/SystemHealth';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`super-admin-tabpanel-${index}`}
      aria-labelledby={`super-admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function SuperAdminDashboard() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.getDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getActionTypeColor = (actionType) => {
    const colors = {
      'setting_update': 'primary',
      'setting_create': 'success',
      'setting_delete': 'error',
      'dashboard_access': 'info',
      'unauthorized_access_attempt': 'error',
      'permission_denied': 'warning',
      'system_backup': 'secondary'
    };
    return colors[actionType] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Chargement du tableau de bord Super Administrateur...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <SecurityIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Tableau de Bord Super Administrateur
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenue {user?.first_name} {user?.last_name} - Gestion complète de la plateforme Fusepoint
        </Typography>
      </Box>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="Super Admin Tabs">
          <Tab 
            icon={<DashboardIcon />} 
            label="Tableau de Bord" 
            id="super-admin-tab-0"
            aria-controls="super-admin-tabpanel-0"
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="Paramètres Plateforme" 
            id="super-admin-tab-1"
            aria-controls="super-admin-tabpanel-1"
          />
          <Tab 
            icon={<SecurityIcon />} 
            label="Permissions" 
            id="super-admin-tab-2"
            aria-controls="super-admin-tabpanel-2"
          />
          <Tab 
            icon={<HistoryIcon />} 
            label="Logs Système" 
            id="super-admin-tab-3"
            aria-controls="super-admin-tabpanel-3"
          />
          <Tab 
            icon={<AssessmentIcon />} 
            label="Santé Système" 
            id="super-admin-tab-4"
            aria-controls="super-admin-tabpanel-4"
          />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      <TabPanel value={currentTab} index={0}>
        {/* Statistiques générales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Utilisateurs Total
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData?.stats?.totalUsers || 0}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Agents Actifs
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData?.stats?.activeAgents || 0}
                    </Typography>
                  </Box>
                  <SecurityIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Super Admins
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData?.stats?.superAdmins || 0}
                    </Typography>
                  </Box>
                  <SecurityIcon sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Sessions Actives
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData?.stats?.totalSessions || 0}
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Activité récente */}
        <Card>
          <CardHeader 
            title="Activité Récente" 
            subheader="Dernières actions des Super Administrateurs"
          />
          <CardContent>
            {dashboardData?.recentLogs?.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Administrateur</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          {log.first_name} {log.last_name}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {log.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.action_type} 
                            color={getActionTypeColor(log.action_type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.action_description}</TableCell>
                        <TableCell>
                          {log.target_resource && (
                            <Typography variant="caption">
                              {log.target_resource}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucune activité récente
              </Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <PlatformSettings />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <PermissionsManager />
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <SystemLogs />
      </TabPanel>

      <TabPanel value={currentTab} index={4}>
        <SystemHealth />
      </TabPanel>
    </Container>
  );
}

export default SuperAdminDashboard;