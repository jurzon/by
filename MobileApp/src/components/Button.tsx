import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  View
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { ButtonProps } from '@/types';

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  style,
  children,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.6 : 1,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: colors.primary[500],
      },
      secondary: {
        backgroundColor: colors.secondary[100],
        borderWidth: 1,
        borderColor: colors.border.medium,
      },
      danger: {
        backgroundColor: colors.danger[500],
      },
      success: {
        backgroundColor: colors.success[500],
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary[500],
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: fontWeight.medium,
    };

    // Size styles
    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: fontSize.sm },
      md: { fontSize: fontSize.base },
      lg: { fontSize: fontSize.lg },
    };

    // Variant styles
    const variantStyles: Record<string, TextStyle> = {
      primary: { color: colors.text.inverse },
      secondary: { color: colors.text.primary },
      danger: { color: colors.text.inverse },
      success: { color: colors.text.inverse },
      outline: { color: colors.primary[500] },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'secondary' ? colors.primary[500] : colors.text.inverse}
          style={{ marginRight: title ? spacing.sm : 0 }}
        />
      )}
      {title && (
        <Text style={getTextStyle()}>
          {title}
        </Text>
      )}
      {children}
    </TouchableOpacity>
  );
};