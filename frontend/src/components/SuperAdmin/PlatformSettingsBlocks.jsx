import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Chip,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import superAdminAPI from '../../services/superAdminAPI';

// Configuration des blocs de paramètres
const SETTINGS_BLOCKS = {
  general: {
    title: 'Paramètres Généraux',
    icon: SettingsIcon,
    color: '#1976d2',
    description: 'Configuration de base de la plateforme',
    settings: [
      {
        key: 'frontend_url',
        label: 'URL de Production',
        description: 'URL principale de la plateforme en production',
        type: 'url',
        required: true,
        placeholder: 'https://votre-domaine.com'
      },
      {
        key: 'platform_name',
        label: 'Nom de la Plateforme',
        description: 'Nom affiché dans l\'interface',
        type: 'text',
        required: true,
        placeholder: 'Fusepoint Hub'
      },
      {
        key: 'maintenance_mode',
        label: 'Mode Maintenance',
        description: 'Activer le mode maintenance pour la plateforme',
        type: 'boolean',
        default: false
      }
    ]
  },
  email: {
    title: 'Configuration Email',
    icon: EmailIcon,
    color: '#d32f2f',
    description: 'Paramètres SMTP et notifications email',
    settings: [
      {
        key: 'smtp_enabled',
        label: 'SMTP Activé',
        description: 'Activer l\'envoi d\'emails via SMTP',
        type: 'boolean',
        default: true
      },
      {
        key: 'email_notifications',
        label: 'Notifications Email',
        description: 'Envoyer des notifications par email',
        type: 'boolean',
        default: true
      },
      {
        key: 'email_from_name',
        label: 'Nom Expéditeur',
        description: 'Nom affiché comme expéditeur des emails',
        type: 'text',
        placeholder: 'Fusepoint Hub'
      }
    ]
  },
  security: {
    title: 'Sécurité',
    icon: SecurityIcon,
    color: '#ed6c02',
    description: 'Paramètres de sécurité et authentification',
    settings: [
      {
        key: 'two_factor_enabled',
        label: 'Authentification 2FA',
        description: 'Activer l\'authentification à deux facteurs',
        type: 'boolean',
        default: false
      },
      {
        key: 'session_timeout',
        label: 'Timeout Session (minutes)',
        description: 'Durée avant expiration automatique des sessions',
        type: 'number',
        min: 15,
        max: 1440,
        default: 60
      },
      {
        key: 'password_min_length',
        label: 'Longueur Minimale Mot de Passe',
        description: 'Nombre minimum de caractères pour les mots de passe',
        type: 'number',
        min: 6,
        max: 50,
        default: 8
      }
    ]
  },
  api: {
    title: 'Configuration API',
    icon: ApiIcon,
    color: '#2e7d32',
    description: 'Paramètres des APIs externes et intégrations',
    settings: [
      {
        key: 'api_rate_limit',
        label: 'Limite de Requêtes API',
        description: 'Nombre maximum de requêtes par minute',
        type: 'number',
        min: 10,
        max: 10000,
        default: 1000
      },
      {
        key: 'openai_enabled',
        label: 'OpenAI Activé',
        description: 'Activer l\'intégration OpenAI',
        type: 'boolean',
        default: true
      },
      {
        key: 'facebook_api_enabled',
        label: 'API Facebook Activée',
        description: 'Activer l\'intégration Facebook/Meta',
        type: 'boolean',
        default: true
      }
    ]
  },
  ui: {
    title: 'Interface Utilisateur',
    icon: PaletteIcon,
    color: '#7b1fa2',
    description: 'Personnalisation de l\'interface',
    settings: [
      {
        key: 'theme_mode',
        label: 'Mode Thème',
        description: 'Thème par défaut de l\'interface',
        type: 'select',
        options: [
          { value: 'light', label: 'Clair' },
          { value: 'dark', label: 'Sombre' },
          { value: 'auto', label: 'Automatique' }
        ],
        default: 'light'
      },
      {
        key: 'show_welcome_tour',
        label: 'Tour de Bienvenue',
        description: 'Afficher le tour guidé pour les nouveaux utilisateurs',
        type: 'boolean',
        default: true
      },
      {
        key: 'items_per_page',
        label: 'Éléments par Page',
        description: 'Nombre d\'éléments affichés par page dans les listes',
        type: 'select',
        options: [
          { value: '10', label: '10' },
          { value: '25', label: '25' },
          { value: '50', label: '50' },
          { value: '100', label: '100' }
        ],
        default: '25'
      }
    ]
  }
};

