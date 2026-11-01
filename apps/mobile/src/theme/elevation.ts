import type { ViewStyle } from 'react-native';
import { colors } from './colors';

/** L0 to L3 from the brief. RN draws one shadow, so the stronger layer of each pair is used. */
export const elevation: Record<'l0' | 'l1' | 'l2' | 'l3', ViewStyle> = {
  l0: { borderWidth: 1, borderColor: colors.outlineSoft },
  l1: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  l2: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  l3: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};
