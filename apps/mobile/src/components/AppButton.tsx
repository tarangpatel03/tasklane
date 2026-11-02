import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, duration, easing, fontFamily, pressScale, radii, sizes, spacing } from '../theme';
import { AppText } from './AppText';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shows a spinner instead of the label and ignores presses. */
  loading?: boolean;
}

/** Primary button: 56px pill, scales to .96 over 100ms while pressed. */
export function AppButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: AppButtonProps): ReactNode {
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
    >
      <Animated.View style={[styles.button, disabled && styles.disabled, animatedStyle]}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <AppText
            variant="bodyL"
            color={disabled ? colors.disabledText : colors.onPrimary}
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
  button: {
    minHeight: sizes.buttonPrimary,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    shadowColor: colors.primary,
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  disabled: { backgroundColor: colors.disabledBackground, elevation: 0, shadowOpacity: 0 },
  label: { fontFamily: fontFamily.bold },
});
