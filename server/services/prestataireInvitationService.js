const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const databaseService = require('./databaseService');
const emailService = require('./emailService');
const bcrypt = require('bcryptjs');

class PrestataireInvitationService {
    constructor() {
        this.db = null;
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            // Attendre que le service de base de données soit initialisé
            if (!databaseService.db) {
                await databaseService.initialize();
            }
            this.db = databaseService.db;
            console.log('✅ PrestataireInvitationService: Base de données initialisée');
        } catch (error) {
            console.error('❌ Erreur initialisation base de données:', error);
            throw error;
        }
    }

    /**
     * Génère un token sécurisé pour l'invitation
     */
    generateSecureToken() {
        return uuidv4() + '-' + crypto.randomBytes(16).toString('hex');
    }

    /**
     * Crée une nouvelle invitation de prestataire
     * @param {Object} invitationData - Données de l'invitation
     * @param {string} invitationData.email - Email du prestataire
     * @param {number} invitationData.agentId - ID de l'agent qui invite
     * @param {Object} invitationData.prestataireInfo - Informations du prestataire (nom, prénom, spécialité)
     * @param {number} invitationData.expirationDays - Nombre de jours avant expiration (défaut: 7)
     */
    async createInvitation(invitationData) {
        try {
            const { email, agentId, prestataireInfo = {}, expirationDays = 7 } = invitationData;

            // Vérifier si l'email existe déjà
            const existingUser = await this.db.get(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUser) {
                throw new Error('Un utilisateur avec cet email existe déjà');
            }

            // Vérifier si une invitation active existe déjà
            const existingInvitation = await this.db.get(
                'SELECT id FROM prestataire_invitations WHERE email = ? AND status = "pending" AND expires_at > datetime("now")',
                [email]
            );

            if (existingInvitation) {
                throw new Error('Une invitation active existe déjà pour cet email');
            }

            // Générer le token sécurisé
            const token = this.generateSecureToken();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expirationDays);

            // Créer l'invitation
            const result = await this.db.run(
                `INSERT INTO prestataire_invitations 
                 (email, token, agent_id, expires_at, invitation_data) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    email,
                    token,
                    agentId,
                    expiresAt.toISOString(),
                    JSON.stringify(prestataireInfo)
                ]
            );

            const invitationId = result.lastID;

            // Récupérer les informations de l'agent
            const agent = await this.db.get(
                'SELECT first_name, last_name, email FROM users WHERE id = ?',
                [agentId]
            );

            // Envoyer l'email d'invitation avec template HTML
            await this.sendInvitationEmail({
                email,
                token,
                agentName: `${agent.first_name} ${agent.last_name}`,
                agentEmail: agent.email,
                prestataireInfo,
                expiresAt: expiresAt.toISOString()
            });

            console.log(`✅ Invitation créée avec succès pour ${email}`);

            return {
                id: invitationId,
                email,
                token,
                agentId,
                expiresAt: expiresAt.toISOString(),
                status: 'pending'
            };

        } catch (error) {
            console.error('❌ Erreur création invitation:', error);
            throw error;
        }
    }

    /**
     * Envoie l'email d'invitation avec template HTML
     */
    async sendInvitationEmail({ email, token, agentName, agentEmail, prestataireInfo, expiresAt }) {
        try {
            const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register-prestataire/${token}`;
            
            try {
                // Charger le template HTML
                const templatePath = path.join(__dirname, '../templates/prestataire-invitation-email.html');
                let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
                
                // Remplacer les variables dans le template
                const templateData = {
                    agentName: agentName,
                    agentEmail: agentEmail,
                    registrationLink: registrationLink,
                    expiryDate: new Date(expiresAt).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    prestataireFirstName: prestataireInfo.firstName || '',
                    prestataireSpeciality: prestataireInfo.speciality || ''
                };
                
                // Remplacer les variables simples
                Object.keys(templateData).forEach(key => {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    htmlTemplate = htmlTemplate.replace(regex, templateData[key] || '');
                });
                
                // Gérer les conditions
                if (prestataireInfo.speciality) {
                    htmlTemplate = htmlTemplate.replace(/{{#if prestataireSpeciality}}/g, '');
                    htmlTemplate = htmlTemplate.replace(/{{\/if}}/g, '');
                } else {
                    htmlTemplate = htmlTemplate.replace(/{{#if prestataireSpeciality}}[\s\S]*?{{\/if}}/g, '');
                }
                
                const emailSubject = `🚀 Invitation Fusepoint - Rejoignez l'équipe de ${agentName}`;
                const emailText = `
Bonjour,

${agentName} vous invite à rejoindre Fusepoint en tant que prestataire externe.

Pour créer votre compte et commencer à collaborer, cliquez sur le lien suivant :
${registrationLink}

Ce lien expire le ${new Date(expiresAt).toLocaleDateString('fr-FR')}.

Cordialement,
L'équipe Fusepoint
                `;
                
                await emailService.sendEmail({
                    to: email,
                    subject: emailSubject,
                    text: emailText,
                    html: htmlTemplate
                });
            } catch (templateError) {
                console.warn('Erreur lors du chargement du template HTML, envoi en mode texte:', templateError);
                
                // Fallback en mode texte si le template HTML échoue
                const emailContent = {
                    to: email,
                    subject: `Invitation à rejoindre Fusepoint en tant que prestataire`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #1f2937; margin: 0; font-size: 24px;">🎯 Invitation Fusepoint</h1>
                                </div>
                                
                                <p style="color: #374151; font-size: 16px; line-height: 1.6;">Bonjour${prestataireInfo.firstName ? ` ${prestataireInfo.firstName}` : ''},</p>
                                
                                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                                    <strong>${agentName}</strong> (${agentEmail}) vous invite à rejoindre la plateforme Fusepoint en tant que prestataire externe.
                                </p>
                                
                                ${prestataireInfo.speciality ? `
                                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Spécialité :</strong> ${prestataireInfo.speciality}</p>
                                    </div>
                                ` : ''}
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${registrationLink}" 
                                       style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                        Créer mon compte prestataire
                                    </a>
                                </div>
                                
                                <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                                        ⚠️ <strong>Important :</strong> Ce lien est valide pendant 7 jours et ne peut être utilisé qu'une seule fois.
                                    </p>
                                </div>
                                
                                <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                                    Si vous n'arrivez pas à cliquer sur le bouton, copiez et collez ce lien dans votre navigateur :<br>
                                    <span style="word-break: break-all; color: #3b82f6;">${registrationLink}</span>
                                </p>
                                
                                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                                
                                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                                    Cet email a été envoyé par Fusepoint. Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
                                </p>
                            </div>
                        </div>
                    `,
                    text: `
Invitation Fusepoint

Bonjour${prestataireInfo.firstName ? ` ${prestataireInfo.firstName}` : ''},

${agentName} (${agentEmail}) vous invite à rejoindre la plateforme Fusepoint en tant que prestataire externe.

${prestataireInfo.speciality ? `Spécialité : ${prestataireInfo.speciality}\n\n` : ''}
Pour créer votre compte, cliquez sur ce lien :
${registrationLink}

Ce lien est valide pendant 7 jours et ne peut être utilisé qu'une seule fois.

Cordialement,
L'équipe Fusepoint
                    `
                };

                await emailService.sendEmail(emailContent);
            }
            
            console.log(`✅ Email d'invitation envoyé à ${email}`);

        } catch (error) {
            console.error('❌ Erreur envoi email invitation:', error);
            throw error;
        }
    }

    /**
     * Vérifie la validité d'un token d'invitation
     */
    async verifyInvitationToken(token) {
        try {
            const invitation = await this.db.get(
                `SELECT i.*, u.first_name as agent_first_name, u.last_name as agent_last_name 
                 FROM prestataire_invitations i 
                 JOIN users u ON i.agent_id = u.id 
                 WHERE i.token = ?`,
                [token]
            );

            if (!invitation) {
                return { valid: false, error: 'Token d\'invitation invalide' };
            }

            if (invitation.status !== 'pending') {
                return { valid: false, error: 'Cette invitation a déjà été utilisée' };
            }

            if (new Date(invitation.expires_at) < new Date()) {
                return { valid: false, error: 'Cette invitation a expiré' };
            }

            return {
                valid: true,
                invitation: {
                    id: invitation.id,
                    email: invitation.email,
                    agentName: `${invitation.agent_first_name} ${invitation.agent_last_name}`,
                    invitationData: JSON.parse(invitation.invitation_data || '{}')
                }
            };

        } catch (error) {
            console.error('❌ Erreur vérification token:', error);
            return { valid: false, error: 'Erreur lors de la vérification du token' };
        }
    }

    /**
     * Accepte une invitation et crée le compte prestataire
     */
    async acceptInvitation(token, userData) {
        try {
            const { firstName, lastName, password, phone = '' } = userData;

            // Vérifier le token
            const verification = await this.verifyInvitationToken(token);
            if (!verification.valid) {
                throw new Error(verification.error);
            }

            const invitation = verification.invitation;

            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 12);

            // Créer l'utilisateur prestataire
            const userResult = await this.db.run(
                `INSERT INTO users 
                 (email, password, first_name, last_name, phone, role, status, created_at) 
                 VALUES (?, ?, ?, ?, ?, 'prestataire', 'active', datetime('now'))`,
                [
                    invitation.email,
                    hashedPassword,
                    firstName,
                    lastName,
                    phone
                ]
            );

            const prestataireId = userResult.lastID;

            // Récupérer l'invitation complète
            const fullInvitation = await this.db.get(
                'SELECT * FROM prestataire_invitations WHERE token = ?',
                [token]
            );

            // Créer la relation agent-prestataire
            await this.db.run(
                `INSERT INTO agent_prestataires 
                 (agent_id, prestataire_id, relationship_type, status) 
                 VALUES (?, ?, 'collaborator', 'active')`,
                [fullInvitation.agent_id, prestataireId]
            );

            // Marquer l'invitation comme acceptée
            await this.db.run(
                `UPDATE prestataire_invitations 
                 SET status = 'accepted', accepted_at = datetime('now'), created_user_id = ? 
                 WHERE token = ?`,
                [prestataireId, token]
            );

            console.log(`✅ Invitation acceptée pour ${invitation.email}, utilisateur créé avec ID ${prestataireId}`);

            return {
                success: true,
                userId: prestataireId,
                email: invitation.email,
                role: 'prestataire'
            };

        } catch (error) {
            console.error('❌ Erreur acceptation invitation:', error);
            throw error;
        }
    }

    /**
     * Récupère les invitations d'un agent
     */
    async getAgentInvitations(agentId, status = null) {
        try {
            let query = `
                SELECT i.*, u.first_name, u.last_name 
                FROM prestataire_invitations i 
                LEFT JOIN users u ON i.created_user_id = u.id 
                WHERE i.agent_id = ?
            `;
            const params = [agentId];

            if (status) {
                query += ' AND i.status = ?';
                params.push(status);
            }

            query += ' ORDER BY i.invited_at DESC';

            const invitations = await this.db.all(query, params);

            return invitations.map(inv => ({
                id: inv.id,
                email: inv.email,
                status: inv.status,
                invitedAt: inv.invited_at,
                expiresAt: inv.expires_at,
                acceptedAt: inv.accepted_at,
                invitationData: JSON.parse(inv.invitation_data || '{}'),
                createdUser: inv.first_name ? {
                    id: inv.created_user_id,
                    firstName: inv.first_name,
                    lastName: inv.last_name
                } : null
            }));

        } catch (error) {
            console.error('❌ Erreur récupération invitations agent:', error);
            throw error;
        }
    }

    /**
     * Récupère les prestataires d'un agent
     */
    async getAgentPrestataires(agentId) {
        try {
            const prestataires = await this.db.all(
                `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at,
                        ap.relationship_type, ap.status as relationship_status, ap.created_at as relationship_created
                 FROM agent_prestataires ap
                 JOIN users u ON ap.prestataire_id = u.id
                 WHERE ap.agent_id = ? AND u.role = 'prestataire'
                 ORDER BY ap.created_at DESC`,
                [agentId]
            );

            return prestataires.map(p => ({
                id: p.id,
                email: p.email,
                firstName: p.first_name,
                lastName: p.last_name,
                phone: p.phone,
                createdAt: p.created_at,
                relationship: {
                    type: p.relationship_type,
                    status: p.relationship_status,
                    createdAt: p.relationship_created
                }
            }));

        } catch (error) {
            console.error('❌ Erreur récupération prestataires agent:', error);
            throw error;
        }
    }

    /**
     * Annule une invitation
     */
    async cancelInvitation(invitationId, agentId) {
        try {
            const result = await this.db.run(
                `UPDATE prestataire_invitations 
                 SET status = 'cancelled' 
                 WHERE id = ? AND agent_id = ? AND status = 'pending'`,
                [invitationId, agentId]
            );

            if (result.changes === 0) {
                throw new Error('Invitation non trouvée ou déjà traitée');
            }

            console.log(`✅ Invitation ${invitationId} annulée`);
            return { success: true };

        } catch (error) {
            console.error('❌ Erreur annulation invitation:', error);
            throw error;
        }
    }

    /**
     * Nettoie les invitations expirées
     */
    async cleanupExpiredInvitations() {
        try {
            const result = await this.db.run(
                `UPDATE prestataire_invitations 
                 SET status = 'expired' 
                 WHERE status = 'pending' AND expires_at < datetime('now')`
            );

            console.log(`✅ ${result.changes} invitations expirées nettoyées`);
            return result.changes;

        } catch (error) {
            console.error('❌ Erreur nettoyage invitations expirées:', error);
            throw error;
        }
    }
}

module.exports = new PrestataireInvitationService();