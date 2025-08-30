import { apiClient } from './apiClient';
import { 
  Goal, 
  CreateGoalRequest, 
  UpdateGoalRequest,
  CheckInRequest,
  CheckInResponse,
  GoalStatus,
  GoalCategory,
  ApiResponse 
} from '@/types';

export class GoalService {
  // Create a new goal
  async createGoal(request: CreateGoalRequest): Promise<ApiResponse<Goal>> {
    return await apiClient.post<Goal>('/goals', request);
  }

  // Get all goals for the current user
  async getUserGoals(status?: GoalStatus, category?: GoalCategory): Promise<ApiResponse<Goal[]>> {
    const params: any = {};
    if (status) params.status = status;
    if (category !== undefined) params.category = category;
    
    return await apiClient.get<Goal[]>('/goals', params);
  }

  // Get active goals for the current user
  async getActiveGoals(): Promise<ApiResponse<Goal[]>> {
    return await apiClient.get<Goal[]>('/goals/active');
  }

  // Get a specific goal by ID
  async getGoal(goalId: string): Promise<ApiResponse<Goal>> {
    return await apiClient.get<Goal>(`/goals/${goalId}`);
  }

  // Update a goal
  async updateGoal(goalId: string, request: UpdateGoalRequest): Promise<ApiResponse<Goal>> {
    return await apiClient.put<Goal>(`/goals/${goalId}`, request);
  }

  // Delete a goal
  async deleteGoal(goalId: string): Promise<ApiResponse<boolean>> {
    return await apiClient.delete<boolean>(`/goals/${goalId}`);
  }

  // Pause an active goal
  async pauseGoal(goalId: string): Promise<ApiResponse<Goal>> {
    return await apiClient.post<Goal>(`/goals/${goalId}/pause`);
  }

  // Resume a paused goal
  async resumeGoal(goalId: string): Promise<ApiResponse<Goal>> {
    return await apiClient.post<Goal>(`/goals/${goalId}/resume`);
  }

  // Check in for a goal (legacy method - prefer using CheckInService)
  async checkIn(goalId: string, request: CheckInRequest): Promise<ApiResponse<CheckInResponse>> {
    return await apiClient.post<CheckInResponse>(`/goals/${goalId}/checkin`, request);
  }

  // Get check-in history for a goal (legacy method - prefer using CheckInService)
  async getGoalCheckIns(
    goalId: string, 
    page: number = 1, 
    limit: number = 30
  ): Promise<ApiResponse<CheckInResponse[]>> {
    return await apiClient.get<CheckInResponse[]>(`/goals/${goalId}/checkins`, {
      page,
      limit,
    });
  }

  // Mobile-specific helper methods

  // Get goals by status with mobile-friendly filtering
  async getGoalsByStatus(status: GoalStatus): Promise<Goal[]> {
    try {
      const response = await this.getUserGoals(status);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error(`Error getting ${status} goals:`, error);
      return [];
    }
  }

  // Get goals by category
  async getGoalsByCategory(category: GoalCategory): Promise<Goal[]> {
    try {
      const response = await this.getUserGoals(undefined, category);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error(`Error getting goals for category ${category}:`, error);
      return [];
    }
  }

  // Get goals requiring check-in today
  async getGoalsRequiringCheckIn(): Promise<Goal[]> {
    try {
      const activeGoals = await this.getGoalsByStatus(GoalStatus.Active);
      
      // In a real app, you'd check if they've already checked in today
      // For now, return all active goals
      return activeGoals;
    } catch (error) {
      console.error('Error getting goals requiring check-in:', error);
      return [];
    }
  }

