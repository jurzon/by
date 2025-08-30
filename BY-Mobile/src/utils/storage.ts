import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use SecureStore for native platforms, AsyncStorage for web
const isWeb = Platform.OS === 'web';

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.clear();
      } else {
        // For secure store, we need to manually remove known keys
        const keys = ['auth_token', 'refresh_token', 'user_data'];
        for (const key of keys) {
          await SecureStore.deleteItemAsync(key);
        }
      }
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};