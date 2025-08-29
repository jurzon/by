import React, { useEffect, useState } from 'react';
import { healthCheck } from '../lib/api';

interface ApiHealthProps {
  className?: string;
}

const ApiHealth: React.FC<ApiHealthProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      setStatus('checking');
      await healthCheck();
      setStatus('online');
      setLastCheck(new Date());
    } catch (error) {
      console.error('API Health check failed:', error);
      setStatus('offline');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'API Online';
      case 'offline': return 'API Offline';
      default: return 'Checking...';
    }
  };

  return (
    <div className={`flex items-center space-x-2 text-xs ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${status === 'checking' ? 'animate-pulse' : ''}`} />
      <span className="text-gray-600">{getStatusText()}</span>
      {lastCheck && (
        <span className="text-gray-400">
          ({lastCheck.toLocaleTimeString()})
        </span>
      )}
      {status === 'offline' && (
        <button
          onClick={checkHealth}
          className="text-blue-600 hover:text-blue-800 underline ml-2"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ApiHealth;