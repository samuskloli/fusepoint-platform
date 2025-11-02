const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireProjectView, requireProjectEdit } = require('../middleware/projectAccess');
const databaseService = require('../services/databaseService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const agentService = require('../services/agentService');
const projectService = require('../services/projectService');

// Configuration multer pour upload de fichiers avec namespacing
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { clientId, projectId } = req.params;
    const uploadPath = path.join(process.cwd(), 'uploads', 'clients', clientId, 'projects', projectId, 'files');
    
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Validation basique du type de fichier
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Middleware de validation du scope (client_id, project_id)
const validateScope = async (req, res, next) => {
  try {
    const { clientId, projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validation des paramètres
    if (!clientId || !projectId) {
      return res.status(400).json({ 
        success: false, 
        error: 'clientId et projectId sont requis' 
      });
    }

    // Charger le projet et déterminer le client propriétaire réel
    const projectRow = await databaseService.get('SELECT id, client_id FROM projects WHERE id = ?', [projectId]);
    if (!projectRow) {
      return res.status(404).json({ 
        success: false, 
        error: 'Projet non trouvé' 
      });
    }
    const projectClientId = projectRow.client_id;

    // Récupérer le company_id du propriétaire du projet (si disponible)
    let ownerCompanyId = null;
    try {
      const owner = await databaseService.get('SELECT company_id FROM users WHERE id = ?', [projectClientId]);
      ownerCompanyId = owner ? owner.company_id : null;
    } catch (e) {
      // Ignorer si la table/colonne n'existe pas
    }

    // Vérifier que le client dans l'URL correspond soit au propriétaire du projet, soit à son company_id
    const clientMatches = String(clientId) === String(projectClientId) || (ownerCompanyId && String(clientId) === String(ownerCompanyId));
    if (!clientMatches) {
      return res.status(404).json({ 
        success: false, 
        error: 'Projet non trouvé ou n\'appartient pas au client' 
      });
    }

    // Vérifier les permissions d'accès
    if (userRole === 'admin' || userRole === 'super_admin') {
      // Admin/Super Admin a accès à tout; continuer
    } else if (userRole === 'agent') {
      // Vérifier l'accès agent-client (sur l'ID propriétaire réel)
      const hasAccess = await checkAgentClientAccess(userId, projectClientId);
      if (!hasAccess) {
        return res.status(403).json({ 
          success: false, 
          error: 'Accès refusé au client' 
        });
      }
    } else if (userRole === 'client' || userRole === 'user') {
      // Le client utilisateur doit appartenir au même propriétaire (par id ou company)
      const userCompanyId = req.user.client_id ?? req.user.company_id ?? null;
      const isOwnerById = userCompanyId && String(userCompanyId) === String(projectClientId);
      const isOwnerByCompany = ownerCompanyId && userCompanyId && String(userCompanyId) === String(ownerCompanyId);
      
      // Logs de débogage temporaires
      console.log('🔍 DEBUG validateScope - User access check:', {
        userId: req.user.id,
        userRole,
        userCompanyId,
        projectClientId,
        ownerCompanyId,
        isOwnerById,
        isOwnerByCompany,
        clientIdFromUrl: clientId,
        projectIdFromUrl: projectId
      });
      
      if (!isOwnerById && !isOwnerByCompany) {
        console.log('❌ DEBUG validateScope - Access denied for user:', req.user.id);
        return res.status(403).json({ 
          success: false, 
          error: 'Accès refusé' 
        });
      }
    } else {
      return res.status(403).json({ 
        success: false, 
        error: 'Rôle non autorisé' 
      });
    }

    // Ajouter les IDs validés à la requête avec le client propriétaire réel
    req.validatedScope = {
      clientId: parseInt(projectClientId),
      projectId: parseInt(projectId)
    };

    next();
  } catch (error) {
    console.error('Erreur validation scope:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    });
  }
};

// Fonction utilitaire pour vérifier l'accès agent-client
async function checkAgentClientAccess(agentId, clientId) {
  return agentService.checkAgentClientAccess(agentId, clientId);
}

// Middleware pour forcer le scope dans les requêtes
const enforceScope = (req, res, next) => {
  const { clientId, projectId } = req.validatedScope;
  
  // Ajouter automatiquement client_id et project_id aux données
  if (req.body && typeof req.body === 'object') {
    req.body.client_id = clientId;
    req.body.project_id = projectId;
  }
  
  next();
};

// Routes pour les fichiers avec scoping strict

// GET /api/clients/:clientId/projects/:projectId/widgets/files
router.get('/:clientId/projects/:projectId/widgets/files', 
  authenticateToken, 
  validateScope, 
  requireProjectView,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { path: folderPath = '/', page = 1, limit = 50 } = req.query;
      let pageNum = parseInt(page, 10);
      let limitNum = parseInt(limit, 10);
      if (!Number.isFinite(pageNum) || pageNum <= 0) pageNum = 1;
      if (!Number.isFinite(limitNum) || limitNum <= 0) limitNum = 50;
      if (limitNum > 100) limitNum = 100;
      const offset = (pageNum - 1) * limitNum;

      // Détecter les colonnes disponibles de la table files
      const columns = await databaseService.query('SHOW COLUMNS FROM files');
      const colNames = columns.map(c => c.Field);
      const has = (name) => colNames.includes(name);
      
      // Construire dynamiquement la liste de colonnes à sélectionner
      const selectCols = [
        'id',
        has('name') ? 'name' : 'filename AS name',
        has('original_name') ? 'original_name' : (has('name') ? 'name AS original_name' : 'filename AS original_name'),
        has('size') ? 'size' : 'file_size AS size',
        has('mime_type') ? 'mime_type' : `'application/octet-stream' AS mime_type`,
        has('folder_path') ? 'folder_path' : `'/' AS folder_path`,
        has('created_at') ? 'created_at' : 'NOW() AS created_at',
        has('updated_at') ? 'updated_at' : (has('created_at') ? 'created_at AS updated_at' : 'NOW() AS updated_at'),
        has('created_by') ? 'created_by' : (has('uploaded_by') ? 'uploaded_by AS created_by' : 'NULL AS created_by')
      ].join(', ');
      
      // Construire dynamiquement le WHERE
      let whereClause = 'WHERE client_id = ? AND project_id = ?';
      const params = [clientId, projectId];
      
      if (has('folder_path')) {
        whereClause += ' AND folder_path = ?';
        params.push(folderPath);
      }
      
      if (has('is_deleted')) {
        whereClause += ' AND is_deleted = FALSE';
      }
      
      const filesQuery = `
        SELECT ${selectCols}
        FROM files
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      params.push(limitNum, offset);

      const files = await databaseService.query(filesQuery, params);

      // Construire l'URL publique pour chaque fichier si absente
      const buildPublicUrl = (fname) => `/uploads/clients/${clientId}/projects/${projectId}/files/${fname}`;
      const filesWithUrl = files.map(f => ({
        ...f,
        url: (typeof f.url === 'string' && f.url) ? f.url : buildPublicUrl(f.name)
      }));
      
      // Compter le total
      let countWhere = 'WHERE client_id = ? AND project_id = ?';
      const countParams = [clientId, projectId];
      if (has('folder_path')) {
        countWhere += ' AND folder_path = ?';
        countParams.push(folderPath);
      }
      if (has('is_deleted')) {
        countWhere += ' AND is_deleted = FALSE';
      }
      const countQuery = `SELECT COUNT(*) as total FROM files ${countWhere}`;
      const [{ total }] = await databaseService.query(countQuery, countParams);
      const totalNum = typeof total === 'bigint' ? Number(total) : Number(total);
      
      res.json({
        success: true,
        data: {
          files: filesWithUrl,
          pagination: {
            page: Number(pageNum),
            limit: Number(limitNum),
            total: totalNum,
            pages: Math.ceil(totalNum / Number(limitNum))
          }
        }
      });
    } catch (error) {
      console.error('Erreur récupération fichiers:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des fichiers',
        details: error.message
      });
    }
  }
);

// -------------------------------------------------------------
// Contexte multi-tenant: listes des clients et projets
// Ces endpoints fournissent les données attendues par le sélecteur
// de contexte du frontend (clients/projets par client)
// -------------------------------------------------------------

// GET /api/clients
// Retourne la liste des clients accessibles par l'utilisateur courant
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Déterminer l'étendue selon le rôle
    // - super_admin/admin: voir tous les clients (agentId = null)
    // - agent: voir ses clients (agentId = userId)
    // - client/user: ne retourner que lui-même comme contexte
    if (userRole === 'client' || userRole === 'user') {
      const name = [req.user?.first_name, req.user?.last_name].filter(Boolean).join(' ').trim() || req.user?.company || req.user?.email;
      return res.json({
        success: true,
        data: [{
          id: Number(req.user?.company_id ?? req.user?.client_id ?? req.user?.id),
          name,
          status: req.user?.is_active ? 'active' : 'inactive'
        }]
      });
    }

    const filters = {
      agentId: (userRole === 'super_admin' || userRole === 'admin') ? null : userId,
      status: 'active'
    };

    const clients = await agentService.getAgentClients(userId, filters);

    // Uniformiser la forme attendue par le frontend
    const contexts = (clients || []).map(c => ({
      id: Number(c.id),
      name: (c.company && String(c.company).trim()) || [c.first_name, c.last_name].filter(Boolean).join(' ').trim() || c.email,
      status: c.is_active ? 'active' : 'inactive'
    }));

    return res.json({ success: true, data: contexts });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients (context selector):', error);
    return res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

// GET /api/clients/:clientId/projects
// Retourne la liste des projets pour un client spécifique
router.get('/:clientId/projects', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Contrôle d'accès simple: admin/super_admin ont accès à tout
    // agent: doit avoir accès au client
    // client/user: doit correspondre au client
    if (userRole === 'agent') {
      const hasAccess = await agentService.checkAgentClientAccess(userId, clientId);
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: 'Accès refusé au client' });
      }
    } else if (userRole === 'client' || userRole === 'user') {
      const userClientId = req.user?.client_id ?? req.user?.company_id ?? req.user?.id;
      if (String(userClientId) !== String(clientId)) {
        return res.status(403).json({ success: false, error: 'Accès refusé' });
      }
    }

    const projects = await projectService.getClientProjects(clientId);
    const contexts = (projects || []).map(p => ({
      id: Number(p.id),
      name: (p.name && String(p.name).trim()) || (p.title && String(p.title).trim()) || `Projet ${p.id}`,
      status: p.status || 'en_cours'
    }));

    return res.json({ success: true, data: contexts });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets (context selector):', error);
    return res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

// POST /api/clients/:clientId/projects/:projectId/widgets/files
router.post('/:clientId/projects/:projectId/widgets/files',
  authenticateToken,
  validateScope,
  requireProjectEdit,
  upload.array('files', 10),
  enforceScope,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { folder_path = '/' } = req.body;
      const uploadedFiles = [];
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Aucun fichier fourni' 
        });
      }
      
      // Détecter les colonnes disponibles
      const columns = await databaseService.query('SHOW COLUMNS FROM files');
      const colNames = columns.map(c => c.Field);
      const has = (name) => colNames.includes(name);
      
      for (const file of req.files) {
        const dbColumns = [];
        const dbValues = [];
        
        // name/filename
        if (has('name')) {
          dbColumns.push('name'); dbValues.push(file.filename);
        } else {
          dbColumns.push('filename'); dbValues.push(file.filename);
        }
        
        if (has('original_name')) { dbColumns.push('original_name'); dbValues.push(file.originalname); }
        
        // path/file_path
        if (has('path')) {
          dbColumns.push('path'); dbValues.push(file.path);
        } else if (has('file_path')) {
          dbColumns.push('file_path'); dbValues.push(file.path);
        }
        
        // url (optionnel)
        if (has('url')) {
          const url = `/uploads/clients/${clientId}/projects/${projectId}/files/${file.filename}`;
          dbColumns.push('url'); dbValues.push(url);
        }
        
        // size/file_size
        if (has('size')) {
          dbColumns.push('size'); dbValues.push(file.size);
        } else {
          dbColumns.push('file_size'); dbValues.push(file.size);
        }
        
        if (has('mime_type')) { dbColumns.push('mime_type'); dbValues.push(file.mimetype); }
        
        // client_id, project_id
        dbColumns.push('client_id'); dbValues.push(clientId);
        dbColumns.push('project_id'); dbValues.push(projectId);
        
        // folder_path (optionnel)
        if (has('folder_path')) {
          dbColumns.push('folder_path'); dbValues.push(folder_path || '/');
        }
        
        // created_by/uploaded_by
        if (has('created_by')) {
          dbColumns.push('created_by'); dbValues.push(req.user.id);
        } else if (has('uploaded_by')) {
          dbColumns.push('uploaded_by'); dbValues.push(req.user.id);
        }
        
        const placeholders = dbValues.map(() => '?').join(', ');
        const insertSql = `
          INSERT INTO files (${dbColumns.join(', ')})
          VALUES (${placeholders})
        `;
        const result = await databaseService.run(insertSql, dbValues);
        
        uploadedFiles.push({
          id: result.lastID,
          name: file.filename,
          original_name: file.originalname,
          size: file.size,
          mime_type: file.mimetype,
          folder_path: folder_path || '/',
          client_id: clientId,
          project_id: projectId,
          created_by: req.user.id
        });
      }
      
      res.json({
        success: true,
        data: { files: uploadedFiles },
        message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`
      });
    } catch (error) {
      console.error('Erreur upload fichiers:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de l\'upload des fichiers',
        details: error.message
      });
    }
  }
);

