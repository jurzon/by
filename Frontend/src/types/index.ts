// ============================================================================
// BY Application - TypeScript Type Definitions
// Matching Backend DTOs exactly
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
// Goal Types - FIXED to match backend exactly
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

// FIXED: This must match the backend CreateGoalRequest exactly
export interface CreateGoalRequest {
  title: string
  description: string
  category: number  // FIXED: Use number for enum values sent to API
  durationDays: number
  totalStakeAmount: number
  reminderTime: string  // Format: "HH:mm:ss"
  reminderMessage: string
  startDate?: string
}

// ============================================================================
// Check-in Types (3-Button System) - FIXED to match backend DTOs exactly
// ============================================================================

export interface CheckIn {
  id: string
  goalId: string
  date: string
  completed: boolean
  notes?: string
  checkInTime: string
  paymentProcessed: boolean
  amountCharged?: number
  streakCount: number
  createdAt: string
  updatedAt: string
  goalTitle?: string
  goalCategory?: GoalCategory
}

export interface CheckInResponse {
  id: string
  goalId: string
  date: string
  completed: boolean
  notes?: string
  checkInTime: string
  paymentProcessed: boolean
  amountCharged?: number
  streakCount: number
  message?: string
}

// FIXED: Must match ThreeButtonCheckInRequest exactly
export interface ThreeButtonCheckInRequest {
  goalId: string  // Maps to Guid GoalId in backend
  result: CheckInResult  // Maps to CheckInResult Result in backend  
  notes?: string  // Maps to string? Notes in backend
  date?: string   // Maps to DateOnly? Date in backend (optional)
}

export interface CheckInStatsResponse {
  goalId: string
  goalTitle: string
  totalCheckIns: number
  completedCheckIns: number
  failedCheckIns: number
  completionRate: number
  currentStreak: number
  longestStreak: number
  totalAmountCharged: number
  lastCheckIn?: CheckInResponse
  todayCheckIn?: CheckInResponse
}

export interface UpdateCheckInRequest {
  result?: CheckInResult
  notes?: string
}

export interface GetCheckInsRequest extends PagedRequest {
  goalId?: string
  fromDate?: string
  toDate?: string
  completed?: boolean
  paymentProcessed?: boolean
}

// ============================================================================
// Payment Types
// ============================================================================

export interface Payment {
  id: string
  goalId?: string
  goalTitle?: string
  amount: number
  type: PaymentType
  status: PaymentStatus
  createdAt: string
  processedAt?: string
  notes?: string
  charityName?: string
}

// ============================================================================
// Enums (matching backend exactly)
// ============================================================================

export enum UserRole {
  User = 'User',
  Admin = 'Admin',
  Moderator = 'Moderator'
}

export enum GoalCategory {
  Fitness = 0,     // Backend: Fitness (first enum value)
  Learning = 1,    // Backend: Learning (second enum value)  
  Habits = 2,      // Backend: Habits (third enum value)
  Finance = 3,     // Backend: Finance (fourth enum value)
  Career = 4,      // Backend: Career (fifth enum value)
  Health = 5,      // Backend: Health (sixth enum value)
  Personal = 6,    // Backend: Personal (seventh enum value)
  Other = 7        // Backend: Other (eighth enum value)
}

export enum GoalStatus {
  Active = 'Active',
  Completed = 'Completed',
  Failed = 'Failed',
  Paused = 'Paused',
  Cancelled = 'Cancelled'
}

// FIXED: Must match backend CheckInResult enum exactly  
export enum CheckInResult {
  Yes = 1,         // Backend: Yes = 1 (User completed their goal today)
  No = 2,          // Backend: No = 2 (User failed, triggers payment)
  RemindLater = 3  // Backend: RemindLater = 3 (Remind later, no action)
}

export enum PaymentType {
  StakeDeposit = 'StakeDeposit',
  FailurePenalty = 'FailurePenalty',
  Refund = 'Refund',
  ProcessingFee = 'ProcessingFee'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Authorized = 'Authorized',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded',
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

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  username: string
  firstName: string
  lastName: string
  acceptTerms: boolean
}

export interface CreateGoalFormData {
  title: string
  description: string
  category: number  // Use numeric enum for forms
  durationDays: number
  totalStakeAmount: number
  reminderTime: string
  reminderMessage: string
}

// ============================================================================
// UI State Types
// ============================================================================

export interface AppState {
  isLoading: boolean
  error: string | null
}

export interface DashboardStats {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalStaked: number
  totalPaid: number
  currentStreak: number
  successRate: number
}

// ============================================================================
// API Client Types
// ============================================================================

export interface PagedRequest {
  page?: number
  limit?: number
}

export interface PaginatedRequest {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

// 3-Button Check-In Component Props
export interface CheckInButtonProps {
  goalId: string
  onCheckIn: (result: CheckInResult, notes?: string) => Promise<void>
  disabled?: boolean
  todayCheckIn?: CheckInResponse
  loading?: boolean
}