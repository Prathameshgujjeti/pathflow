import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { StepLayout } from '../../components/StepLayout';
import { ThemedDialog } from '../../components/ThemedDialog';
import { useFlow } from '../../context/FlowContext';
import { useProgress } from '../../hooks/useProgress';
import { theme } from '../../constants/theme';

export default function Step5Summary() {
  const { state, dispatch } = useFlow();
  const { saveCurrentState, startNewSession } = useProgress();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await saveCurrentState(state);
      setShowDialog(true);
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Saved locally. We will sync when the connection is available.' });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleStartOver = async () => {
    setShowDialog(false);
    await startNewSession();
    dispatch({ type: 'NAVIGATE', payload: 'Welcome' });
  };

  const handleEdit = (routeName: 'Step1' | 'Step2' | 'Step3' | 'Step4') => {
    dispatch({ type: 'NAVIGATE', payload: routeName });
  };

  return (
    <>
      <StepLayout
        title="Your plan summary"
        subtitle="Review the choices shaping your guided wellness flow."
        onNext={handleComplete}
        isSaving={isCompleting || state.isSyncing}
      >
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Assessment snapshot</Text>
          <SummaryItem
            label="Age Range"
            value={state.answers.ageRange || 'Not set'}
            onEdit={() => handleEdit('Step1')}
          />

          <View style={styles.divider} />

          <SummaryItem
            label="Primary Goals"
            value={state.answers.goals.join(', ') || 'Not set'}
            onEdit={() => handleEdit('Step2')}
          />

          <View style={styles.divider} />

          <SummaryItem
            label="Diet & Activity"
            value={`${state.answers.diet || 'N/A'} / ${state.answers.activityLevel || 'N/A'}`}
            onEdit={() => handleEdit('Step3')}
          />

          {state.totalSteps === 5 ? (
            <>
              <View style={styles.divider} />
              <SummaryItem
                label="Reminders"
                value={`${state.answers.notificationFrequency || 'N/A'} at ${state.answers.notificationTime || 'N/A'}`}
                onEdit={() => handleEdit('Step4')}
              />
            </>
          ) : null}
        </View>
      </StepLayout>

      <ThemedDialog
        visible={showDialog}
        title="Journey configured"
        message="Your wellness setup has been saved. You can restart the assessment or keep this session on the device and continue refining it later."
        secondaryAction={{
          label: 'Keep editing',
          onPress: () => setShowDialog(false),
          variant: 'secondary',
        }}
        primaryAction={{
          label: 'Start over',
          onPress: handleStartOver,
          variant: 'primary',
        }}
      />
    </>
  );
}

const SummaryItem = ({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) => (
  <View style={styles.itemRow}>
    <View style={styles.itemContent}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
    <TouchableOpacity onPress={onEdit} style={styles.editButton}>
      <Text style={styles.editButtonText}>Edit</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  cardHeader: {
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  itemContent: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  itemLabel: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  itemValue: {
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  editButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.pill,
  },
  editButtonText: {
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
});
