import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from './ProgressBar';
import { PrimaryButton } from './PrimaryButton';
import { useFlow } from '../context/FlowContext';
import { useProgress } from '../hooks/useProgress';
import { theme } from '../constants/theme';
import { getPreviousRoute } from '../types/navigation';

interface StepLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isNextDisabled?: boolean;
  onNext: () => void;
  showBack?: boolean;
  isSaving?: boolean;
}

export const StepLayout: React.FC<StepLayoutProps> = ({
  title,
  subtitle,
  children,
  isNextDisabled = false,
  onNext,
  showBack = true,
  isSaving = false,
}) => {
  const { state, dispatch } = useFlow();
  const { retrySaveState } = useProgress();

  const handleBack = () => {
    dispatch({ type: 'NAVIGATE', payload: getPreviousRoute(state.currentRoute, state.answers.goals) });
  };

  const handleRetrySync = async () => {
    await retrySaveState(state);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundOrbOne} />
      <View style={styles.backgroundOrbTwo} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.shell}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.stepLabel}>Guided intake</Text>
                <Text style={styles.stepText}>Step {state.currentStep} of {state.totalSteps}</Text>
              </View>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{Math.round((state.currentStep / state.totalSteps) * 100)}%</Text>
              </View>
            </View>
            <ProgressBar currentStep={state.currentStep} totalSteps={state.totalSteps} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            {state.error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorTitle}>Sync paused</Text>
                <Text style={styles.errorText}>{state.error}</Text>
                <PrimaryButton
                  title="Retry sync"
                  onPress={handleRetrySync}
                  variant="secondary"
                  style={styles.retryButton}
                />
              </View>
            ) : null}
            
            <View style={styles.content}>
              {children}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {showBack && (
              <PrimaryButton
                title="Back"
                onPress={handleBack}
                variant="secondary"
                style={styles.backButton}
                disabled={isSaving}
              />
            )}
            <PrimaryButton
              title={state.currentStep === state.totalSteps ? "Complete" : "Next"}
              onPress={onNext}
              disabled={isNextDisabled}
              loading={isSaving}
              style={styles.nextButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundOrbOne: {
    position: 'absolute',
    top: 30,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.accentSoft,
  },
  backgroundOrbTwo: {
    position: 'absolute',
    bottom: 80,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.backgroundAccent,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  shell: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.dialog,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  stepLabel: {
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stepText: {
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.xs,
  },
  stepBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.surfaceHighlight,
  },
  stepBadgeText: {
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  titleContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  errorBanner: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.sm,
    marginBottom: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.sm,
  },
  retryButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  nextButton: {
    flex: 2,
  },
});
