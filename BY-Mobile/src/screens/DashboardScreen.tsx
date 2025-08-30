import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BY!</Text>
      <Text style={styles.subtitle}>Your accountability journey starts here</Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>Hello, {user.firstName || user.username}!</Text>
          <Text style={styles.emailText}>{user.email}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>?? Your Goals</Text>
        <Text style={styles.cardText}>No active goals yet. Create your first goal to start betting on yourself!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>?? Your Progress</Text>
        <Text style={styles.cardText}>Your accountability journey will be tracked here.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>?? Financial Commitment</Text>
        <Text style={styles.cardText}>Put your money where your goals are. Real stakes = real results.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  userInfo: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});