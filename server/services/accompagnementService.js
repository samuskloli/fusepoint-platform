const path = require('path');
const fs = require('fs');
const MariaDBConfig = require('../config/mariadb.config');

class AccompagnementService {
    constructor() {
        this.mariadb = new MariaDBConfig();
        this.initialized = false;
        this.initDatabase();
    }

    async initDatabase() {
        try {
            await this.mariadb.createPool();
            console.log('Base de données accompagnement connectée');
            await this.createTables();
            this.initialized = true;
        } catch (error) {
            console.error('Erreur connexion base de données accompagnement:', error);
            throw error;
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
            
            return { id: result.insertId, ...requestData };
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
                const result = await conn.query(query, [
                    user_id, company_id, type, title, message,
                    JSON.stringify(data || {}), action_url
                ]);
                
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