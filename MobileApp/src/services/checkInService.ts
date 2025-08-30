import { apiClient } from './apiClient';
import { 
  CheckInRequest,
  CheckInResponse,
  CheckInStatsResponse,
  ThreeButtonCheckInRequest,
  UpdateCheckInRequest,
  GetCheckInsRequest,
  PagedResponse,
  ApiResponse 
} from '@/types';

export class CheckInService {
  // Create a new check-in using the 3-button system (Yes/No/Remind Later)
  async createCheckIn(request: ThreeButtonCheckInRequest): Promise<ApiResponse<CheckInResponse>> {
    return await apiClient.post<CheckInResponse>('/checkins', request);
  }

  // Get today's check-in for a specific goal
  async getTodayCheckIn(goalId: string): Promise<ApiResponse<CheckInResponse>> {
    return await apiClient.get<CheckInResponse>(`/checkins/today/${goalId}`);
  }

  // Get check-ins with optional filtering and pagination
  async getCheckIns(request?: GetCheckInsRequest): Promise<ApiResponse<PagedResponse<CheckInResponse>>> {
    const params: any = {};
    
    if (request) {
      if (request.goalId) params.goalId = request.goalId;
      if (request.fromDate) params.fromDate = request.fromDate;
      if (request.toDate) params.toDate = request.toDate;
      if (request.completed !== undefined) params.completed = request.completed;
      if (request.paymentProcessed !== undefined) params.paymentProcessed = request.paymentProcessed;
      if (request.page) params.page = request.page;
      if (request.limit) params.limit = request.limit;
    }
    
    return await apiClient.get<PagedResponse<CheckInResponse>>('/checkins', params);
  }

  // Get check-in statistics and progress for a specific goal
  async getCheckInStats(goalId: string): Promise<ApiResponse<CheckInStatsResponse>> {
    return await apiClient.get<CheckInStatsResponse>(`/checkins/stats/${goalId}`);
  }

  // Update an existing check-in
  async updateCheckIn(checkInId: string, request: UpdateCheckInRequest): Promise<ApiResponse<CheckInResponse>> {
    return await apiClient.put<CheckInResponse>(`/checkins/${checkInId}`, request);
  }

  // Delete a check-in
  async deleteCheckIn(checkInId: string): Promise<ApiResponse<boolean>> {
    return await apiClient.delete<boolean>(`/checkins/${checkInId}`);
  }

  // Process "Remind Later" request for a goal (schedules a reminder)
  async remindLater(goalId: string): Promise<ApiResponse<boolean>> {
    return await apiClient.post<boolean>(`/checkins/remind-later/${goalId}`);
  }

  // Quick check-in endpoint for the 3-button system
  async quickCheckIn(
    goalId: string, 
    result: 1 | 2 | 3, // 1=Yes, 2=No, 3=RemindLater
    notes?: string
  ): Promise<ApiResponse<CheckInResponse>> {
    return await apiClient.post<CheckInResponse>(
      `/checkins/quick/${goalId}/${result}`, 
      notes || null
    );
  }

  // Mobile-specific helper methods

  // Simple Yes/No check-in for mobile (most common use case)
  async simpleCheckIn(goalId: string, completed: boolean, notes?: string): Promise<ApiResponse<CheckInResponse>> {
    const request: ThreeButtonCheckInRequest = {
      goalId,
      result: completed ? 1 : 2, // 1=Yes, 2=No
      notes,
      date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
    };
    
    return await this.createCheckIn(request);
  }

  // Get recent check-ins for dashboard
  async getRecentCheckIns(limit: number = 10): Promise<ApiResponse<PagedResponse<CheckInResponse>>> {
    return await this.getCheckIns({
      page: 1,
      limit,
    });
  }

  // Get check-ins for a specific goal (mobile optimized)
  async getGoalCheckIns(
    goalId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<ApiResponse<PagedResponse<CheckInResponse>>> {
    return await this.getCheckIns({
      goalId,
      page,
      limit,
    });
  }

  // Check if user has checked in today for a specific goal
  async hasCheckedInToday(goalId: string): Promise<boolean> {
    try {
      const response = await this.getTodayCheckIn(goalId);
      return response.success && !!response.data;
    } catch (error) {
      console.error('Error checking today\'s check-in:', error);
      return false;
    }
  }

  // Get user's overall check-in statistics
  async getOverallStats(): Promise<{ 
    totalCheckIns: number; 
    completedCheckIns: number; 
    successRate: number; 
  }> {
    try {
      const response = await this.getCheckIns({ limit: 1000 }); // Get all check-ins
      
      if (response.success && response.data) {
        const totalCheckIns = response.data.total;
        const completedCheckIns = response.data.items.filter(c => c.completed).length;
        const successRate = totalCheckIns > 0 ? (completedCheckIns / totalCheckIns) * 100 : 0;
        
        return {
          totalCheckIns,
          completedCheckIns,
          successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal place
        };
      }
      
      return { totalCheckIns: 0, completedCheckIns: 0, successRate: 0 };
    } catch (error) {
      console.error('Error getting overall check-in stats:', error);
      return { totalCheckIns: 0, completedCheckIns: 0, successRate: 0 };
    }
  }
}

export const checkInService = new CheckInService();