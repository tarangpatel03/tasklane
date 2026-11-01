import type { TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, duration, easing, radii, spacing } from '../theme';
import { STATUS_LABEL } from '../utils/task-format';
import { AppText } from './app-text';
import { StatusIcon } from './status-icon';

interface StatusBadgeProps {
  status: TaskStatus;
  /** 36px badge for the detail header; 32px in lists. */
  large?: boolean;
}

/** Status pill with icon and text. When the status changes it scales 1 to 1.1 to 1. */
export function StatusBadge({ status, large = false }: StatusBadgeProps): ReactNode {
  const tone = colors.status[status];
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  const previous = useRef(status);

  useEffect(() => {
    if (previous.current === status) return;
    previous.current = status;
    if (reduceMotion) return;
    scale.value = withSequence(
      withTiming(1.1, { duration: duration.sheet / 2, easing: easing.emphasized }),
      withTiming(1, { duration: duration.sheet / 2, easing: easing.emphasized }),
    );
  }, [status, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[
        styles.badge,
        large && styles.large,
        { backgroundColor: tone.background },
        animatedStyle,
      ]}
    >
      <StatusIcon
        status={status}
        color={tone.foreground}
        checkColor={tone.background}
        size={large ? 20 : 18}
      />
      <AppText variant="labelL" color={tone.foreground}>
        {STATUS_LABEL[status]}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  large: { minHeight: 36, paddingHorizontal: spacing.lg },
});
