import { create } from 'zustand';
import { User, AuthResponse } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  loadUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string, rememberMe: boolean = false) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login({ email, password, rememberMe });
      
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.message || 'Login failed',
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Login failed. Please try again.',
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.message || 'Registration failed',
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Registration failed. Please try again.',
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  refreshToken: async () => {
    try {
      const response = await authService.refreshToken();
      
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          error: null,
        });
        return true;
      } else {
        // Token refresh failed, logout user
        await get().logout();
        return false;
      }
    } catch (error) {
      await get().logout();
      return false;
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    
    try {
      const user = await authService.getCurrentUser();
      const isAuthenticated = await authService.isAuthenticated();
      
      if (user && isAuthenticated) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to load user data',
      });
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...userData },
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));