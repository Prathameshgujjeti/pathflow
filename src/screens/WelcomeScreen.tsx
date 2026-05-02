import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { useFlow } from '../context/FlowContext';
import { useProgress } from '../hooks/useProgress';
import { PrimaryButton } from '../components/PrimaryButton';
import { theme } from '../constants/theme';
import { SavedSessionSummary } from '../api/progress.api';

const buildSessionHeadline = (session: SavedSessionSummary) => {
  if (session.answers.goals.length > 0) {
    return session.answers.goals.slice(0, 2).join(' • ');
  }

  if (session.answers.ageRange) {
    return `Age ${session.answers.ageRange}`;
  }

  return 'Wellness intake session';
};

const buildSessionDetails = (session: SavedSessionSummary) => {
  const details: string[] = [];

  if (session.answers.diet) {
    details.push(session.answers.diet);
  }

  if (session.answers.activityLevel) {
    details.push(session.answers.activityLevel);
  }

  if (session.answers.notificationFrequency) {
    details.push(`${session.answers.notificationFrequency} reminders`);
  }

  return details.length > 0 ? details.join(' • ') : 'Tap to open and edit this session';
};

export default function WelcomeScreen() {
  const { state, dispatch } = useFlow();
  const { getSessions, loadInitialState, retryLoadState, restoreSession, startNewSession } = useProgress();
  const [loading, setLoading] = useState(true);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<SavedSessionSummary[]>([]);
  const [openingSessionId, setOpeningSessionId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const result = await loadInitialState();
      setHasSavedProgress(result.hasSavedProgress);
      setLoading(false);
    };

    init();
  }, [loadInitialState]);

  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true);
    const nextSessions = await getSessions();
    setSessions(nextSessions);
    setSessionsLoading(false);
  }, [getSessions]);

  const handleRetryRestore = async () => {
    setLoading(true);
    const result = await retryLoadState();
    setHasSavedProgress(result.hasSavedProgress);
    setLoading(false);
  };

  const handleShowSessions = async () => {
    setShowSessionsModal(true);
    await refreshSessions();
  };

  const handleOpenSession = async (sessionId: string) => {
    setOpeningSessionId(sessionId);
    const restored = await restoreSession(sessionId);
    setOpeningSessionId(null);

    if (!restored) {
      return;
    }

    setHasSavedProgress(true);
    setShowSessionsModal(false);
    dispatch({ type: 'NAVIGATE', payload: restored.currentRoute === 'Welcome' ? 'Step1' : restored.currentRoute });
  };

  const handleStartJourney = async () => {
    await startNewSession();
    setHasSavedProgress(false);
    dispatch({ type: 'NAVIGATE', payload: 'Step1' });
  };

  const handleContinue = () => {
    dispatch({ type: 'NAVIGATE', payload: state.currentRoute === 'Welcome' ? 'Step1' : state.currentRoute });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.kicker}>
            <Text style={styles.kickerText}>Health journey</Text>
          </View>
          <Text style={styles.title}>HealthPath</Text>
          <Text style={styles.subtitle}>
            Start a new guided plan or reopen one of your saved Firebase sessions to keep editing professionally.
          </Text>
        </View>

        <View style={styles.actions}>
          {state.error ? (
            <PrimaryButton
              title="Retry restore"
              onPress={handleRetryRestore}
              variant="secondary"
              style={styles.button}
            />
          ) : null}
          <PrimaryButton
            title="Show Sessions"
            onPress={handleShowSessions}
            variant="secondary"
            style={styles.button}
          />
          {hasSavedProgress ? (
            <PrimaryButton
              title="Continue Current Session"
              onPress={handleContinue}
              style={styles.button}
            />
          ) : null}
          <PrimaryButton
            title={hasSavedProgress ? 'Start New Journey' : 'Start Journey'}
            onPress={handleStartJourney}
            variant={hasSavedProgress ? 'secondary' : 'primary'}
            style={styles.button}
          />
        </View>
      </View>

      <Modal visible={showSessionsModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSessionsModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <View style={styles.modalBadge}>
              <Text style={styles.modalBadgeText}>Saved sessions</Text>
            </View>
            <Text style={styles.modalTitle}>Open a session to edit and save again</Text>
            <Text style={styles.modalSubtitle}>
              Every card below is loaded from Firebase. Tap one to resume that session and continue editing.
            </Text>

            <ScrollView style={styles.sessionsList} contentContainerStyle={styles.sessionsContent}>
              {sessionsLoading ? (
                <View style={styles.sessionLoading}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.sessionLoadingText}>Fetching sessions from Firebase...</Text>
                </View>
              ) : null}

              {!sessionsLoading && sessions.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No sessions found</Text>
                  <Text style={styles.emptyText}>Start your first journey and it will appear here after saving.</Text>
                </View>
              ) : null}

              {!sessionsLoading
                ? sessions.map((session) => {
                    const isOpening = openingSessionId === session.sessionId;
                    const updatedLabel = session.lastSavedAt
                      ? formatDistanceToNow(new Date(session.lastSavedAt), { addSuffix: true })
                      : 'just now';

                    return (
                      <Pressable
                        key={session.sessionId}
                        style={styles.sessionCard}
                        onPress={() => session.sessionId && handleOpenSession(session.sessionId)}
                        disabled={isOpening || !session.sessionId}
                      >
                        <View style={styles.sessionCardTop}>
                          <View style={styles.sessionMeta}>
                            <Text style={styles.sessionStep}>Step {session.currentStep} of {session.totalSteps}</Text>
                            <Text style={styles.sessionHeadline}>{buildSessionHeadline(session)}</Text>
                          </View>
                          <View style={styles.sessionEditPill}>
                            {isOpening ? (
                              <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : (
                              <Text style={styles.sessionEditText}>Edit</Text>
                            )}
                          </View>
                        </View>
                        <Text style={styles.sessionDetail}>{buildSessionDetails(session)}</Text>
                        <Text style={styles.sessionTime}>Updated {updatedLabel}</Text>
                      </Pressable>
                    );
                  })
                : null}
            </ScrollView>

            <PrimaryButton
              title="Close"
              onPress={() => setShowSessionsModal(false)}
              variant="secondary"
              style={styles.modalButton}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowTop: {
    position: 'absolute',
    top: -40,
    right: -10,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.accentSoft,
  },
  glowBottom: {
    position: 'absolute',
    bottom: 40,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.backgroundAccent,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: theme.spacing.lg,
  },
  kicker: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  kickerText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.sm,
  },
  title: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: 44,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
    lineHeight: 28,
    maxWidth: 320,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  button: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: '78%',
    ...theme.shadows.dialog,
  },
  modalBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.surfaceHighlight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  modalBadgeText: {
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
  },
  modalTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  sessionsList: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  sessionsContent: {
    gap: theme.spacing.md,
  },
  sessionLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  sessionLoadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.sm,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  emptyTitle: {
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  sessionCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  sessionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  sessionMeta: {
    flex: 1,
  },
  sessionStep: {
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  sessionHeadline: {
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  sessionEditPill: {
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.surfaceHighlight,
  },
  sessionEditText: {
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
  },
  sessionDetail: {
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  sessionTime: {
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  modalButton: {
    width: '100%',
  },
});
