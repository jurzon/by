import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Screens
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { CheckInScreen } from '@/screens/CheckInScreen';

// Store
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/theme';

// Types
import { RootStackParamList, TabParamList } from '@/types';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab Navigator for authenticated users
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border.light,
        },
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <View style={{ padding: 2 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: focused ? colors.primary[500] : 'transparent',
                }}
              />
            </View>
          ),
          headerTitle: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{
          tabBarLabel: 'Check In',
          tabBarIcon: ({ focused }) => (
            <View style={{ padding: 2 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: focused ? colors.primary[500] : 'transparent',
                }}
              />
            </View>
          ),
          headerTitle: 'Daily Check-In',
        }}
      />
      <Tab.Screen
        name="Goals"
        component={DashboardScreen} // Placeholder for now
        options={{
          tabBarLabel: 'Goals',
          tabBarIcon: ({ focused }) => (
            <View style={{ padding: 2 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: focused ? colors.primary[500] : 'transparent',
                }}
              />
            </View>
          ),
          headerTitle: 'My Goals',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DashboardScreen} // Placeholder for now
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={{ padding: 2 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: focused ? colors.primary[500] : 'transparent',
                }}
              />
            </View>
          ),
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Navigator for unauthenticated users
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

// Loading component
const LoadingScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
    }}
  >
    <ActivityIndicator size="large" color={colors.primary[500]} />
  </View>
);

export default function App() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load user from storage
        await loadUser();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [loadUser]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={colors.background.primary} />
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}