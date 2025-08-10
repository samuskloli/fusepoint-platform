/**
 * Types pour la base de données
 */

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'client' | 'prestataire' | 'super_admin';
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  language?: string;
  created_at: Date;
  updated_at: Date;
  agent_id?: number;
  user_code?: string;
  is_active?: boolean;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  client_id: number;
  agent_id?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  created_at: Date;
  updated_at: Date;
  template_id?: number;
}

export interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Agent {
  id: number;
  user_id: number;
  specialization?: string;
  experience_years?: number;
  max_clients?: number;
  current_clients?: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: number;
  user_id: number;
  company_id?: number;
  agent_id?: number;
  subscription_type?: string;
  subscription_status?: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
}

export interface ProjectTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  tasks: string; // JSON string
  estimated_duration?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseQueryResult<T = any> {
  insertId?: number;
  affectedRows?: number;
  data?: T[];
}

export interface DatabaseConnection {
  execute(query: string, params?: any[]): Promise<[any[], any]>;
  end(): Promise<void>;
}