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

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface CurrentUserResponse {
  userId: string
  email: string
  role: string
  claims: ClaimInfo[]
}

export interface ClaimInfo {
  type: string
  value: string
}

// ============================================================================
// User Management Types
// ============================================================================

export interface UserResponse {
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

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  profileImageUrl?: string
  defaultReminderTime?: string
  preferredCategories?: number[]
  defaultStakeAmount?: number
}

export interface UserStatsResponse {
  userId: string
  totalGoals: number
  activeGoals: number
  completedGoals: number
  failedGoals: number
  overallSuccessRate: number
  totalStaked: number
  totalPaid: number
  totalRefunded: number
  currentLongestStreak: number
  allTimeLongestStreak: number
  favoriteCategory: GoalCategory
  monthlyStats: MonthlyStatsResponse[]
}

export interface MonthlyStatsResponse {
  month: string
  totalGoals: number
  completedGoals: number
  successRate: number
  totalStaked: number
  totalPaid: number
}

export interface CategoryStatsResponse {
  categoryStats: CategoryStat[]
  mostSuccessfulCategory?: GoalCategory
  mostActiveCategory?: GoalCategory
}

export interface CategoryStat {
  category: GoalCategory
  totalGoals: number
  completedGoals: number
  activeGoals: number
  successRate: number
  totalStaked: number
  totalPaid: number
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

export interface UpdateGoalRequest {
  title?: string
  description?: string
  reminderTime?: string
  reminderMessage?: string
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

export interface CheckInRequest {
  completed: boolean
  notes?: string
}

export interface ThreeButtonCheckInRequest {
  goalId: string
  result: CheckInResult
  notes?: string
  date?: string
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

export interface PaymentResponse {
  id: string
  goalId?: string
  goalTitle?: string
  amount: number
  type: PaymentType
  status: PaymentStatus
  createdAt: string
  processedAt?: string
  stripePaymentIntentId?: string
  stripeChargeId?: string
  failureReason?: string
  disputeReason?: string
  notes?: string
  charityName?: string
}

export interface PaymentSummaryResponse {
  totalPayments: number
  totalAmount: number
  totalStakeDeposits: number
  totalFailurePenalties: number
  totalRefunds: number
  totalProcessingFees: number
  pendingPayments: number
  failedPayments: number
  averageStakeAmount: number
  monthlyBreakdown: MonthlyPaymentSummary[]
}

export interface MonthlyPaymentSummary {
  month: string
  totalAmount: number
  paymentCount: number
  averageAmount: number
}

export interface ProcessStakePaymentRequest {
  goalId: string
  amount: number
  notes?: string
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
  Cancelled = 'Cancelled',
  Disputed = 'Disputed'
}

export enum CheckInResult {
  Yes = 1,          // User completed their goal today
  No = 2,           // User failed to complete their goal today (triggers payment)
  RemindLater = 3   // User wants to be reminded later (no action)
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
// Navigation Types (React Navigation)
// ============================================================================

export type RootStackParamList = {
  Home: undefined
  Login: undefined
  Register: undefined
  Dashboard: undefined
  Goals: undefined
  CreateGoal: undefined
  GoalDetails: { goalId: string }
  Profile: undefined
  Settings: undefined
  CheckIn: { goalId?: string }
  PaymentHistory: undefined
  Statistics: undefined
}

export type TabParamList = {
  Dashboard: undefined
  Goals: undefined
  CheckIn: undefined
  Profile: undefined
  Payments: undefined
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface BaseComponentProps {
  style?: any
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  title: string
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onPress?: () => void
}

// 3-Button Check-In Component Props
export interface CheckInButtonProps {
  goalId: string
  onCheckIn: (completed: boolean, notes?: string) => Promise<void>
  disabled?: boolean
  todayCheckIn?: CheckInResponse
  loading?: boolean
}

// Mobile-specific Types
export interface NotificationData {
  goalId: string
  title: string
  body: string
  data?: any
}

export interface DeviceInfo {
  deviceId: string
  platform: 'ios' | 'android' | 'web'
  appVersion: string
  osVersion: string
}

// Service Index - for easy imports
export * from '../services/authService';
export * from '../services/goalService';
export * from '../services/checkInService';
export * from '../services/userService';
export * from '../services/paymentService';