// DELETE /api/clients/:clientId/projects/:projectId/widgets/files/:fileId
router.delete('/:clientId/projects/:projectId/widgets/files/:fileId',
  authenticateToken,
  validateScope,
  requireProjectEdit,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { fileId } = req.params;
      
      // Détecter les colonnes disponibles
      const columns = await databaseService.query('SHOW COLUMNS FROM files');
      const colNames = columns.map(c => c.Field);
      const has = (name) => colNames.includes(name);
      
      // Vérifier que le fichier appartient au scope
      let whereClause = 'WHERE id = ? AND client_id = ? AND project_id = ?';
      const params = [fileId, clientId, projectId];
      if (has('is_deleted')) {
        whereClause += ' AND is_deleted = FALSE';
      }
      const selectSql = `
        SELECT id, ${has('path') ? 'path' : (has('file_path') ? 'file_path' : 'NULL')} as path
        FROM files
        ${whereClause}
      `;
      const file = await databaseService.query(selectSql, params);
      
      if (file.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Fichier non trouvé' 
        });
      }
      
      // Soft delete si possible, sinon suppression définitive
      if (has('is_deleted')) {
        const updateSql = `
          UPDATE files
          SET is_deleted = TRUE${has('updated_at') ? ', updated_at = NOW()' : ''}
          WHERE id = ? AND client_id = ? AND project_id = ?
        `;
        await databaseService.run(updateSql, [fileId, clientId, projectId]);
      } else {
        const deleteSql = `
          DELETE FROM files
          WHERE id = ? AND client_id = ? AND project_id = ?
        `;
        await databaseService.run(deleteSql, [fileId, clientId, projectId]);
      }
      
      res.json({
        success: true,
        message: 'Fichier supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la suppression du fichier',
        details: error.message
      });
    }
  }
);

