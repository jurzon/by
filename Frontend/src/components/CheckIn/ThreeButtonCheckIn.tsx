import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Loader2, Flame, DollarSign, Calendar, TrendingUp, Target } from 'lucide-react'
import { CheckInResult } from '../../types'
import { useGoalStore, useTodayCheckIn } from '../../store/goalStore'
import { toast } from 'sonner'

interface ThreeButtonCheckInProps {
  goalId: string
  goalTitle: string
  onCheckIn?: (result: CheckInResult, notes?: string) => void
  className?: string
}

const ThreeButtonCheckIn: React.FC<ThreeButtonCheckInProps> = ({
  goalId,
  goalTitle,
  onCheckIn,
  className = ''
}) => {
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  // FIXED: Use goal-specific check-in state
  const todayCheckIn = useTodayCheckIn(goalId)
  const { isLoading, error, loadTodayCheckIn, performCheckIn, clearError } = useGoalStore()

  useEffect(() => { 
    loadTodayCheckIn(goalId) 
  }, [goalId, loadTodayCheckIn])

  const handleCheckIn = async (result: CheckInResult) => {
    if (isProcessing || isLoading) return
    setIsProcessing(true)
    clearError()
    
    try {
      const res = await performCheckIn(goalId, result, notes.trim() || undefined)
      
      if (result === CheckInResult.Yes) {
        toast.success('?? Excellent!', { 
          description: 'Check-in recorded successfully. Keep the streak going!' 
        })
      } else if (result === CheckInResult.No) {
        toast.error('?? Payment Processed', { 
          description: `$${res.amountCharged || 0} has been charged. Use this as motivation!`
        })
      } else {
        toast.info('? Reminder Set', { 
          description: 'We\'ll check back with you later today.' 
        })
      }
      
      setNotes('')
      onCheckIn?.(result, notes.trim() || undefined)
      
    } catch (e: any) {
      toast.error('Check-in failed', { 
        description: e.message || 'Please try again in a moment.' 
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Loading State
  if (isLoading && !todayCheckIn) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Loading...</h3>
          <span className="text-gray-600 text-sm">Checking today's progress</span>
        </div>
      </div>
    )
  }

  // Already Checked In State
  if (todayCheckIn) {
    const isCompleted = todayCheckIn.completed
    
    return (
      <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg ${className}`}>
        <div className="text-center">
          {/* Goal Title */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl mr-3">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{goalTitle}</h3>
          </div>
          
          {/* Status Badge */}
          <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold mb-4 ${
            isCompleted 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ? Completed Today!
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                ? Failed Today
              </>
            )}
          </div>

          {/* Notes */}
          {todayCheckIn.notes && (
            <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-200">
              <p className="text-blue-700 text-sm italic">"{todayCheckIn.notes}"</p>
            </div>
          )}
          
          {/* Stats */}
          <div className="flex justify-center space-x-4 mb-4">
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-200 text-center min-w-0">
              <div className="flex items-center justify-center mb-1">
                <Flame className="w-4 h-4 text-orange-600 mr-1" />
                <span className="text-xs font-semibold text-orange-800">Streak</span>
              </div>
              <p className="text-lg font-bold text-orange-900">{todayCheckIn.streakCount}</p>
            </div>
            
            {todayCheckIn.amountCharged && (
              <div className="bg-red-50 rounded-xl p-3 border border-red-200 text-center min-w-0">
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-xs font-semibold text-red-800">Charged</span>
                </div>
                <p className="text-lg font-bold text-red-900">${todayCheckIn.amountCharged.toFixed(2)}</p>
              </div>
            )}
          </div>
          
          {/* Check-in Time */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-xs text-gray-600">
                {new Date(todayCheckIn.checkInTime).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Check-In Interface - COMPACT VERSION
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl mr-3">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{goalTitle}</h3>
        </div>
        <p className="text-gray-600 text-sm font-medium">
          Did you complete your goal today?
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-center">
            <XCircle className="w-4 h-4 text-red-500 mr-2" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Notes Input - COMPACT */}
      <div className="mb-6">
        <label htmlFor={`notes-${goalId}`} className="block text-xs font-semibold text-gray-700 mb-2">
          Add a note about today's progress (optional)
        </label>
        <textarea
          id={`notes-${goalId}`}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did it go today? Any challenges or wins to share?"
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 text-sm"
          rows={2}
          disabled={isProcessing}
          maxLength={200}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">{notes.length}/200</p>
        </div>
      </div>

      {/* 3-Button System - COMPACT HORIZONTAL */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* YES Button */}
        <button
          onClick={() => handleCheckIn(CheckInResult.Yes)}
          disabled={isProcessing}
          className="group bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-300 hover:border-green-400 rounded-xl p-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-800 font-bold text-lg block">YES</span>
            <span className="text-green-700 text-xs block">I completed it!</span>
          </div>
        </button>

        {/* NO Button */}
        <button
          onClick={() => handleCheckIn(CheckInResult.No)}
          disabled={isProcessing}
          className="group bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-2 border-red-300 hover:border-red-400 rounded-xl p-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-red-800 font-bold text-lg block">NO</span>
            <span className="text-red-700 text-xs block">I failed today</span>
          </div>
        </button>

        {/* REMIND LATER Button */}
        <button
          onClick={() => handleCheckIn(CheckInResult.RemindLater)}
          disabled={isProcessing}
          className="group bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border-2 border-yellow-300 hover:border-yellow-400 rounded-xl p-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-yellow-800 font-bold text-lg block">LATER</span>
            <span className="text-yellow-700 text-xs block">Remind me later</span>
          </div>
        </button>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
            <Loader2 className="animate-spin w-4 h-4 text-blue-600 mr-2" />
            <span className="text-blue-800 text-sm font-semibold">Processing...</span>
          </div>
        </div>
      )}

      {/* Help Guide - COMPACT */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
        <h4 className="font-bold text-gray-900 text-center mb-2 text-sm">?? How It Works</h4>
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          <div>
            <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="font-semibold text-green-800">YES</p>
            <p className="text-gray-600">Keep streak</p>
          </div>
          <div>
            <XCircle className="w-4 h-4 text-red-600 mx-auto mb-1" />
            <p className="font-semibold text-red-800">NO</p>
            <p className="text-gray-600">Pay penalty</p>
          </div>
          <div>
            <Clock className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
            <p className="font-semibold text-yellow-800">LATER</p>
            <p className="text-gray-600">Remind me</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThreeButtonCheckIn