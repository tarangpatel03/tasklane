import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily, radii, screenMargin, sizes, spacing } from '../theme';
import { AppText } from './app-text';

/** Distance of the button above the bottom edge: it clears the floating nav (brief: 112). */
const BOTTOM_OFFSET = 112;

/** 56px pill at the right screen margin that opens the Create task screen. */
export function NewTaskButton({ onPress }: { onPress: () => void }): ReactNode {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="New task"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          right: screenMargin.compact + insets.right,
          bottom: insets.bottom + BOTTOM_OFFSET,
        },
        pressed && styles.pressed,
      ]}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path
          d="M12 5v14M5 12h14"
          fill="none"
          stroke={colors.onPrimary}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      </Svg>
      <AppText variant="bodyL" color={colors.onPrimary} style={styles.label}>
        New task
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    minHeight: sizes.buttonPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  pressed: { backgroundColor: colors.primaryPressed },
  label: { fontFamily: fontFamily.bold },
});
