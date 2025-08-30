import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login({
        email,
        password,
        rememberMe: false,
      });

      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          error: response.message || 'Login failed',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: 'Login failed',
        isLoading: false,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Even if logout fails, clear local state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    
    try {
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        const user = await authService.getCurrentUser();
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to load user',
      });
    }
  },

  clearError: () => set({ error: null }),
}));