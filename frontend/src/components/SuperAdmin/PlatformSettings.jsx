import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { superAdminAPI } from '../../services/superAdminAPI';

function PlatformSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSettings, setEditingSettings] = useState({});
  const [showSensitive, setShowSensitive] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    type: 'string',
    category: 'general',
    description: '',
    isSensitive: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [validationErrors, setValidationErrors] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.getSettings();
      setSettings(response.data.settings);
      
      // Valider les paramètres
      const allSettings = Object.values(response.data.settings).flat();
      const errors = await superAdminAPI.validateSettings(allSettings);
      setValidationErrors(errors);
      
      // Ouvrir automatiquement les catégories avec des erreurs
      const categoriesWithErrors = [...new Set(errors.map(error => {
        const setting = allSettings.find(s => s.setting_key === error.key);
        return setting?.category || 'general';
      }));
      
      const newExpanded = {};
      categoriesWithErrors.forEach(category => {
        newExpanded[category] = true;
      });
      setExpandedCategories(newExpanded);
      
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      showSnackbar('Erreur lors du chargement des paramètres', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (settingKey) => {
    const allSettings = Object.values(settings).flat();
    const setting = allSettings.find(s => s.setting_key === settingKey);
    if (setting) {
      setEditingSettings({
        ...editingSettings,
        [settingKey]: setting.setting_value
      });
    }
  };

  const handleSave = async (settingKey) => {
    try {
      setSaving(true);
      const newValue = editingSettings[settingKey];
      
      await superAdminAPI.updateSetting(settingKey, newValue);
      
      // Mettre à jour localement
      const updatedSettings = { ...settings };
      Object.keys(updatedSettings).forEach(category => {
        updatedSettings[category] = updatedSettings[category].map(setting => 
          setting.setting_key === settingKey 
            ? { ...setting, setting_value: newValue }
            : setting
        );
      });
      setSettings(updatedSettings);
      
      // Supprimer de l'état d'édition
      const newEditingSettings = { ...editingSettings };
      delete newEditingSettings[settingKey];
      setEditingSettings(newEditingSettings);
      
      showSnackbar('Paramètre mis à jour avec succès', 'success');
      
      // Revalider
      const allSettings = Object.values(updatedSettings).flat();
      const errors = await superAdminAPI.validateSettings(allSettings);
      setValidationErrors(errors);
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showSnackbar(error.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (settingKey) => {
    const newEditingSettings = { ...editingSettings };
    delete newEditingSettings[settingKey];
    setEditingSettings(newEditingSettings);
  };

  const handleCreateSetting = async () => {
    try {
      setSaving(true);
      
      await superAdminAPI.createSetting({
        key: newSetting.key,
        value: newSetting.value,
        type: newSetting.type,
        category: newSetting.category,
        description: newSetting.description,
        isSensitive: newSetting.isSensitive
      });
      
      setOpenDialog(false);
      setNewSetting({
        key: '',
        value: '',
        type: 'string',
        category: 'general',
        description: '',
        isSensitive: false
      });
      
      showSnackbar('Paramètre créé avec succès', 'success');
      loadSettings(); // Recharger
      
    } catch (error) {
      console.error('Erreur création paramètre:', error);
      showSnackbar(error.message || 'Erreur lors de la création', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSetting = async (settingKey) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) {
      return;
    }
    
    try {
      await superAdminAPI.deleteSetting(settingKey);
      showSnackbar('Paramètre supprimé avec succès', 'success');
      loadSettings(); // Recharger
    } catch (error) {
      console.error('Erreur suppression:', error);
      showSnackbar(error.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const toggleSensitiveVisibility = (settingKey) => {
    setShowSensitive({
      ...showSensitive,
      [settingKey]: !showSensitive[settingKey]
    });
  };

  const handleCategoryToggle = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getValidationError = (settingKey) => {
    return validationErrors.find(error => error.key === settingKey);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: '⚙️',
      email: '📧',
      security: '🔒',
      oauth: '🔑',
      api: '🔌',
      ui: '🎨',
      monitoring: '📊',
      backup: '💾'
    };
    return icons[category] || '📋';
  };

  const renderSettingField = (setting) => {
    const isEditing = editingSettings.hasOwnProperty(setting.setting_key);
    const validationError = getValidationError(setting.setting_key);
    const isPassword = setting.is_sensitive;
    const showValue = showSensitive[setting.setting_key] || !isPassword;
    
    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            type={isPassword && !showValue ? 'password' : 'text'}
            value={editingSettings[setting.setting_key] || ''}
            onChange={(e) => setEditingSettings({
              ...editingSettings,
              [setting.setting_key]: e.target.value
            })}
            error={!!validationError}
            helperText={validationError?.message}
            InputProps={{
              endAdornment: isPassword && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleSensitiveVisibility(setting.setting_key)}
                    size="small"
                  >
                    {showValue ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <IconButton 
            color="primary" 
            onClick={() => handleSave(setting.setting_key)}
            disabled={saving}
            size="small"
          >
            {saving ? <CircularProgress size={20} /> : <SaveIcon />}
          </IconButton>
          <IconButton 
            color="secondary" 
            onClick={() => handleCancel(setting.setting_key)}
            size="small"
          >
            <CancelIcon />
          </IconButton>
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          value={showValue ? setting.setting_value : '••••••••'}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                {isPassword && (
                  <IconButton
                    onClick={() => toggleSensitiveVisibility(setting.setting_key)}
                    size="small"
                  >
                    {showValue ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )}
              </InputAdornment>
            )
          }}
          error={!!validationError}
          helperText={validationError?.message}
        />
        <Tooltip title="Modifier">
          <IconButton 
            color="primary" 
            onClick={() => handleEdit(setting.setting_key)}
            size="small"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer">
          <IconButton 
            color="error" 
            onClick={() => handleDeleteSetting(setting.setting_key)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête avec actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Paramètres de la Plateforme
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => superAdminAPI.exportSettings()}
          >
            Exporter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nouveau Paramètre
          </Button>
        </Box>
      </Box>

      {/* Alertes de validation */}
      {validationErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {validationErrors.length} erreur(s) de configuration détectée(s):
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>
                <strong>{error.key}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Paramètres par catégorie */}
      {Object.entries(settings).map(([category, categorySettings]) => (
        <Accordion 
          key={category}
          expanded={expandedCategories[category] || false}
          onChange={() => handleCategoryToggle(category)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">
                {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
              </Typography>
              <Chip 
                label={`${categorySettings.length} paramètre(s)`} 
                size="small" 
                color="primary"
              />
              {validationErrors.some(error => {
                const setting = categorySettings.find(s => s.setting_key === error.key);
                return !!setting;
              }) && (
                <Chip 
                  icon={<WarningIcon />}
                  label="Erreurs" 
                  size="small" 
                  color="warning"
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {categorySettings.map((setting) => (
                <Grid item xs={12} md={6} key={setting.setting_key}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {setting.setting_key}
                        </Typography>
                        {setting.description && (
                          <Typography variant="body2" color="text.secondary">
                            {setting.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip label={setting.setting_type} size="small" />
                          {setting.is_sensitive && (
                            <Chip label="Sensible" size="small" color="warning" />
                          )}
                          {getValidationError(setting.setting_key) && (
                            <Chip 
                              icon={<WarningIcon />}
                              label="Erreur" 
                              size="small" 
                              color="error" 
                            />
                          )}
                        </Box>
                      </Box>
                      {renderSettingField(setting)}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Dialog pour créer un nouveau paramètre */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer un Nouveau Paramètre</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Clé du paramètre"
                value={newSetting.key}
                onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                placeholder="ex: smtp_host"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Valeur"
                value={newSetting.value}
                onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newSetting.type}
                  onChange={(e) => setNewSetting({ ...newSetting, type: e.target.value })}
                >
                  {superAdminAPI.getSettingTypes().map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={newSetting.category}
                  onChange={(e) => setNewSetting({ ...newSetting, category: e.target.value })}
                >
                  {superAdminAPI.getSettingCategories().map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newSetting.description}
                onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newSetting.isSensitive}
                    onChange={(e) => setNewSetting({ ...newSetting, isSensitive: e.target.checked })}
                  />
                }
                label="Paramètre sensible (chiffré)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleCreateSetting} 
            variant="contained"
            disabled={!newSetting.key || !newSetting.value || saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default PlatformSettings;