import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = (): string => {
  // For development
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:5185'; // Web can use localhost
    }
    // For mobile simulators/devices, use your computer's IP
    // You can get this by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
    return 'http://192.168.1.100:5185'; // Replace with your actual IP
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
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Notifications
  CHECK_IN_REMINDER_CHANNEL: 'check-in-reminders',
  
  // Timeouts
  API_TIMEOUT: 10000, // 10 seconds
  
  // Goal Constants
  MIN_GOAL_DURATION: 7, // 7 days
  MAX_GOAL_DURATION: 365, // 1 year
  MIN_STAKE_AMOUNT: 1,
  MAX_STAKE_AMOUNT: 1000,
  
  // Check-in Constants
  CHECK_IN_WINDOW_HOURS: 24, // Hours to complete check-in
};