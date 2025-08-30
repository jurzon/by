import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/Button';
import { useGoalStore } from '@/store/goalStore';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, borderRadius, fontSize, shadow } from '@/constants/theme';
import { Goal, GoalCategory } from '@/types';

const getCategoryEmoji = (category: GoalCategory): string => {
  const emojiMap = {
    [GoalCategory.Fitness]: '??',
    [GoalCategory.Learning]: '??',
    [GoalCategory.Habits]: '??',
    [GoalCategory.Finance]: '??',
    [GoalCategory.Career]: '??',
    [GoalCategory.Health]: '??',
    [GoalCategory.Personal]: '?',
    [GoalCategory.Other]: '??',
  };
  return emojiMap[category] || '??';
};

const getCategoryColor = (category: GoalCategory): string => {
  const colorMap = {
    [GoalCategory.Fitness]: colors.success[500],
    [GoalCategory.Learning]: colors.primary[500],
    [GoalCategory.Habits]: colors.accent.purple,
    [GoalCategory.Finance]: colors.success[600],
    [GoalCategory.Career]: colors.primary[600],
    [GoalCategory.Health]: colors.danger[500],
    [GoalCategory.Personal]: colors.accent.pink,
    [GoalCategory.Other]: colors.neutral[500],
  };
  return colorMap[category] || colors.neutral[500];
};

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress }) => {
  const progressColor = goal.progressPercentage >= 70 ? colors.success[500] :
                       goal.progressPercentage >= 40 ? colors.warning[500] :
                       colors.danger[500];

  return (
    <TouchableOpacity 
      style={[styles.goalCard, shadow.md]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.emojiContainer, { backgroundColor: getCategoryColor(goal.category) + '20' }]}>
            <Text style={styles.categoryEmoji}>{getCategoryEmoji(goal.category)}</Text>
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
            <Text style={styles.goalDescription} numberOfLines={1}>
              {goal.description || 'Daily accountability goal'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>??</Text>
          <Text style={styles.statNumber}>{goal.currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>??</Text>
          <Text style={styles.statNumber}>{Math.round(goal.progressPercentage)}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>??</Text>
          <Text style={styles.statNumber}>${goal.totalStakeAmount}</Text>
          <Text style={styles.statLabel}>Stake</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${Math.min(goal.progressPercentage, 100)}%`,
                backgroundColor: progressColor
              }
            ]} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();
  const {
    activeGoals,
    isLoading,
    error,
    fetchActiveGoals,
    clearError,
  } = useGoalStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchActiveGoals();
    }, [fetchActiveGoals])
  );

  const handleRefresh = () => {
    clearError();
    fetchActiveGoals();
  };

  const handleGoalPress = (goalId: string) => {
    Alert.alert('Goal Details', `View details for goal: ${goalId}`);
  };

  const handleCreateGoal = () => {
    Alert.alert('Create Goal', 'Navigate to create goal screen');
  };

  const totalStaked = activeGoals.reduce((sum, goal) => sum + goal.totalStakeAmount, 0);
  const bestStreak = Math.max(...activeGoals.map(g => g.currentStreak), 0);

  const renderGoalCard = ({ item }: { item: Goal }) => (
    <GoalCard
      goal={item}
      onPress={() => handleGoalPress(item.id)}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Welcome Section */}
      <View style={[styles.welcomeCard, shadow.lg]}>
        <Text style={styles.greeting}>
          Hello, {user?.firstName || 'Test User'}!
        </Text>
        <Text style={styles.subtitle}>
          Keep up the great work with your accountability goals
        </Text>
        
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <View style={styles.quickStatIcon}>
              <Text style={styles.quickStatEmoji}>??</Text>
            </View>
            <Text style={styles.quickStatValue}>{activeGoals.length}</Text>
            <Text style={styles.quickStatLabel}>Active Goals</Text>
          </View>
          
          <View style={styles.quickStatItem}>
            <View style={styles.quickStatIcon}>
              <Text style={styles.quickStatEmoji}>??</Text>
            </View>
            <Text style={styles.quickStatValue}>${totalStaked}</Text>
            <Text style={styles.quickStatLabel}>Total Staked</Text>
          </View>
          
          <View style={styles.quickStatItem}>
            <View style={styles.quickStatIcon}>
              <Text style={styles.quickStatEmoji}>??</Text>
            </View>
            <Text style={styles.quickStatValue}>{bestStreak}</Text>
            <Text style={styles.quickStatLabel}>Best Streak</Text>
          </View>
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Active Goals</Text>
        <TouchableOpacity 
          style={[styles.addButton, shadow.sm]}
          onPress={handleCreateGoal}
        >
          <Text style={styles.addButtonText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBox}>
        <Text style={styles.emptyIcon}>??</Text>
      </View>
      <Text style={styles.emptyTitle}>Start Your Journey</Text>
      <Text style={styles.emptyDescription}>
        Create your first accountability goal and bet on yourself to achieve it!
      </Text>
      <TouchableOpacity 
        style={[styles.createButton, shadow.lg]}
        onPress={handleCreateGoal}
      >
        <Text style={styles.createButtonText}>Create Your First Goal</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorIcon}>??</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>??</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={activeGoals}
          keyExtractor={(item) => item.id}
          renderItem={renderGoalCard}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={colors.primary[500]}
            />
          }
          ListEmptyComponent={!isLoading ? renderEmptyState : null}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  safeArea: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: colors.primary[500],
    margin: spacing.lg,
    padding: spacing['2xl'],
    borderRadius: borderRadius['2xl'],
  },
  greeting: {
    fontSize: fontSize['3xl'],
    fontWeight: '800',
    color: colors.text.inverse,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.text.inverse,
    opacity: 0.9,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickStatEmoji: {
    fontSize: 20,
  },
  quickStatValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.inverse,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: fontSize.xs,
    color: colors.text.inverse,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.accent.purple,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  addButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  errorBanner: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.danger[50],
    borderRadius: borderRadius.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger[500],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorIcon: {
    fontSize: 24,
  },
  errorText: {
    color: colors.danger[700],
    fontSize: fontSize.sm,
    flex: 1,
    fontWeight: '500',
  },
  retryButton: {
    padding: spacing.sm,
  },
  retryText: {
    fontSize: 20,
  },
  listContent: {
    paddingBottom: spacing['2xl'],
  },
  goalCard: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  titleColumn: {
    flex: 1,
  },
  goalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  goalDescription: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  statNumber: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: '500',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  emptyIcon: {
    fontSize: 48,
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
    marginBottom: spacing.xl,
    lineHeight: 24,
    maxWidth: 280,
  },
  createButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
  },
  createButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.base,
    fontWeight: '600',
    textAlign: 'center',
  },
});