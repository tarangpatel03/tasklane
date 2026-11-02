import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, duration, easing, fontFamily, radii, sizes, spacing } from '../theme';
import { AppText } from './AppText';

/** Distance of the button above the bottom edge: it clears the floating nav (brief: 112). */
const BOTTOM_OFFSET = 112;

interface NewTaskButtonProps {
  onPress: () => void;
  /** Distance from the right edge of the window. */
  right: number;
  /** Fades in and out (the button belongs to Tasks and Review only). */
  visible: boolean;
}

/** 56px pill near the right edge that opens the Create task screen. */
export function NewTaskButton({ onPress, right, visible }: NewTaskButtonProps): ReactNode {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: reduceMotion ? duration.reduced : duration.fade,
      easing: easing.standard,
    });
  }, [visible, reduceMotion, opacity]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[styles.wrap, { right, bottom: insets.bottom + BOTTOM_OFFSET }, fadeStyle]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New task"
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  button: {
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
