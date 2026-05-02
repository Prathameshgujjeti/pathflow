import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { FlowState } from '../context/FlowContext';

const COLLECTION_NAME = 'progress';

type FirestoreProgressDoc = FlowState & {
  deviceId?: string;
  lastUpdated?: Timestamp;
};

export type SavedSessionSummary = Pick<
  FlowState,
  'sessionId' | 'currentRoute' | 'currentStep' | 'totalSteps' | 'answers' | 'lastSavedAt'
>;

const normalizeProgressDoc = (data: FirestoreProgressDoc): FlowState => ({
  ...data,
  lastSavedAt: data.lastSavedAt ?? data.lastUpdated?.toDate().toISOString() ?? null,
});

export const saveProgress = async (sessionId: string, state: FlowState, deviceId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, sessionId);
    await setDoc(docRef, {
      ...state,
      deviceId,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save progress to Firebase:', error);
    throw error; // Will be caught by the hook to trigger offline fallback
  }
};

export const loadProgress = async (sessionId: string): Promise<FlowState | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, sessionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return normalizeProgressDoc(docSnap.data() as FirestoreProgressDoc);
    }
    return null;
  } catch (error) {
    console.error('Failed to load progress from Firebase:', error);
    throw error;
  }
};

export const listProgressSessions = async (deviceId: string): Promise<SavedSessionSummary[]> => {
  try {
    const progressCollection = collection(db, COLLECTION_NAME);
    const sessionsQuery = query(
      progressCollection,
      where('deviceId', '==', deviceId)
    );
    const snapshot = await getDocs(sessionsQuery);

    return snapshot.docs
      .map((docSnapshot) => {
        const normalizedState = normalizeProgressDoc(docSnapshot.data() as FirestoreProgressDoc);

        return {
          sessionId: normalizedState.sessionId,
          currentRoute: normalizedState.currentRoute,
          currentStep: normalizedState.currentStep,
          totalSteps: normalizedState.totalSteps,
          answers: normalizedState.answers,
          lastSavedAt: normalizedState.lastSavedAt,
        };
      })
      .sort((left, right) => {
        const leftTime = left.lastSavedAt ? Date.parse(left.lastSavedAt) : 0;
        const rightTime = right.lastSavedAt ? Date.parse(right.lastSavedAt) : 0;
        return rightTime - leftTime;
      })
      .map((normalizedState) => {
        return {
          sessionId: normalizedState.sessionId,
          currentRoute: normalizedState.currentRoute,
          currentStep: normalizedState.currentStep,
          totalSteps: normalizedState.totalSteps,
          answers: normalizedState.answers,
          lastSavedAt: normalizedState.lastSavedAt,
        };
      });
  } catch (error) {
    console.error('Failed to list sessions from Firebase:', error);
    throw error;
  }
};

export const deleteProgress = async (sessionId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, sessionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Failed to delete progress from Firebase:', error);
    throw error;
  }
};
