/**
 * Types pour les routes Express
 */

import { Request, Response, NextFunction } from 'express';
import { User, Project, Company, Agent, Client } from './database';

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: number;
  userRole?: string;
  body: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  role?: 'client' | 'agent';
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  client_id: number;
  template_id?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress?: number;
}

export interface CreateCompanyRequest {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
}

export interface AssignAgentRequest {
  client_id: number;
  agent_id: number;
}

export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export interface RouteHandler {
  (req: AuthenticatedRequest, res: Response, next?: NextFunction): Promise<void> | void;
}

export interface Middleware {
  (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> | void;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: ValidationError[];
  code?: string;
}