function PlatformSettingsBlocks() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [expandedBlocks, setExpandedBlocks] = useState({
    general: true // Bloc général ouvert par défaut
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.getSettings();
      
      // Convertir le tableau en objet pour faciliter l'accès
      const settingsObj = {};
      response.forEach(setting => {
        settingsObj[setting.key] = {
          value: setting.value,
          type: setting.value_type,
          category: setting.category
        };
      });
      
      setSettings(settingsObj);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      showSnackbar('Erreur lors du chargement des paramètres', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value, blockKey) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: value
      }
    }));
    setHasChanges(true);
  };

  const saveSetting = async (key, blockKey) => {
    try {
      setSaving(prev => ({ ...prev, [key]: true }));
      
      const setting = settings[key];
      const blockConfig = SETTINGS_BLOCKS[blockKey];
      const settingConfig = blockConfig.settings.find(s => s.key === key);
      
      await superAdminAPI.updateSetting(key, {
        value: setting.value,
        type: settingConfig.type === 'boolean' ? 'boolean' : 
              settingConfig.type === 'number' ? 'number' : 'string',
        category: blockKey,
        description: settingConfig.description
      });
      
      showSnackbar(`Paramètre "${settingConfig.label}" mis à jour avec succès`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const saveAllChanges = async () => {
    try {
      setSaving({ all: true });
      
      const promises = [];
      Object.entries(SETTINGS_BLOCKS).forEach(([blockKey, blockConfig]) => {
        blockConfig.settings.forEach(settingConfig => {
          const setting = settings[settingConfig.key];
          if (setting) {
            promises.push(
              superAdminAPI.updateSetting(settingConfig.key, {
                value: setting.value,
                type: settingConfig.type === 'boolean' ? 'boolean' : 
                      settingConfig.type === 'number' ? 'number' : 'string',
                category: blockKey,
                description: settingConfig.description
              })
            );
          }
        });
      });
      
      await Promise.all(promises);
      setHasChanges(false);
      showSnackbar('Tous les paramètres ont été sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde globale:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving({ all: false });
    }
  };

  const handleBlockToggle = (blockKey) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockKey]: !prev[blockKey]
    }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const renderSettingInput = (settingConfig, blockKey) => {
    const currentValue = settings[settingConfig.key]?.value || settingConfig.default || '';
    
    switch (settingConfig.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={currentValue === 'true' || currentValue === true}
                onChange={(e) => handleSettingChange(settingConfig.key, e.target.checked, blockKey)}
                color="primary"
              />
            }
            label={currentValue === 'true' || currentValue === true ? 'Activé' : 'Désactivé'}
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth size="small">
            <Select
              value={currentValue}
              onChange={(e) => handleSettingChange(settingConfig.key, e.target.value, blockKey)}
            >
              {settingConfig.options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'number':
        return (
          <TextField
            type="number"
            value={currentValue}
            onChange={(e) => handleSettingChange(settingConfig.key, e.target.value, blockKey)}
            inputProps={{
              min: settingConfig.min,
              max: settingConfig.max
            }}
            size="small"
            fullWidth
          />
        );
      
      default:
        return (
          <TextField
            type={settingConfig.type === 'url' ? 'url' : 'text'}
            value={currentValue}
            onChange={(e) => handleSettingChange(settingConfig.key, e.target.value, blockKey)}
            placeholder={settingConfig.placeholder}
            size="small"
            fullWidth
            required={settingConfig.required}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Chargement des paramètres...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Paramètres de la Plateforme
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configuration simplifiée par blocs fonctionnels
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSettings}
            disabled={loading}
          >
            Actualiser
          </Button>
          
          {hasChanges && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveAllChanges}
              disabled={saving.all}
            >
              {saving.all ? 'Sauvegarde...' : 'Sauvegarder Tout'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Alerte si des changements sont en attente */}
      {hasChanges && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Vous avez des modifications non sauvegardées. N'oubliez pas de sauvegarder vos changements.
        </Alert>
      )}

      {/* Blocs de paramètres */}
      <Grid container spacing={3}>
        {Object.entries(SETTINGS_BLOCKS).map(([blockKey, blockConfig]) => {
          const IconComponent = blockConfig.icon;
          
          return (
            <Grid item xs={12} key={blockKey}>
              <Card>
                <Accordion 
                  expanded={expandedBlocks[blockKey] || false}
                  onChange={() => handleBlockToggle(blockKey)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <IconComponent sx={{ color: blockConfig.color }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">
                          {blockConfig.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {blockConfig.description}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${blockConfig.settings.length} paramètres`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {blockConfig.settings.map((settingConfig) => (
                        <Grid item xs={12} md={6} key={settingConfig.key}>
                          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                  {settingConfig.label}
                                  {settingConfig.required && (
                                    <Chip label="Requis" size="small" color="error" sx={{ ml: 1 }} />
                                  )}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {settingConfig.description}
                                </Typography>
                              </Box>
                              
                              <Tooltip title="Information">
                                <IconButton size="small">
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              {renderSettingInput(settingConfig, blockKey)}
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<SaveIcon />}
                                onClick={() => saveSetting(settingConfig.key, blockKey)}
                                disabled={saving[settingConfig.key]}
                              >
                                {saving[settingConfig.key] ? 'Sauvegarde...' : 'Sauvegarder'}
                              </Button>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PlatformSettingsBlocks;