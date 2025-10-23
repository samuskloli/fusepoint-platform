const databaseService = require('./databaseService');

class PermissionsService {
  constructor() {
    this.db = databaseService;
    this.initializePermissionsTables();
  }

  // Initialiser les tables de permissions
  async initializePermissionsTables() {
    const createRolesTable = `
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        is_system_role BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    const createPermissionsTable = `
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR(100) DEFAULT 'general',
        resource VARCHAR(100),
        action VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createRolePermissionsTable = `
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        granted BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE,
        UNIQUE(role_id, permission_id)
      )
    `;

    const createUserRolesTable = `
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by INT,
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        UNIQUE(user_id, role_id)
      )
    `;

    // Créer les tables
    try {
      await this.db.run(createRolesTable);
      await this.db.run(createPermissionsTable);
      await this.db.run(createRolePermissionsTable);
      await this.db.run(createUserRolesTable);
      console.log('Tables de permissions initialisées avec succès');
      await this.insertDefaultData();
    } catch (err) {
      console.error('Erreur lors de la création des tables de permissions:', err);
    }
  }

  // Insérer les données par défaut
  async insertDefaultData() {
    // Rôles par défaut
    const defaultRoles = [
      { name: 'super_admin', description: 'Super Administrateur avec tous les droits', is_system_role: 1 },
      { name: 'admin', description: 'Administrateur', is_system_role: 1 },
      { name: 'agent', description: 'Agent', is_system_role: 1 },
      { name: 'user', description: 'Utilisateur standard', is_system_role: 1 }
    ];

    // Permissions par défaut
    const defaultPermissions = [
      // Permissions système
      { name: 'system.manage', description: 'Gérer le système', category: 'system', resource: 'system', action: 'manage' },
      { name: 'system.view_health', description: 'Voir la santé du système', category: 'system', resource: 'system', action: 'view_health' },
      { name: 'system.view_logs', description: 'Voir les logs système', category: 'system', resource: 'system', action: 'view_logs' },
      { name: 'system.backup', description: 'Créer des sauvegardes', category: 'system', resource: 'system', action: 'backup' },
      
      // Permissions utilisateurs
      { name: 'users.create', description: 'Créer des utilisateurs', category: 'users', resource: 'users', action: 'create' },
      { name: 'users.read', description: 'Voir les utilisateurs', category: 'users', resource: 'users', action: 'read' },
      { name: 'users.update', description: 'Modifier les utilisateurs', category: 'users', resource: 'users', action: 'update' },
      { name: 'users.delete', description: 'Supprimer les utilisateurs', category: 'users', resource: 'users', action: 'delete' },
      { name: 'user_management', description: 'Gestion complète des utilisateurs', category: 'users', resource: 'users', action: 'management' },
      
      // Permissions rôles
      { name: 'roles.create', description: 'Créer des rôles', category: 'roles', resource: 'roles', action: 'create' },
      { name: 'roles.read', description: 'Voir les rôles', category: 'roles', resource: 'roles', action: 'read' },
      { name: 'roles.update', description: 'Modifier les rôles', category: 'roles', resource: 'roles', action: 'update' },
      { name: 'roles.delete', description: 'Supprimer les rôles', category: 'roles', resource: 'roles', action: 'delete' },
      
      // Permissions projets
      { name: 'projects.create', description: 'Créer des projets', category: 'projects', resource: 'projects', action: 'create' },
      { name: 'projects.read', description: 'Voir les projets', category: 'projects', resource: 'projects', action: 'read' },
      { name: 'projects.update', description: 'Modifier les projets', category: 'projects', resource: 'projects', action: 'update' },
      { name: 'projects.delete', description: 'Supprimer les projets', category: 'projects', resource: 'projects', action: 'delete' },
      { name: 'project_management', description: 'Gestion complète des projets', category: 'projects', resource: 'projects', action: 'management' },
      
      // Permissions clients
      { name: 'clients.create', description: 'Créer des clients', category: 'clients', resource: 'clients', action: 'create' },
      { name: 'clients.read', description: 'Voir les clients', category: 'clients', resource: 'clients', action: 'read' },
      { name: 'clients.update', description: 'Modifier les clients', category: 'clients', resource: 'clients', action: 'update' },
      { name: 'clients.delete', description: 'Supprimer les clients', category: 'clients', resource: 'clients', action: 'delete' },
      
      // Permissions fichiers
      { name: 'files.upload', description: 'Télécharger des fichiers', category: 'files', resource: 'files', action: 'upload' },
      { name: 'files.download', description: 'Télécharger des fichiers', category: 'files', resource: 'files', action: 'download' },
      { name: 'files.delete', description: 'Supprimer des fichiers', category: 'files', resource: 'files', action: 'delete' },
      { name: 'files.manage', description: 'Gérer les fichiers', category: 'files', resource: 'files', action: 'manage' },
      
      // Permissions widgets
      { name: 'widgets.view', description: 'Voir les widgets', category: 'widgets', resource: 'widgets', action: 'view' },
      { name: 'widgets.configure', description: 'Configurer les widgets', category: 'widgets', resource: 'widgets', action: 'configure' },
      { name: 'widgets.manage', description: 'Gérer les widgets', category: 'widgets', resource: 'widgets', action: 'manage' }
    ];

    // Insérer les rôles
    for (const role of defaultRoles) {
      try {
        const existing = await this.db.get('SELECT id FROM roles WHERE name = ?', [role.name]);
        if (!existing) {
          await this.db.run(
            'INSERT INTO roles (name, description, is_system_role) VALUES (?, ?, ?)',
            [role.name, role.description, role.is_system_role]
          );
        }
      } catch (err) {
        console.error(`Erreur lors de l'insertion du rôle ${role.name}:`, err);
      }
    }

    // Insérer les permissions
    for (const permission of defaultPermissions) {
      try {
        const existing = await this.db.get('SELECT id FROM permissions WHERE name = ?', [permission.name]);
        if (!existing) {
          await this.db.run(
            'INSERT INTO permissions (name, description, category, resource, action) VALUES (?, ?, ?, ?, ?)',
            [permission.name, permission.description, permission.category, permission.resource, permission.action]
          );
        }
      } catch (err) {
        console.error(`Erreur lors de l'insertion de la permission ${permission.name}:`, err);
      }
    }

    // Assigner toutes les permissions au super_admin
    await this.assignAllPermissionsToSuperAdmin();
  }

