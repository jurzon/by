import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { config } from '../constants/config';
import { storage } from '../utils/storage';
import { ApiResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;

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

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage and redirect to login
          await storage.clear();
        }
        return Promise.reject(error);
      }
    );
  }

  private handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return response.data;
  }

  private handleError(error: AxiosError): ApiResponse<any> {
    console.error('API Error:', error);
    
    if (error.response?.data) {
      return error.response.data as ApiResponse<any>;
    }
    
    return {
      success: false,
      message: error.message || 'Network error occurred',
      errors: [error.message || 'Network error occurred'],
    };
  }

  // Generic methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return this.handleResponse<T>(response);
    } catch (error) {
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
}

export const apiClient = new ApiClient();