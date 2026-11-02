import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { duration, easing, pressScale } from '../../theme';

/** Press feedback: scales to .96 over 100ms while pressed. Spread `handlers` on a Pressable and `style` on an Animated.View. */
export function usePressScale(scaleTo: number = pressScale.control) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const animateTo = (value: number): void => {
    scale.value = reduceMotion
      ? value
      : withTiming(value, { duration: duration.press, easing: easing.standard });
  };

  return {
    style,
    handlers: {
      onPressIn: () => animateTo(scaleTo),
      onPressOut: () => animateTo(1),
    },
  };
}
