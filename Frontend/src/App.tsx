import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Store imports
import { useAuthStore, initializeAuth } from './store/authStore';
import { useGoalStore, useActiveGoals } from './store/goalStore';

// Component imports
import LoginPage from './pages/auth/LoginPage';
import ThreeButtonCheckIn from './components/CheckIn/ThreeButtonCheckIn';

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

// Dashboard Component
const DashboardPage = () => {
  const { user } = useAuthStore();
  const { loadGoals } = useGoalStore();
  const activeGoals = useActiveGoals();

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-blue to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  BY
                </div>
                <h1 className="ml-3 text-2xl font-bold text-primary-dark">Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                  </span>
                </div>
                <span className="text-sm text-gray-700">
                  Welcome back, {user?.firstName || user?.username}!
                </span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeGoals.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-dark mb-2">Your Active Goals</h2>
              <p className="text-gray-600">Stay accountable with your daily check-ins</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeGoals.map((goal) => (
                <ThreeButtonCheckIn
                  key={goal.id}
                  goalId={goal.id}
                  goalTitle={goal.title}
                  className="w-full"
                />
              ))}
            </div>
          </>
        )}

        {/* Stats Section */}
        <div className="mt-12">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-primary-dark">🚀 System Status</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="status-success rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">✅ Backend Ready</h3>
                  <p className="text-sm text-green-700">Full API with authentication & payments</p>
                </div>
                
                <div className="status-info rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-800 mb-2">⚡ 3-Button System</h3>
                  <p className="text-sm text-blue-700">Yes/No/RemindLater with real payments</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-purple-800 mb-2">⚛️ Frontend Integrated</h3>
                  <p className="text-sm text-purple-700">React + TypeScript + Zustand</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="max-w-md w-full text-center">
      {/* Icon */}
      <div className="w-24 h-24 bg-gradient-to-br from-primary-blue to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-bold text-primary-dark mb-4">Ready to Start?</h2>
      <p className="text-gray-600 mb-8 text-lg leading-relaxed">
        Create your first goal and begin your accountability journey with the 3-button check-in system.
      </p>
      
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border border-blue-100">
        <h3 className="text-lg font-semibold text-primary-dark mb-6">🚀 System Ready!</h3>
        <div className="space-y-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-800">Backend APIs</p>
              <p className="text-sm text-gray-600">Authentication, Goals, Check-ins, Payments</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-800">Frontend Components</p>
              <p className="text-sm text-gray-600">Dashboard, Check-in System, State Management</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-800">Real-time Integration</p>
              <p className="text-sm text-gray-600">Frontend ↔ Backend communication</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-xl p-6">
        <p className="text-accent-orange font-semibold mb-2">⚡ Next Steps:</p>
        <p className="text-gray-700 text-sm">
          The system is ready for goal creation and testing. Add a goal management interface to get started!
        </p>
      </div>
    </div>
  </div>
)

// Logout Button Component
const LogoutButton = () => {
  const { logout } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  return (
    <button
      onClick={handleLogout}
      className="btn-secondary px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-200"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span>Logout</span>
    </button>
  );
}

// Landing Page Component
const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-blue via-blue-700 to-purple-700">
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      <div className="relative text-center text-white max-w-6xl w-full">
        {/* Hero Section */}
        <div className="mb-16 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              BY
            </span>
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 text-blue-100">
            Bet on Yourself
          </p>
          <p className="text-base sm:text-lg lg:text-xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Transform your goals into achievements through financial commitment and community accountability
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 animate-slide-in">
            <div className="text-primary-green mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-300 mb-4">✅ Backend Complete</h3>
            <ul className="space-y-2 text-left text-white/90">
              <li className="flex items-center"><span className="mr-2">🔐</span>JWT Authentication & Security</li>
              <li className="flex items-center"><span className="mr-2">⚡</span>3-Button Check-in System</li>
              <li className="flex items-center"><span className="mr-2">💳</span>Stripe Payment Integration</li>
              <li className="flex items-center"><span className="mr-2">🐳</span>Docker Containerization</li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 animate-slide-in">
            <div className="text-blue-300 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-blue-300 mb-4">⚛️ Frontend Ready</h3>
            <ul className="space-y-2 text-left text-white/90">
              <li className="flex items-center"><span className="mr-2">⚛️</span>React + TypeScript</li>
              <li className="flex items-center"><span className="mr-2">🏪</span>Zustand State Management</li>
              <li className="flex items-center"><span className="mr-2">🎯</span>Interactive Check-in UI</li>
              <li className="flex items-center"><span className="mr-2">🔄</span>Real-time Integration</li>
            </ul>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-primary px-8 py-4 text-lg w-full sm:w-auto min-w-[200px] transform hover:scale-105 transition-transform"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login & Test
            </span>
          </button>
          <button 
            onClick={() => window.location.href = '/register'}
            className="btn-outline border-2 border-white text-white px-8 py-4 text-lg w-full sm:w-auto min-w-[200px] transform hover:scale-105 transition-transform"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Get Started
            </span>
          </button>
        </div>

        {/* Status Footer */}
        <div className="text-center text-white/75 text-sm">
          <div className="inline-flex items-center space-x-6 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Backend: localhost:5186
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
              Frontend: localhost:3000
            </span>
          </div>
          <p className="mt-4 text-white/60">Ready for production deployment! 🚀</p>
        </div>
      </div>
    </div>
  </div>
)

// Main App Component
function App() {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Routes */}
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
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold mb-4">Registration Coming Soon!</h1>
                      <p className="text-gray-600 mb-4">Backend registration API is ready</p>
                      <a href="/login" className="text-blue-600 hover:underline">
                        Go to Login
                      </a>
                    </div>
                  </div>
                </PublicRoute>
              }
            />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        <Toaster position="top-right" expand={false} richColors closeButton />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
