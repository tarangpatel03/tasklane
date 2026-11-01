import type { ReactNode } from 'react';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '../api/client';
import { useAuth } from '../auth/auth-context';
import { AppButton } from '../components/app-button';
import { TextButton } from '../components/text-button';
import { AppText } from '../components/app-text';
import { Logo } from '../components/logo';
import { Wash } from '../components/wash';
import { useWindowClass } from '../hooks/use-window-class';
import { colors, easing, elevation, radii, spacing, stagger } from '../theme';

type HealthState = 'idle' | 'checking' | 'ok' | 'failed';

const HEALTH_LABEL: Record<HealthState, string> = {
  idle: 'Not checked yet',
  checking: 'Checking…',
  ok: 'API reachable',
  failed: 'API not reachable. Is the API running and the base URL in app-config.ts right?',
};

/** Scaffold placeholder: shows the window class, insets and an API check. Replaced by the auth flow in 5.2. */
export function HomeScreen(): ReactNode {
  const insets = useSafeAreaInsets();
  const { windowClass, isLandscape, width, height } = useWindowClass();
  const reduceMotion = useReducedMotion();
  const [health, setHealth] = useState<HealthState>('idle');
  const { user, logout } = useAuth();

  const checkApi = async (): Promise<void> => {
    setHealth('checking');
    try {
      await apiRequest<unknown>('/health', { public: true });
      setHealth('ok');
    } catch {
      setHealth('failed');
    }
  };

  const rows: Array<[string, string]> = [
    ['Signed in as', user ? `${user.name} (${user.role})` : 'Unknown'],
    ['Window class', windowClass],
    ['Orientation', isLandscape ? 'Landscape' : 'Portrait'],
    ['Window', `${Math.round(width)} x ${Math.round(height)} dp`],
    [
      'Insets (t / b / l / r)',
      `${insets.top} / ${insets.bottom} / ${insets.left} / ${insets.right}`,
    ],
    ['API', HEALTH_LABEL[health]],
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <Wash />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xxxl,
            paddingBottom: insets.bottom + spacing.xxxl,
            paddingLeft: insets.left + spacing.xl,
            paddingRight: insets.right + spacing.xl,
          },
        ]}
      >
        <View style={styles.column}>
          <Logo size={64} />
          <AppText variant="headline">Tasklane</AppText>
          <AppText variant="bodyL" color={colors.textSecondary}>
            Mobile scaffold. The task screens arrive in the next checkpoints.
          </AppText>

          <View style={styles.card}>
            {rows.map(([label, value], index) => (
              <Animated.View
                key={label}
                style={styles.row}
                entering={
                  reduceMotion
                    ? undefined
                    : FadeInDown.duration(300)
                        .delay(Math.min(index, stagger.maxRows - 1) * stagger.step)
                        .easing(easing.emphasized)
                }
              >
                <AppText variant="labelS" color={colors.textSecondary}>
                  {label}
                </AppText>
                <AppText variant="bodyL" style={styles.value}>
                  {value}
                </AppText>
              </Animated.View>
            ))}
          </View>

          <AppButton label="Check API" onPress={() => void checkApi()} />
          {/* Temporary until Profile (5.6) has the real Log out. */}
          <TextButton label="Log out" onPress={() => void logout()} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  // Content is centred and capped so wide windows do not stretch text edge to edge.
  column: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.l,
    padding: spacing.xl,
    gap: spacing.lg,
    ...elevation.l2,
  },
  row: { gap: spacing.xs },
  value: { flexShrink: 1, flexWrap: 'wrap' },
});
