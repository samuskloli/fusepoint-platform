const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class PermissionsService {
  constructor() {
    this.dbPath = path.join(__dirname, '../database/fusepoint.db');
    this.db = new sqlite3.Database(this.dbPath);
    this.initializePermissionsTables();
  }

  // Initialiser les tables de permissions
  initializePermissionsTables() {
    const createRolesTable = `
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        is_system_role BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createPermissionsTable = `
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'general',
        resource TEXT,
        action TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createRolePermissionsTable = `
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        granted BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE,
        UNIQUE(role_id, permission_id)
      )
    `;

    const createUserRolesTable = `
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        assigned_by INTEGER,
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        UNIQUE(user_id, role_id)
      )
    `;

    // Créer les tables
    this.db.serialize(() => {
      this.db.run(createRolesTable);
      this.db.run(createPermissionsTable);
      this.db.run(createRolePermissionsTable);
      this.db.run(createUserRolesTable, (err) => {
        if (err) {
          console.error('Erreur lors de la création des tables de permissions:', err);
        } else {
          console.log('Tables de permissions initialisées avec succès');
          this.insertDefaultData();
        }
      });
    });
  }

  // Insérer les données par défaut
  insertDefaultData() {
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
    defaultRoles.forEach(role => {
      this.db.run(
        'INSERT OR IGNORE INTO roles (name, description, is_system_role) VALUES (?, ?, ?)',
        [role.name, role.description, role.is_system_role],
        (err) => {
          if (err) {
            console.error(`Erreur lors de l'insertion du rôle ${role.name}:`, err);
          }
        }
      );
    });

    // Insérer les permissions
    defaultPermissions.forEach(permission => {
      this.db.run(
        'INSERT OR IGNORE INTO permissions (name, description, category, resource, action) VALUES (?, ?, ?, ?, ?)',
        [permission.name, permission.description, permission.category, permission.resource, permission.action],
        (err) => {
          if (err) {
            console.error(`Erreur lors de l'insertion de la permission ${permission.name}:`, err);
          }
        }
      );
    });

    // Attribuer toutes les permissions au super_admin
    setTimeout(() => {
      this.assignAllPermissionsToSuperAdmin();
    }, 1000);
  }

  // Attribuer toutes les permissions au super_admin
  assignAllPermissionsToSuperAdmin() {
    this.db.get('SELECT id FROM roles WHERE name = "super_admin"', [], (err, role) => {
      if (err || !role) {
        console.error('Rôle super_admin non trouvé');
        return;
      }

      this.db.all('SELECT id FROM permissions', [], (err, permissions) => {
        if (err) {
          console.error('Erreur lors de la récupération des permissions:', err);
          return;
        }

        permissions.forEach(permission => {
          this.db.run(
            'INSERT OR IGNORE INTO role_permissions (role_id, permission_id, granted) VALUES (?, ?, 1)',
            [role.id, permission.id],
            (err) => {
              if (err) {
                console.error('Erreur lors de l\'attribution des permissions:', err);
              }
            }
          );
        });
      });
    });
  }

  // Récupérer tous les rôles
  async getAllRoles() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM roles ORDER BY name',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(role => ({
              ...role,
              is_system_role: Boolean(role.is_system_role)
            })));
          }
        }
      );
    });
  }

  // Récupérer les permissions d'un rôle
  async getRolePermissions(roleId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, rp.granted, p.category
        FROM permissions p
        LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = ?
        ORDER BY p.category, p.name
      `;

      this.db.all(query, [roleId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
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

          resolve(permissionsByCategory);
        }
      });
    });
  }

  // Récupérer un rôle par nom
  async getRoleByName(roleName) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM roles WHERE name = ?',
        [roleName],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? { ...row, is_system_role: Boolean(row.is_system_role) } : null);
          }
        }
      );
    });
  }

  // Vérifier si un utilisateur a une permission
  async userHasPermission(userId, permissionName) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.name = ? AND rp.granted = 1
      `;

      this.db.get(query, [userId, permissionName], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
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
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, ur.assigned_at
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ?
        ORDER BY r.name
      `;

      this.db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(role => ({
            ...role,
            is_system_role: Boolean(role.is_system_role)
          })));
        }
      });
    });
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
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'super_admin'
      `;

      this.db.get(query, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
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

module.exports = new PermissionsService();