// Ajouter le téléchargement direct par ID
router.get('/:clientId/projects/:projectId/widgets/files/:fileId/download',
  authenticateToken,
  validateScope,
  requireProjectView,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { fileId } = req.params;

      // Préparer cols dynamiques
      const columns = await databaseService.query('SHOW COLUMNS FROM files');
      const colNames = columns.map(c => c.Field);
      const has = (name) => colNames.includes(name);

      const selectCols = [
        'id',
        has('name') ? 'name' : 'filename AS name',
        has('original_name') ? 'original_name' : (has('name') ? 'name AS original_name' : 'filename AS original_name'),
        has('mime_type') ? 'mime_type' : `'application/octet-stream' AS mime_type`,
        'client_id',
        'project_id'
      ].join(', ');

      const fileRows = await databaseService.query(
        `SELECT ${selectCols} FROM files WHERE id = ? AND client_id = ? AND project_id = ? LIMIT 1`,
        [fileId, clientId, projectId]
      );
      const file = fileRows && fileRows[0];
      if (!file) {
        return res.status(404).json({ success: false, error: 'Fichier introuvable' });
      }

      const filePath = path.join(process.cwd(), 'uploads', 'clients', String(clientId), 'projects', String(projectId), 'files', file.name);
      try {
        await fs.access(filePath);
      } catch (e) {
        return res.status(404).json({ success: false, error: 'Fichier non trouvé sur le serveur' });
      }

      res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
      const downloadName = file.original_name || file.name;
      return res.download(filePath, downloadName);
    } catch (error) {
      console.error('Erreur téléchargement fichier:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors du téléchargement du fichier', details: error.message });
    }
  }
);

// Routes dossiers (CRUD)
router.post('/:clientId/projects/:projectId/widgets/files/folders',
  authenticateToken,
  validateScope,
  requireProjectEdit,
  enforceScope,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { name, parent_path, folder_path } = req.body;
      const parentPath = typeof parent_path === 'string' ? parent_path : (typeof folder_path === 'string' ? folder_path : '/');
      const folderName = (name || '').trim();
      if (!folderName || /[\\\/]/.test(folderName)) {
        return res.status(400).json({ success: false, error: 'Nom de dossier invalide' });
      }

      const columns = await databaseService.query('SHOW COLUMNS FROM files');
      const colNames = columns.map(c => c.Field);
      const has = (n) => colNames.includes(n);

      if (!has('folder_path') || !has('mime_type')) {
        return res.status(400).json({ success: false, error: 'La gestion des dossiers nécessite les colonnes folder_path et mime_type' });
      }

      const nameCol = has('name') ? 'name' : 'filename';
      const sizeCol = has('size') ? 'size' : (has('file_size') ? 'file_size' : null);

      // Vérifier doublon
      const [dup] = await databaseService.query(
        `SELECT id FROM files WHERE client_id = ? AND project_id = ? AND folder_path = ? AND ${nameCol} = ? AND mime_type IN ('application/x-directory','folder','inode/directory') LIMIT 1`,
        [clientId, projectId, parentPath || '/', folderName]
      );
      if (dup) {
        return res.status(409).json({ success: false, error: 'Un dossier du même nom existe déjà' });
      }

      const dbColumns = [nameCol, 'mime_type', 'client_id', 'project_id', 'folder_path'];
      const dbValues = [folderName, 'application/x-directory', clientId, projectId, parentPath || '/'];

      // Inclure original_name si la colonne existe (NOT NULL dans certains schémas)
      if (has('original_name')) { dbColumns.push('original_name'); dbValues.push(folderName); }

      // Inclure file_path/path pour les dossiers si la colonne existe
      const filePathCol = has('path') ? 'path' : (has('file_path') ? 'file_path' : null);
      if (filePathCol) {
        const base = (parentPath || '/').trim();
        const normalized = base.endsWith('/') ? base : base + '/';
        const computedPath = normalized + folderName;
        dbColumns.push(filePathCol); dbValues.push(computedPath);
      }

      if (sizeCol) { dbColumns.push(sizeCol); dbValues.push(0); }
      if (has('created_by')) { dbColumns.push('created_by'); dbValues.push(req.user.id); }

      const placeholders = dbValues.map(() => '?').join(', ');
      const insertSql = `INSERT INTO files (${dbColumns.join(', ')}) VALUES (${placeholders})`;
      const result = await databaseService.run(insertSql, dbValues);

      const created = {
        id: Number(result.insertId ?? result.lastID),
        name: folderName,
        mime_type: 'application/x-directory',
        folder_path: parentPath || '/',
        size: 0,
        client_id: clientId,
        project_id: projectId,
        created_by: req.user.id
      };

      return res.status(201).json({ success: true, data: { folder: created }, message: 'Dossier créé avec succès' });
    } catch (error) {
      console.error('Erreur création dossier:', {
        error: error.message,
        stack: error.stack,
        clientId: req.validatedScope?.clientId,
        projectId: req.validatedScope?.projectId,
        folderName: req.body?.name,
        parentPath: req.body?.parent_path || req.body?.folder_path,
        userId: req.user?.id
      });
      return res.status(500).json({ success: false, error: 'Erreur lors de la création du dossier', details: error.message });
    }
  }
);

