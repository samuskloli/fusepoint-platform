const MariaDBService = require('./mariadbService');
const path = require('path');

class PermissionsService {
  constructor() {
    this.mariadbService = new MariaDBService();
  }

  // Initialiser le service
  async init() {
    try {
      await this.mariadbService.initialize();
      await this.initializePermissionsTables();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service de permissions:', error);
      throw error;
    }
  }

  // Initialiser les tables de permissions
  async initializePermissionsTables() {
    try {
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
      await this.mariadbService.query(createRolesTable);
      await this.mariadbService.query(createPermissionsTable);
      await this.mariadbService.query(createRolePermissionsTable);
      await this.mariadbService.query(createUserRolesTable);
      
      console.log('Tables de permissions initialisées avec succès');
      await this.insertDefaultData();
    } catch (error) {
      console.error('Erreur lors de la création des tables de permissions:', error);
    }
  }

  // Insérer les données par défaut
  async insertDefaultData() {
    try {
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
          await this.mariadbService.query(
            'INSERT IGNORE INTO roles (name, description, is_system_role) VALUES (?, ?, ?)',
            [role.name, role.description, role.is_system_role]
          );
        } catch (error) {
          console.error(`Erreur lors de l'insertion du rôle ${role.name}:`, error);
        }
      }

      // Insérer les permissions
      for (const permission of defaultPermissions) {
        try {
          await this.mariadbService.query(
            'INSERT IGNORE INTO permissions (name, description, category, resource, action) VALUES (?, ?, ?, ?, ?)',
            [permission.name, permission.description, permission.category, permission.resource, permission.action]
          );
        } catch (error) {
          console.error(`Erreur lors de l'insertion de la permission ${permission.name}:`, error);
        }
      }

      // Attribuer toutes les permissions au super_admin
      await this.assignAllPermissionsToSuperAdmin();
    } catch (error) {
      console.error('Erreur lors de l\'insertion des données par défaut:', error);
    }
  }

  // Attribuer toutes les permissions au super_admin
  async assignAllPermissionsToSuperAdmin() {
    try {
      const roleResult = await this.mariadbService.query('SELECT id FROM roles WHERE name = "super_admin"');
      if (!roleResult || roleResult.length === 0) {
        console.error('Rôle super_admin non trouvé');
        return;
      }

      const role = roleResult[0];
      const permissions = await this.mariadbService.query('SELECT id FROM permissions');
      
      for (const permission of permissions) {
        try {
          await this.mariadbService.query(
            'INSERT IGNORE INTO role_permissions (role_id, permission_id, granted) VALUES (?, ?, 1)',
            [role.id, permission.id]
          );
        } catch (error) {
          console.error('Erreur lors de l\'attribution des permissions:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution des permissions au super_admin:', error);
    }
  }

  // Récupérer tous les rôles
  async getAllRoles() {
    try {
      const rows = await this.mariadbService.query('SELECT * FROM roles ORDER BY name');
      return rows.map(role => ({
        ...role,
        is_system_role: Boolean(role.is_system_role)
      }));
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les permissions d'un rôle
  async getRolePermissions(roleId) {
    try {
      const rows = await this.mariadbService.query(
        `SELECT p.*, rp.granted 
         FROM permissions p 
         LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = ?
         ORDER BY p.category, p.name`,
        [roleId]
      );
      return rows.map(permission => ({
        ...permission,
        granted: Boolean(permission.granted)
      }));
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un rôle par nom
  async getRoleByName(roleName) {
    try {
      const rows = await this.mariadbService.query(
        'SELECT * FROM roles WHERE name = ?',
        [roleName]
      );
      const row = rows[0];
      return row ? {
        ...row,
        is_system_role: Boolean(row.is_system_role)
      } : null;
    } catch (error) {
      throw error;
    }
  }

  // Vérifier si un utilisateur a une permission
  async userHasPermission(userId, resource, action) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ? AND p.resource = ? AND p.action = ? AND rp.granted = 1
      `;

      const rows = await this.mariadbService.query(query, [userId, resource, action]);
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Attribuer un rôle à un utilisateur
  async assignRoleToUser(userId, roleId, assignedBy = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)',
        [userId, roleId, assignedBy],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: this.changes > 0 });
          }
        }
      );
    });
  }

  // Retirer un rôle d'un utilisateur
  async removeRoleFromUser(userId, roleId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
        [userId, roleId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: this.changes > 0 });
          }
        }
      );
    });
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

      const rows = await this.mariadbService.query(query, [userId]);
      return rows.map(role => ({
        ...role,
        is_system_role: Boolean(role.is_system_role)
      }));
    } catch (error) {
      console.error('❌ Erreur récupération rôles utilisateur:', error);
      return [];
    }
  }

  // Récupérer toutes les permissions
  async getAllPermissions() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM permissions ORDER BY category, name',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  // Récupérer les catégories de permissions
  async getPermissionCategories() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT DISTINCT category FROM permissions ORDER BY category',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => row.category));
          }
        }
      );
    });
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

      const rows = await this.mariadbService.query(query, [userId]);
      return rows[0].count > 0;
    } catch (error) {
      console.error('❌ Erreur vérification super admin:', error);
      return false;
    }
  }

  // Fermer la connexion
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture de la base de données:', err);
      } else {
        console.log('Connexion à la base de données fermée.');
      }
    });
  }
}

// Créer et initialiser l'instance
const permissionsServiceInstance = new PermissionsService();

// Initialiser le service de manière asynchrone
permissionsServiceInstance.init().catch(error => {
  console.error('Erreur lors de l\'initialisation du service de permissions:', error);
});

module.exports = permissionsServiceInstance;