import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { useFlow, FlowState } from '../context/FlowContext';
import { saveProgress, loadProgress, listProgressSessions, SavedSessionSummary } from '../api/progress.api';

const STORAGE_KEY = '@health_path_flow_state';
const SESSION_KEY = '@health_path_session_id';
const DEVICE_KEY = '@health_path_device_id';

type LoadInitialStateResult = {
  hasSavedProgress: boolean;
  restoredFromCloud: boolean;
  restoredFromLocal: boolean;
  source: 'cloud' | 'local' | 'none';
};

const getComparableTimestamp = (state: FlowState | null): number => {
  if (!state?.lastSavedAt) {
    return 0;
  }

  const parsedTime = Date.parse(state.lastSavedAt);
  return Number.isNaN(parsedTime) ? 0 : parsedTime;
};

const hasMeaningfulProgress = (state: FlowState | null): boolean => {
  if (!state) {
    return false;
  }

  return state.currentRoute !== 'Welcome' || !!state.answers.ageRange;
};

export const useProgress = () => {
  const { dispatch } = useFlow();

  const initDevice = useCallback(async () => {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_KEY);
      if (!deviceId) {
        deviceId = Crypto.randomUUID();
        await AsyncStorage.setItem(DEVICE_KEY, deviceId);
      }

      return deviceId;
    } catch (e) {
      console.error('Failed to initialize device', e);
      return null;
    }
  }, []);

  // Initialize active session ID
  const initSession = useCallback(async () => {
    try {
      let sessionId = await AsyncStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        sessionId = Crypto.randomUUID();
        await AsyncStorage.setItem(SESSION_KEY, sessionId);
      }
      dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
      return sessionId;
    } catch (e) {
      console.error('Failed to initialize session', e);
      return null;
    }
  }, [dispatch]);

  // Load state from local storage first, then try Firebase
  const loadInitialState = useCallback(async (): Promise<LoadInitialStateResult> => {
    const [deviceId, sessionId] = await Promise.all([initDevice(), initSession()]);
    if (!deviceId || !sessionId) {
      return {
        hasSavedProgress: false,
        restoredFromCloud: false,
        restoredFromLocal: false,
        source: 'none',
      };
    }

    let restoredFromLocal = false;
    let restoredFromCloud = false;
    let hasSavedProgress = false;
    let source: LoadInitialStateResult['source'] = 'none';
    let localState: FlowState | null = null;

    try {
      const localData = await AsyncStorage.getItem(STORAGE_KEY);
      if (localData) {
        localState = JSON.parse(localData) as FlowState;
        restoredFromLocal = true;
      }

      const remoteData = await loadProgress(sessionId);

      const localTimestamp = getComparableTimestamp(localState);
      const remoteTimestamp = getComparableTimestamp(remoteData);

      if (localState && (!remoteData || localTimestamp >= remoteTimestamp)) {
        dispatch({ type: 'RESTORE_STATE', payload: localState });
        hasSavedProgress = hasMeaningfulProgress(localState);
        source = 'local';
      } else if (remoteData) {
        dispatch({ type: 'RESTORE_STATE', payload: remoteData });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
        restoredFromCloud = true;
        hasSavedProgress = hasMeaningfulProgress(remoteData);
        source = 'cloud';
      }

      return {
        hasSavedProgress,
        restoredFromCloud,
        restoredFromLocal,
        source,
      };
    } catch (e) {
      console.log('Using local data due to network/firebase issue', e);
      dispatch({ type: 'SET_ERROR', payload: 'Cloud sync is unavailable. You can retry or continue with local progress.' });
      return {
        hasSavedProgress,
        restoredFromCloud,
        restoredFromLocal,
        source: restoredFromLocal ? 'local' : 'none',
      };
    }
  }, [dispatch, initDevice, initSession]);

  // Save state (debounced implicitly by calling it on next/prev step)
  const saveCurrentState = useCallback(async (newState: FlowState) => {
    if (!newState.sessionId) return;

    const [deviceId, sessionId] = await Promise.all([initDevice(), Promise.resolve(newState.sessionId)]);
    if (!deviceId || !sessionId) {
      return;
    }
    
    dispatch({ type: 'SET_SYNCING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const persistedState: FlowState = {
      ...newState,
      sessionId,
      lastSavedAt: new Date().toISOString(),
    };
    
    try {
      // Save locally first so the flow survives app restarts while offline.
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
      
      // Sync the same snapshot to Firebase.
      await saveProgress(sessionId, persistedState, deviceId);
    } catch (e) {
      console.log('Firebase save failed, data is saved locally.', e);
      dispatch({ type: 'SET_ERROR', payload: 'Sync failed. Data saved offline.' });
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  }, [dispatch, initDevice]);

  const startNewSession = useCallback(async () => {
    const nextSessionId = Crypto.randomUUID();

    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.setItem(SESSION_KEY, nextSessionId);

    dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_SESSION_ID', payload: nextSessionId });
  }, [dispatch]);

  const getSessions = useCallback(async (): Promise<SavedSessionSummary[]> => {
    const deviceId = await initDevice();
    if (!deviceId) {
      return [];
    }

    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      return await listProgressSessions(deviceId);
    } catch (e) {
      console.log('Unable to fetch sessions from Firebase.', e);
      dispatch({ type: 'SET_ERROR', payload: 'Could not load saved sessions from Firebase.' });
      return [];
    }
  }, [dispatch, initDevice]);

  const restoreSession = useCallback(async (sessionId: string): Promise<FlowState | null> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const remoteData = await loadProgress(sessionId);

      if (!remoteData) {
        dispatch({ type: 'SET_ERROR', payload: 'That session is no longer available in Firebase.' });
        return null;
      }

      await AsyncStorage.setItem(SESSION_KEY, sessionId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
      dispatch({ type: 'RESTORE_STATE', payload: remoteData });
      return remoteData;
    } catch (e) {
      console.log('Unable to restore session from Firebase.', e);
      dispatch({ type: 'SET_ERROR', payload: 'Could not restore that session right now.' });
      return null;
    }
  }, [dispatch]);

  return {
    getSessions,
    initSession,
    loadInitialState,
    retryLoadState: loadInitialState,
    restoreSession,
    saveCurrentState,
    retrySaveState: saveCurrentState,
    startNewSession,
  };
};
