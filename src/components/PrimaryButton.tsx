import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceStrong;
    if (variant === 'primary') return theme.colors.primary;
    if (variant === 'secondary') return theme.colors.surface;
    if (variant === 'danger') return theme.colors.error;
    return theme.colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    if (variant === 'secondary') return theme.colors.primary;
    return theme.colors.surface;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'secondary' && styles.secondaryButton,
        variant === 'primary' && styles.primaryButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButton: {
    ...theme.shadows.soft,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  text: {
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.md,
  },
});
