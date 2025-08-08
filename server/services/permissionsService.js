const MariaDBService = require('./mariadbService');

class PermissionsService {
  constructor() {
    this.mariadb = new MariaDBService();
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
      await this.mariadb.run(createRolesTable);
      await this.mariadb.run(createPermissionsTable);
      await this.mariadb.run(createRolePermissionsTable);
      await this.mariadb.run(createUserRolesTable);
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
      
      // Permissions paramètres
      { name: 'settings.read', description: 'Voir les paramètres', category: 'settings', resource: 'settings', action: 'read' },
      { name: 'settings.update', description: 'Modifier les paramètres', category: 'settings', resource: 'settings', action: 'update' },
      { name: 'platform.settings.write', description: 'Écrire les paramètres de plateforme', category: 'platform', resource: 'platform', action: 'settings_write' },
      { name: 'platform.logs.read', description: 'Lire les logs de plateforme', category: 'platform', resource: 'platform', action: 'logs_read' },
      { name: 'system_backup', description: 'Créer des sauvegardes système', category: 'system', resource: 'system', action: 'backup' },
      
      // Permissions agents
      { name: 'agents.manage', description: 'Gérer les agents', category: 'agents', resource: 'agents', action: 'manage' },
      { name: 'agents.view', description: 'Voir les agents', category: 'agents', resource: 'agents', action: 'view' },
      
      // Permissions accompagnement
      { name: 'accompagnement.create', description: 'Créer des accompagnements', category: 'accompagnement', resource: 'accompagnement', action: 'create' },
      { name: 'accompagnement.read', description: 'Voir les accompagnements', category: 'accompagnement', resource: 'accompagnement', action: 'read' },
      { name: 'accompagnement.update', description: 'Modifier les accompagnements', category: 'accompagnement', resource: 'accompagnement', action: 'update' },
      { name: 'accompagnement.delete', description: 'Supprimer les accompagnements', category: 'accompagnement', resource: 'accompagnement', action: 'delete' }
    ];

    // Insérer les rôles
    for (const role of defaultRoles) {
      try {
        await this.mariadb.run(
          'INSERT IGNORE INTO roles (name, description, is_system_role) VALUES (?, ?, ?)',
          [role.name, role.description, role.is_system_role]
        );
      } catch (err) {
        console.error(`Erreur lors de l'insertion du rôle ${role.name}:`, err);
      }
    }

    // Insérer les permissions
    for (const permission of defaultPermissions) {
      try {
        await this.mariadb.run(
          'INSERT IGNORE INTO permissions (name, description, category, resource, action) VALUES (?, ?, ?, ?, ?)',
          [permission.name, permission.description, permission.category, permission.resource, permission.action]
        );
      } catch (err) {
        console.error(`Erreur lors de l'insertion de la permission ${permission.name}:`, err);
      }
    }

