import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowClass } from '../hooks/use-window-class';
import { colors, elevation, maxWidths, radii, screenMargin, spacing } from '../theme';
import { Wash } from './wash';

/** Below this width the smaller 16 margin is used (brief: 16 at 320 wide). */
const NARROW_WIDTH = 360;

/**
 * Shared frame of the signed-out screens: lavender wash, safe-area insets, a scrolling form that the
 * keyboard never covers. Medium and wider windows put the content in a centred white card.
 */
export function AuthLayout({ children }: { children: ReactNode }): ReactNode {
  const insets = useSafeAreaInsets();
  const { windowClass, width } = useWindowClass();
  const isCard = windowClass !== 'compact';
  const margin = isCard
    ? screenMargin.medium
    : width < NARROW_WIDTH
      ? screenMargin.narrow
      : screenMargin.compact;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <Wash />
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + spacing.xl,
              paddingBottom: insets.bottom + spacing.xl,
              paddingLeft: insets.left + margin,
              paddingRight: insets.right + margin,
            },
          ]}
        >
          <View style={[styles.column, isCard && styles.card]}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center' },
  column: { width: '100%', maxWidth: maxWidths.form, alignSelf: 'center', gap: spacing.xl },
  card: {
    padding: spacing.xxxl,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...elevation.l2,
  },
});
