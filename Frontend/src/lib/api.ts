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
  CheckInResult
} from '../types'

// API Client Configuration - Matching your backend exactly
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5186'

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
      return config
    })

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
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

  // Goals API - Matching your GoalsController
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

  // Check-ins API (3-Button System) - Matching your CheckInsController exactly
  async createCheckIn(checkInData: ThreeButtonCheckInRequest): Promise<ApiResponse<CheckInResponse>> {
    const response: AxiosResponse<ApiResponse<CheckInResponse>> = await this.client.post('/checkins', checkInData)
    return response.data
  }

  async threeButtonCheckIn(data: ThreeButtonCheckInRequest): Promise<ApiResponse<CheckInResponse>> {
    const response: AxiosResponse<ApiResponse<CheckInResponse>> = await this.client.post('/checkins/three-button', data)
    return response.data
  }

  async getTodayCheckIn(goalId: string): Promise<ApiResponse<CheckInResponse | null>> {
    const response: AxiosResponse<ApiResponse<CheckInResponse | null>> = 
      await this.client.get(`/checkins/today/${goalId}`)
    return response.data
  }

  async getCheckInStats(goalId: string): Promise<ApiResponse<CheckInStatsResponse>> {
    const response: AxiosResponse<ApiResponse<CheckInStatsResponse>> = 
      await this.client.get(`/checkins/stats/${goalId}`)
    return response.data
  }

  // Quick Check-in for 3-button system
  async quickCheckIn(goalId: string, result: CheckInResult, notes?: string): Promise<ApiResponse<CheckInResponse>> {
    const response: AxiosResponse<ApiResponse<CheckInResponse>> = 
      await this.client.post(`/checkins/quick/${goalId}/${result}`, { notes })
    return response.data
  }

  // Remind Later endpoint
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

// Export individual methods for convenience
export const {
  login,
  register,
  logout,
  getProfile,
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  createCheckIn,
  threeButtonCheckIn,
  getTodayCheckIn,
  getCheckInStats,
  quickCheckIn,
  remindLater,
  getPaymentHistory,
  healthCheck
} = apiClient
