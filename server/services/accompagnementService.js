const Database = require('sqlite3').Database;
const path = require('path');
const fs = require('fs');

class AccompagnementService {
    constructor() {
        this.dbPath = path.join(__dirname, '../database/fusepoint.db');
        this.db = null;
        this.initDatabase();
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {
            this.db = new Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Erreur connexion base de données:', err);
                    reject(err);
                } else {
                    console.log('Base de données accompagnement connectée');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        // Créer seulement les tables d'accompagnement
        // Les tables principales (users, companies) sont gérées par le service principal
        const schemaPath = path.join(__dirname, '../database/schema_accompagnement_complet.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        return new Promise((resolve, reject) => {
            this.db.exec(schema, (err) => {
                if (err) {
                    console.error('Erreur création tables accompagnement:', err);
                    console.error('Message d\'erreur détaillé:', err.message);
                    console.error('Code d\'erreur:', err.code);
                    reject(err);
                } else {
                    console.log('Tables accompagnement créées avec succès');
                    resolve();
                }
            });
        });
    }

    // ==================== GESTION DES PRESTATIONS ====================

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
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM agency_services WHERE id = ?', [serviceId], (err, row) => {
                if (err) reject(err);
                else if (row) {
                    resolve({
                        ...row,
                        deliverables: JSON.parse(row.deliverables || '[]'),
                        requirements: JSON.parse(row.requirements || '[]')
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // ==================== GESTION DES DEMANDES ====================

    async createServiceRequest(requestData) {
        const {
            company_id,
            user_id,
            service_id,
            title,
            description,
            brief_data,
            budget_range,
            deadline
        } = requestData;

        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO service_requests 
                (company_id, user_id, service_id, title, description, brief_data, budget_range, deadline)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, [
                company_id, user_id, service_id, title, description,
                JSON.stringify(brief_data), budget_range, deadline
            ], function(err) {
                if (err) reject(err);
                else {
                    // Créer automatiquement une conversation pour cette demande
                    const requestId = this.lastID;
                    resolve(requestId);
                }
            });
        });
    }

