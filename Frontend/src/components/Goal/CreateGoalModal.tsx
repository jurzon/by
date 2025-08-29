import React, { useState } from 'react';
import { X, Target, Calendar, DollarSign, Clock, Zap } from 'lucide-react';
import { useGoalStore } from '../../store/goalStore';
import { toast } from 'sonner';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose }) => {
  const { createGoal, isLoading } = useGoalStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 0, // Use enum numeric value: Fitness = 0
    durationDays: 30,
    stakeAmount: 25,
    reminderTime: '08:00'
  });

  // FIXED: Use numeric values that match backend enum exactly
  const categories = [
    { value: 0, name: 'Fitness', label: '?? Fitness', color: 'bg-red-100 text-red-800' },
    { value: 1, name: 'Learning', label: '?? Learning', color: 'bg-blue-100 text-blue-800' },
    { value: 2, name: 'Habits', label: '?? Habits', color: 'bg-green-100 text-green-800' },
    { value: 3, name: 'Finance', label: '?? Finance', color: 'bg-yellow-100 text-yellow-800' },
    { value: 4, name: 'Career', label: '? Career', color: 'bg-indigo-100 text-indigo-800' },
    { value: 5, name: 'Health', label: '?? Health', color: 'bg-purple-100 text-purple-800' }
  ];

  const durations = [
    { value: 7, label: '1 Week' },
    { value: 21, label: '21 Days (Habit Formation)' },
    { value: 30, label: '30 Days' },
    { value: 60, label: '2 Months' },
    { value: 90, label: '3 Months' }
  ];

  const stakeAmounts = [
    { value: 5, label: '$5 - Start Small' },
    { value: 10, label: '$10 - Light Pressure' },
    { value: 25, label: '$25 - Moderate Stakes' },
    { value: 50, label: '$50 - Serious Commitment' },
    { value: 100, label: '$100 - High Stakes' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    try {
      // FIXED: Send data in exact format backend expects
      const goalData = {
        title: formData.title.trim(),
        description: formData.description.trim() || `Achieve ${formData.title.trim()} in ${formData.durationDays} days`,
        category: formData.category, // Send as numeric enum value
        durationDays: formData.durationDays,
        totalStakeAmount: formData.stakeAmount,
        reminderTime: formData.reminderTime + ':00', // Convert to HH:mm:ss format
        reminderMessage: `Time to work on: ${formData.title.trim()}!`
      };

      console.log('Sending goal data:', goalData); // Debug log

      await createGoal(goalData);
      toast.success('?? Goal created successfully! Time to put money on the line!');
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 0, // Reset to Fitness
        durationDays: 30,
        stakeAmount: 25,
        reminderTime: '08:00'
      });
    } catch (error: any) {
      console.error('Goal creation error:', error); // Debug log
      
      // Better error handling
      let errorMessage = 'Failed to create goal. Please try again.';
      
      if (error?.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const errorMessages = [];
        
        for (const field in errors) {
          if (Array.isArray(errors[field])) {
            errorMessages.push(...errors[field]);
          } else {
            errorMessages.push(errors[field]);
          }
        }
        
        errorMessage = errorMessages.join(', ');
      } else if (error?.response?.data?.title) {
        // Handle ASP.NET Core validation error format
        errorMessage = error.response.data.title;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 401) {
        errorMessage = 'Please log in again to create goals.';
      } else if (error?.response?.status === 500) {
        errorMessage = 'Server error. Please check if the backend is running.';
      } else if (error?.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and backend server.';
      }
      
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Your Goal</h2>
                <p className="text-sm text-gray-500">Put money on the line and achieve it!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's your goal? *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Exercise for 30 minutes daily"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add more details about your goal..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: category.value })}
                    className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {categories.find(c => c.value === formData.category)?.name} (ID: {formData.category})
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Duration
                </label>
                <select
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {durations.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reminder Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Stake Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Stake Amount (Total commitment)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {stakeAmounts.map((stake) => (
                  <button
                    key={stake.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, stakeAmount: stake.value })}
                    className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                      formData.stakeAmount === stake.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {stake.label}
                  </button>
                ))}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-yellow-600 mr-2" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-800">Daily Risk: ${(formData.stakeAmount / formData.durationDays).toFixed(2)}</p>
                    <p className="text-yellow-700">You'll lose this amount each day you fail to complete your goal.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Goal & Start Journey'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGoalModal;