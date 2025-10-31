// Types partagés pour les services serveur

export interface ServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  role?: string
  onboarding_completed?: boolean
  is_active?: boolean
  name?: string
  company_id?: number | null
  client_id?: number | null
  password?: string
}

export interface DatabaseQueryResult {
  insertId?: number
  affectedRows?: number
}

export type DatabaseConnection = any

export interface DatabaseService {
  initialize(): Promise<boolean>
  getConnection(): Promise<DatabaseConnection>
  query<T = any>(sql: string, params?: any[]): Promise<T[]>
  run(sql: string, params?: any[]): Promise<DatabaseQueryResult>
  get<T = any>(sql: string, params?: any[]): Promise<T | null>
  close(): Promise<void>

  authenticateUser(email: string, password: string): Promise<User | null>
  createUser(userData: Partial<User>): Promise<User>
  createSession(userId: number, sessionToken: string, expiresAt: string, ipAddress?: string, userAgent?: string): Promise<void>
  getUserCompanies(userId: number): Promise<Array<{ id: number; name?: string }>>
  logAudit(userId: number, companyId: number | null, action: string, entity: string, details?: any, ipAddress?: string): Promise<void>
}

export interface AuthService {
  login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ user: User; token: string }>
  register(userData: { email: string; password: string; firstName: string; lastName: string }, ipAddress?: string): Promise<User>
  verifyToken(token: string): any
}

export interface EmailService {
  sendEmail(emailData: any): Promise<boolean>
  sendWelcomeEmail(user: any): Promise<boolean>
  sendPasswordResetEmail(user: any, resetToken: string): Promise<boolean>
  sendProjectNotification(project: any, user: any): Promise<boolean>
}