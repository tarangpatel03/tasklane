import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../theme';

/** Lavender wash behind headers and the login hero (brief: 160deg, #E4DEFF to #F6F4FD). */
export function Wash(): ReactNode {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" pointerEvents="none">
      <Defs>
        <LinearGradient id="wash" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={colors.washStart} />
          <Stop offset="1" stopColor={colors.washEnd} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#wash)" />
    </Svg>
  );
}
