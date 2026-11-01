import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { duration } from '../theme';

/** Counts from the last shown value to `target` over 600ms (ease-out cubic). Reduced motion jumps straight there. */
export function useCountUp(target: number): number {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? target : 0);
  const shown = useRef(value);

  useEffect(() => {
    if (reduceMotion) {
      shown.current = target;
      setValue(target);
      return undefined;
    }
    const from = shown.current;
    const start = Date.now();
    let frame = 0;
    const tick = (): void => {
      const progress = Math.min((Date.now() - start) / duration.countUp, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      shown.current = Math.round(from + (target - from) * eased);
      setValue(shown.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduceMotion]);

  return value;
}
