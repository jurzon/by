import { apiClient } from './apiClient';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  ChangePasswordRequest,
  CurrentUserResponse,
  ApiResponse 
} from '@/types';
import { storage } from '@/utils/storage';
import { config } from '@/constants/config';

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
  async logout(): Promise<ApiResponse<boolean>> {
    try {
      // Call logout endpoint - now properly typed
      const response = await apiClient.post<boolean>('/auth/logout');
      
      // Clear local storage regardless of API response
      await this.clearLocalAuth();
      
      return response;
    } catch (error) {
      // Clear local storage even if API call fails
      await this.clearLocalAuth();
      console.error('Logout API call failed:', error);
      
      return {
        success: true, // Consider logout successful if local data cleared
        message: 'Logged out locally',
        data: true
      };
    }
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = await storage.getItem(config.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      return {
        success: false,
        message: 'No refresh token available',
        errors: ['No refresh token available'],
      };
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    
    if (response.success && response.data) {
      // Update stored tokens
      await storage.setItem(config.TOKEN_KEY, response.data.token);
      await storage.setItem(config.REFRESH_TOKEN_KEY, response.data.refreshToken);
      await storage.setItem(config.USER_KEY, JSON.stringify(response.data.user));
      
      // Set new token in API client
      await apiClient.setAuthToken(response.data.token);
    }
    
    return response;
  }

  // Get current user info from API
  async getCurrentUserInfo(): Promise<ApiResponse<CurrentUserResponse>> {
    return await apiClient.get<CurrentUserResponse>('/auth/me');
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

  // Change password
  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<boolean>> {
    return await apiClient.post<boolean>('/auth/change-password', {
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
      confirmPassword: request.confirmPassword, // Include confirm password for validation
    });
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<boolean>> {
    return await apiClient.post<boolean>('/auth/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<boolean>> {
    return await apiClient.post<boolean>('/auth/reset-password', {
      token,
      newPassword,
      confirmPassword,
    });
  }

  // Private helper methods
  private async clearLocalAuth(): Promise<void> {
    await storage.clear();
    await apiClient.clearAuthToken();
  }

  // Update stored user data
  async updateStoredUser(user: User): Promise<void> {
    await storage.setItem(config.USER_KEY, JSON.stringify(user));
  }

  // Check token expiry and refresh if needed
  async ensureValidToken(): Promise<boolean> {
    try {
      const token = await storage.getItem(config.TOKEN_KEY);
      if (!token) return false;

      // Try to get current user info to validate token
      const response = await this.getCurrentUserInfo();
      
      if (response.success) {
        return true;
      }
      
      // If token is invalid, try to refresh
      const refreshResponse = await this.refreshToken();
      return refreshResponse.success;
    } catch (error) {
      console.error('Error ensuring valid token:', error);
      return false;
    }
  }
}

export const authService = new AuthService();