  // Assigner toutes les permissions au rôle super_admin
  async assignAllPermissionsToSuperAdmin() {
    try {
      const superAdminRole = await this.db.get('SELECT id FROM roles WHERE name = ?', ['super_admin']);
      if (superAdminRole) {
        const permissions = await this.db.query('SELECT id FROM permissions');
        for (const permission of permissions) {
          try {
            await this.db.run(
              'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
              [superAdminRole.id, permission.id]
            );
          } catch (err) {
            // Ignorer les erreurs de doublons
          }
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'assignation des permissions au super_admin:', err);
    }
  }

  // Récupérer tous les rôles
  async getAllRoles() {
    try {
      const roles = await this.db.query('SELECT * FROM roles ORDER BY name');
      return { success: true, data: roles };
    } catch (err) {
      console.error('Erreur lors de la récupération des rôles:', err);
      return { success: false, error: err.message };
    }
  }

  // Récupérer les permissions d'un rôle
  async getRolePermissions(roleId) {
    try {
      const permissions = await this.db.query(`
        SELECT p.*, rp.granted
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
        ORDER BY p.category, p.name
      `, [roleId]);

      const categories = {};
      permissions.forEach(permission => {
        if (!categories[permission.category]) {
          categories[permission.category] = [];
        }
        categories[permission.category].push({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          resource: permission.resource,
          action: permission.action,
          granted: permission.granted === 1
        });
      });

      return { success: true, data: { permissions, categories } };
    } catch (err) {
      console.error('Erreur lors de la récupération des permissions du rôle:', err);
      return { success: false, error: err.message };
    }
  }

  // Créer un nouveau rôle
  async createRole(name, description, isSystemRole = false) {
    try {
      const result = await this.db.run(
        'INSERT INTO roles (name, description, is_system_role) VALUES (?, ?, ?)',
        [name, description, isSystemRole]
      );
      return { success: true, data: { id: result.insertId, name, description, isSystemRole } };
    } catch (err) {
      console.error('Erreur lors de la création du rôle:', err);
      return { success: false, error: err.message };
    }
  }

  // Supprimer un rôle
  async deleteRole(roleId) {
    try {
      // Vérifier que ce n'est pas un rôle système
      const role = await this.db.get('SELECT is_system_role FROM roles WHERE id = ?', [roleId]);
      if (role && role.is_system_role) {
        return { success: false, error: 'Impossible de supprimer un rôle système' };
      }

      await this.db.run('DELETE FROM roles WHERE id = ?', [roleId]);
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la suppression du rôle:', err);
      return { success: false, error: err.message };
    }
  }

  // Mettre à jour les permissions d'un rôle
  async updateRolePermissions(roleId, permissions) {
    try {
      // Supprimer toutes les permissions existantes du rôle
      await this.db.run('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

      // Ajouter les nouvelles permissions
      for (const permissionId of permissions) {
        await this.db.run(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [roleId, permissionId]
        );
      }

      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la mise à jour des permissions du rôle:', err);
      return { success: false, error: err.message };
    }
  }

  // Récupérer un rôle par nom
  async getRoleByName(roleName) {
    try {
      const role = await this.db.get('SELECT * FROM roles WHERE name = ?', [roleName]);
      return role;
    } catch (err) {
      console.error('Erreur lors de la récupération du rôle par nom:', err);
      return null;
    }
  }

  // Vérifier si un utilisateur a une permission spécifique
  async userHasPermission(userId, permissionName) {
    try {
      const result = await this.db.get(`
        SELECT COUNT(*) as count
        FROM user_roles ur
        INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
        INNER JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.name = ? AND rp.granted = 1
      `, [userId, permissionName]);

      return result.count > 0;
    } catch (err) {
      console.error('Erreur lors de la vérification des permissions:', err);
      return false;
    }
  }

  // Assigner un rôle à un utilisateur
  async assignRoleToUser(userId, roleId, assignedBy = null) {
    try {
      await this.db.run(
        'INSERT IGNORE INTO user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)',
        [userId, roleId, assignedBy]
      );
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de l\'assignation du rôle:', err);
      return { success: false, error: err.message };
    }
  }

  // Retirer un rôle d'un utilisateur
  async removeRoleFromUser(userId, roleId) {
    try {
      await this.db.run('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?', [userId, roleId]);
      return { success: true };
    } catch (err) {
      console.error('Erreur lors du retrait du rôle:', err);
      return { success: false, error: err.message };
    }
  }

  // Récupérer les rôles d'un utilisateur
  async getUserRoles(userId) {
    try {
      const roles = await this.db.query(`
        SELECT r.*, ur.assigned_at, ur.assigned_by
        FROM roles r
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ?
        ORDER BY r.name
      `, [userId]);

      return { success: true, data: roles };
    } catch (err) {
      console.error('Erreur lors de la récupération des rôles utilisateur:', err);
      return { success: false, error: err.message };
    }
  }

  // Récupérer toutes les permissions
  async getAllPermissions() {
    try {
      const permissions = await this.db.query('SELECT * FROM permissions ORDER BY category, name');
      return { success: true, data: permissions };
    } catch (err) {
      console.error('Erreur lors de la récupération des permissions:', err);
      return { success: false, error: err.message };
    }
  }

  // Récupérer les catégories de permissions
  async getPermissionCategories() {
    try {
      const categories = await this.db.query('SELECT DISTINCT category FROM permissions ORDER BY category');
      return { success: true, data: categories.map(c => c.category) };
    } catch (err) {
      console.error('Erreur lors de la récupération des catégories:', err);
      return { success: false, error: err.message };
    }
  }

  // Vérifier si un utilisateur est super admin
  async isSuperAdmin(userId) {
    try {
      const result = await this.db.get(`
        SELECT COUNT(*) as count
        FROM user_roles ur
        INNER JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'super_admin'
      `, [userId]);

      return result.count > 0;
    } catch (err) {
      console.error('Erreur lors de la vérification super admin:', err);
      return false;
    }
  }

  // Vérifier si un utilisateur est admin (admin ou super_admin)
  async isAdmin(userId) {
    try {
      const result = await this.db.get(`
        SELECT COUNT(*) as count
        FROM user_roles ur
        INNER JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name IN ('admin', 'super_admin')
      `, [userId]);

      return result.count > 0;
    } catch (err) {
      console.error('Erreur lors de la vérification admin:', err);
      return false;
    }
  }

  // Fermer la connexion
  close() {
    if (this.db && this.db.close) {
      this.db.close();
    }
  }
}

module.exports = new PermissionsService();