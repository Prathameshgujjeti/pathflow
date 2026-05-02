import React from 'react';
import WelcomeScreen from '../screens/WelcomeScreen';
import Step1AgeRange from '../screens/steps/Step1AgeRange';
import Step2Goals from '../screens/steps/Step2Goals';
import Step3Preferences from '../screens/steps/Step3Preferences';
import Step4Notifications from '../screens/steps/Step4Notifications';
import Step5Summary from '../screens/steps/Step5Summary';
import ErrorScreen from '../screens/ErrorScreen';
import { useFlow } from '../context/FlowContext';
import { RootStackParamList, getStepOrder } from '../types/navigation';

export { RootStackParamList, getStepOrder };

export const FlowNavigator = () => {
  const { state } = useFlow();

  switch (state.currentRoute) {
    case 'Step1':
      return <Step1AgeRange />;
    case 'Step2':
      return <Step2Goals />;
    case 'Step3':
      return <Step3Preferences />;
    case 'Step4':
      return <Step4Notifications />;
    case 'Step5':
      return <Step5Summary />;
    case 'Error':
      return <ErrorScreen />;
    case 'Welcome':
    default:
      return <WelcomeScreen />;
  }
};
