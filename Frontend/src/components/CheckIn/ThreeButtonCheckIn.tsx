import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Loader2, Flame, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { CheckInResult } from '../../types'
import { useGoalStore } from '../../store/goalStore'
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
  const { todayCheckIn, isLoading, error, loadTodayCheckIn, performCheckIn, clearError } = useGoalStore()

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
      <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl ${className}`}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Goal Status</h3>
          <span className="text-gray-600">Checking today's progress...</span>
        </div>
      </div>
    )
  }

  // Already Checked In State
  if (todayCheckIn) {
    const isCompleted = todayCheckIn.completed
    const statusColor = isCompleted ? 'emerald' : 'red'
    
    return (
      <div className={`bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl ${className}`}>
        <div className="text-center">
          {/* Goal Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{goalTitle}</h3>
          
          {/* Status Badge */}
          <div className={`inline-flex items-center px-8 py-4 rounded-2xl text-xl font-bold mb-6 ${
            isCompleted 
              ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-2 border-emerald-300' 
              : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-300'
          }`}>
            {isCompleted ? (
              <>
                <CheckCircle className="w-8 h-8 mr-3" />
                ?? Completed Today!
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 mr-3" />
                ?? Failed Today
              </>
            )}
          </div>

          {/* Notes */}
          {todayCheckIn.notes && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Your Note:</h4>
              <p className="text-blue-700 italic leading-relaxed">"{todayCheckIn.notes}"</p>
            </div>
          )}
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200">
              <div className="flex items-center justify-center mb-2">
                <Flame className="w-6 h-6 text-orange-600 mr-2" />
                <span className="text-sm font-semibold text-orange-800">Current Streak</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{todayCheckIn.streakCount} days</p>
            </div>
            
            {todayCheckIn.amountCharged && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4 border border-red-200">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-red-600 mr-2" />
                  <span className="text-sm font-semibold text-red-800">Amount Charged</span>
                </div>
                <p className="text-2xl font-bold text-red-900">${todayCheckIn.amountCharged.toFixed(2)}</p>
              </div>
            )}
          </div>
          
          {/* Check-in Time */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">
                Checked in at {new Date(todayCheckIn.checkInTime).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          {/* Tomorrow's Motivation */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-200/50">
            <p className="text-blue-800 font-medium text-sm">
              {isCompleted 
                ? "?? Great job today! Keep this momentum going tomorrow!" 
                : "?? Tomorrow is a new opportunity. Learn from today and come back stronger!"
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main Check-In Interface
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{goalTitle}</h3>
        <p className="text-gray-600 text-lg font-medium">
          Did you complete your goal today?
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-2xl p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Notes Input */}
      <div className="mb-8">
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-3">
          Add a note about today's progress (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did it go today? Any challenges or wins to share?"
          className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 bg-gray-50/50 backdrop-blur-sm"
          rows={3}
          disabled={isProcessing}
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">{notes.length}/500 characters</p>
          {notes.length > 0 && (
            <p className="text-xs text-blue-600">?? Great! Notes help track your journey</p>
          )}
        </div>
      </div>

      {/* 3-Button System */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* YES Button */}
        <button
          onClick={() => handleCheckIn(CheckInResult.Yes)}
          disabled={isProcessing}
          className="group relative bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-2 border-emerald-300 hover:border-emerald-400 rounded-3xl p-8 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-xl"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <span className="text-emerald-800 font-bold text-2xl block mb-2">YES</span>
            <span className="text-emerald-700 font-semibold block mb-3">I completed it!</span>
            <div className="bg-emerald-100/80 rounded-xl p-3">
              <span className="text-emerald-600 text-sm font-medium">Keep your streak going ??</span>
            </div>
          </div>
        </button>

        {/* NO Button */}
        <button
          onClick={() => handleCheckIn(CheckInResult.No)}
          disabled={isProcessing}
          className="group relative bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-2 border-red-300 hover:border-red-400 rounded-3xl p-8 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-xl"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <span className="text-red-800 font-bold text-2xl block mb-2">NO</span>
            <span className="text-red-700 font-semibold block mb-3">I failed today</span>
            <div className="bg-red-100/80 rounded-xl p-3">
              <span className="text-red-600 text-sm font-medium">Payment will be processed ??</span>
            </div>
          </div>
        </button>

        {/* REMIND LATER Button */}
        <button
          onClick={() => handleCheckIn(CheckInResult.RemindLater)}
          disabled={isProcessing}
          className="group relative bg-gradient-to-br from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border-2 border-amber-300 hover:border-amber-400 rounded-3xl p-8 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-xl"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <span className="text-amber-800 font-bold text-2xl block mb-2">LATER</span>
            <span className="text-amber-700 font-semibold block mb-3">Remind me later</span>
            <div className="bg-amber-100/80 rounded-xl p-3">
              <span className="text-amber-600 text-sm font-medium">No action taken ?</span>
            </div>
          </div>
        </button>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center bg-blue-50 px-6 py-3 rounded-2xl border border-blue-200">
            <Loader2 className="animate-spin w-6 h-6 text-blue-600 mr-3" />
            <span className="text-blue-800 font-semibold">Processing your check-in...</span>
          </div>
        </div>
      )}

      {/* Help Guide */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200">
        <h4 className="font-bold text-gray-900 text-center mb-4">?? How It Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-semibold text-emerald-800">YES</p>
            <p className="text-gray-600">Keep your streak! No payment needed.</p>
          </div>
          <div className="text-center">
            <div className="bg-red-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="font-semibold text-red-800">NO</p>
            <p className="text-gray-600">Payment processed immediately to charity.</p>
          </div>
          <div className="text-center">
            <div className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-semibold text-amber-800">LATER</p>
            <p className="text-gray-600">Get reminded again later today.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThreeButtonCheckIn