/**
 * Types pour les services backend
 */

import { User, Project, Company, Agent, Client, ProjectTemplate } from './database';
import { ApiResponse, EmailRequest } from './routes';

export interface AuthService {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  register(userData: Partial<User>): Promise<User>;
  verifyToken(token: string): Promise<User | null>;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}

export interface DatabaseService {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  run(sql: string, params?: any[]): Promise<{ insertId?: number; affectedRows?: number }>;
  get<T = any>(sql: string, params?: any[]): Promise<T | null>;
  close(): Promise<void>;
}

export interface EmailService {
  sendEmail(emailData: EmailRequest): Promise<boolean>;
  sendWelcomeEmail(user: User): Promise<boolean>;
  sendPasswordResetEmail(user: User, resetToken: string): Promise<boolean>;
  sendProjectNotification(project: Project, user: User): Promise<boolean>;
}

export interface ProjectService {
  createProject(projectData: Partial<Project>): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;
  getProject(id: number): Promise<Project | null>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  getProjectsByAgent(agentId: number): Promise<Project[]>;
  updateProgress(id: number, progress: number): Promise<boolean>;
}

export interface ClientService {
  createClient(clientData: Partial<Client>): Promise<Client>;
  updateClient(id: number, updates: Partial<Client>): Promise<Client>;
  deleteClient(id: number): Promise<boolean>;
  getClient(id: number): Promise<Client | null>;
  getClientsByAgent(agentId: number): Promise<Client[]>;
  assignAgent(clientId: number, agentId: number): Promise<boolean>;
}

export interface AgentService {
  createAgent(agentData: Partial<Agent>): Promise<Agent>;
  updateAgent(id: number, updates: Partial<Agent>): Promise<Agent>;
  deleteAgent(id: number): Promise<boolean>;
  getAgent(id: number): Promise<Agent | null>;
  getAvailableAgents(): Promise<Agent[]>;
  assignClient(agentId: number, clientId: number): Promise<boolean>;
}

export interface CompanyService {
  createCompany(companyData: Partial<Company>): Promise<Company>;
  updateCompany(id: number, updates: Partial<Company>): Promise<Company>;
  deleteCompany(id: number): Promise<boolean>;
  getCompany(id: number): Promise<Company | null>;
  searchCompanies(query: string): Promise<Company[]>;
}

export interface ProjectTemplateService {
  createTemplate(templateData: Partial<ProjectTemplate>): Promise<ProjectTemplate>;
  updateTemplate(id: number, updates: Partial<ProjectTemplate>): Promise<ProjectTemplate>;
  deleteTemplate(id: number): Promise<boolean>;
  getTemplate(id: number): Promise<ProjectTemplate | null>;
  getActiveTemplates(): Promise<ProjectTemplate[]>;
  getTemplatesByCategory(category: string): Promise<ProjectTemplate[]>;
}

export interface ValidationService {
  validateEmail(email: string): boolean;
  validatePassword(password: string): { valid: boolean; errors: string[] };
  validateUser(userData: Partial<User>): { valid: boolean; errors: string[] };
  validateProject(projectData: Partial<Project>): { valid: boolean; errors: string[] };
}

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: Date;
}

export interface NotificationService {
  sendNotification(userId: number, message: string, type: 'info' | 'success' | 'warning' | 'error'): Promise<boolean>;
  getNotifications(userId: number): Promise<AppNotification[]>;
  markAsRead(notificationId: number): Promise<boolean>;
}

export interface BackupService {
  createBackup(): Promise<string>;
  restoreBackup(backupPath: string): Promise<boolean>;
  listBackups(): Promise<string[]>;
  deleteBackup(backupPath: string): Promise<boolean>;
}

export interface LanguageService {
  getTranslation(key: string, language: string): string;
  getSupportedLanguages(): string[];
  setUserLanguage(userId: number, language: string): Promise<boolean>;
}

export interface PermissionService {
  hasPermission(userId: number, permission: string): Promise<boolean>;
  getUserPermissions(userId: number): Promise<string[]>;
  assignPermission(userId: number, permission: string): Promise<boolean>;
  revokePermission(userId: number, permission: string): Promise<boolean>;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SearchOptions extends PaginationOptions {
  query?: string;
  filters?: Record<string, any>;
}