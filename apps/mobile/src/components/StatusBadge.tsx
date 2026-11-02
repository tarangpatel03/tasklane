import type { TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, duration, easing, radii, spacing } from '../theme';
import { STATUS_LABEL } from '../utils/taskFormat.util';
import { AppText } from './AppText';
import { StatusIcon } from './StatusIcon';

interface StatusBadgeProps {
  status: TaskStatus;
  /** 36px badge for the detail header; 32px in lists. */
  large?: boolean;
}

/** Status pill with icon and text. When the status changes it scales 1 to 1.1 to 1. */
export function StatusBadge({ status, large = false }: StatusBadgeProps): ReactNode {
  const tone = colors.status[status];
  const scale = useSharedValue(1);
  // The tint cross-fades from the previous status colour to the new one.
  const tint = useSharedValue(1);
  const tintFrom = useSharedValue<string>(tone.background);
  const tintTo = useSharedValue<string>(tone.background);
  const reduceMotion = useReducedMotion();
  const previous = useRef(status);

  useEffect(() => {
    if (previous.current === status) return;
    tintFrom.value = colors.status[previous.current].background;
    tintTo.value = colors.status[status].background;
    previous.current = status;
    tint.value = 0;
    tint.value = withTiming(1, {
      duration: reduceMotion ? duration.reduced : duration.sheet,
      easing: easing.standard,
    });
    if (reduceMotion) return;
    scale.value = withSequence(
      withTiming(1.1, { duration: duration.sheet / 2, easing: easing.emphasized }),
      withTiming(1, { duration: duration.sheet / 2, easing: easing.emphasized }),
    );
  }, [status, reduceMotion, scale, tint, tintFrom, tintTo]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(tint.value, [0, 1], [tintFrom.value, tintTo.value]),
  }));

  return (
    <Animated.View style={[styles.badge, large && styles.large, animatedStyle]}>
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
