import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient from '../lib/api'
import { User, LoginRequest, RegisterRequest } from '../types'

// Auth State Interface
interface AuthState {
  // State
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  loadUserProfile: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>(
  (persist as any)(
    (set: any, get: any) => ({
      // Initial State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null })

          const response = await apiClient.login(credentials)

          if (response.success && response.data) {
            const { token, refreshToken, user } = response.data

            // Store tokens in localStorage
            localStorage.setItem('auth_token', token)
            localStorage.setItem('refresh_token', refreshToken)

            set({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error(response.message || 'Login failed')
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Login failed',
          })
          throw error
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null })

          const response = await apiClient.register(userData)

          if (response.success && response.data) {
            const { token, refreshToken, user } = response.data

            // Store tokens in localStorage
            localStorage.setItem('auth_token', token)
            localStorage.setItem('refresh_token', refreshToken)

            set({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error(response.message || 'Registration failed')
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Registration failed',
          })
          throw error
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true })

          await apiClient.logout()
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error)
        } finally {
          // Clear all auth state
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')

          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      loadUserProfile: async () => {
        try {
          const token = localStorage.getItem('auth_token')
          if (!token) {
            set({ isAuthenticated: false })
            return
          }

          set({ isLoading: true })

          const response = await apiClient.getProfile()

          if (response.success && response.data) {
            set({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // Invalid token, logout
            get().logout()
          }
        } catch (error) {
          // Invalid token, logout
          get().logout()
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-store',
      partialize: (state: any) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize auth state on app start
export const initializeAuth = async () => {
  const { loadUserProfile } = useAuthStore.getState()
  await loadUserProfile()
}
