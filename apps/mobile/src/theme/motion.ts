import { Easing } from 'react-native-reanimated';

/** Durations in ms, from the brief's motion table. */
export const duration = {
  press: 100,
  fade: 200,
  sheet: 300,
  sharedElement: 450,
  exit: 200,
  countUp: 600,
  /** Reduced motion replaces transitions with this fade. */
  reduced: 100,
} as const;

export const easing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  emphasized: Easing.bezier(0.05, 0.7, 0.1, 1),
  accelerate: Easing.bezier(0.3, 0, 0.8, 0.15),
};

/** List entrance: 40ms per row, at most 8 rows. */
export const stagger = { step: 40, maxRows: 8, rise: 16 } as const;

/** Press feedback scale. */
export const pressScale = { control: 0.96, card: 0.98 } as const;