    // Attribuer toutes les permissions au super_admin
    await this.assignAllPermissionsToSuperAdmin();
  }

  // Attribuer toutes les permissions au super_admin
  async assignAllPermissionsToSuperAdmin() {
    try {
      const role = await this.mariadb.get('SELECT id FROM roles WHERE name = ?', ['super_admin']);
      if (!role) {
        console.error('Rôle super_admin non trouvé');
        return;
      }

      const permissions = await this.mariadb.all('SELECT id FROM permissions');
      
      for (const permission of permissions) {
        try {
          await this.mariadb.run(
            'INSERT IGNORE INTO role_permissions (role_id, permission_id, granted) VALUES (?, ?, 1)',
            [role.id, permission.id]
          );
        } catch (err) {
          console.error('Erreur lors de l\'attribution des permissions:', err);
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'attribution des permissions au super_admin:', err);
    }
  }

  // Récupérer tous les rôles
  async getAllRoles() {
    try {
      const rows = await this.mariadb.all('SELECT * FROM roles ORDER BY name');
      return rows.map(role => ({
        ...role,
        is_system_role: Boolean(role.is_system_role)
      }));
    } catch (err) {
      throw err;
    }
  }

  // Récupérer les permissions d'un rôle
  async getRolePermissions(roleId) {
    try {
      const query = `
        SELECT p.*, rp.granted, p.category
        FROM permissions p
        LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = ?
        ORDER BY p.category, p.name
      `;

      const rows = await this.mariadb.all(query, [roleId]);
      
      // Organiser par catégorie
      const permissionsByCategory = {};
      
      rows.forEach(permission => {
        const category = permission.category || 'general';
        if (!permissionsByCategory[category]) {
          permissionsByCategory[category] = {
            granted: [],
            denied: []
          };
        }

        const permissionData = {
          id: permission.id,
          name: permission.name,
          description: permission.description,
          resource: permission.resource,
          action: permission.action
        };

        if (permission.granted) {
          permissionsByCategory[category].granted.push(permissionData);
        } else {
          permissionsByCategory[category].denied.push(permissionData);
        }
      });

      return permissionsByCategory;
    } catch (err) {
      throw err;
    }
  }

  // Créer un nouveau rôle
  async createRole(name, description, isSystemRole = false) {
    try {
      const result = await this.mariadb.run(
        'INSERT INTO roles (name, description, is_system_role) VALUES (?, ?, ?)',
        [name, description, isSystemRole ? 1 : 0]
      );
      return { id: result.insertId, affectedRows: result.affectedRows };
    } catch (err) {
      throw err;
    }
  }

  // Supprimer un rôle
  async deleteRole(roleId) {
    try {
      // Vérifier si c'est un rôle système
      const role = await this.mariadb.get(
        'SELECT is_system_role FROM roles WHERE id = ?',
        [roleId]
      );

      if (!role) {
        throw new Error('Rôle non trouvé');
      }

      if (role.is_system_role) {
        throw new Error('Impossible de supprimer un rôle système');
      }

      // Supprimer les permissions associées
      await this.mariadb.run(
        'DELETE FROM role_permissions WHERE role_id = ?',
        [roleId]
      );

      // Supprimer le rôle
      const result = await this.mariadb.run(
        'DELETE FROM roles WHERE id = ?',
        [roleId]
      );

      return { affectedRows: result.affectedRows };
    } catch (err) {
      throw err;
    }
  }

  // Mettre à jour les permissions d'un rôle
  async updateRolePermissions(roleId, permissions) {
    try {
      // Supprimer toutes les permissions existantes pour ce rôle
      await this.mariadb.run(
        'DELETE FROM role_permissions WHERE role_id = ?',
        [roleId]
      );

      // Ajouter les nouvelles permissions
      if (permissions.length === 0) {
        return { affectedRows: 0 };
      }

      let affectedRows = 0;
      for (const permission of permissions) {
        const result = await this.mariadb.run(
          'INSERT INTO role_permissions (role_id, permission_id, granted) VALUES (?, ?, ?)',
          [roleId, permission.permission_id, permission.granted ? 1 : 0]
        );
        affectedRows += result.affectedRows;
      }

      return { affectedRows };
    } catch (err) {
      throw err;
    }
  }

  // Récupérer un rôle par nom
  async getRoleByName(roleName) {
    try {
      const row = await this.mariadb.get(
        'SELECT * FROM roles WHERE name = ?',
        [roleName]
      );
      return row ? { ...row, is_system_role: Boolean(row.is_system_role) } : null;
    } catch (err) {
      throw err;
    }
  }

  // Vérifier si un utilisateur a une permission
  async userHasPermission(userId, permissionName) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.name = ? AND rp.granted = 1
      `;

      const row = await this.mariadb.get(query, [userId, permissionName]);
      return row.count > 0;
    } catch (err) {
      throw err;
    }
  }

  // Attribuer un rôle à un utilisateur
  async assignRoleToUser(userId, roleId, assignedBy = null) {
    try {
      const result = await this.mariadb.run(
        'INSERT IGNORE INTO user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)',
        [userId, roleId, assignedBy]
      );
      return { success: result.affectedRows > 0 };
    } catch (err) {
      throw err;
    }
  }

  // Retirer un rôle d'un utilisateur
  async removeRoleFromUser(userId, roleId) {
    try {
      const result = await this.mariadb.run(
        'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
        [userId, roleId]
      );
      return { success: result.affectedRows > 0 };
    } catch (err) {
      throw err;
    }
  }

  // Récupérer les rôles d'un utilisateur
  async getUserRoles(userId) {
    try {
      const query = `
        SELECT r.*, ur.assigned_at
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ?
        ORDER BY r.name
      `;

      const rows = await this.mariadb.all(query, [userId]);
      return rows.map(role => ({
        ...role,
        is_system_role: Boolean(role.is_system_role)
      }));
    } catch (err) {
      throw err;
    }
  }

  // Récupérer toutes les permissions
  async getAllPermissions() {
    try {
      const rows = await this.mariadb.all(
        'SELECT * FROM permissions ORDER BY category, name'
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  // Récupérer les catégories de permissions
  async getPermissionCategories() {
    try {
      const rows = await this.mariadb.all(
        'SELECT DISTINCT category FROM permissions ORDER BY category'
      );
      return rows.map(row => row.category);
    } catch (err) {
      throw err;
    }
  }

  // Vérifier si un utilisateur est super admin
  async isSuperAdmin(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'super_admin'
      `;

      const row = await this.mariadb.get(query, [userId]);
      return row.count > 0;
    } catch (err) {
      throw err;
    }
  }

  // Fermer la connexion
  close() {
    if (this.mariadb && this.mariadb.close) {
      this.mariadb.close();
    }
  }
}

module.exports = new PermissionsService();