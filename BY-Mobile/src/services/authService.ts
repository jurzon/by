import { apiClient } from './apiClient';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  ApiResponse 
} from '../types';
import { storage } from '../utils/storage';
import { config } from '../constants/config';

export class AuthService {
  // Login
  async login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', request);
    
    if (response.success && response.data) {
      // Store auth data
      await storage.setItem(config.TOKEN_KEY, response.data.token);
      await storage.setItem(config.REFRESH_TOKEN_KEY, response.data.refreshToken);
      await storage.setItem(config.USER_KEY, JSON.stringify(response.data.user));
      
      // Set token in API client
      await apiClient.setAuthToken(response.data.token);
    }
    
    return response;
  }

  // Register
  async register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/register', request);
    
    if (response.success && response.data) {
      // Store auth data
      await storage.setItem(config.TOKEN_KEY, response.data.token);
      await storage.setItem(config.REFRESH_TOKEN_KEY, response.data.refreshToken);
      await storage.setItem(config.USER_KEY, JSON.stringify(response.data.user));
      
      // Set token in API client
      await apiClient.setAuthToken(response.data.token);
    }
    
    return response;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    // Clear local storage
    await storage.clear();
    await apiClient.clearAuthToken();
  }

  // Get current user from local storage
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await storage.getItem(config.USER_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await storage.getItem(config.TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
}

export const authService = new AuthService();