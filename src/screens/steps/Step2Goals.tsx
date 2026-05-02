import React from 'react';
import { getStepOrder } from '../../types/navigation';
import { StepLayout } from '../../components/StepLayout';
import { MultiSelect } from '../../components/MultiSelect';
import { useFlow } from '../../context/FlowContext';
import { useProgress } from '../../hooks/useProgress';

const GOAL_OPTIONS = [
  { label: 'Daily Exercise', value: 'Daily Exercise' },
  { label: 'Sleep Better', value: 'Sleep Better' },
  { label: 'Drink More Water', value: 'Drink More Water' },
  { label: 'Reduce Stress', value: 'Reduce Stress' },
  { label: 'Eat Healthier', value: 'Eat Healthier' },
  { label: 'Build Muscle', value: 'Build Muscle' },
];

export default function Step2Goals() {
  const { state, dispatch } = useFlow();
  const { saveCurrentState } = useProgress();

  const handleToggle = (value: string) => {
    const currentGoals = state.answers.goals;
    const newGoals = currentGoals.includes(value)
      ? currentGoals.filter((g) => g !== value)
      : [...currentGoals, value];
      
    dispatch({ type: 'SET_ANSWER', payload: { goals: newGoals } });
  };

  const handleNext = async () => {
    const order = getStepOrder(state.answers.goals);
    const newTotalSteps = order.length;
    const nextState = {
      ...state,
      currentRoute: 'Step3' as const,
      totalSteps: newTotalSteps,
      currentStep: 3,
    };

    dispatch({ type: 'NAVIGATE', payload: 'Step3' });
    await saveCurrentState(nextState);
  };

  return (
    <StepLayout
      title="What are your primary goals?"
      subtitle="Select all that apply to you."
      onNext={handleNext}
      isNextDisabled={state.answers.goals.length === 0}
    >
      <MultiSelect
        options={GOAL_OPTIONS}
        selectedValues={state.answers.goals}
        onToggle={handleToggle}
      />
    </StepLayout>
  );
}