// PATCH: renommer/déplacer un dossier
router.patch('/:clientId/projects/:projectId/widgets/files/folders/:folderId',
  authenticateToken,
  validateScope,
  requireProjectEdit,
  enforceScope,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { folderId } = req.params;
      const { new_name, new_parent_path } = req.body;

      const columns = await databaseService.query('SHOW COLUMNS FROM files');
      const colNames = columns.map(c => c.Field);
      const has = (n) => colNames.includes(n);

      if (!has('folder_path') || !has('mime_type')) {
        return res.status(400).json({ success: false, error: 'La gestion des dossiers nécessite les colonnes folder_path et mime_type' });
      }

      const nameCol = has('name') ? 'name' : 'filename';
      const folderPathCol = 'folder_path';

      const rows = await databaseService.query(
        `SELECT id, ${nameCol} AS name, ${folderPathCol} AS folder_path FROM files WHERE id = ? AND client_id = ? AND project_id = ? AND mime_type IN ('application/x-directory','folder','inode/directory') LIMIT 1`,
        [folderId, clientId, projectId]
      );
      const folder = rows && rows[0];
      if (!folder) {
        return res.status(404).json({ success: false, error: 'Dossier introuvable' });
      }

      const oldName = folder.name;
      const oldParentPath = folder.folder_path || '/';
      const oldPath = oldParentPath === '/' ? `/${oldName}` : `${oldParentPath}/${oldName}`;

      const targetName = (new_name ?? oldName).trim();
      const targetParent = typeof new_parent_path === 'string' ? new_parent_path : oldParentPath;

      if (!targetName || /[\\\/]/.test(targetName)) {
        return res.status(400).json({ success: false, error: 'Nouveau nom de dossier invalide' });
      }

      // Vérifier doublon au nouvel emplacement
      const [dup] = await databaseService.query(
        `SELECT id FROM files WHERE client_id = ? AND project_id = ? AND ${folderPathCol} = ? AND ${nameCol} = ? AND mime_type IN ('application/x-directory','folder','inode/directory') AND id != ? LIMIT 1`,
        [clientId, projectId, targetParent || '/', targetName, folderId]
      );
      if (dup) {
        return res.status(409).json({ success: false, error: 'Un dossier du même nom existe déjà dans le dossier cible' });
      }

      const updates = [];
      const params = [];
      if (targetName !== oldName) { updates.push(`${nameCol} = ?`); params.push(targetName); }
      if (targetParent !== oldParentPath) { updates.push(`${folderPathCol} = ?`); params.push(targetParent || '/'); }
      if (has('updated_at')) { updates.push('updated_at = NOW()'); }

      if (updates.length > 0) {
        await databaseService.query(
          `UPDATE files SET ${updates.join(', ')} WHERE id = ? AND client_id = ? AND project_id = ?`,
          [...params, folderId, clientId, projectId]
        );
      }

      const newPath = (targetParent || '/') === '/' ? `/${targetName}` : `${targetParent}/${targetName}`;
      if (newPath !== oldPath) {
        await databaseService.query(
          `UPDATE files 
           SET ${folderPathCol} = CONCAT(?, SUBSTRING(${folderPathCol}, LENGTH(?) + 1))${has('updated_at') ? ', updated_at = NOW()' : ''}
           WHERE client_id = ? AND project_id = ? AND ${folderPathCol} LIKE CONCAT(?, '%')`,
          [newPath, oldPath, clientId, projectId, oldPath]
        );
      }

      return res.json({ success: true, data: { folder: { id: folderId, name: targetName, folder_path: targetParent, mime_type: 'application/x-directory' } }, message: 'Dossier mis à jour avec succès' });
    } catch (error) {
      console.error('Erreur mise à jour dossier:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du dossier', details: error.message });
    }
  }
);

// DELETE: supprimer un dossier et son contenu
router.delete('/:clientId/projects/:projectId/widgets/files/folders/:folderId',
  authenticateToken,
  validateScope,
  requireProjectEdit,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { folderId } = req.params;

      const columns = await databaseService.query('SHOW COLUMNS FROM files');
      const colNames = columns.map(c => c.Field);
      const has = (n) => colNames.includes(n);

      if (!has('folder_path') || !has('mime_type')) {
        return res.status(400).json({ success: false, error: 'La gestion des dossiers nécessite les colonnes folder_path et mime_type' });
      }

      const nameCol = has('name') ? 'name' : 'filename';
      const folderPathCol = 'folder_path';

      const rows = await databaseService.query(
        `SELECT id, ${nameCol} AS name, ${folderPathCol} AS folder_path FROM files WHERE id = ? AND client_id = ? AND project_id = ? AND mime_type IN ('application/x-directory','folder','inode/directory') LIMIT 1`,
        [folderId, clientId, projectId]
      );
      const folder = rows && rows[0];
      if (!folder) {
        return res.status(404).json({ success: false, error: 'Dossier introuvable' });
      }

      const oldParentPath = folder.folder_path || '/';
      const oldPath = oldParentPath === '/' ? `/${folder.name}` : `${oldParentPath}/${folder.name}`;

      if (has('is_deleted')) {
        await databaseService.query(
          `UPDATE files SET is_deleted = TRUE${has('updated_at') ? ', updated_at = NOW()' : ''} WHERE client_id = ? AND project_id = ? AND (id = ? OR ${folderPathCol} LIKE CONCAT(?, '%'))`,
          [clientId, projectId, folderId, oldPath]
        );
      } else {
        await databaseService.query(
          `DELETE FROM files WHERE client_id = ? AND project_id = ? AND (id = ? OR ${folderPathCol} LIKE CONCAT(?, '%'))`,
          [clientId, projectId, folderId, oldPath]
        );
      }

      return res.json({ success: true, message: 'Dossier supprimé avec son contenu' });
    } catch (error) {
      console.error('Erreur suppression dossier:', error);
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression du dossier', details: error.message });
    }
  }
);

