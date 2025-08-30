import { apiClient } from './apiClient';
import { 
  User,
  UserResponse,
  UpdateProfileRequest,
  UserStatsResponse,
  CategoryStatsResponse,
  ApiResponse 
} from '@/types';

export class UserService {
  // Get current user profile
  async getCurrentUserProfile(): Promise<ApiResponse<UserResponse>> {
    return await apiClient.get<UserResponse>('/users/me');
  }

  // Update current user profile
  async updateCurrentUserProfile(request: UpdateProfileRequest): Promise<ApiResponse<UserResponse>> {
    return await apiClient.put<UserResponse>('/users/me', request);
  }

  // Get current user statistics
  async getCurrentUserStats(): Promise<ApiResponse<UserStatsResponse>> {
    return await apiClient.get<UserStatsResponse>('/users/me/stats');
  }

  // Get user's goal category preferences and statistics
  async getCategoryStats(): Promise<ApiResponse<CategoryStatsResponse>> {
    return await apiClient.get<CategoryStatsResponse>('/users/me/categories');
  }

  // Deactivate current user account (soft delete)
  async deactivateCurrentUser(): Promise<ApiResponse<boolean>> {
    return await apiClient.delete<boolean>('/users/me');
  }

  // Mobile-specific helper methods

  // Get user dashboard data (combines profile and stats)
  async getDashboardData(): Promise<{
    profile: UserResponse | null;
    stats: UserStatsResponse | null;
    categoryStats: CategoryStatsResponse | null;
  }> {
    try {
      const [profileResponse, statsResponse, categoryResponse] = await Promise.all([
        this.getCurrentUserProfile(),
        this.getCurrentUserStats(),
        this.getCategoryStats(),
      ]);

      return {
        profile: profileResponse.success ? profileResponse.data || null : null,
        stats: statsResponse.success ? statsResponse.data || null : null,
        categoryStats: categoryResponse.success ? categoryResponse.data || null : null,
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return {
        profile: null,
        stats: null,
        categoryStats: null,
      };
    }
  }

  // Update specific profile fields (mobile-friendly)
  async updateProfileField(field: string, value: any): Promise<ApiResponse<UserResponse>> {
    const updateRequest: UpdateProfileRequest = {
      [field]: value,
    };
    
    return await this.updateCurrentUserProfile(updateRequest);
  }

  // Update reminder preferences
  async updateReminderPreferences(
    defaultReminderTime: string,
    preferredCategories?: number[]
  ): Promise<ApiResponse<UserResponse>> {
    const request: UpdateProfileRequest = {
      defaultReminderTime,
      ...(preferredCategories && { preferredCategories }),
    };
    
    return await this.updateCurrentUserProfile(request);
  }

  // Update financial preferences
  async updateFinancialPreferences(defaultStakeAmount: number): Promise<ApiResponse<UserResponse>> {
    const request: UpdateProfileRequest = {
      defaultStakeAmount,
    };
    
    return await this.updateCurrentUserProfile(request);
  }

  // Get user's favorite category based on stats
  async getFavoriteCategory(): Promise<number | null> {
    try {
      const response = await this.getCurrentUserStats();
      
      if (response.success && response.data) {
        return response.data.favoriteCategory || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting favorite category:', error);
      return null;
    }
  }

  // Get user's success rate
  async getSuccessRate(): Promise<number> {
    try {
      const response = await this.getCurrentUserStats();
      
      if (response.success && response.data) {
        return response.data.overallSuccessRate || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting success rate:', error);
      return 0;
    }
  }

  // Check if user has any active goals
  async hasActiveGoals(): Promise<boolean> {
    try {
      const response = await this.getCurrentUserStats();
      
      if (response.success && response.data) {
        return response.data.activeGoals > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking active goals:', error);
      return false;
    }
  }

  // Get user's financial summary
  async getFinancialSummary(): Promise<{
    totalStaked: number;
    totalPaid: number;
    totalRefunded: number;
    netLoss: number;
  }> {
    try {
      const response = await this.getCurrentUserStats();
      
      if (response.success && response.data) {
        const { totalStaked, totalPaid, totalRefunded } = response.data;
        const netLoss = totalPaid - (totalRefunded || 0);
        
        return {
          totalStaked,
          totalPaid,
          totalRefunded: totalRefunded || 0,
          netLoss,
        };
      }
      
      return {
        totalStaked: 0,
        totalPaid: 0,
        totalRefunded: 0,
        netLoss: 0,
      };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      return {
        totalStaked: 0,
        totalPaid: 0,
        totalRefunded: 0,
        netLoss: 0,
      };
    }
  }
}

export const userService = new UserService();