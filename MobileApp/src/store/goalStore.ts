import { create } from 'zustand';
import { 
  Goal, 
  CreateGoalRequest, 
  UpdateGoalRequest,
  CheckInRequest,
  CheckInResponse,
  GoalStatus,
  GoalCategory 
} from '@/types';
import { goalService } from '@/services/goalService';

interface GoalState {
  goals: Goal[];
  activeGoals: Goal[];
  currentGoal: Goal | null;
  checkInHistory: CheckInResponse[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Actions
  fetchGoals: (status?: GoalStatus, category?: GoalCategory) => Promise<void>;
  fetchActiveGoals: () => Promise<void>;
  fetchGoal: (goalId: string) => Promise<void>;
  createGoal: (request: CreateGoalRequest) => Promise<boolean>;
  updateGoal: (goalId: string, request: UpdateGoalRequest) => Promise<boolean>;
  deleteGoal: (goalId: string) => Promise<boolean>;
  pauseGoal: (goalId: string) => Promise<boolean>;
  resumeGoal: (goalId: string) => Promise<boolean>;
  checkIn: (goalId: string, request: CheckInRequest) => Promise<boolean>;
  fetchCheckInHistory: (goalId: string, page?: number, limit?: number) => Promise<void>;
  clearError: () => void;
  clearCurrentGoal: () => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  activeGoals: [],
  currentGoal: null,
  checkInHistory: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  fetchGoals: async (status?: GoalStatus, category?: GoalCategory) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await goalService.getUserGoals(status, category);
      
      if (response.success && response.data) {
        set({
          goals: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Failed to fetch goals',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Failed to fetch goals. Please try again.',
      });
    }
  },

  fetchActiveGoals: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await goalService.getActiveGoals();
      
      if (response.success && response.data) {
        set({
          activeGoals: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Failed to fetch active goals',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Failed to fetch active goals. Please try again.',
      });
    }
  },

  fetchGoal: async (goalId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await goalService.getGoal(goalId);
      
      if (response.success && response.data) {
        set({
          currentGoal: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Failed to fetch goal',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Failed to fetch goal. Please try again.',
      });
    }
  },

  createGoal: async (request: CreateGoalRequest) => {
    set({ isCreating: true, error: null });
    
    try {
      const response = await goalService.createGoal(request);
      
      if (response.success && response.data) {
        const currentGoals = get().goals;
        set({
          goals: [response.data, ...currentGoals],
          isCreating: false,
          error: null,
        });
        
        // Refresh active goals if the new goal is active
        if (response.data.isActive) {
          get().fetchActiveGoals();
        }
        
        return true;
      } else {
        set({
          isCreating: false,
          error: response.message || 'Failed to create goal',
        });
        return false;
      }
    } catch (error) {
      set({
        isCreating: false,
        error: 'Failed to create goal. Please try again.',
      });
      return false;
    }
  },

  updateGoal: async (goalId: string, request: UpdateGoalRequest) => {
    set({ isUpdating: true, error: null });
    
    try {
      const response = await goalService.updateGoal(goalId, request);
      
      if (response.success && response.data) {
        const currentGoals = get().goals;
        const updatedGoals = currentGoals.map(goal =>
          goal.id === goalId ? response.data! : goal
        );
        
        set({
          goals: updatedGoals,
          currentGoal: response.data,
          isUpdating: false,
          error: null,
        });
        
        return true;
      } else {
        set({
          isUpdating: false,
          error: response.message || 'Failed to update goal',
        });
        return false;
      }
    } catch (error) {
      set({
        isUpdating: false,
        error: 'Failed to update goal. Please try again.',
      });
      return false;
    }
  },

  deleteGoal: async (goalId: string) => {
    set({ isDeleting: true, error: null });
    
    try {
      const response = await goalService.deleteGoal(goalId);
      
      if (response.success) {
        const currentGoals = get().goals;
        const currentActiveGoals = get().activeGoals;
        
        set({
          goals: currentGoals.filter(goal => goal.id !== goalId),
          activeGoals: currentActiveGoals.filter(goal => goal.id !== goalId),
          currentGoal: get().currentGoal?.id === goalId ? null : get().currentGoal,
          isDeleting: false,
          error: null,
        });
        
        return true;
      } else {
        set({
          isDeleting: false,
          error: response.message || 'Failed to delete goal',
        });
        return false;
      }
    } catch (error) {
      set({
        isDeleting: false,
        error: 'Failed to delete goal. Please try again.',
      });
      return false;
    }
  },

  pauseGoal: async (goalId: string) => {
    set({ isUpdating: true, error: null });
    
    try {
      const response = await goalService.pauseGoal(goalId);
      
      if (response.success && response.data) {
        const currentGoals = get().goals;
        const updatedGoals = currentGoals.map(goal =>
          goal.id === goalId ? response.data! : goal
        );
        
        set({
          goals: updatedGoals,
          currentGoal: response.data,
          isUpdating: false,
          error: null,
        });
        
        // Refresh active goals
        get().fetchActiveGoals();
        
        return true;
      } else {
        set({
          isUpdating: false,
          error: response.message || 'Failed to pause goal',
        });
        return false;
      }
    } catch (error) {
      set({
        isUpdating: false,
        error: 'Failed to pause goal. Please try again.',
      });
      return false;
    }
  },

  resumeGoal: async (goalId: string) => {
    set({ isUpdating: true, error: null });
    
    try {
      const response = await goalService.resumeGoal(goalId);
      
      if (response.success && response.data) {
        const currentGoals = get().goals;
        const updatedGoals = currentGoals.map(goal =>
          goal.id === goalId ? response.data! : goal
        );
        
        set({
          goals: updatedGoals,
          currentGoal: response.data,
          isUpdating: false,
          error: null,
        });
        
        // Refresh active goals
        get().fetchActiveGoals();
        
        return true;
      } else {
        set({
          isUpdating: false,
          error: response.message || 'Failed to resume goal',
        });
        return false;
      }
    } catch (error) {
      set({
        isUpdating: false,
        error: 'Failed to resume goal. Please try again.',
      });
      return false;
    }
  },

  checkIn: async (goalId: string, request: CheckInRequest) => {
    set({ isUpdating: true, error: null });
    
    try {
      const response = await goalService.checkIn(goalId, request);
      
      if (response.success && response.data) {
        // Add the new check-in to history
        const currentHistory = get().checkInHistory;
        set({
          checkInHistory: [response.data, ...currentHistory],
          isUpdating: false,
          error: null,
        });
        
        // Refresh goals to update stats
        get().fetchActiveGoals();
        
        if (get().currentGoal?.id === goalId) {
          get().fetchGoal(goalId);
        }
        
        return true;
      } else {
        set({
          isUpdating: false,
          error: response.message || 'Failed to check in',
        });
        return false;
      }
    } catch (error) {
      set({
        isUpdating: false,
        error: 'Failed to check in. Please try again.',
      });
      return false;
    }
  },

  fetchCheckInHistory: async (goalId: string, page: number = 1, limit: number = 30) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await goalService.getGoalCheckIns(goalId, page, limit);
      
      if (response.success && response.data) {
        set({
          checkInHistory: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Failed to fetch check-in history',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Failed to fetch check-in history. Please try again.',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentGoal: () => {
    set({ currentGoal: null });
  },
}));