    async getServiceRequests(companyId, status = null) {
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

        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else {
                    const requests = rows.map(row => ({
                        ...row,
                        brief_data: JSON.parse(row.brief_data || '{}')
                    }));
                    resolve(requests);
                }
            });
        });
    }

    async updateRequestStatus(requestId, newStatus, changedBy, comment = null) {
        return new Promise((resolve, reject) => {
            // D'abord récupérer l'ancien statut
            this.db.get('SELECT status FROM service_requests WHERE id = ?', [requestId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                const oldStatus = row ? row.status : null;
                
                // Mettre à jour le statut
                this.db.run(
                    'UPDATE service_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [newStatus, requestId],
                    (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        
                        // Ajouter l'historique
                        this.db.run(
                            'INSERT INTO request_status_history (request_id, old_status, new_status, changed_by, comment) VALUES (?, ?, ?, ?, ?)',
                            [requestId, oldStatus, newStatus, changedBy, comment],
                            (err) => {
                                if (err) reject(err);
                                else resolve();
                            }
                        );
                    }
                );
            });
        });
    }

    async getRequestHistory(requestId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT rsh.*, u.first_name, u.last_name
                FROM request_status_history rsh
                LEFT JOIN users u ON rsh.changed_by = u.id
                WHERE rsh.request_id = ?
                ORDER BY rsh.created_at DESC
            `;
            
            this.db.all(query, [requestId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }



    // ==================== GESTION DES RECOMMANDATIONS ====================

    async createRecommendation(recommendationData) {
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

        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO fusepoint_recommendations 
                (company_id, type, title, description, priority, category, action_required, 
                 expected_impact, estimated_effort, data_source, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, [
                company_id, type, title, description, priority, category,
                action_required, expected_impact, estimated_effort, data_source, expires_at
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    async getRecommendations(companyId, status = null, limit = null) {
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

        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async updateRecommendationStatus(recommendationId, status, clientResponse = null, scheduledDate = null) {
        return new Promise((resolve, reject) => {
            let query = 'UPDATE fusepoint_recommendations SET status = ?, updated_at = CURRENT_TIMESTAMP';
            const params = [status, recommendationId];
            
            if (clientResponse) {
                query = query.replace('updated_at', 'client_response = ?, updated_at');
                params.splice(1, 0, clientResponse);
            }
            
            if (scheduledDate) {
                query = query.replace('updated_at', 'scheduled_date = ?, updated_at');
                params.splice(-1, 0, scheduledDate);
            }
            
            query += ' WHERE id = ?';
            
            this.db.run(query, params, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // ==================== GESTION DES NOTIFICATIONS ====================

    async createNotification(notificationData) {
        const {
            user_id,
            company_id,
            type,
            title,
            message,
            data,
            action_url
        } = notificationData;

        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO notifications 
                (user_id, company_id, type, title, message, data, action_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, [
                user_id, company_id, type, title, message,
                JSON.stringify(data || {}), action_url
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    async getNotifications(userId, unreadOnly = false, limit = 20, offset = 0) {
        // Récupérer le rôle de l'utilisateur pour déterminer quelles notifications afficher
        const userQuery = 'SELECT role FROM users WHERE id = ?';
        
        return new Promise((resolve, reject) => {
            this.db.get(userQuery, [userId], (err, userRow) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                let query, params;
                
                if (userRow && userRow.role === 'agent') {
                    // Pour les agents, récupérer toutes les notifications qui leur sont destinées
                    // Cela inclut les notifications user_assignment créées avec leur ID
                    query = 'SELECT * FROM notifications WHERE user_id = ?';
                    params = [userId];
                } else {
                    // Pour les autres utilisateurs, récupérer leurs propres notifications
                    query = 'SELECT * FROM notifications WHERE user_id = ?';
                    params = [userId];
                }
                
                if (unreadOnly) {
                    query += ' AND is_read = 0';
                }
                
                query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
                params.push(limit, offset);
                
                this.db.all(query, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const notifications = rows.map(row => ({
                            ...row,
                            data: JSON.parse(row.data || '{}')
                        }));
                        resolve(notifications);
                    }
                });
            });
        });
    }

    async getNotificationsCount(userId) {
        const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?';
        
        return new Promise((resolve, reject) => {
            this.db.get(query, [userId], (err, row) => {
                if (err) {
                    console.error('Erreur lors du comptage des notifications:', err);
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    }

    async markAllNotificationsAsRead(userId) {
        const query = 'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0';
        
        return new Promise((resolve, reject) => {
            this.db.run(query, [userId], function(err) {
                if (err) {
                    console.error('Erreur lors du marquage des notifications:', err);
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async markNotificationAsRead(notificationId, userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ?',
                [notificationId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    // ==================== MÉTRIQUES ET STATISTIQUES ====================

    async getAccompanimentMetrics(companyId) {
        return new Promise((resolve, reject) => {
            const queries = {
                activeRequests: 'SELECT COUNT(*) as count FROM service_requests WHERE company_id = ? AND status IN ("pending", "in_progress")',
                completedRequests: 'SELECT COUNT(*) as count FROM service_requests WHERE company_id = ? AND status = "completed"',
                pendingRecommendations: 'SELECT COUNT(*) as count FROM fusepoint_recommendations WHERE company_id = ? AND status = "pending"'
            };
            
            const results = {};
            const queryPromises = Object.entries(queries).map(([key, query]) => {
                return new Promise((resolve, reject) => {
                    this.db.get(query, [companyId], (err, row) => {
                        if (err) reject(err);
                        else {
                            results[key] = row.count;
                            resolve();
                        }
                    });
                });
            });
            
            Promise.all(queryPromises)
                .then(() => resolve(results))
                .catch(reject);
        });
    }

    async getRecentActivity(companyId, limit = 10) {
        return new Promise((resolve, reject) => {
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
            
            this.db.all(query, [companyId, companyId, limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
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