// Routes pour les tâches avec scoping strict

// GET /api/clients/:clientId/projects/:projectId/widgets/tasks
router.get('/:clientId/projects/:projectId/widgets/tasks',
  authenticateToken,
  validateScope,
  requireProjectView,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { status, priority, assigned_to, page = 1, limit = 50 } = req.query;
      
      // Détecter les colonnes disponibles de la table tasks
      const columns = await databaseService.query('SHOW COLUMNS FROM tasks');
      const colNames = columns.map(c => c.Field);
      const has = (name) => colNames.includes(name);

      let whereClause = "WHERE client_id = ? AND project_id = ?";
      let params = [clientId, projectId];
      // Par défaut, nous excluons les tâches annulées UNIQUEMENT si aucun filtre de statut n'est fourni.
      // Si un filtre de statut est explicitement demandé, nous n'excluons pas 'cancelled' afin de
      // permettre la récupération correcte des tâches annulées.
      if (has('status') && !status) {
        whereClause += " AND status != 'cancelled'";
      }
      
      // Filtres optionnels
      if (status && has('status')) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      if (priority) {
        whereClause += ' AND priority = ?';
        params.push(priority);
      }
      if (assigned_to) {
        if (has('assigned_to')) {
          whereClause += ' AND assigned_to = ?';
          params.push(assigned_to);
        } else if (has('agent_id')) {
          whereClause += ' AND agent_id = ?';
          params.push(assigned_to);
        }
      }
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      // Construire dynamiquement la liste de colonnes à sélectionner
      const selectCols = [
        'id',
        'title',
        has('description') ? 'description' : "'' AS description",
        has('status') ? 'status' : "'pending' AS status",
        has('priority') ? 'priority' : "'normal' AS priority",
        has('assigned_to') ? 'assigned_to' : (has('agent_id') ? 'agent_id AS assigned_to' : 'NULL AS assigned_to'),
        has('due_date') ? 'due_date' : 'NULL AS due_date',
        // Inclure les colonnes de progression si elles existent pour permettre l'affichage du % côté frontend
        has('estimated_hours') ? 'estimated_hours' : 'NULL AS estimated_hours',
        has('actual_hours') ? 'actual_hours' : 'NULL AS actual_hours',
        has('completed_at') ? 'completed_at' : 'NULL AS completed_at',
        'created_at',
        has('updated_at') ? 'updated_at' : 'created_at AS updated_at'
      ].join(', ');
      
      // Récupérer les tâches avec scoping strict
      const orderBy = has('priority')
        ? `CASE priority 
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
            ELSE 5
          END, created_at DESC`
        : 'created_at DESC';

      const tasks = await databaseService.query(`
        SELECT ${selectCols}
        FROM tasks 
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `, [...params, limitNum, offset]);
      
      // Normaliser les types pour JSON (BigInt -> Number)
      const normalizedTasks = tasks.map(t => ({
        ...t,
        id: typeof t.id === 'bigint' ? Number(t.id) : t.id,
        assigned_to: typeof t.assigned_to === 'bigint' ? Number(t.assigned_to) : t.assigned_to,
        // Normaliser les heures en nombres pour le calcul de progression côté client
        estimated_hours: typeof t.estimated_hours !== 'undefined' && t.estimated_hours !== null ? Number(t.estimated_hours) : null,
        actual_hours: typeof t.actual_hours !== 'undefined' && t.actual_hours !== null ? Number(t.actual_hours) : null
      }));
      
      // Statistiques des tâches
      let stats = [];
      if (has('status')) {
        // Inclure toutes les statuts dans les statistiques, y compris 'cancelled'.
        stats = await databaseService.query(`
          SELECT 
            status,
            COUNT(*) as count
          FROM tasks 
          WHERE client_id = ? AND project_id = ?
          GROUP BY status
        `, [clientId, projectId]);
      }
      
      const normalizedStats = stats.reduce((acc, stat) => {
        const cnt = typeof stat.count === 'bigint' ? Number(stat.count) : stat.count;
        acc[stat.status] = cnt;
        return acc;
      }, {});
      
      res.json({
        success: true,
        data: {
          tasks: normalizedTasks,
          stats: normalizedStats,
          pagination: {
            page: pageNum,
            limit: limitNum
          }
        }
      });
    } catch (error) {
      console.error('Erreur récupération tâches:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des tâches',
        details: error?.sqlMessage || error?.message || String(error)
      });
    }
  }
);

