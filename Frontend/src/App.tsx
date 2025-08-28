import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

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

// Placeholder components for now
const LandingPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
    <div className="text-center text-white max-w-4xl px-6">
      <h1 className="text-6xl font-bold mb-4">BY</h1>
      <p className="text-2xl mb-2">Bet on Yourself</p>
      <p className="text-lg mb-8 opacity-90">Accountability Through Action & Financial Commitment</p>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">? Backend Complete!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-green-500/20 rounded p-3">
            <p className="font-semibold">?? Authentication</p>
            <p>JWT with refresh tokens</p>
          </div>
          <div className="bg-green-500/20 rounded p-3">
            <p className="font-semibold">?? Goals & Check-ins</p>
            <p>3-button system ready</p>
          </div>
          <div className="bg-green-500/20 rounded p-3">
            <p className="font-semibold">?? Stripe Payments</p>
            <p>Real payment processing</p>
          </div>
        </div>
      </div>

      <div className="space-x-4">
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Login
        </button>
        <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
          Get Started
        </button>
      </div>
      
      <div className="mt-8 text-sm opacity-75">
        <p>?? Docker environment running at localhost:5186</p>
        <p>?? Frontend development at localhost:3000</p>
      </div>
    </div>
  </div>
);

const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6">Login to BY</h1>
      <div className="text-center text-gray-500">
        <p>?? Login component coming soon!</p>
        <p className="mt-2">Backend authentication ready</p>
      </div>
    </div>
  </div>
);

const DashboardPage = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">BY Dashboard</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">?? 3-Button Check-In System</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-3xl mb-2">?</div>
            <p className="font-semibold text-green-800">YES</p>
            <p className="text-sm text-green-600">I completed it!</p>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="text-3xl mb-2">?</div>
            <p className="font-semibold text-red-800">NO</p>
            <p className="text-sm text-red-600">I failed (pay up!)</p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <div className="text-3xl mb-2">?</div>
            <p className="font-semibold text-yellow-800">LATER</p>
            <p className="text-sm text-yellow-600">Remind me later</p>
          </div>
        </div>
        <p className="mt-4 text-center text-gray-600">
          Components coming next! Backend APIs ready.
        </p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        <Toaster position="top-right" expand={false} richColors closeButton />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
