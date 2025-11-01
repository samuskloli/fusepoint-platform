const path = require('path');
const fs = require('fs');
const MariaDBConfig = require('../config/mariadb.config');

class AccompagnementService {
    constructor() {
        this.mariadb = new MariaDBConfig();
        this.initialized = false;
        // Ne pas faire planter l'application si la DB accompagnement est indisponible
        // Lancer l'initialisation de manière asynchrone et gérer les erreurs localement
        this.initDatabase().catch((err) => {
            console.warn('⚠️ AccompagnementService: initialisation en échec (non bloquant):', err && err.message ? err.message : err);
            this.initialized = false;
        });
    }

    async initDatabase() {
        try {
            await this.mariadb.createPool();
            console.log('Base de données accompagnement connectée');
            await this.createTables();
            await this.ensureIsAvailableColumn();
            // Ajout: s'assurer du lien conversations.request_id
            await this.ensureConversationsRequestIdColumn();
            this.initialized = true;
        } catch (error) {
            // Ne pas propager l'erreur pour éviter de faire planter le serveur au démarrage
            console.error('Erreur connexion base de données accompagnement (non bloquant):', error);
            this.initialized = false;
            return false;
        }
    }

    async createTables() {
        try {
            // Créer seulement les tables d'accompagnement
            // Les tables principales (users, companies) sont gérées par le service principal
            const schemaPath = path.join(__dirname, '../database/schema_accompagnement_complet.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Diviser le schéma en requêtes individuelles et les exécuter
            const queries = schema.split(';').filter(query => query.trim());
            const conn = await this.mariadb.getConnection();
            
            try {
                for (const query of queries) {
                    if (query.trim()) {
                        await conn.query(query.trim());
                    }
                }
                console.log('Tables accompagnement créées avec succès');
            } finally {
                conn.release();
            }
        } catch (err) {
            console.error('Erreur création tables accompagnement:', err);
            console.error('Message d\'erreur détaillé:', err.message);
            console.error('Code d\'erreur:', err.code);
            throw err;
        }
    }

    // Ajout: assurer la présence de la colonne is_available
    async ensureIsAvailableColumn() {
        let conn;
        try {
            conn = await this.mariadb.getConnection();
            const rows = await conn.query("SHOW COLUMNS FROM agency_services LIKE 'is_available'");
            if (!rows || rows.length === 0) {
                await conn.query("ALTER TABLE agency_services ADD COLUMN is_available TINYINT(1) NOT NULL DEFAULT 1 AFTER is_active");
                console.log('Colonne is_available ajoutée à agency_services');
            }
        } catch (err) {
            // Log sans bloquer l'app au cas où les droits empêchent l'ALTER
            console.warn('ensureIsAvailableColumn: impossible de vérifier/ajouter la colonne is_available:', err.message);
        } finally {
            if (conn) conn.release();
        }
    }

    // Ajout: garantir la colonne request_id dans conversations
    async ensureConversationsRequestIdColumn() {
        let conn;
        try {
            conn = await this.mariadb.getConnection();
            const cols = await conn.query("SHOW COLUMNS FROM conversations LIKE 'request_id'");
            if (!cols || cols.length === 0) {
                await conn.query("ALTER TABLE conversations ADD COLUMN request_id INT NULL AFTER agent_id");
                console.log('Colonne request_id ajoutée à conversations');
            }
            try {
                await conn.query("CREATE INDEX idx_conversations_request_id ON conversations(request_id)");
            } catch (e) {
                const msg = String(e.message || '').toLowerCase();
                if (!msg.includes('exists') && !msg.includes('duplicate')) {
                    console.warn('⚠️ Erreur création index conversations.request_id:', e.message);
                }
            }
        } catch (err) {
            console.warn('ensureConversationsRequestIdColumn: impossible de vérifier/ajouter la colonne request_id:', err.message);
        } finally {
            if (conn) conn.release();
        }
    }

    // ==================== GESTION DES PRESTATIONS ====================

    async getServices() {
        let conn;
        try {
            conn = await this.mariadb.getConnection();
            const rows = await conn.query('SELECT * FROM agency_services WHERE is_active = 1 ORDER BY display_order');
            const services = rows.map(service => ({
                ...service,
                deliverables: JSON.parse(service.deliverables || '[]'),
                requirements: JSON.parse(service.requirements || '[]')
            }));
            return services;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async getAgencyServices(activeOnly = true) {
        let conn;
        try {
            const query = activeOnly 
                ? 'SELECT * FROM agency_services WHERE is_active = 1 ORDER BY display_order, name'
                : 'SELECT * FROM agency_services ORDER BY display_order, name';
            
            conn = await this.mariadb.getConnection();
            const rows = await conn.query(query);
            const services = rows.map(row => ({
                ...row,
                deliverables: JSON.parse(row.deliverables || '[]'),
                requirements: JSON.parse(row.requirements || '[]')
            }));
            return services;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async getServiceById(serviceId) {
        let conn;
        try {
            conn = await this.mariadb.getConnection();
            const rows = await conn.query('SELECT * FROM agency_services WHERE id = ?', [serviceId]);
            const row = rows[0];
            if (row) {
                return {
                    ...row,
                    deliverables: JSON.parse(row.deliverables || '[]'),
                    requirements: JSON.parse(row.requirements || '[]')
                };
            } else {
                return null;
            }
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    // === AJOUT: CRUD des agency_services ===
    async createAgencyService(data) {
        let conn;
        try {
            const {
                name,
                description = null,
                category = null,
                price_type = null,
                base_price = null,
                duration_estimate = null,
                deliverables = [],
                requirements = [],
                is_active = 1,
                is_available = 1,
                display_order = 0,
                icon = null,
                color = null
            } = data;

            if (!name) {
                const err = new Error('Le champ name est requis');
                err.code = 'VALIDATION_ERROR';
                throw err;
            }

            conn = await this.mariadb.getConnection();
            const result = await conn.query(
                `INSERT INTO agency_services 
                 (name, description, category, price_type, base_price, duration_estimate, deliverables, requirements, is_active, is_available, display_order, icon, color)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    description,
                    category,
                    price_type,
                    base_price,
                    duration_estimate,
                    JSON.stringify(deliverables || []),
                    JSON.stringify(requirements || []),
                    is_active,
                    is_available,
                    display_order,
                    icon,
                    color
                ]
            );
            return await this.getServiceById(result.insertId);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async updateAgencyService(id, data) {
        let conn;
        try {
            const allowed = ['name','description','category','price_type','base_price','duration_estimate','deliverables','requirements','is_active','is_available','display_order','icon','color'];
            const set = [];
            const values = [];
            for (const key of allowed) {
                if (data[key] !== undefined) {
                    if (key === 'deliverables' || key === 'requirements') {
                        set.push(`${key} = ?`);
                        values.push(JSON.stringify(data[key] || []));
                    } else {
                        set.push(`${key} = ?`);
                        values.push(data[key]);
                    }
                }
            }
            if (set.length === 0) {
                const err = new Error('Aucune donnée à mettre à jour');
                err.code = 'VALIDATION_ERROR';
                throw err;
            }
            set.push('updated_at = CURRENT_TIMESTAMP');
            conn = await this.mariadb.getConnection();
            await conn.query(`UPDATE agency_services SET ${set.join(', ')} WHERE id = ?`, [...values, id]);
            return await this.getServiceById(id);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async deleteAgencyService(id) {
        let conn;
        try {
            conn = await this.mariadb.getConnection();
            await conn.query('DELETE FROM agency_services WHERE id = ?', [id]);
            return { success: true };
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    // ==================== GESTION DES DEMANDES ====================

    async createServiceRequest(requestData) {
        let conn;
        try {
            const {
                company_id,
                user_id,
                service_id,
                title,
                description,
                brief_data,
                budget_range,
                deadline,
                priority = 'normal'
            } = requestData;

            const query = `
                INSERT INTO service_requests 
                (company_id, user_id, service_id, title, description, brief_data, budget_range, deadline, priority)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            conn = await this.mariadb.getConnection();
            const result = await conn.query(query, [
                company_id, user_id, service_id, title, description, 
                JSON.stringify(brief_data), budget_range, deadline, priority
            ]);
            
            return result.insertId;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async getServiceRequests(companyId, status = null) {
        let conn;
        try {
            let query = `
                SELECT sr.*, ags.name as service_name, ags.category as service_category,
                       u.first_name, u.last_name, u.email
                FROM service_requests sr
                JOIN agency_services ags ON sr.service_id = ags.id
                JOIN users u ON sr.user_id = u.id
                WHERE sr.company_id = ?
            `;
            
            const params = [companyId];
            
            if (status) {
                query += ' AND sr.status = ?';
                params.push(status);
            }
            
            query += ' ORDER BY sr.created_at DESC';
            
            conn = await this.mariadb.getConnection();
            const rows = await conn.query(query, params);
            const requests = rows.map(row => ({
                ...row,
                brief_data: JSON.parse(row.brief_data || '{}')
            }));
            return requests;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async updateRequestStatus(requestId, newStatus, changedBy, comment = null) {
        let conn;
        try {
            conn = await this.mariadb.getConnection();
            
            // D'abord récupérer l'ancien statut
            const rows = await conn.query('SELECT status FROM service_requests WHERE id = ?', [requestId]);
            const oldStatus = rows.length > 0 ? rows[0].status : null;
            
            // Mettre à jour le statut
            await conn.query(
                'UPDATE service_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newStatus, requestId]
            );
            
            // Ajouter l'historique
            await conn.query(
                'INSERT INTO request_status_history (request_id, old_status, new_status, changed_by, comment) VALUES (?, ?, ?, ?, ?)',
                [requestId, oldStatus, newStatus, changedBy, comment]
            );
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async getRequestHistory(requestId) {
        let conn;
        try {
            const query = `
                SELECT rsh.*, u.first_name, u.last_name
                FROM request_status_history rsh
                LEFT JOIN users u ON rsh.changed_by = u.id
                WHERE rsh.request_id = ?
                ORDER BY rsh.created_at DESC
            `;
            
            conn = await this.mariadb.getConnection();
            const rows = await conn.query(query, [requestId]);
            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }



    // ==================== GESTION DES RECOMMANDATIONS ====================

    async createRecommendation(recommendationData) {
        try {
            const {
                company_id,
                type,
                title,
                description,
                priority,
                category,
                action_required,
                expected_impact,
                estimated_effort,
                data_source,
                expires_at
            } = recommendationData;

            const query = `
                INSERT INTO fusepoint_recommendations 
                (company_id, type, title, description, priority, category, action_required, 
                 expected_impact, estimated_effort, data_source, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            let conn;
            try {
                conn = await this.mariadb.getConnection();
                const result = await conn.query(query, [
                    company_id, type, title, description, priority, category,
                    action_required, expected_impact, estimated_effort, data_source, expires_at
                ]);
                
                return result.insertId;
            } finally {
                if (conn) conn.release();
            }
        } catch (err) {
            throw err;
        }
    }

    async getRecommendations(companyId, status = null, limit = null) {
        try {
            let query = `
                SELECT * FROM fusepoint_recommendations 
                WHERE company_id = ?
            `;
            
            const params = [companyId];
            
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
            
            query += ' ORDER BY priority DESC, created_at DESC';
            
            if (limit) {
                query += ' LIMIT ?';
                params.push(limit);
            }

            let conn;
            try {
                conn = await this.mariadb.getConnection();
                const rows = await conn.query(query, params);
                return rows;
            } finally {
                if (conn) conn.release();
            }
        } catch (err) {
            throw err;
        }
    }

    async updateRecommendationStatus(recommendationId, status, clientResponse = null) {
        try {
            const query = `
                UPDATE fusepoint_recommendations 
                SET status = ?, client_response = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            let conn;
            try {
                conn = await this.mariadb.getConnection();
                const result = await conn.query(query, [status, clientResponse, recommendationId]);
                return result.affectedRows;
            } finally {
                if (conn) conn.release();
            }
        } catch (err) {
            throw err;
        }
    }

    // ==================== GESTION DES NOTIFICATIONS ====================

    async createNotification(notificationData) {
        try {
            const {
                user_id,
                company_id,
                type,
                title,
                message,
                data,
                action_url
            } = notificationData;

            const query = `
                INSERT INTO notifications 
                (user_id, company_id, type, title, message, data, action_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            let conn;
            try {
                conn = await this.mariadb.getConnection();
                const safeData = (data === undefined || data === null)
                  ? null
                  : JSON.stringify(data, (_k, v) => (typeof v === 'bigint' ? Number(v) : v));
                const result = await conn.query(query, [
                    user_id, company_id, type, title, message,
                    safeData, action_url
                ]);

                // Envoi push non bloquant
                try {
                    const pushService = require('./pushService');
                    const payload = { title, body: message, url: action_url || '/' };
                    pushService.sendToUser(user_id, payload).catch(() => {});
                } catch (e) {
                    // Ignorer toute erreur push pour ne pas bloquer la création
                }
                
                return result.insertId;
            } finally {
                if (conn) conn.release();
            }
        } catch (err) {
            throw err;
        }
    }

    async getNotifications(userId, companyId = null, unreadOnly = false, limit = 50) {
        try {
            let query = `
                SELECT * FROM notifications 
                WHERE user_id = ?
            `;
            
            const params = [userId];
            
            if (companyId) {
                query += ' AND company_id = ?';
                params.push(companyId);
            }
            
            if (unreadOnly) {
                query += ' AND is_read = 0';
            }
            
            query += ' ORDER BY created_at DESC LIMIT ?';
            params.push(limit);

            let conn;
            try {
                conn = await this.mariadb.getConnection();
                const rows = await conn.query(query, params);
                
                // Parse JSON data field
                const notifications = rows.map(row => ({
                    ...row,
                    data: row.data ? JSON.parse(row.data) : null
                }));
                
                return notifications;
            } finally {
                if (conn) conn.release();
            }
        } catch (err) {
            throw err;
        }
    }

    // ==================== GESTION DES CONVERSATIONS ====================

    async createConversation(companyId, requestId = null, type = 'general', title = 'Discussion') {
        let conn;
        try {
            conn = await this.mariadb.getConnection();

            let clientId = null;
            let agentId = null;

            // Si une demande est fournie, récupérer le client et l'agent associé
            if (requestId) {
                const rows = await conn.query(
                    `SELECT sr.user_id AS client_id, u.agent_id AS agent_id
                     FROM service_requests sr
                     LEFT JOIN users u ON u.id = sr.user_id
                     WHERE sr.id = ?`,
                    [requestId]
                );
                if (rows && rows[0]) {
                    clientId = rows[0].client_id || null;
                    agentId = rows[0].agent_id || null;
                }
            }

            // Si pas de client trouvé, essayer d'en déduire un via la company
            if (!clientId && companyId) {
                const rows = await conn.query(
                    `SELECT id AS client_id, agent_id FROM users 
                     WHERE company_id = ? AND role IN ('client','user')
                     ORDER BY id LIMIT 1`,
                    [companyId]
                );
                if (rows && rows[0]) {
                    clientId = rows[0].client_id || null;
                    if (!agentId) agentId = rows[0].agent_id || null;
                }
            }

            // Fallback: si aucun agent associé, choisir un agent/admin de l'entreprise
            if (!agentId && companyId) {
                const rows = await conn.query(
                    `SELECT id FROM users 
                     WHERE company_id = ? AND role IN ('agent','admin')
                     ORDER BY id LIMIT 1`,
                    [companyId]
                );
                if (rows && rows[0]) {
                    agentId = rows[0].id;
                }
            }

            // Dernier recours: si aucun agent trouvé, associer au client pour éviter NULL
            if (!agentId && clientId) {
                agentId = clientId;
            }

            // Vérifications minimales pour éviter une erreur
            if (!clientId) {
                const err = new Error('Impossible de déterminer le client pour la conversation');
                err.code = 'CLIENT_NOT_FOUND';
                throw err;
            }

            const result = await conn.query(
                `INSERT INTO conversations (client_id, agent_id, request_id, title, status, last_message_at)
                 VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
                [clientId, agentId, requestId || null, title || 'Discussion']
            );

            return result.insertId;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async getNotificationsCount(userId) {
        try {
            const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?';
            let conn;
            try {
                conn = await this.mariadb.getConnection();
                const rows = await conn.query(query, [userId]);
                return rows[0].count;
            } finally {
                if (conn) conn.release();
            }
        } catch (err) {
            console.error('Erreur lors du comptage des notifications:', err);
            throw err;
        }
    }

    async markAllNotificationsAsRead(userId) {
        try {
            const query = 'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0';
            let conn;
            try {
                conn = await this.mariadb.getConnection();
                const result = await conn.query(query, [userId]);
                return { changes: result.affectedRows };
            } finally {
                if (conn) conn.release();
            }
        } catch (err) {
            console.error('Erreur lors du marquage des notifications:', err);
            throw err;
        }
    }

    async markNotificationAsRead(notificationId, userId) {
        try {
            let conn;
            try {
                conn = await this.mariadb.getConnection();
                await conn.query(
                    'UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [notificationId]
                );
            } finally {
                if (conn) conn.release();
            }
        } catch (err) {
            throw err;
        }
    }

    // ==================== MÉTRIQUES ET STATISTIQUES ====================

    async getAccompanimentMetrics(companyId) {
        try {
            const queries = {
                activeRequests: 'SELECT COUNT(*) as count FROM service_requests WHERE company_id = ? AND status IN ("pending", "in_progress")',
                completedRequests: 'SELECT COUNT(*) as count FROM service_requests WHERE company_id = ? AND status = "completed"',
                pendingRecommendations: 'SELECT COUNT(*) as count FROM fusepoint_recommendations WHERE company_id = ? AND status = "pending"'
            };
            
            const results = {};
            
            let conn;
            try {
                conn = await this.mariadb.getConnection();
                for (const [key, query] of Object.entries(queries)) {
                    const rows = await conn.query(query, [companyId]);
                    results[key] = rows[0].count;
                }
            } finally {
                if (conn) conn.release();
            }
            
            return results;
        } catch (err) {
            throw err;
        }
    }

    async getRecentActivity(companyId, limit = 10) {
        try {
            const query = `
                SELECT 
                    'request' as type,
                    sr.id,
                    sr.title,
                    sr.status,
                    sr.updated_at as activity_date,
                    'Demande de prestation' as activity_type
                FROM service_requests sr
                WHERE sr.company_id = ?
                
                UNION ALL
                
                SELECT 
                    'recommendation' as type,
                    fr.id,
                    fr.title,
                    fr.status,
                    fr.updated_at as activity_date,
                    'Recommandation Fusepoint' as activity_type
                FROM fusepoint_recommendations fr
                WHERE fr.company_id = ?
                
                ORDER BY activity_date DESC
                LIMIT ?
            `;
            
            let conn;
            try {
                conn = await this.mariadb.getConnection();
                const rows = await conn.query(query, [companyId, companyId, limit]);
                return rows;
            } finally {
                if (conn) conn.release();
            }
        } catch (err) {
            throw err;
        }
    }

    // ==================== UTILITAIRES ====================

    async close() {
        if (this.db) {
            return new Promise((resolve) => {
                this.db.close((err) => {
                    if (err) console.error('Erreur fermeture base de données:', err);
                    else console.log('Base de données accompagnement fermée');
                    resolve();
                });
            });
        }
    }
}

module.exports = AccompagnementService;