// POST /api/clients/:clientId/projects/:projectId/widgets/tasks
router.post('/:clientId/projects/:projectId/widgets/tasks',
  authenticateToken,
  validateScope,
  requireProjectEdit,
  enforceScope,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      let { title, description, priority = 'medium', assigned_to, due_date, category } = req.body;
      const requestedStatus = req.body?.status;
      // Progression
      let { estimated_hours, actual_hours } = req.body;
      
      if (!title) {
        return res.status(400).json({ 
          success: false, 
          error: 'Le titre est requis' 
        });
      }
      
      // Détecter dynamiquement les colonnes disponibles de la table tasks
      const columns = await databaseService.query('SHOW COLUMNS FROM tasks');
      const colNames = columns.map(c => c.Field);
      const has = (name) => colNames.includes(name);

      // Déterminer dynamiquement les valeurs autorisées pour status (ENUM) s'il y en a
      const statusCol = columns.find(c => c.Field === 'status');
      let allowedStatuses = null;
      if (statusCol && typeof statusCol.Type === 'string') {
        const m = statusCol.Type.match(/^enum\((.*)\)$/i);
        if (m && m[1]) {
          allowedStatuses = m[1]
            .split(',')
            .map(s => s.trim().replace(/^'|"|`|\(|\)|\s+|\)$/g, ''))
            .map(s => s.replace(/^'|"|`/, '').replace(/'|"|`$/, ''));
        }
      }

      // Normaliser/valider certains champs pour éviter les erreurs SQL
      const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
      if (typeof priority === 'string' && !allowedPriorities.includes(priority)) {
        priority = 'medium';
      }
      if (typeof assigned_to !== 'undefined') {
        assigned_to = assigned_to === null || assigned_to === '' ? null : Number(assigned_to);
        if (Number.isNaN(assigned_to)) assigned_to = null;
      }
      if (typeof due_date !== 'undefined') {
        const m = String(due_date || '').match(/^\d{4}-\d{2}-\d{2}$/);
        if (!m) {
          // tenter de convertir, sinon mettre null
          const d = new Date(due_date);
          if (isNaN(d.getTime())) {
            due_date = null;
          } else {
            const pad = (n) => String(n).padStart(2, '0');
            due_date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          }
        }
      }
      if (typeof estimated_hours !== 'undefined') {
        const n = Number(estimated_hours);
        estimated_hours = Number.isFinite(n) && n >= 0 ? n : null;
      }
      if (typeof actual_hours !== 'undefined') {
        const n = Number(actual_hours);
        actual_hours = Number.isFinite(n) && n >= 0 ? n : 0;
      }

      // Construire dynamiquement l'INSERT en fonction des colonnes existantes
      const insertCols = ['title', 'client_id', 'project_id'];
      const insertValues = [title, clientId, projectId];

      // description
      if (has('description')) {
        insertCols.push('description');
        insertValues.push(typeof description !== 'undefined' ? description : null);
      }
      // priority
      if (has('priority')) {
        insertCols.push('priority');
        insertValues.push(priority);
      }
      // assigned_to ou agent_id
      if (typeof assigned_to !== 'undefined') {
        if (has('assigned_to')) {
          insertCols.push('assigned_to');
          insertValues.push(assigned_to || null);
        } else if (has('agent_id')) {
          insertCols.push('agent_id');
          insertValues.push(assigned_to || null);
        }
      }
      // due_date
      if (has('due_date')) {
        insertCols.push('due_date');
        insertValues.push(typeof due_date !== 'undefined' ? due_date || null : null);
      }
      // estimated_hours
      if (has('estimated_hours')) {
        insertCols.push('estimated_hours');
        insertValues.push(typeof estimated_hours !== 'undefined' ? estimated_hours : null);
      }
      // actual_hours
      if (has('actual_hours')) {
        insertCols.push('actual_hours');
        insertValues.push(typeof actual_hours !== 'undefined' ? actual_hours : 0);
      }
      // category
      if (has('category')) {
        insertCols.push('category');
        insertValues.push(typeof category !== 'undefined' ? category || null : null);
      }
      // status: utiliser la valeur fournie après normalisation ou une valeur par défaut compatible
      if (has('status')) {
        // Fonction de normalisation vers une valeur autorisée
        const mapToAllowedStatus = (input, allowed) => {
          if (!input) return null;
          const v = String(input).toLowerCase();
          // Correspondance directe
          if (allowed && allowed.includes(v)) return v;
          // Dictionnaire de synonymes
          const synonyms = {
            pending: ['pending', 'todo'],
            todo: ['todo', 'pending'],
            in_progress: ['in_progress', 'progress', 'doing'],
            review: ['review', 'in_review', 'awaiting_review'],
            done: ['done', 'completed', 'complete'],
            cancelled: ['cancelled', 'canceled', 'abandoned']
          };
          // Essayer de mapper le v vers une clé supportée présente dans allowed
          for (const [target, inputs] of Object.entries(synonyms)) {
            if (inputs.includes(v)) {
              if (!allowed || allowed.includes(target)) return target;
              // Si la cible n'est pas autorisée, essayer la deuxième valeur du tableau inputs
              for (const candidate of inputs) {
                if (allowed.includes(candidate)) return candidate;
              }
            }
          }
          // Dernier recours: retourner null pour laisser la base prendre la valeur par défaut
          return null;
        };

        let normalizedStatus = null;
        if (requestedStatus) {
          normalizedStatus = mapToAllowedStatus(requestedStatus, allowedStatuses || null);
        }

        // Choisir une valeur par défaut robuste si aucune n'est fournie ou normalisable
        if (!normalizedStatus) {
          // Préférer 'todo' ou 'pending' si autorisés
          if (allowedStatuses && allowedStatuses.length) {
            if (allowedStatuses.includes('todo')) normalizedStatus = 'todo';
            else if (allowedStatuses.includes('pending')) normalizedStatus = 'pending';
            else if (allowedStatuses.includes('in_progress')) normalizedStatus = 'in_progress';
            else normalizedStatus = allowedStatuses[0];
          } else {
            // Si pas d'ENUM (VARCHAR), garder 'pending' par défaut pour compatibilité
            normalizedStatus = 'pending';
          }
        }

        insertCols.push('status');
        insertValues.push(normalizedStatus);
      }
      // created_by si la colonne existe
      if (has('created_by')) {
        insertCols.push('created_by');
        insertValues.push(req.user.id);
      }

      const placeholders = insertCols.map(() => '?').join(', ');
      const sql = `INSERT INTO tasks (${insertCols.join(', ')}) VALUES (${placeholders})`;
      const result = await databaseService.query(sql, insertValues);
      
      // Récupérer la tâche créée
      const [task] = await databaseService.query(
        'SELECT * FROM tasks WHERE id = ? AND client_id = ? AND project_id = ?',
        [result.insertId, clientId, projectId]
      );
      
      res.status(201).json({
        success: true,
        data: { task },
        message: 'Tâche créée avec succès'
      });
    } catch (error) {
      console.error('Erreur création tâche:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la création de la tâche',
        details: error?.sqlMessage || error?.message || String(error)
      });
    }
  }
);

// PATCH /api/clients/:clientId/projects/:projectId/widgets/tasks/:taskId
router.patch('/:clientId/projects/:projectId/widgets/tasks/:taskId',
  authenticateToken,
  validateScope,
  requireProjectEdit,
  enforceScope,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { taskId } = req.params;
      const updates = { ...req.body };
      
      // Vérifier que la tâche appartient au scope
      // Récupérer la tâche avec les champs utiles pour la progression si disponibles
      const [task] = await databaseService.query(
        'SELECT id, status, estimated_hours, actual_hours FROM tasks WHERE id = ? AND client_id = ? AND project_id = ?',
        [taskId, clientId, projectId]
      );
      
      if (!task) {
        return res.status(404).json({ 
          success: false, 
          error: 'Tâche non trouvée' 
        });
      }
      
      // Détecter dynamiquement les colonnes disponibles de la table tasks
      const columns = await databaseService.query('SHOW COLUMNS FROM tasks');
      const colNames = columns.map(c => c.Field);
      const has = (name) => colNames.includes(name);

      // Normaliser/valider certains champs pour éviter les erreurs SQL
      if (typeof updates.priority === 'string') {
        const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!allowedPriorities.includes(updates.priority)) {
          // retirer la priorité invalide pour éviter une 500
          delete updates.priority;
        }
      }
      // Normaliser progression
      if (typeof updates.estimated_hours !== 'undefined') {
        const n = Number(updates.estimated_hours);
        updates.estimated_hours = Number.isFinite(n) && n >= 0 ? n : null;
      }
      if (typeof updates.actual_hours !== 'undefined') {
        const n = Number(updates.actual_hours);
        updates.actual_hours = Number.isFinite(n) && n >= 0 ? n : 0;
      }
      // Normaliser le statut selon les valeurs ENUM réellement présentes
      if (typeof updates.status === 'string') {
        const statusCol = columns.find(c => c.Field === 'status');
        let allowedStatuses = null;
        if (statusCol && typeof statusCol.Type === 'string') {
          const m = statusCol.Type.match(/^enum\((.*)\)$/i);
          if (m && m[1]) {
            allowedStatuses = m[1]
              .split(',')
              .map(s => s.trim().replace(/^'|"|`|\(|\)|\s+|\)$/g, ''))
              .map(s => s.replace(/^'|"|`/, '').replace(/'|"|`$/, ''));
          }
        }
        const mapToAllowedStatus = (input, allowed) => {
          if (!input) return null;
          const v = String(input).toLowerCase();
          if (allowed && allowed.includes(v)) return v;
          const synonyms = {
            pending: ['pending', 'todo'],
            todo: ['todo', 'pending'],
            in_progress: ['in_progress', 'progress', 'doing'],
            // Certaines bases utilisent 'pending_validation' au lieu de 'review'
            pending_validation: ['pending_validation', 'review', 'in_review', 'awaiting_review'],
            review: ['review', 'in_review', 'awaiting_review'],
            done: ['done', 'completed', 'complete'],
            // Certaines bases utilisent 'rejected' au lieu de 'cancelled'
            rejected: ['rejected', 'cancelled', 'canceled', 'abandoned', 'closed'],
            cancelled: ['cancelled', 'canceled', 'abandoned']
          };
          for (const [target, inputs] of Object.entries(synonyms)) {
            if (inputs.includes(v)) {
              if (!allowed || allowed.includes(target)) return target;
              for (const candidate of inputs) {
                if (allowed.includes(candidate)) return candidate;
              }
            }
          }
          return null;
        };
        const normalized = mapToAllowedStatus(updates.status, allowedStatuses || null);
        if (normalized) updates.status = normalized;
        else delete updates.status; // retirer valeur invalide pour éviter troncature de données
      }
      if (typeof updates.assigned_to !== 'undefined') {
        updates.assigned_to = updates.assigned_to === null || updates.assigned_to === '' ? null : Number(updates.assigned_to);
        if (Number.isNaN(updates.assigned_to)) updates.assigned_to = null;
      }
      if (typeof updates.due_date !== 'undefined') {
        const m = String(updates.due_date || '').match(/^\d{4}-\d{2}-\d{2}$/);
        if (!m) {
          const d = new Date(updates.due_date);
          if (isNaN(d.getTime())) {
            updates.due_date = null;
          } else {
            const pad = (n) => String(n).padStart(2, '0');
            updates.due_date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          }
        }
      }

      // Construire la requête de mise à jour en fonction des colonnes existantes
      const updateFields = [];
      const updateValues = [];
      const candidateUpdates = ['title', 'description', 'status', 'priority', 'due_date', 'category', 'estimated_hours', 'actual_hours'];
      
      for (const [key, value] of Object.entries(updates)) {
        if (candidateUpdates.includes(key) && has(key)) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        } else if (key === 'assigned_to') {
          if (has('assigned_to')) {
            updateFields.push('assigned_to = ?');
            updateValues.push(value);
          } else if (has('agent_id')) {
            updateFields.push('agent_id = ?');
            updateValues.push(value);
          }
        }
      }
      
      if (updateFields.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Aucun champ valide à mettre à jour' 
        });
      }
      
      // Règles automatiques liées à la progression: si 100%, passer en done
      // Calculer les valeurs finales pour comparer
      let finalEstimated = task?.estimated_hours;
      let finalActual = task?.actual_hours;
      if (typeof updates.estimated_hours !== 'undefined') finalEstimated = updates.estimated_hours;
      if (typeof updates.actual_hours !== 'undefined') finalActual = updates.actual_hours;
      if (has('status') && typeof finalEstimated !== 'undefined' && typeof finalActual !== 'undefined' && finalEstimated) {
        const pct = Math.round((Number(finalActual) / Number(finalEstimated)) * 100);
        if (pct >= 100) {
          // Forcer le statut à 'done' si 100%
          updateFields.push('status = ?');
          updateValues.push('done');
        } else if (pct > 0 && (!updates.status || updates.status === 'todo')) {
          // Mettre en in_progress si >0 et pas explicitement défini autrement
          updateFields.push('status = ?');
          updateValues.push('in_progress');
        }
      }

      // Ajouter completed_at si status = done
      if (has('completed_at')) {
        // Si le statut est ou devient 'done', fixer completed_at
        if (updates.status === 'done' || updateValues.includes('done')) {
          updateFields.push('completed_at = NOW()');
        } else if (updates.status && updates.status !== 'done') {
          updateFields.push('completed_at = NULL');
        }
      }
      
      if (has('updated_at')) {
        updateFields.push('updated_at = NOW()');
      }
      updateValues.push(taskId, clientId, projectId);
      
      await databaseService.query(`
        UPDATE tasks 
        SET ${updateFields.join(', ')}
        WHERE id = ? AND client_id = ? AND project_id = ?
      `, updateValues);
      
      // Récupérer la tâche mise à jour
      const [updatedTask] = await databaseService.query(
        'SELECT * FROM tasks WHERE id = ? AND client_id = ? AND project_id = ?',
        [taskId, clientId, projectId]
      );
      
      res.json({
        success: true,
        data: { task: updatedTask },
        message: 'Tâche mise à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la mise à jour de la tâche',
        details: error?.sqlMessage || error?.message || String(error)
      });
    }
  }
);

