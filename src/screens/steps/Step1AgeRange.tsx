import React from 'react';
import { StepLayout } from '../../components/StepLayout';
import { RadioGroup } from '../../components/RadioGroup';
import { useFlow } from '../../context/FlowContext';
import { useProgress } from '../../hooks/useProgress';

const AGE_OPTIONS = [
  { label: 'Under 18', value: '<18' },
  { label: '18 - 24', value: '18-24' },
  { label: '25 - 34', value: '25-34' },
  { label: '35 - 44', value: '35-44' },
  { label: '45 - 54', value: '45-54' },
  { label: '55 and over', value: '55+' },
];

export default function Step1AgeRange() {
  const { state, dispatch } = useFlow();
  const { saveCurrentState } = useProgress();

  const handleNext = async () => {
    const nextState = { ...state, currentRoute: 'Step2' as const, currentStep: 2 };
    dispatch({ type: 'NAVIGATE', payload: 'Step2' });
    await saveCurrentState(nextState);
  };

  return (
    <StepLayout
      title="What is your age range?"
      subtitle="This helps us tailor your wellness journey."
      onNext={handleNext}
      isNextDisabled={!state.answers.ageRange}
      showBack={false}
    >
      <RadioGroup
        options={AGE_OPTIONS}
        selectedValue={state.answers.ageRange}
        onSelect={(value) => dispatch({ type: 'SET_ANSWER', payload: { ageRange: value } })}
      />
    </StepLayout>
  );
}
