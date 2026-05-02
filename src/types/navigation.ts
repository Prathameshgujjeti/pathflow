export type RootStackParamList = {
  Welcome: undefined;
  Step1: undefined;
  Step2: undefined;
  Step3: undefined;
  Step4: undefined;
  Step5: undefined;
  Error: { message: string };
};

export type FlowRoute = keyof RootStackParamList;

// Define which goals trigger the notification step
const TIME_SENSITIVE_GOALS = ['Daily Exercise', 'Sleep Better', 'Drink More Water'];

export const getStepOrder = (goals: string[]): number[] => {
  const needsNotifications = goals.some(g => TIME_SENSITIVE_GOALS.includes(g));
  return needsNotifications ? [1, 2, 3, 4, 5] : [1, 2, 3, 5];
};

export const getPreviousRoute = (route: FlowRoute, goals: string[]): FlowRoute => {
  switch (route) {
    case 'Step2':
      return 'Step1';
    case 'Step3':
      return 'Step2';
    case 'Step4':
      return 'Step3';
    case 'Step5':
      return getStepOrder(goals).includes(4) ? 'Step4' : 'Step3';
    default:
      return 'Welcome';
  }
};

export const getProgressForRoute = (route: FlowRoute, goals: string[]): number => {
  const order = getStepOrder(goals);

  if (route === 'Welcome' || route === 'Error') {
    return 1;
  }

  const routeStepNumber = Number(route.replace('Step', ''));
  const routeIndex = order.indexOf(routeStepNumber);
  return routeIndex >= 0 ? routeIndex + 1 : 1;
};
