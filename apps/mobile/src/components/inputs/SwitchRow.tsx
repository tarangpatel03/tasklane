import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, duration, easing, radii, spacing } from '../../theme';
import { AppText } from '../brand/AppText';

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const THUMB = 24;
const THUMB_INSET = 4;

interface SwitchRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** One line that says what the current setting does. */
  effect: string;
}

/** 72px row with a 52 x 32 switch, "On" / "Off" and the effect of the current setting. */
export function SwitchRow({ label, value, onChange, effect }: SwitchRowProps): ReactNode {
  const progress = useSharedValue(value ? 1 : 0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {
      duration: reduceMotion ? duration.reduced : duration.fade,
      easing: easing.standard,
    });
  }, [value, reduceMotion, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.outline, colors.primary]),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (TRACK_WIDTH - THUMB - THUMB_INSET * 2) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.row}
    >
      <View style={styles.text}>
        <AppText variant="labelL" color={colors.textStrong}>
          {`${label} · ${value ? 'On' : 'Off'}`}
        </AppText>
        <AppText variant="bodyM" color={colors.textSecondary}>
          {effect}
        </AppText>
      </View>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.m,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.outline,
  },
  text: { flex: 1, gap: spacing.xs },
  track: { width: TRACK_WIDTH, height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2 },
  thumb: {
    position: 'absolute',
    top: THUMB_INSET,
    left: THUMB_INSET,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.surface,
  },
});
