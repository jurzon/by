// ============================================================================
// BY Mobile App - Services Index
// Centralized exports for all API services
// ============================================================================

export { authService, AuthService } from './authService';
export { goalService, GoalService } from './goalService';
export { checkInService, CheckInService } from './checkInService';
export { userService, UserService } from './userService';
export { paymentService, PaymentService } from './paymentService';
export { apiClient } from './apiClient';

// Re-export commonly used types
export type {
  ApiResponse,
  PagedResponse,
  Goal,
  User,
  CheckInResponse,
  PaymentResponse,
} from '@/types';