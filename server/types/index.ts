/**
 * Export centralisé de tous les types backend
 */

// Types de base de données
export * from './database';

// Types pour les routes
export * from './routes';

// Types pour les services
export * from './services';

// Types utilitaires
export interface Config {
  port: number;
  database: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: string;
  JWT_SECRET: string;
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
}

export interface ProjectTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  estimatedDuration?: number;
  estimatedBudget?: number;
  tasks?: TemplateTask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateTask {
  id: number;
  templateId: number;
  name: string;
  description?: string;
  estimatedHours?: number;
  order: number;
  dependencies?: number[];
}

export interface Task {
  id: number;
  projectId: number;
  assignedTo?: number;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface JWTPayload {
  id?: number;
  userId?: number;
  email: string;
  role: string;
  company_id?: number;
  iat?: number;
  exp?: number;
}

// Types pour les requêtes Express
export interface AuthenticatedRequest extends Express.Request {
  user?: JWTPayload;
  userId?: number;
  userRole?: string;
  body: any;
}

// Types pour les statistiques
export interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export interface AgentStats {
  totalClients: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

// Types pour les notifications
export interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Types pour l'email
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Types pour les fichiers
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Types pour les validations
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}