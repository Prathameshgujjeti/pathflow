import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from './PrimaryButton';

interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface ThemedDialogProps {
  visible: boolean;
  title: string;
  message: string;
  primaryAction: DialogAction;
  secondaryAction?: DialogAction;
}

export const ThemedDialog: React.FC<ThemedDialogProps> = ({
  visible,
  title,
  message,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Plan ready</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {secondaryAction ? (
              <PrimaryButton
                title={secondaryAction.label}
                onPress={secondaryAction.onPress}
                variant={secondaryAction.variant ?? 'secondary'}
                style={styles.button}
              />
            ) : null}
            <PrimaryButton
              title={primaryAction.label}
              onPress={primaryAction.onPress}
              variant={primaryAction.variant ?? 'primary'}
              style={styles.button}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.dialog,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.pill,
    marginBottom: theme.spacing.lg,
  },
  badgeText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.sm,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.xl,
    marginBottom: theme.spacing.sm,
  },
  message: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.md,
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  actions: {
    gap: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
});
