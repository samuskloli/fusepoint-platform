const path = require('path');
const fs = require('fs');
const databaseService = require('./databaseService');

class AccompagnementService {
    constructor() {
        this.db = null;
        this.initialized = false;
        this.initDatabase();
    }

    async initDatabase() {
        try {
            // Attendre que le service de base de données principal soit initialisé
            if (!databaseService.db) {
                await databaseService.initialize();
            }
            this.db = databaseService.db;
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
            
            await this.db.exec(schema);
            console.log('Tables accompagnement créées avec succès');
        } catch (err) {
            console.error('Erreur création tables accompagnement:', err);
            console.error('Message d\'erreur détaillé:', err.message);
            console.error('Code d\'erreur:', err.code);
            throw err;
        }
    }

    // ==================== GESTION DES PRESTATIONS ====================

    async getServices() {
        try {
            const rows = await this.db.all('SELECT * FROM agency_services WHERE is_active = 1 ORDER BY display_order');
            const services = rows.map(service => ({
                ...service,
                deliverables: JSON.parse(service.deliverables || '[]'),
                requirements: JSON.parse(service.requirements || '[]')
            }));
            return services;
        } catch (err) {
            throw err;
        }
    }

    async getAgencyServices(activeOnly = true) {
        const query = activeOnly 
            ? 'SELECT * FROM agency_services WHERE is_active = 1 ORDER BY display_order, name'
            : 'SELECT * FROM agency_services ORDER BY display_order, name';
        
        return new Promise((resolve, reject) => {
            this.db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else {
                    const services = rows.map(row => ({
                        ...row,
                        deliverables: JSON.parse(row.deliverables || '[]'),
                        requirements: JSON.parse(row.requirements || '[]')
                    }));
                    resolve(services);
                }
            });
        });
    }

    async getServiceById(serviceId) {
        try {
            const row = await this.db.get('SELECT * FROM agency_services WHERE id = ?', [serviceId]);
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
        }
    }

    // ==================== GESTION DES DEMANDES ====================

    async createServiceRequest(requestData) {
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
            
            const result = await this.db.run(query, [
                company_id, user_id, service_id, title, description, 
                JSON.stringify(brief_data), budget_range, deadline, priority
            ]);
            
            return { id: result.lastID, ...requestData };
        } catch (err) {
            throw err;
        }
    }

    async getServiceRequests(companyId, status = null) {
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
            
            const rows = await this.db.all(query, params);
            const requests = rows.map(row => ({
                ...row,
                brief_data: JSON.parse(row.brief_data || '{}')
            }));
            return requests;
        } catch (err) {
            throw err;
        }
    }

    async updateRequestStatus(requestId, newStatus, changedBy, comment = null) {
        try {
            // D'abord récupérer l'ancien statut
            const row = await this.db.get('SELECT status FROM service_requests WHERE id = ?', [requestId]);
            const oldStatus = row ? row.status : null;
            
            // Mettre à jour le statut
            await this.db.run(
                'UPDATE service_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newStatus, requestId]
            );
            
            // Ajouter l'historique
            await this.db.run(
                'INSERT INTO request_status_history (request_id, old_status, new_status, changed_by, comment) VALUES (?, ?, ?, ?, ?)',
                [requestId, oldStatus, newStatus, changedBy, comment]
            );
        } catch (err) {
            throw err;
        }
    }

    async getRequestHistory(requestId) {
        try {
            const query = `
                SELECT rsh.*, u.first_name, u.last_name
                FROM request_status_history rsh
                LEFT JOIN users u ON rsh.changed_by = u.id
                WHERE rsh.request_id = ?
                ORDER BY rsh.created_at DESC
            `;
            
            const rows = await this.db.all(query, [requestId]);
            return rows;
        } catch (err) {
            throw err;
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
            
            const result = await this.db.run(query, [
                company_id, type, title, description, priority, category,
                action_required, expected_impact, estimated_effort, data_source, expires_at
            ]);
            
            return result.lastID;
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

            const rows = await this.db.all(query, params);
            return rows;
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
            
            const result = await this.db.run(query, [status, clientResponse, recommendationId]);
            return result.changes;
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
            
            const result = await this.db.run(query, [
                user_id, company_id, type, title, message,
                JSON.stringify(data || {}), action_url
            ]);
            
            return result.lastID;
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

            const rows = await this.db.all(query, params);
            
            // Parse JSON data field
            const notifications = rows.map(row => ({
                ...row,
                data: row.data ? JSON.parse(row.data) : null
            }));
            
            return notifications;
        } catch (err) {
            throw err;
        }
    }

    async getNotificationsCount(userId) {
        try {
            const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?';
            const row = await this.db.get(query, [userId]);
            return row.count;
        } catch (err) {
            console.error('Erreur lors du comptage des notifications:', err);
            throw err;
        }
    }

    async markAllNotificationsAsRead(userId) {
        try {
            const query = 'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0';
            const result = await this.db.run(query, [userId]);
            return { changes: result.changes };
        } catch (err) {
            console.error('Erreur lors du marquage des notifications:', err);
            throw err;
        }
    }

    async markNotificationAsRead(notificationId, userId) {
        try {
            await this.db.run(
                'UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ?',
                [notificationId]
            );
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
            
            for (const [key, query] of Object.entries(queries)) {
                const row = await this.db.get(query, [companyId]);
                results[key] = row.count;
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
            
            const rows = await this.db.all(query, [companyId, companyId, limit]);
            return rows;
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