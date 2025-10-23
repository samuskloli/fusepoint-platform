import { Ref } from 'vue'

export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UseAuthReturn {
  user: Ref<User | null>;
  isAuthenticated: Ref<boolean>;
  isLoading: Ref<boolean>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export declare function useAuth(): UseAuthReturn;