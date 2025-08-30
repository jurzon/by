import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

// Store
import { useAuthStore } from './src/store/authStore';

// Types
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

export default function App() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    // Load user from storage on app start
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated screens
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          // Unauthenticated screens
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
