import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';

import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, borderRadius, fontSize, shadow } from '@/constants/theme';
import { LoginFormData } from '@/types';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: 'test@example.com',
      password: 'Test123!',
      rememberMe: false,
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data.email, data.password, data.rememberMe);
    
    if (success) {
      // Navigation will be handled by the auth state change
    } else {
      Alert.alert(
        '?? Login Failed', 
        error || 'Please check your credentials and try again.',
        [{ text: '?? Try Again', style: 'default' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* App Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>??</Text>
            </View>
            <Text style={styles.appName}>BY</Text>
            <Text style={styles.tagline}>Bet on Yourself</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.header}>
            <Text style={styles.title}>?? Welcome Back</Text>
            <Text style={styles.subtitle}>
              ?? Sign in to continue tracking your accountability goals
            </Text>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorEmoji}>??</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>?? Email Address</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.email && styles.inputError,
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.text.tertiary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>?? {errors.email.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>?? Password</Text>
              <View style={styles.passwordContainer}>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors.password && styles.inputError,
                      ]}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.text.tertiary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? '??' : '???'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>?? {errors.password.message}</Text>
              )}
            </View>

            <Button
              title="?? Sign In"
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
              loading={isLoading}
              style={styles.submitButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                ?? Don't have an account?{' '}
              </Text>
              <Button
                title="? Sign Up"
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate('Register' as never)}
                style={styles.signUpButton}
              />
            </View>

            {/* Test Credentials Display */}
            <View style={styles.testCredentials}>
              <Text style={styles.testCredentialsTitle}>?? Test Credentials</Text>
              <Text style={styles.testCredentialsText}>
                ?? User: test@example.com / Test123!{'\n'}
                ?? Admin: admin@byapp.com / Admin123!
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadow.lg,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: fontSize['4xl'],
    fontWeight: '900',
    color: colors.primary[500],
    marginBottom: spacing.xs,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.danger[50],
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger[500],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadow.sm,
  },
  errorEmoji: {
    fontSize: 20,
  },
  errorText: {
    color: colors.danger[700],
    fontSize: fontSize.sm,
    flex: 1,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    ...shadow.sm,
  },
  inputError: {
    borderColor: colors.danger[500],
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: spacing['3xl'],
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    padding: spacing.sm,
  },
  passwordToggleText: {
    fontSize: 20,
  },
  submitButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadow.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    paddingHorizontal: spacing.lg,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  signUpButton: {
    minWidth: 120,
  },
  testCredentials: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  testCredentialsTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  testCredentialsText: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});