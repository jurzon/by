import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { Button } from '@/components/Button';
import { useGoalStore } from '@/store/goalStore';
import { colors, spacing, borderRadius, fontSize, shadow } from '@/constants/theme';
import { Goal, CheckInRequest } from '@/types';

interface CheckInCardProps {
  goal: Goal;
  onCheckIn: (goalId: string, completed: boolean, notes?: string) => void;
  isLoading: boolean;
}

const CheckInCard: React.FC<CheckInCardProps> = ({
  goal,
  onCheckIn,
  isLoading,
}) => {
  const [selectedResult, setSelectedResult] = useState<boolean | null>(null);

  const handleCheckIn = (completed: boolean) => {
    setSelectedResult(completed);
    
    Alert.alert(
      completed ? '?? Great Job!' : '?? Keep Going!',
      completed 
        ? '? Congratulations on completing your goal today!'
        : '?? Tomorrow is a new opportunity to succeed!',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setSelectedResult(null),
        },
        {
          text: '? Confirm',
          onPress: () => {
            onCheckIn(goal.id, completed);
            setSelectedResult(null);
          },
        },
      ]
    );
  };

  const getCategoryEmoji = () => {
    const categoryEmojis = {
      0: '??', // Fitness
      1: '??', // Learning
      2: '??', // Habits
      3: '??', // Finance
      4: '??', // Career
      5: '??', // Health
      6: '??', // Personal
      7: '?', // Other
    };
    return categoryEmojis[goal.category as keyof typeof categoryEmojis] || '??';
  };

  return (
    <View style={[styles.checkInCard, shadow.lg]}>
      <View style={styles.goalInfo}>
        <View style={styles.goalTitleRow}>
          <Text style={styles.goalEmoji}>{getCategoryEmoji()}</Text>
          <Text style={styles.goalTitle}>{goal.title}</Text>
        </View>
        <Text style={styles.goalDescription} numberOfLines={2}>
          {goal.description || 'Building accountability through daily commitment'}
        </Text>
        
        <View style={styles.goalMetaContainer}>
          <View style={styles.goalMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaEmoji}>??</Text>
              <Text style={styles.metaValue}>{goal.currentStreak}</Text>
              <Text style={styles.metaLabel}>Day Streak</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaEmoji}>??</Text>
              <Text style={styles.metaValue}>${goal.dailyStakeAmount}</Text>
              <Text style={styles.metaLabel}>Daily Stake</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaEmoji}>??</Text>
              <Text style={styles.metaValue}>{Math.round(goal.progressPercentage)}%</Text>
              <Text style={styles.metaLabel}>Progress</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.checkInSection}>
        <Text style={styles.checkInTitle}>
          ?? Did you complete your goal today?
        </Text>
        <Text style={styles.checkInDate}>
          ?? {format(new Date(), 'EEEE, MMMM dd, yyyy')}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.checkInButton, styles.successButton]}
            onPress={() => handleCheckIn(true)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.successButtonEmoji}>?</Text>
            <Text style={styles.successButtonText}>Yes, I did it!</Text>
            <Text style={styles.buttonSubtext}>Keep the streak going</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkInButton, styles.failureButton]}
            onPress={() => handleCheckIn(false)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.failureButtonEmoji}>?</Text>
            <Text style={styles.failureButtonText}>No, I missed it</Text>
            <Text style={styles.buttonSubtext}>Tomorrow is a new day</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const CheckInScreen: React.FC = () => {
  const {
    activeGoals,
    isLoading,
    isUpdating,
    error,
    checkIn,
    fetchActiveGoals,
  } = useGoalStore();

  React.useEffect(() => {
    fetchActiveGoals();
  }, [fetchActiveGoals]);

  const handleCheckIn = async (goalId: string, completed: boolean, notes?: string) => {
    const request: CheckInRequest = {
      completed,
      notes,
    };

    const success = await checkIn(goalId, request);
    
    if (success) {
      Alert.alert(
        completed ? '?? Success!' : '?? Recorded!',
        completed 
          ? '? Great job! Your progress has been recorded.'
          : '?? Thanks for being honest. Tomorrow is a new opportunity!',
        [{ text: '?? OK' }]
      );
    } else {
      Alert.alert(
        '?? Check-in Failed',
        error || 'Failed to record your check-in. Please try again.',
        [{ text: '?? OK' }]
      );
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>??</Text>
      <Text style={styles.emptyTitle}>?? No Active Goals</Text>
      <Text style={styles.emptyDescription}>
        ?? Create some goals to start your daily check-ins and build accountability through financial commitment
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>??</Text>
          <Text style={styles.loadingText}>Loading your goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>? Daily Check-In</Text>
        <Text style={styles.headerSubtitle}>
          ?? Be honest with yourself - accountability starts here
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>??</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {activeGoals.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView 
          style={styles.checkInList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeGoals.map((goal) => (
            <CheckInCard
              key={goal.id}
              goal={goal}
              onCheckIn={handleCheckIn}
              isLoading={isUpdating}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.danger[50],
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger[500],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorEmoji: {
    fontSize: 24,
  },
  errorText: {
    color: colors.danger[700],
    fontSize: fontSize.sm,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingEmoji: {
    fontSize: 48,
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  checkInList: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  checkInCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  goalInfo: {
    marginBottom: spacing.xl,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalEmoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  goalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  goalDescription: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  goalMetaContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaEmoji: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontWeight: '500',
  },
  checkInSection: {
    alignItems: 'center',
  },
  checkInTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  checkInDate: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xl,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.lg,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    minHeight: 80,
    ...shadow.md,
  },
  successButton: {
    backgroundColor: colors.success[500],
  },
  successButtonEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  successButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.inverse,
    flex: 1,
    textAlign: 'center',
  },
  failureButton: {
    backgroundColor: colors.danger[500],
  },
  failureButtonEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  failureButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.inverse,
    flex: 1,
    textAlign: 'center',
  },
  buttonSubtext: {
    fontSize: fontSize.xs,
    color: colors.text.inverse,
    opacity: 0.8,
    position: 'absolute',
    bottom: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
});