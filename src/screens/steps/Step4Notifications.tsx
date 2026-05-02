import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { StepLayout } from '../../components/StepLayout';
import { RadioGroup } from '../../components/RadioGroup';
import { useFlow } from '../../context/FlowContext';
import { useProgress } from '../../hooks/useProgress';
import { theme } from '../../constants/theme';

const FREQUENCY_OPTIONS = [
  { label: 'Once a day', value: 'Daily' },
  { label: 'Twice a day', value: 'Twice Daily' },
  { label: 'Weekly', value: 'Weekly' },
];

const TIME_OPTIONS = [
  { label: 'Morning (8:00 AM)', value: 'Morning' },
  { label: 'Afternoon (1:00 PM)', value: 'Afternoon' },
  { label: 'Evening (7:00 PM)', value: 'Evening' },
];

export default function Step4Notifications() {
  const { state, dispatch } = useFlow();
  const { saveCurrentState } = useProgress();

  const handleNext = async () => {
    const nextState = { ...state, currentRoute: 'Step5' as const, currentStep: 5 };
    dispatch({ type: 'NAVIGATE', payload: 'Step5' });
    await saveCurrentState(nextState);
  };

  const isComplete = !!state.answers.notificationFrequency && !!state.answers.notificationTime;

  return (
    <StepLayout
      title="Set Reminders"
      subtitle="Since you selected time-sensitive goals, when should we remind you?"
      onNext={handleNext}
      isNextDisabled={!isComplete}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminder Frequency</Text>
        <RadioGroup
          options={FREQUENCY_OPTIONS}
          selectedValue={state.answers.notificationFrequency}
          onSelect={(value) => dispatch({ type: 'SET_ANSWER', payload: { notificationFrequency: value } })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Time</Text>
        <RadioGroup
          options={TIME_OPTIONS}
          selectedValue={state.answers.notificationTime}
          onSelect={(value) => dispatch({ type: 'SET_ANSWER', payload: { notificationTime: value } })}
        />
      </View>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
});
