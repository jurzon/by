import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
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

  useEffect(() => { loadTodayCheckIn(goalId) }, [goalId, loadTodayCheckIn])

  const handleCheckIn = async (result: CheckInResult) => {
    if (isProcessing || isLoading) return
    setIsProcessing(true)
    clearError()
    try {
      const res = await performCheckIn(goalId, result, notes.trim() || undefined)
      if (result === CheckInResult.Yes) toast.success('Check-in recorded: YES')
      else if (result === CheckInResult.No) toast.error(`Failure recorded. Amount charged: $${res.amountCharged || 0}`)
      else toast('Remind later selected')
      setNotes('')
      onCheckIn?.(result, notes.trim() || undefined)
    } catch (e: any) {
      toast.error(e.message || 'Check-in failed')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading && !todayCheckIn) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading check-in status...</span>
        </div>
      </div>
    )
  }

  if (todayCheckIn) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-center">{goalTitle}</h3>
        <div className="text-center">
          <div className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold ${todayCheckIn.completed ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-red-100 text-red-800 border-2 border-red-300'}`}>
            {todayCheckIn.completed ? (
              <>
                <CheckCircle className="w-6 h-6 mr-2" />
                Completed Today
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 mr-2" />
                Failed Today
              </>
            )}
          </div>
          {todayCheckIn.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{todayCheckIn.notes}"</p>
            </div>
          )}
          <div className="mt-4 text-sm text-gray-600">
            <p>Current Streak: <span className="font-semibold">{todayCheckIn.streakCount} days</span></p>
            {todayCheckIn.amountCharged && (
              <p className="text-red-600 font-semibold">Amount Charged: ${todayCheckIn.amountCharged.toFixed(2)}</p>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">Checked in at {new Date(todayCheckIn.checkInTime).toLocaleTimeString()}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-center">{goalTitle}</h3>
      <p className="text-gray-600 mb-6 text-center text-lg">Did you complete your goal today?</p>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      <div className="mb-6">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Add a note (optional)</label>
        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it go today?" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" rows={3} disabled={isProcessing} maxLength={500} />
        <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => handleCheckIn(CheckInResult.Yes)} disabled={isProcessing} className="group flex flex-col items-center p-6 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <CheckCircle className="w-16 h-16 text-green-600 mb-3" />
          <span className="text-green-800 font-bold text-lg">YES</span>
          <span className="text-green-600 text-sm mt-1 text-center">I completed it</span>
        </button>
        <button onClick={() => handleCheckIn(CheckInResult.No)} disabled={isProcessing} className="group flex flex-col items-center p-6 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <XCircle className="w-16 h-16 text-red-600 mb-3" />
          <span className="text-red-800 font-bold text-lg">NO</span>
          <span className="text-red-600 text-sm mt-1 text-center">I failed today</span>
        </button>
        <button onClick={() => handleCheckIn(CheckInResult.RemindLater)} disabled={isProcessing} className="group flex flex-col items-center p-6 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 hover:border-yellow-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Clock className="w-16 h-16 text-yellow-600 mb-3" />
          <span className="text-yellow-800 font-bold text-lg">LATER</span>
          <span className="text-yellow-600 text-sm mt-1 text-center">Remind me later</span>
        </button>
      </div>
      {isProcessing && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-blue-600">
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            <span>Processing...</span>
          </div>
        </div>
      )}
      <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
        <p>YES = Keep your streak. No charge.</p>
        <p>NO = Immediate payment processed.</p>
        <p>LATER = No action taken.</p>
      </div>
    </div>
  )
}

export default ThreeButtonCheckIn