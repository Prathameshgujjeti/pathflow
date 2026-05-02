import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { getStepOrder } from '../../types/navigation';
import { StepLayout } from '../../components/StepLayout';
import { RadioGroup } from '../../components/RadioGroup';
import { useFlow } from '../../context/FlowContext';
import { useProgress } from '../../hooks/useProgress';
import { theme } from '../../constants/theme';

const DIET_OPTIONS = [
  { label: 'No specific diet', value: 'None' },
  { label: 'Vegetarian', value: 'Vegetarian' },
  { label: 'Vegan', value: 'Vegan' },
  { label: 'Keto', value: 'Keto' },
  { label: 'Paleo', value: 'Paleo' },
];

const ACTIVITY_OPTIONS = [
  { label: 'Sedentary (office job)', value: 'Sedentary' },
  { label: 'Lightly active', value: 'Lightly active' },
  { label: 'Moderately active', value: 'Moderately active' },
  { label: 'Very active', value: 'Very active' },
];

export default function Step3Preferences() {
  const { state, dispatch } = useFlow();
  const { saveCurrentState } = useProgress();

  const handleNext = async () => {
    const order = getStepOrder(state.answers.goals);
    const hasNotifications = order.includes(4);
    const nextRoute = hasNotifications ? ('Step4' as const) : ('Step5' as const);
    const nextProgressStep = hasNotifications ? 4 : 4;
    const nextState = {
      ...state,
      currentRoute: nextRoute,
      currentStep: nextProgressStep,
      totalSteps: order.length,
    };

    dispatch({ type: 'NAVIGATE', payload: nextRoute });
    await saveCurrentState(nextState);
  };

  const isComplete = !!state.answers.diet && !!state.answers.activityLevel;

  return (
    <StepLayout
      title="Lifestyle Preferences"
      subtitle="Tell us a bit about your daily life."
      onNext={handleNext}
      isNextDisabled={!isComplete}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Diet</Text>
        <RadioGroup
          options={DIET_OPTIONS}
          selectedValue={state.answers.diet}
          onSelect={(value) => dispatch({ type: 'SET_ANSWER', payload: { diet: value } })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Level</Text>
        <RadioGroup
          options={ACTIVITY_OPTIONS}
          selectedValue={state.answers.activityLevel}
          onSelect={(value) => dispatch({ type: 'SET_ANSWER', payload: { activityLevel: value } })}
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
