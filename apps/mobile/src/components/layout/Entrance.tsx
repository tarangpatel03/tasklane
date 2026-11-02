import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { duration, easing, stagger } from '../../theme';

interface EntranceProps {
  /** Position in the list; each step adds 40ms, capped at 8 rows. */
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** Fades and rises into place. Reduced motion swaps the rise for a 100ms fade. */
export function Entrance({ index = 0, style, children }: EntranceProps): ReactNode {
  const reduceMotion = useReducedMotion();
  const delay = Math.min(index, stagger.maxRows - 1) * stagger.step;
  const entering = reduceMotion
    ? FadeIn.duration(duration.reduced)
    : FadeInDown.duration(duration.sheet).delay(delay).easing(easing.emphasized);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
