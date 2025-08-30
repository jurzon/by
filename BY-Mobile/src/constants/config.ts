import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = (): string => {
  // For development
  if (__DEV__) {
    if (Platform.OS === 'web') {
      // Try local first, then Docker
      return 'http://localhost:5185'; // Local .NET dev server
      // If using Docker, change to: 'http://localhost:5186'
    }
    // For mobile simulators/devices, use your computer's IP
    return 'http://192.168.1.100:5185'; // Replace with your actual IP
    // If using Docker, change to: 'http://192.168.1.100:5186'
  }
  
  // For production, use your deployed API URL
  return 'https://your-api-domain.com';
};

export const config = {
  API_URL: getApiUrl(),
  API_VERSION: 'v1',
  
  // Auth
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  
  // App Info
  APP_NAME: 'BY - Bet on Yourself',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  
  // Timeouts
  API_TIMEOUT: 10000, // 10 seconds
};