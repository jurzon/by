import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  ApiResponse, 
  User,
  Goal,
  CheckInResponse,
  Payment,
  LoginRequest, 
  RegisterRequest,
  CreateGoalRequest,
  ThreeButtonCheckInRequest,
  CheckInStatsResponse,
  PaginatedResponse,
  CheckInResult,
  GetCheckInsRequest,
  UpdateCheckInRequest
} from '../types'

// API Client Configuration - Matching your backend exactly
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5186'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // Debug log outgoing requests
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers
      });
      
      return config
    })

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => {
        // Debug log successful responses
        console.log('API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response
      },
      (error) => {
        // Enhanced debug log error responses with full details
        console.error('API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data,
          message: error.message,
          fullError: error
        });
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth API - Matching your AuthController
  async login(credentials: LoginRequest): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/auth/login', credentials)
    return response.data
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/auth/register', userData)
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.client.get('/users/profile')
    return response.data
  }

  // Goals API - Matching GoalsController routes exactly
  async getGoals(): Promise<ApiResponse<Goal[]>> {
    const response: AxiosResponse<ApiResponse<Goal[]>> = await this.client.get('/goals')
    return response.data
  }

  async getGoal(goalId: string): Promise<ApiResponse<Goal>> {
    const response: AxiosResponse<ApiResponse<Goal>> = await this.client.get(`/goals/${goalId}`)
    return response.data
  }

  async createGoal(goalData: CreateGoalRequest): Promise<ApiResponse<Goal>> {
    const response: AxiosResponse<ApiResponse<Goal>> = await this.client.post('/goals', goalData)
    return response.data
  }

  async updateGoal(goalId: string, goalData: Partial<CreateGoalRequest>): Promise<ApiResponse<Goal>> {
    const response: AxiosResponse<ApiResponse<Goal>> = await this.client.put(`/goals/${goalId}`, goalData)
    return response.data
  }

  async deleteGoal(goalId: string): Promise<ApiResponse<boolean>> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.client.delete(`/goals/${goalId}`)
    return response.data
  }

  // FIXED: Check-ins API using CheckInsController (3-button system)
  async createCheckIn(checkInData: ThreeButtonCheckInRequest): Promise<ApiResponse<CheckInResponse>> {
    console.log('Creating check-in with data:', checkInData); // Debug log
    const response: AxiosResponse<ApiResponse<CheckInResponse>> = await this.client.post('/checkins', checkInData)
    return response.data
  }

  async threeButtonCheckIn(data: ThreeButtonCheckInRequest): Promise<ApiResponse<CheckInResponse>> {
    console.log('Three-button check-in with data:', data); // Debug log
    
    // ENSURE we're sending the right data structure
    const requestData = {
      goalId: data.goalId,
      result: Number(data.result), // Ensure it's a number
      notes: data.notes || null,    // Send null instead of undefined
      date: data.date || null       // Send null instead of undefined
    };
    
    console.log('Final request data being sent:', requestData);
    
    const response: AxiosResponse<ApiResponse<CheckInResponse>> = await this.client.post('/checkins', requestData)
    return response.data
  }

  // FIXED: Handle 404s gracefully for getTodayCheckIn
  async getTodayCheckIn(goalId: string): Promise<ApiResponse<CheckInResponse | null>> {
    try {
      const response: AxiosResponse<ApiResponse<CheckInResponse | null>> = 
        await this.client.get(`/checkins/today/${goalId}`)
      return response.data
    } catch (error: any) {
      // Handle 400/404 errors gracefully - means no check-in exists for today
      if (error.response?.status === 400 || error.response?.status === 404) {
        console.log(`No check-in found for today for goal ${goalId}`);
        return { success: true, data: null }
      }
      throw error
    }
  }

  async getCheckInStats(goalId: string): Promise<ApiResponse<CheckInStatsResponse>> {
    const response: AxiosResponse<ApiResponse<CheckInStatsResponse>> = 
      await this.client.get(`/checkins/stats/${goalId}`)
    return response.data
  }

  // Quick Check-in for 3-button system using CheckInsController
  async quickCheckIn(goalId: string, result: CheckInResult, notes?: string): Promise<ApiResponse<CheckInResponse>> {
    const requestBody = notes ? { notes } : null;
    console.log('Quick check-in:', { goalId, result, notes, requestBody }); // Debug log
    const response: AxiosResponse<ApiResponse<CheckInResponse>> = 
      await this.client.post(`/checkins/quick/${goalId}/${result}`, requestBody)
    return response.data
  }

  // Remind Later using CheckInsController
  async remindLater(goalId: string): Promise<ApiResponse<boolean>> {
    const response: AxiosResponse<ApiResponse<boolean>> = 
      await this.client.post(`/checkins/remind-later/${goalId}`)
    return response.data
  }

  // Payments API - Matching your PaymentsController
  async getPaymentHistory(params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response: AxiosResponse<ApiResponse<PaginatedResponse<Payment>>> = 
      await this.client.get(`/payments/history?${queryParams.toString()}`)
    return response.data
  }

  // Health Check - Matching your HealthController
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health', {
      baseURL: API_BASE_URL,
    })
    return response.data
  }
}

// Create singleton instance
const apiClient = new ApiClient()
export default apiClient

// Export individual methods safely
export const login = (credentials: LoginRequest) => apiClient.login(credentials)
export const register = (userData: RegisterRequest) => apiClient.register(userData)
export const logout = () => apiClient.logout()
export const getProfile = () => apiClient.getProfile()
export const getGoals = () => apiClient.getGoals()
export const getGoal = (goalId: string) => apiClient.getGoal(goalId)
export const createGoal = (goalData: CreateGoalRequest) => apiClient.createGoal(goalData)
export const updateGoal = (goalId: string, goalData: Partial<CreateGoalRequest>) => apiClient.updateGoal(goalId, goalData)
export const deleteGoal = (goalId: string) => apiClient.deleteGoal(goalId)
export const createCheckIn = (checkInData: ThreeButtonCheckInRequest) => apiClient.createCheckIn(checkInData)
export const threeButtonCheckIn = (data: ThreeButtonCheckInRequest) => apiClient.threeButtonCheckIn(data)
export const getTodayCheckIn = (goalId: string) => apiClient.getTodayCheckIn(goalId)
export const getCheckInStats = (goalId: string) => apiClient.getCheckInStats(goalId)
export const quickCheckIn = (goalId: string, result: CheckInResult, notes?: string) => apiClient.quickCheckIn(goalId, result, notes)
export const remindLater = (goalId: string) => apiClient.remindLater(goalId)
export const getPaymentHistory = (params?: { page?: number; limit?: number }) => apiClient.getPaymentHistory(params)
export const healthCheck = () => apiClient.healthCheck()
