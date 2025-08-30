import axios, { AxiosInstance, AxiosResponse, AxiosError, CancelToken } from 'axios';
import { config } from '@/constants/config';
import { storage } from '@/utils/storage';
import { ApiResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<any> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${config.API_URL}/api/${config.API_VERSION}`,
      timeout: config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (requestConfig) => {
        const token = await storage.getItem(config.TOKEN_KEY);
        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        return requestConfig;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshTokenIfNeeded();
            
            // Retry the original request with new token
            const token = await storage.getItem(config.TOKEN_KEY);
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear storage and redirect to login
            await this.clearAuthToken();
            // Emit auth error event for app-wide handling
            this.emitAuthError();
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the current refresh to complete
      await this.refreshPromise;
      return;
    }

    this.isRefreshing = true;
    
    try {
      const refreshToken = await storage.getItem(config.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      this.refreshPromise = this.client.post('/auth/refresh', {
        refreshToken,
      });

      const response = await this.refreshPromise;
      
      if (response.data?.success && response.data?.data) {
        const { token, refreshToken: newRefreshToken, user } = response.data.data;
        
        // Update stored tokens
        await storage.setItem(config.TOKEN_KEY, token);
        await storage.setItem(config.REFRESH_TOKEN_KEY, newRefreshToken);
        await storage.setItem(config.USER_KEY, JSON.stringify(user));
      } else {
        throw new Error('Token refresh failed');
      }
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private emitAuthError(): void {
    // Emit custom event for auth error - components can listen to this
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-error', { 
        detail: { message: 'Authentication failed' } 
      }));
    }
  }

  private handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return response.data;
  }

  private handleError(error: AxiosError): ApiResponse<any> {
    console.error('API Error:', error);
    
    // Handle network errors
    if (!error.response) {
      return {
        success: false,
        message: 'Network error - please check your connection',
        errors: ['Network error'],
      };
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'Request timeout - please try again',
        errors: ['Request timeout'],
      };
    }

    // Handle API error responses
    if (error.response?.data) {
      return error.response.data as ApiResponse<any>;
    }

    // Handle HTTP status codes
    const statusCode = error.response?.status || 500;
    const statusMessages: Record<number, string> = {
      400: 'Bad request - please check your input',
      401: 'Authentication required',
      403: 'Access denied',
      404: 'Resource not found',
      408: 'Request timeout',
      409: 'Conflict - resource already exists',
      422: 'Validation error',
      429: 'Too many requests - please wait',
      500: 'Server error - please try again later',
      502: 'Service temporarily unavailable',
      503: 'Service temporarily unavailable',
    };
    
    return {
      success: false,
      message: statusMessages[statusCode] || `HTTP ${statusCode} error`,
      errors: [statusMessages[statusCode] || `HTTP ${statusCode} error`],
    };
  }

  // Generic methods with cancellation token support
  async get<T>(url: string, params?: any, cancelToken?: CancelToken): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { 
        params,
        cancelToken,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (axios.isCancel(error)) {
        return {
          success: false,
          message: 'Request cancelled',
          errors: ['Request cancelled'],
        };
      }
      return this.handleError(error as AxiosError);
    }
  }

  async post<T>(url: string, data?: any, cancelToken?: CancelToken): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data, {
        cancelToken,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (axios.isCancel(error)) {
        return {
          success: false,
          message: 'Request cancelled',
          errors: ['Request cancelled'],
        };
      }
      return this.handleError(error as AxiosError);
    }
  }

  async put<T>(url: string, data?: any, cancelToken?: CancelToken): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data, {
        cancelToken,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (axios.isCancel(error)) {
        return {
          success: false,
          message: 'Request cancelled',
          errors: ['Request cancelled'],
        };
      }
      return this.handleError(error as AxiosError);
    }
  }

  async delete<T>(url: string, cancelToken?: CancelToken): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url, {
        cancelToken,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (axios.isCancel(error)) {
        return {
          success: false,
          message: 'Request cancelled',
          errors: ['Request cancelled'],
        };
      }
      return this.handleError(error as AxiosError);
    }
  }

  // Auth token management
  async setAuthToken(token: string): Promise<void> {
    await storage.setItem(config.TOKEN_KEY, token);
  }

  async clearAuthToken(): Promise<void> {
    await storage.removeItem(config.TOKEN_KEY);
    await storage.removeItem(config.REFRESH_TOKEN_KEY);
    await storage.removeItem(config.USER_KEY);
  }

  // Create cancel token for request cancellation
  createCancelToken(): { token: CancelToken; cancel: (message?: string) => void } {
    const cancelTokenSource = axios.CancelToken.source();
    return {
      token: cancelTokenSource.token,
      cancel: cancelTokenSource.cancel,
    };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Get current API URL
  getBaseUrl(): string {
    return this.client.defaults.baseURL || '';
  }
}

export const apiClient = new ApiClient();