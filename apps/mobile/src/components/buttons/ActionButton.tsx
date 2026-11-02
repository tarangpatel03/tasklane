import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  colors,
  duration,
  easing,
  fontFamily,
  pressScale,
  radii,
  sizes,
  spacing,
} from '../../theme';
import { AppText } from '../brand/AppText';

export type ActionVariant = 'primary' | 'approve' | 'reject' | 'destructive' | 'outlined';

interface ActionButtonProps {
  label: string;
  variant: ActionVariant;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** 48px instead of 56px, for buttons inside cards. */
  compact?: boolean;
}

const TONES: Record<ActionVariant, { background: string; foreground: string; border?: string }> = {
  primary: { background: colors.primary, foreground: colors.onPrimary },
  approve: { background: colors.approve, foreground: colors.onPrimary },
  reject: { background: colors.rejectBackground, foreground: colors.rejectText },
  destructive: { background: colors.destructive, foreground: colors.onPrimary },
  outlined: { background: colors.surface, foreground: colors.textStrong, border: colors.outline },
};

/** 56px pill for the task actions and sheets. Scales to .96 over 100ms while pressed. */
export function ActionButton({
  label,
  variant,
  onPress,
  disabled = false,
  loading = false,
  compact = false,
}: ActionButtonProps): ReactNode {
  const tone = TONES[variant];
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const animateTo = (value: number): void => {
    scale.value = reduceMotion
      ? value
      : withTiming(value, { duration: duration.press, easing: easing.standard });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => animateTo(pressScale.control)}
      onPressOut={() => animateTo(1)}
      style={styles.flex}
    >
      <Animated.View
        style={[
          styles.button,
          compact && styles.compact,
          { backgroundColor: tone.background },
          tone.border ? { borderWidth: 1.5, borderColor: tone.border } : null,
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={tone.foreground} />
        ) : (
          <AppText
            variant="bodyL"
            color={disabled ? colors.disabledText : tone.foreground}
            style={styles.label}
          >
            {label}
          </AppText>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  button: {
    minHeight: sizes.buttonPrimary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  compact: { minHeight: sizes.touchTarget },
  disabled: { backgroundColor: colors.disabledBackground, borderColor: colors.disabledBackground },
  label: { fontFamily: fontFamily.bold, textAlign: 'center' },
});