// POST /api/clients/:clientId/projects/:projectId/widgets/tasks/:taskId/assignees
router.post('/:clientId/projects/:projectId/widgets/tasks/:taskId/assignees',
  authenticateToken,
  validateScope,
  requireProjectEdit,
  enforceScope,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { taskId } = req.params;
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'user_id est requis' 
        });
      }
      
      // Vérifier que la tâche appartient au scope
      const [task] = await databaseService.query(
        'SELECT id FROM tasks WHERE id = ? AND client_id = ? AND project_id = ?',
        [taskId, clientId, projectId]
      );
      
      if (!task) {
        return res.status(404).json({ 
          success: false, 
          error: 'Tâche non trouvée' 
        });
      }
      
      // Ajouter l'assignation avec scoping strict
      await databaseService.query(`
        INSERT IGNORE INTO task_assignees (
          task_id, user_id, client_id, project_id, assigned_by
        ) VALUES (?, ?, ?, ?, ?)
      `, [taskId, user_id, clientId, projectId, req.user.id]);
      
      // Mettre à jour le champ assigned_to de la tâche
      await databaseService.query(
        'UPDATE tasks SET assigned_to = ?, updated_at = NOW() WHERE id = ? AND client_id = ? AND project_id = ?',
        [user_id, taskId, clientId, projectId]
      );
      
      res.json({
        success: true,
        message: 'Utilisateur assigné à la tâche avec succès'
      });
    } catch (error) {
      console.error('Erreur assignation tâche:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de l\'assignation de la tâche' 
      });
    }
  }
);

