import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { FlowRoute, getProgressForRoute, getStepOrder } from '../types/navigation';

export type FlowAnswers = {
  ageRange: string | null;
  goals: string[];
  diet: string | null;
  activityLevel: string | null;
  notificationFrequency: string | null;
  notificationTime: string | null;
};

export type FlowState = {
  currentRoute: FlowRoute;
  currentStep: number;
  totalSteps: number;
  answers: FlowAnswers;
  sessionId: string | null;
  isSyncing: boolean;
  error: string | null;
  lastSavedAt: string | null;
};

const initialState: FlowState = {
  currentRoute: 'Welcome',
  currentStep: 1,
  totalSteps: 5,
  answers: {
    ageRange: null,
    goals: [],
    diet: null,
    activityLevel: null,
    notificationFrequency: null,
    notificationTime: null,
  },
  sessionId: null,
  isSyncing: false,
  error: null,
  lastSavedAt: null,
};

type Action =
  | { type: 'SET_ANSWER'; payload: Partial<FlowAnswers> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'SET_TOTAL_STEPS'; payload: number }
  | { type: 'NAVIGATE'; payload: FlowRoute }
  | { type: 'RESTORE_STATE'; payload: FlowState }
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const flowReducer = (state: FlowState, action: Action): FlowState => {
  switch (action.type) {
    case 'SET_ANSWER':
      return { ...state, answers: { ...state.answers, ...action.payload } };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, state.totalSteps) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_TOTAL_STEPS':
      return { ...state, totalSteps: action.payload };
    case 'NAVIGATE':
      return {
        ...state,
        currentRoute: action.payload,
        currentStep: getProgressForRoute(action.payload, state.answers.goals),
        totalSteps: getStepOrder(state.answers.goals).length,
      };
    case 'RESTORE_STATE':
      return {
        ...action.payload,
        currentRoute: action.payload.currentRoute ?? 'Welcome',
        currentStep:
          action.payload.currentRoute
            ? getProgressForRoute(action.payload.currentRoute, action.payload.answers.goals)
            : action.payload.currentStep,
        totalSteps: getStepOrder(action.payload.answers.goals).length,
        isSyncing: false,
        error: null,
      };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return { ...initialState, sessionId: state.sessionId };
    default:
      return state;
  }
};

type FlowContextType = {
  state: FlowState;
  dispatch: React.Dispatch<Action>;
};

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const FlowProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(flowReducer, initialState);

  return (
    <FlowContext.Provider value={{ state, dispatch }}>
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};
