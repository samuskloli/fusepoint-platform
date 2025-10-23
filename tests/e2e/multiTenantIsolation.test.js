/**
 * Tests E2E pour l'isolation multi-tenant
 * Vérifie qu'aucune donnée ne fuite entre clients/projets
 */

const request = require('supertest');
const app = require('../../server/app');
const db = require('../../server/config/database');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

describe('Multi-Tenant Isolation E2E Tests', () => {
  let client1Token, client2Token, adminToken;
  let client1Id, client2Id;
  let project1Id, project2Id;
  let user1Id, user2Id, adminId;
  
  // Configuration des données de test
  const testData = {
    client1: {
      name: 'Client Test 1',
      email: 'client1@test.com'
    },
    client2: {
      name: 'Client Test 2', 
      email: 'client2@test.com'
    },
    project1: {
      name: 'Projet Test 1',
      description: 'Projet de test pour client 1'
    },
    project2: {
      name: 'Projet Test 2',
      description: 'Projet de test pour client 2'
    },
    user1: {
      email: 'user1@test.com',
      password: 'password123',
      role: 'user'
    },
    user2: {
      email: 'user2@test.com', 
      password: 'password123',
      role: 'user'
    },
    admin: {
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    }
  };

  beforeAll(async () => {
    // Nettoyer la base de données de test
    await cleanupTestData();
    
    // Créer les données de test
    await setupTestData();
    
    // Générer les tokens JWT
    client1Token = generateToken(user1Id, 'user', client1Id);
    client2Token = generateToken(user2Id, 'user', client2Id);
    adminToken = generateToken(adminId, 'admin');
  });

  afterAll(async () => {
    // Nettoyer après les tests
    await cleanupTestData();
  });

  describe('Files Widget Isolation', () => {
    let file1Id, file2Id;
    
    test('Client 1 peut uploader un fichier dans son projet', async () => {
      const testFile = Buffer.from('Test file content for client 1');
      
      const response = await request(app)
        .post(`/api/clients/${client1Id}/projects/${project1Id}/widgets/files`)
        .set('Authorization', `Bearer ${client1Token}`)
        .attach('file', testFile, 'test-client1.txt')
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.file.client_id).toBe(client1Id);
      expect(response.body.file.project_id).toBe(project1Id);
      file1Id = response.body.file.id;
    });
    
    test('Client 2 peut uploader un fichier dans son projet', async () => {
      const testFile = Buffer.from('Test file content for client 2');
      
      const response = await request(app)
        .post(`/api/clients/${client2Id}/projects/${project2Id}/widgets/files`)
        .set('Authorization', `Bearer ${client2Token}`)
        .attach('file', testFile, 'test-client2.txt')
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.file.client_id).toBe(client2Id);
      expect(response.body.file.project_id).toBe(project2Id);
      file2Id = response.body.file.id;
    });
    
    test('Client 1 ne peut voir que ses propres fichiers', async () => {
      const response = await request(app)
        .get(`/api/clients/${client1Id}/projects/${project1Id}/widgets/files`)
        .set('Authorization', `Bearer ${client1Token}`)
        .expect(200);
      
      expect(response.body.files).toHaveLength(1);
      expect(response.body.files[0].id).toBe(file1Id);
      expect(response.body.files[0].client_id).toBe(client1Id);
      expect(response.body.files[0].project_id).toBe(project1Id);
    });
    
    test('Client 2 ne peut voir que ses propres fichiers', async () => {
      const response = await request(app)
        .get(`/api/clients/${client2Id}/projects/${project2Id}/widgets/files`)
        .set('Authorization', `Bearer ${client2Token}`)
        .expect(200);
      
      expect(response.body.files).toHaveLength(1);
      expect(response.body.files[0].id).toBe(file2Id);
      expect(response.body.files[0].client_id).toBe(client2Id);
      expect(response.body.files[0].project_id).toBe(project2Id);
    });
    
    test('Client 1 ne peut pas accéder aux fichiers du Client 2', async () => {
      await request(app)
        .get(`/api/clients/${client2Id}/projects/${project2Id}/widgets/files`)
        .set('Authorization', `Bearer ${client1Token}`)
        .expect(403);
    });
    
    test('Client 2 ne peut pas accéder aux fichiers du Client 1', async () => {
      await request(app)
        .get(`/api/clients/${client1Id}/projects/${project1Id}/widgets/files`)
        .set('Authorization', `Bearer ${client2Token}`)
        .expect(403);
    });
    
    test('Client 1 ne peut pas supprimer les fichiers du Client 2', async () => {
      await request(app)
        .delete(`/api/clients/${client2Id}/projects/${project2Id}/widgets/files/${file2Id}`)
        .set('Authorization', `Bearer ${client1Token}`)
        .expect(403);
    });
    
    test('Tentative de manipulation des paramètres client_id/project_id est rejetée', async () => {
      const testFile = Buffer.from('Malicious file content');
      
      // Essayer d'uploader un fichier avec un client_id différent dans le body
      const response = await request(app)
        .post(`/api/clients/${client1Id}/projects/${project1Id}/widgets/files`)
        .set('Authorization', `Bearer ${client1Token}`)
        .field('client_id', client2Id) // Tentative de manipulation
        .field('project_id', project2Id) // Tentative de manipulation
        .attach('file', testFile, 'malicious.txt')
        .expect(201); // Devrait réussir mais avec les bons IDs
      
      // Vérifier que le serveur a forcé les bons IDs
      expect(response.body.file.client_id).toBe(client1Id);
      expect(response.body.file.project_id).toBe(project1Id);
    });
  });

  describe('Tasks Widget Isolation', () => {
    let task1Id, task2Id;
    
    test('Client 1 peut créer une tâche dans son projet', async () => {
      const taskData = {
        title: 'Tâche Client 1',
        description: 'Description de la tâche pour client 1',
        status: 'todo',
        priority: 'medium'
      };
      
      const response = await request(app)
        .post(`/api/clients/${client1Id}/projects/${project1Id}/widgets/tasks`)
        .set('Authorization', `Bearer ${client1Token}`)
        .send(taskData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.task.client_id).toBe(client1Id);
      expect(response.body.task.project_id).toBe(project1Id);
      expect(response.body.task.title).toBe(taskData.title);
      task1Id = response.body.task.id;
    });
    
    test('Client 2 peut créer une tâche dans son projet', async () => {
      const taskData = {
        title: 'Tâche Client 2',
        description: 'Description de la tâche pour client 2',
        status: 'todo',
        priority: 'high'
      };
      
      const response = await request(app)
        .post(`/api/clients/${client2Id}/projects/${project2Id}/widgets/tasks`)
        .set('Authorization', `Bearer ${client2Token}`)
        .send(taskData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.task.client_id).toBe(client2Id);
      expect(response.body.task.project_id).toBe(project2Id);
      expect(response.body.task.title).toBe(taskData.title);
      task2Id = response.body.task.id;
    });
    
    test('Client 1 ne peut voir que ses propres tâches', async () => {
      const response = await request(app)
        .get(`/api/clients/${client1Id}/projects/${project1Id}/widgets/tasks`)
        .set('Authorization', `Bearer ${client1Token}`)
        .expect(200);
      
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].id).toBe(task1Id);
      expect(response.body.tasks[0].client_id).toBe(client1Id);
      expect(response.body.tasks[0].project_id).toBe(project1Id);
    });
    
    test('Client 1 ne peut pas modifier les tâches du Client 2', async () => {
      const updateData = {
        title: 'Tâche modifiée malicieusement',
        status: 'done'
      };
      
      await request(app)
        .patch(`/api/clients/${client2Id}/projects/${project2Id}/widgets/tasks/${task2Id}`)
        .set('Authorization', `Bearer ${client1Token}`)
        .send(updateData)
        .expect(403);
    });
    
    test('Client 1 ne peut pas assigner les tâches du Client 2', async () => {
      await request(app)
        .post(`/api/clients/${client2Id}/projects/${project2Id}/widgets/tasks/${task2Id}/assignees`)
        .set('Authorization', `Bearer ${client1Token}`)
        .send({ user_id: user1Id })
        .expect(403);
    });
    
    test('Les statistiques de tâches sont isolées par client', async () => {
      const response1 = await request(app)
        .get(`/api/clients/${client1Id}/projects/${project1Id}/widgets/dashboard/stats`)
        .set('Authorization', `Bearer ${client1Token}`)
        .expect(200);
      
      const response2 = await request(app)
        .get(`/api/clients/${client2Id}/projects/${project2Id}/widgets/dashboard/stats`)
        .set('Authorization', `Bearer ${client2Token}`)
        .expect(200);
      
      // Chaque client ne devrait voir que ses propres statistiques
      expect(response1.body.stats.tasks.total).toBe(1);
      expect(response2.body.stats.tasks.total).toBe(1);
      
      // Vérifier que les statistiques ne se chevauchent pas
      expect(response1.body.stats.client_id).toBe(client1Id);
      expect(response2.body.stats.client_id).toBe(client2Id);
    });
  });

  describe('Cross-Client Access Prevention', () => {
    test('Tentative d\'accès avec des IDs de client/projet incohérents', async () => {
      // Essayer d'accéder au projet du client 2 avec l'ID du client 1
      await request(app)
        .get(`/api/clients/${client1Id}/projects/${project2Id}/widgets/files`)
        .set('Authorization', `Bearer ${client1Token}`)
        .expect(403);
    });
    
    test('Tentative d\'accès avec un token d\'un autre client', async () => {
      // Essayer d'accéder aux données du client 1 avec le token du client 2
      await request(app)
        .get(`/api/clients/${client1Id}/projects/${project1Id}/widgets/files`)
        .set('Authorization', `Bearer ${client2Token}`)
        .expect(403);
    });
    
    test('Tentative de création de données dans le mauvais scope', async () => {
      const taskData = {
        title: 'Tâche malicieuse',
        client_id: client2Id, // Tentative de manipulation
        project_id: project2Id // Tentative de manipulation
      };
      
      const response = await request(app)
        .post(`/api/clients/${client1Id}/projects/${project1Id}/widgets/tasks`)
        .set('Authorization', `Bearer ${client1Token}`)
        .send(taskData)
        .expect(201);
      
      // Vérifier que le serveur a forcé les bons IDs
      expect(response.body.task.client_id).toBe(client1Id);
      expect(response.body.task.project_id).toBe(project1Id);
    });
    
    test('Injection SQL dans les paramètres de scope', async () => {
      const maliciousClientId = "1' OR '1'='1";
      const maliciousProjectId = "1' OR '1'='1";
      
      await request(app)
        .get(`/api/clients/${maliciousClientId}/projects/${maliciousProjectId}/widgets/files`)
        .set('Authorization', `Bearer ${client1Token}`)
        .expect(400); // Devrait rejeter les paramètres invalides
    });
  });

  describe('Admin Access Control', () => {
    test('Admin peut accéder aux données de tous les clients', async () => {
      const response1 = await request(app)
        .get(`/api/clients/${client1Id}/projects/${project1Id}/widgets/files`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      const response2 = await request(app)
        .get(`/api/clients/${client2Id}/projects/${project2Id}/widgets/files`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response1.body.files).toBeDefined();
      expect(response2.body.files).toBeDefined();
    });
    
    test('Admin peut voir les statistiques globales', async () => {
      const response = await request(app)
        .get('/api/admin/multi-tenant/health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.statistics).toBeDefined();
      expect(response.body.statistics.active_clients).toBeGreaterThanOrEqual(2);
      expect(response.body.statistics.active_projects).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Data Validation and Integrity', () => {
    test('Validation de l\'intégrité des données multi-tenant', async () => {
      const response = await request(app)
        .get('/api/admin/multi-tenant/validate')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.summary.failed).toBe(0);
      expect(response.body.errors).toHaveLength(0);
    });
    
    test('Test d\'isolation des données', async () => {
      const response = await request(app)
        .post('/api/admin/multi-tenant/test-isolation')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          client_id: client1Id,
          project_id: project1Id,
          test_user_id: user1Id
        })
        .expect(200);
      
      expect(response.body.passed).toBeGreaterThan(0);
      expect(response.body.failed).toBe(0);
    });
  });

  describe('File Storage Namespacing', () => {
    test('Les fichiers sont stockés avec le bon namespacing', async () => {
      const testFile = Buffer.from('Test namespacing content');
      
      const response = await request(app)
        .post(`/api/clients/${client1Id}/projects/${project1Id}/widgets/files`)
        .set('Authorization', `Bearer ${client1Token}`)
        .attach('file', testFile, 'namespacing-test.txt')
        .expect(201);
      
      const filePath = response.body.file.url;
      expect(filePath).toContain(`clients/${client1Id}/projects/${project1Id}`);
      
      // Vérifier que le fichier existe physiquement au bon endroit
      const fullPath = path.join(process.cwd(), 'uploads', filePath);
      const fileExists = await fs.access(fullPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });
  });

  // Fonctions utilitaires
  async function setupTestData() {
    // Créer les clients
    const [client1Result] = await db.execute(
      'INSERT INTO clients (name, email, status) VALUES (?, ?, "active")',
      [testData.client1.name, testData.client1.email]
    );
    client1Id = client1Result.insertId;
    
    const [client2Result] = await db.execute(
      'INSERT INTO clients (name, email, status) VALUES (?, ?, "active")',
      [testData.client2.name, testData.client2.email]
    );
    client2Id = client2Result.insertId;
    
    // Créer les projets
    const [project1Result] = await db.execute(
      'INSERT INTO projects (client_id, name, description, status) VALUES (?, ?, ?, "active")',
      [client1Id, testData.project1.name, testData.project1.description]
    );
    project1Id = project1Result.insertId;
    
    const [project2Result] = await db.execute(
      'INSERT INTO projects (client_id, name, description, status) VALUES (?, ?, ?, "active")',
      [client2Id, testData.project2.name, testData.project2.description]
    );
    project2Id = project2Result.insertId;
    
    // Créer les utilisateurs
    const [user1Result] = await db.execute(
      'INSERT INTO users (email, password, role, client_id, status) VALUES (?, ?, ?, ?, "active")',
      [testData.user1.email, 'hashed_password', testData.user1.role, client1Id]
    );
    user1Id = user1Result.insertId;
    
    const [user2Result] = await db.execute(
      'INSERT INTO users (email, password, role, client_id, status) VALUES (?, ?, ?, ?, "active")',
      [testData.user2.email, 'hashed_password', testData.user2.role, client2Id]
    );
    user2Id = user2Result.insertId;
    
    const [adminResult] = await db.execute(
      'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, "active")',
      [testData.admin.email, 'hashed_password', testData.admin.role]
    );
    adminId = adminResult.insertId;
    
    // Créer les membres d'équipe
    await db.execute(
      'INSERT INTO team_members (user_id, client_id, project_id, role) VALUES (?, ?, ?, "member")',
      [user1Id, client1Id, project1Id]
    );
    
    await db.execute(
      'INSERT INTO team_members (user_id, client_id, project_id, role) VALUES (?, ?, ?, "member")',
      [user2Id, client2Id, project2Id]
    );
  }
  
  async function cleanupTestData() {
    // Supprimer dans l'ordre inverse des dépendances
    await db.execute('DELETE FROM task_assignees WHERE client_id IN (?, ?)', [client1Id, client2Id]);
    await db.execute('DELETE FROM tasks WHERE client_id IN (?, ?)', [client1Id, client2Id]);
    await db.execute('DELETE FROM files WHERE client_id IN (?, ?)', [client1Id, client2Id]);
    await db.execute('DELETE FROM widget_instances WHERE client_id IN (?, ?)', [client1Id, client2Id]);
    await db.execute('DELETE FROM team_members WHERE client_id IN (?, ?)', [client1Id, client2Id]);
    await db.execute('DELETE FROM projects WHERE client_id IN (?, ?)', [client1Id, client2Id]);
    await db.execute('DELETE FROM users WHERE email IN (?, ?, ?)', [
      testData.user1.email, testData.user2.email, testData.admin.email
    ]);
    await db.execute('DELETE FROM clients WHERE email IN (?, ?)', [
      testData.client1.email, testData.client2.email
    ]);
  }
  
  function generateToken(userId, role, clientId = null) {
    const payload = {
      user_id: userId,
      role: role,
      client_id: clientId
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'test_secret', {
      expiresIn: '1h'
    });
  }
});