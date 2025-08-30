// ============================================================================
// BY Application - TypeScript Type Definitions (React Native)
// Matching Backend DTOs exactly - Mobile Version
// ============================================================================

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
  meta?: ApiResponseMeta
}

export interface ApiResponseMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PagedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// ============================================================================
// Auth Types
// ============================================================================

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  fullName: string
  profileImageUrl?: string
  role: UserRole
  defaultReminderTime: string
  preferredCategories: GoalCategory[]
  defaultStakeAmount: number
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalStaked: number
  totalPaid: number
  createdAt: string
  lastLoginAt?: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
  expiresAt: string
}

// ============================================================================
// Goal Types
// ============================================================================

export interface Goal {
  id: string
  title: string
  description: string
  category: GoalCategory
  status: GoalStatus
  startDate: string
  endDate: string
  durationDays: number
  totalStakeAmount: number
  dailyStakeAmount: number
  reminderTime: string
  successfulDays: number
  failedDays: number
  missedDays: number
  currentStreak: number
  longestStreak: number
  totalPaid: number
  progressPercentage: number
  successRate: number
  isActive: boolean
  createdAt: string
}

export interface CreateGoalRequest {
  title: string
  description: string
  category: number  // Use number for enum values sent to API
  durationDays: number
  totalStakeAmount: number
  reminderTime: string  // Format: "HH:mm:ss"
  reminderMessage: string
  startDate?: string
}

// ============================================================================
// Enums
// ============================================================================

export enum UserRole {
  User = 'User',
  Admin = 'Admin',
  Moderator = 'Moderator'
}

export enum GoalCategory {
  Fitness = 0,
  Learning = 1,
  Habits = 2,
  Finance = 3,
  Career = 4,
  Health = 5,
  Personal = 6,
  Other = 7
}

export enum GoalStatus {
  Active = 'Active',
  Completed = 'Completed',
  Failed = 'Failed',
  Paused = 'Paused',
  Cancelled = 'Cancelled'
}

// ============================================================================
// Form Types
// ============================================================================

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

// ============================================================================
// Navigation Types
// ============================================================================

export type RootStackParamList = {
  Home: undefined
  Login: undefined
  Register: undefined
  Dashboard: undefined
  Goals: undefined
  Profile: undefined
}

export type TabParamList = {
  Dashboard: undefined
  Goals: undefined
  CheckIn: undefined
  Profile: undefined
}