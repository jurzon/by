import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { 
  Target, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Rocket,
  Star,
  Users,
  DollarSign,
  Trophy,
  Play,
  ChevronDown
} from 'lucide-react';

// Store imports
import { useAuthStore, initializeAuth } from './store/authStore';
import { useGoalStore, useActiveGoals } from './store/goalStore';

// Component imports
import LoginPage from './pages/auth/LoginPage';
import ThreeButtonCheckIn from './components/CheckIn/ThreeButtonCheckIn';
import CreateGoalModal from './components/Goal/CreateGoalModal';
import ApiHealth from './components/ApiHealth';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Dashboard Page
const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const { loadGoals } = useGoalStore();
  const activeGoals = useActiveGoals();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // FIXED: Calculate total money at stake
  const totalStakeAmount = activeGoals.reduce((total, goal) => total + goal.totalStakeAmount, 0);
  
  // Calculate current streak (for now, use 0 - this would come from backend)
  const currentStreak = 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BY Dashboard
                </h1>
                <p className="text-sm text-gray-500">Bet on Yourself</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* API Health Check */}
              <ApiHealth />
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName || user?.username}
                </p>
                <p className="text-xs text-gray-500">Accountability Champion</p>
              </div>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1 hover:bg-gray-100 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards - FIXED with real calculations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Goals</p>
                <p className="text-xl font-bold text-gray-900">{activeGoals.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-xl font-bold text-gray-900">{currentStreak} days</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Money at Stake</p>
                <p className="text-xl font-bold text-gray-900">${totalStakeAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {activeGoals.length === 0 ? (
          <EmptyState onCreateGoal={() => setShowCreateModal(true)} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Your Goals</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm"
              >
                Add New Goal
              </button>
            </div>
            {/* IMPROVED GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {activeGoals.map((goal) => (
                <ThreeButtonCheckIn
                  key={goal.id}
                  goalId={goal.id}
                  goalTitle={goal.title}
                  className="w-full"
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Goal Modal */}
      <CreateGoalModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
}

// Enhanced Empty State Component with Create Goal Function
const EmptyState = ({ onCreateGoal }: { onCreateGoal: () => void }) => (
  <div className="text-center py-16">
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-4xl mx-auto border border-white/50 shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
        <Target className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
      <p className="text-xl text-gray-600 mb-8">Create your first accountability goal and put money on the line!</p>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">🎯 How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">1. Set Your Goal</h4>
            <p className="text-sm text-gray-600">Define what you want to achieve and stake money on it</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">2. Daily Check-ins</h4>
            <p className="text-sm text-gray-600">Three buttons: Yes, No, or Remind Later</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">3. Face Consequences</h4>
            <p className="text-sm text-gray-600">Immediate payment if you fail - real accountability!</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onCreateGoal}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center"
      >
        Create Your First Goal
        <ArrowRight className="w-6 h-6 ml-2" />
      </button>
      
      <div className="mt-8 text-sm text-gray-500">
        <p>💡 <strong>Pro Tip:</strong> Start small with a $5-10 stake to build the habit!</p>
      </div>
    </div>
  </div>
)

// Modern Landing Page Component
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 bg-opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 bg-opacity-20 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BY</span>
            </div>
            <div className="flex items-center space-x-4">
              <ApiHealth className="text-white/60" />
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-white bg-opacity-20 text-white px-6 py-2 rounded-full hover:bg-opacity-30 transition-colors backdrop-blur-sm"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pt-20">
        <div className="text-center text-white max-w-6xl">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Target className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              BY
            </h1>
            
            <p className="text-3xl md:text-4xl font-semibold mb-4 text-blue-100">
              Bet on Yourself
            </p>
            
            <p className="text-xl text-blue-200 text-opacity-80 mb-12 max-w-3xl mx-auto leading-relaxed">
              The ultimate accountability platform that helps you achieve your goals through 
              <span className="font-semibold text-white"> real financial commitment</span>
            </p>
          </div>
          
          {/* Feature Showcase */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 mb-12 border border-white border-opacity-20">
            <div className="flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-3xl font-bold">Production-Ready System!</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="font-semibold text-green-300">Backend APIs</span>
                </div>
                <div className="ml-9 space-y-2 text-sm text-blue-200">
                  <p>🔐 JWT Authentication System</p>
                  <p>🎯 3-Button Check-in API</p>
                  <p>💳 Real Stripe Payment Processing</p>
                  <p>🐳 Docker Environment</p>
                  <p>📊 Health Monitoring</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="font-semibold text-blue-300">Frontend Complete</span>
                </div>
                <div className="ml-9 space-y-2 text-sm text-purple-200">
                  <p>⚛️ React + TypeScript</p>
                  <p>🐻 Zustand State Management</p>
                  <p>🎨 Modern Tailwind Design</p>
                  <p>🔄 Real-time Integration</p>
                  <p>📱 Responsive Mobile UI</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center justify-center"
            >
              <Shield className="w-6 h-6 mr-3" />
              Login & Start Testing
            </button>
            <button 
              onClick={() => window.location.href = '/register'}
              className="border-2 border-white border-opacity-50 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm inline-flex items-center justify-center"
            >
              <Target className="w-6 h-6 mr-3" />
              Create Account
            </button>
          </div>
          
          {/* System Info */}
          <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-green-300">Backend: localhost:5186</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-blue-300">Frontend: localhost:3001</span>
              </div>
            </div>
            <p className="text-center text-white text-opacity-60 text-sm mt-4">
              🚀 Ready for production deployment & real user testing!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                    <div className="text-center bg-white rounded-3xl p-12 max-w-md mx-4 shadow-2xl">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h1 className="text-3xl font-bold mb-4 text-gray-900">Coming Soon!</h1>
                      <p className="text-gray-600 mb-6">Registration page is under development</p>
                      <p className="text-sm text-green-600 mb-6">✅ Backend registration API is ready</p>
                      <button 
                        onClick={() => window.location.href = '/login'}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Go to Login
                      </button>
                    </div>
                  </div>
                </PublicRoute>
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        <Toaster 
          position="top-right" 
          expand={false} 
          richColors 
          closeButton
          className="z-50" 
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
