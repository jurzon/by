import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import apiClient, {
  getGoals as apiGetGoals,
  createGoal as apiCreateGoal,
  updateGoal as apiUpdateGoal,
  deleteGoal as apiDeleteGoal,
  getTodayCheckIn as apiGetTodayCheckIn,
  threeButtonCheckIn as apiThreeButtonCheckIn  // BACK TO ORIGINAL
} from '../lib/api'
import type { Goal, CheckInResult, CheckInResponse } from '../types'

interface GoalState {
  goals: Goal[]
  activeGoals: Goal[]
  todayCheckIns: Record<string, CheckInResponse | null> // FIXED: Per-goal check-ins
  isLoading: boolean
  error: string | null
}

interface GoalActions {
  loadGoals: () => Promise<void>
  createGoal: (goalData: any) => Promise<Goal>
  updateGoal: (id: string, goalData: any) => Promise<Goal>
  deleteGoal: (id: string) => Promise<void>
  loadTodayCheckIn: (goalId: string) => Promise<void>
  performCheckIn: (goalId: string, result: CheckInResult, notes?: string) => Promise<CheckInResponse>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type GoalStore = GoalState & GoalActions

export const useGoalStore = create<GoalStore>()(
  devtools(
    persist(
      (set, get) => ({
        goals: [],
        activeGoals: [],
        todayCheckIns: {}, // FIXED: Initialize as empty object
        isLoading: false,
        error: null,

        loadGoals: async () => {
          try {
            set({ isLoading: true, error: null })
            const response = await apiGetGoals()
            const goals = response.data || []
            const activeGoals = goals.filter(g => g.isActive)
            set({ goals, activeGoals, isLoading: false })
          } catch (e: any) {
            set({ error: e.message || 'Failed to load goals', isLoading: false })
          }
        },

        createGoal: async (goalData: any) => {
          try {
            set({ isLoading: true, error: null })
            const response = await apiCreateGoal(goalData)
            const newGoal = response.data!
            set(state => ({
              goals: [...state.goals, newGoal],
              activeGoals: newGoal.isActive ? [...state.activeGoals, newGoal] : state.activeGoals,
              isLoading: false
            }))
            return newGoal
          } catch (e: any) {
            set({ error: e.message || 'Failed to create goal', isLoading: false })
            throw e
          }
        },

        updateGoal: async (id: string, goalData: any) => {
          try {
            set({ isLoading: true, error: null })
            const response = await apiUpdateGoal(id, goalData)
            const updatedGoal = response.data!
            set(state => ({
              goals: state.goals.map(g => g.id === id ? updatedGoal : g),
              activeGoals: state.activeGoals.map(g => g.id === id ? updatedGoal : g),
              isLoading: false
            }))
            return updatedGoal
          } catch (e: any) {
            set({ error: e.message || 'Failed to update goal', isLoading: false })
            throw e
          }
        },

        deleteGoal: async (id: string) => {
          try {
            set({ isLoading: true, error: null })
            await apiDeleteGoal(id)
            set(state => ({
              goals: state.goals.filter(g => g.id !== id),
              activeGoals: state.activeGoals.filter(g => g.id !== id),
              // FIXED: Remove the goal's check-in data
              todayCheckIns: Object.fromEntries(
                Object.entries(state.todayCheckIns).filter(([goalId]) => goalId !== id)
              ),
              isLoading: false
            }))
          } catch (e: any) {
            set({ error: e.message || 'Failed to delete goal', isLoading: false })
            throw e
          }
        },

        loadTodayCheckIn: async (goalId: string) => {
          try {
            set({ isLoading: true, error: null })
            const response = await apiGetTodayCheckIn(goalId)
            // FIXED: Set check-in for specific goal
            set(state => ({
              todayCheckIns: {
                ...state.todayCheckIns,
                [goalId]: response.data || null
              },
              isLoading: false
            }))
          } catch (e: any) {
            // Gracefully handle errors - no check-in for today is normal
            console.log('No check-in for today:', e.message)
            set(state => ({
              todayCheckIns: {
                ...state.todayCheckIns,
                [goalId]: null
              },
              isLoading: false
            }))
          }
        },

        performCheckIn: async (goalId: string, result: CheckInResult, notes?: string) => {
          try {
            set({ isLoading: true, error: null })
            
            console.log('Performing check-in:', { goalId, result, notes }); // Debug log
            
            // BACK TO: Use threeButtonCheckIn with proper format
            const response = await apiThreeButtonCheckIn({
              goalId,
              result,
              notes: notes || undefined
              // No date field - let backend use current date
            })
            
            const checkInResponse = response.data!
            // FIXED: Set check-in for specific goal only
            set(state => ({
              todayCheckIns: {
                ...state.todayCheckIns,
                [goalId]: checkInResponse
              },
              isLoading: false
            }))
            get().loadGoals()
            return checkInResponse
          } catch (e: any) {
            console.error('Check-in error:', e); // Debug log
            
            // ENHANCED ERROR LOGGING - Log the full response details
            console.error('Full error response:', {
              status: e?.response?.status,
              statusText: e?.response?.statusText,
              data: e?.response?.data,
              message: e?.message
            });
            
            // Check if it's "Goal not found" error - might need to reload goals
            const backendMessage = e?.response?.data?.message;
            if (backendMessage === "Goal not found") {
              console.log('Goal not found - reloading goals and retrying...')
              await get().loadGoals();
              
              // Check if goal exists after reload
              const currentState = get();
              const goalExists = currentState.activeGoals.some(g => g.id === goalId);
              
              if (!goalExists) {
                const errorMessage = 'This goal no longer exists. Please refresh the page.';
                set({ error: errorMessage, isLoading: false })
                throw new Error(errorMessage)
              }
              
              // Retry the check-in
              try {
                const retryResponse = await apiThreeButtonCheckIn({
                  goalId,
                  result,
                  notes: notes || undefined
                })
                
                const checkInResponse = retryResponse.data!
                // FIXED: Set check-in for specific goal only
                set(state => ({
                  todayCheckIns: {
                    ...state.todayCheckIns,
                    [goalId]: checkInResponse
                  },
                  isLoading: false
                }))
                get().loadGoals()
                return checkInResponse
              } catch (retryError: any) {
                console.error('Retry failed:', retryError);
                // Fall through to normal error handling
                e = retryError;
              }
            }
            
            // Better error handling
            let errorMessage = 'Failed to perform check-in';
            
            if (e?.response?.data?.errors) {
              // Handle validation errors
              const errors = e.response.data.errors;
              const errorMessages = [];
              
              for (const field in errors) {
                if (Array.isArray(errors[field])) {
                  errorMessages.push(...errors[field]);
                } else {
                  errorMessages.push(errors[field]);
                }
              }
              
              errorMessage = errorMessages.join(', ');
            } else if (e?.response?.data?.message) {
              errorMessage = `Backend error: ${e.response.data.message}`;
            } else if (e?.message) {
              errorMessage = e.message;
            } else if (e?.response?.status === 400) {
              errorMessage = 'Invalid check-in data. Please try again.';
            } else if (e?.response?.status === 401) {
              errorMessage = 'Please log in again to check in.';
            } else if (e?.response?.status === 500) {
              errorMessage = 'Server error. Please check if the backend is running.';
            }
            
            set({ error: errorMessage, isLoading: false })
            throw new Error(errorMessage)
          }
        },

        clearError: () => set({ error: null }),
        setLoading: (loading: boolean) => set({ isLoading: loading })
      }),
      {
        name: 'goal-store',
        partialize: (state) => ({ 
          goals: state.goals, 
          activeGoals: state.activeGoals,
          // FIXED: Don't persist per-goal check-ins to avoid stale data
          // todayCheckIns will be loaded fresh each time
        })
      }
    ),
    { name: 'goal-store' }
  )
)

export const useActiveGoals = () => useGoalStore(state => state.activeGoals)
export const useGoalsLoading = () => useGoalStore(state => state.isLoading)
export const useGoalsError = () => useGoalStore(state => state.error)
// FIXED: Updated to get check-in for specific goal
export const useTodayCheckIn = (goalId: string) => useGoalStore(state => state.todayCheckIns[goalId] || null)