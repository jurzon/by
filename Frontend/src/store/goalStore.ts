import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  getGoals as apiGetGoals,
  createGoal as apiCreateGoal,
  updateGoal as apiUpdateGoal,
  deleteGoal as apiDeleteGoal,
  getTodayCheckIn as apiGetTodayCheckIn,
  threeButtonCheckIn as apiThreeButtonCheckIn
} from '../lib/api'
import type { Goal, CheckInResult, CheckInResponse } from '../types'

interface GoalState {
  goals: Goal[]
  activeGoals: Goal[]
  todayCheckIn: CheckInResponse | null
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
        todayCheckIn: null,
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
            set({ todayCheckIn: response.data || null, isLoading: false })
          } catch (e: any) {
            // 404 means none yet today
            if (e.status !== 404) {
              set({ error: e.message || 'Failed to load check-in status' })
            }
            set({ todayCheckIn: null, isLoading: false })
          }
        },

        performCheckIn: async (goalId: string, result: CheckInResult, notes?: string) => {
          try {
            set({ isLoading: true, error: null })
            const response = await apiThreeButtonCheckIn({
              goalId,
              result,
              notes: notes || undefined,
              date: new Date().toISOString().split('T')[0]
            })
            const checkInResponse = response.data!
            set({ todayCheckIn: checkInResponse, isLoading: false })
            get().loadGoals()
            return checkInResponse
          } catch (e: any) {
            set({ error: e.message || 'Failed to perform check-in', isLoading: false })
            throw e
          }
        },

        clearError: () => set({ error: null }),
        setLoading: (loading: boolean) => set({ isLoading: loading })
      }),
      {
        name: 'goal-store',
        partialize: (state) => ({ goals: state.goals, activeGoals: state.activeGoals })
      }
    ),
    { name: 'goal-store' }
  )
)

export const useActiveGoals = () => useGoalStore(state => state.activeGoals)
export const useGoalsLoading = () => useGoalStore(state => state.isLoading)
export const useGoalsError = () => useGoalStore(state => state.error)
export const useTodayCheckIn = () => useGoalStore(state => state.todayCheckIn)