// Route pour récupérer les statistiques du projet
// GET /api/clients/:clientId/projects/:projectId/widgets/dashboard
router.get('/:clientId/projects/:projectId/widgets/dashboard',
  authenticateToken,
  validateScope,
  requireProjectView,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      
      // Récupérer les statistiques avec scoping strict
      const [projectStats] = await databaseService.query(`
        SELECT 
          p.name as project_name,
          p.status as project_status,
          p.priority as project_priority,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as in_progress_tasks,
          COUNT(DISTINCT f.id) as total_files,
          SUM(f.size) as total_file_size,
          COUNT(DISTINCT wi.id) as active_widgets
        FROM projects p
        LEFT JOIN tasks t ON t.client_id = p.client_id AND t.project_id = p.id AND t.status != 'cancelled'
        LEFT JOIN files f ON f.client_id = p.client_id AND f.project_id = p.id AND f.is_deleted = FALSE
        LEFT JOIN widget_instances wi ON wi.client_id = p.client_id AND wi.project_id = p.id AND wi.is_active = TRUE
        WHERE p.client_id = ? AND p.id = ?
        GROUP BY p.id
      `, [clientId, projectId]);
      
      if (!projectStats) {
        return res.status(404).json({ 
          success: false, 
          error: 'Projet non trouvé' 
        });
      }
      
      // Calculer le pourcentage de progression
      const progress = projectStats.total_tasks > 0 
        ? Math.round((projectStats.completed_tasks / projectStats.total_tasks) * 100)
        : 0;
      
      res.json({
        success: true,
        data: {
          ...projectStats,
          progress,
          total_file_size_mb: Math.round((projectStats.total_file_size || 0) / (1024 * 1024) * 100) / 100
        }
      });
    } catch (error) {
      console.error('Erreur récupération dashboard:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération du dashboard' 
      });
    }
  }
);

// GET /api/clients/:clientId/projects/:projectId/widgets
router.get('/:clientId/projects/:projectId/widgets',
  authenticateToken,
  validateScope,
  requireProjectView,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.params;

      // Récupérer les widgets du projet avec leur configuration
      const widgets = await databaseService.query(`
        SELECT 
          w.id,
          w.name,
          w.description,
          w.category,
          w.icon,
          w.is_active,
          pw.position_x,
          pw.position_y,
          pw.width,
          pw.height,
          pw.is_enabled,
          pw.widget_config
        FROM widgets w
        INNER JOIN project_widgets pw ON w.id = pw.widget_id
        WHERE pw.project_id = ? AND w.is_active = 1
        ORDER BY pw.position_y, pw.position_x
      `, [projectId]);

      // Traiter les données JSON et normaliser types
      const processedWidgets = widgets.map(widget => {
        let widgetConfig = {};
        if (widget.widget_config) {
          try {
            widgetConfig = JSON.parse(widget.widget_config);
          } catch (e) {
            widgetConfig = {};
          }
        }
        return {
          ...widget,
          id: typeof widget.id === 'bigint' ? Number(widget.id) : widget.id,
          position_x: widget.position_x || 0,
          position_y: widget.position_y || 0,
          width: widget.width || 4,
          height: widget.height || 2,
          widget_config: widgetConfig
        };
      });

      res.json({
        success: true,
        data: processedWidgets
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des widgets du projet:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des widgets du projet'
      });
    }
  }
);

module.exports = router;
// DELETE /api/clients/:clientId/projects/:projectId/widgets/tasks/:taskId
router.delete('/:clientId/projects/:projectId/widgets/tasks/:taskId',
  authenticateToken,
  validateScope,
  requireProjectEdit,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.validatedScope;
      const { taskId } = req.params;

      // Vérifier que la tâche appartient au scope
      const [task] = await databaseService.query(
        'SELECT id FROM tasks WHERE id = ? AND client_id = ? AND project_id = ?',
        [taskId, clientId, projectId]
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Tâche non trouvée'
        });
      }

      // Détecter les colonnes disponibles de la table tasks
      const columns = await databaseService.query('SHOW COLUMNS FROM tasks');
      const colNames = columns.map(c => c.Field);
      const has = (name) => colNames.includes(name);

      // Marquer la tâche comme annulée et (optionnel) supprimée
      const updates = [];
      const updateValues = [];

      updates.push("status = 'cancelled'");
      if (has('updated_at')) {
        updates.push('updated_at = NOW()');
      }
      if (has('is_deleted')) {
        updates.push('is_deleted = TRUE');
      }

      updateValues.push(taskId, clientId, projectId);

      await databaseService.query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND client_id = ? AND project_id = ?`,
        updateValues
      );

      res.json({
        success: true,
        message: 'Tâche supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression de la tâche',
        details: error?.sqlMessage || error?.message || String(error)
      });
    }
  }
);