  // Get goal statistics for dashboard
  async getGoalStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    failed: number;
    paused: number;
  }> {
    try {
      const response = await this.getUserGoals();
      
      if (response.success && response.data) {
        const goals = response.data;
        
        return {
          total: goals.length,
          active: goals.filter(g => g.status === GoalStatus.Active).length,
          completed: goals.filter(g => g.status === GoalStatus.Completed).length,
          failed: goals.filter(g => g.status === GoalStatus.Failed).length,
          paused: goals.filter(g => g.status === GoalStatus.Paused).length,
        };
      }
      
      return { total: 0, active: 0, completed: 0, failed: 0, paused: 0 };
    } catch (error) {
      console.error('Error getting goal stats:', error);
      return { total: 0, active: 0, completed: 0, failed: 0, paused: 0 };
    }
  }

  // Quick create goal with validation
  async quickCreateGoal(
    title: string,
    category: GoalCategory,
    durationDays: number,
    totalStakeAmount: number
  ): Promise<ApiResponse<Goal>> {
    // Basic client-side validation
    if (!title.trim()) {
      return {
        success: false,
        message: 'Title is required',
        errors: ['Title cannot be empty'],
      };
    }

    if (durationDays < 1 || durationDays > 365) {
      return {
        success: false,
        message: 'Duration must be between 1 and 365 days',
        errors: ['Invalid duration'],
      };
    }

    if (totalStakeAmount < 0.01 || totalStakeAmount > 10000) {
      return {
        success: false,
        message: 'Stake amount must be between $0.01 and $10,000',
        errors: ['Invalid stake amount'],
      };
    }

    const request: CreateGoalRequest = {
      title: title.trim(),
      description: `${title} - Created on mobile`,
      category,
      durationDays,
      totalStakeAmount,
      reminderTime: '09:00:00', // Default reminder time
      reminderMessage: `Time to work on: ${title}`,
    };

    return await this.createGoal(request);
  }

  // Get user's most successful category
  async getMostSuccessfulCategory(): Promise<GoalCategory | null> {
    try {
      const goals = await this.getGoalsByStatus(GoalStatus.Completed);
      
      if (goals.length === 0) return null;
      
      // Count goals by category
      const categoryCount = goals.reduce((acc, goal) => {
        acc[goal.category] = (acc[goal.category] || 0) + 1;
        return acc;
      }, {} as Record<GoalCategory, number>);
      
      // Find category with most completed goals
      const mostSuccessful = Object.entries(categoryCount)
        .reduce((max, [category, count]) => 
          count > max.count ? { category: Number(category) as GoalCategory, count } : max,
          { category: GoalCategory.Other, count: 0 }
        );
      
      return mostSuccessful.category;
    } catch (error) {
      console.error('Error getting most successful category:', error);
      return null;
    }
  }

  // Calculate overall success rate
  async getOverallSuccessRate(): Promise<number> {
    try {
      const response = await this.getUserGoals();
      
      if (response.success && response.data) {
        const goals = response.data;
        const completedGoals = goals.filter(g => 
          g.status === GoalStatus.Completed || g.status === GoalStatus.Failed
        );
        
        if (completedGoals.length === 0) return 0;
        
        const successfulGoals = goals.filter(g => g.status === GoalStatus.Completed).length;
        return Math.round((successfulGoals / completedGoals.length) * 100);
      }
      
      return 0;
    } catch (error) {
      console.error('Error calculating success rate:', error);
      return 0;
    }
  }

  // Get current streak across all active goals
  async getCurrentStreak(): Promise<number> {
    try {
      const activeGoals = await this.getGoalsByStatus(GoalStatus.Active);
      
      if (activeGoals.length === 0) return 0;
      
      // Return the highest current streak among active goals
      return Math.max(...activeGoals.map(g => g.currentStreak));
    } catch (error) {
      console.error('Error getting current streak:', error);
      return 0;
    }
  }

  // Simple check-in for mobile (Yes/No only)
  async simpleCheckIn(goalId: string, completed: boolean, notes?: string): Promise<ApiResponse<CheckInResponse>> {
    const request: CheckInRequest = {
      completed,
      notes,
    };
    
    return await this.checkIn(goalId, request);
  }
}

export const goalService = new GoalService();