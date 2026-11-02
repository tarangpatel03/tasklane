import type { ReactNode } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../../theme';

interface LogoProps {
  size?: number;
}

/** The Tasklane mark: three lanes filling from empty to done. */
export function Logo({ size = 64 }: LogoProps): ReactNode {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="Tasklane">
      <Rect x={7} y={10} width={14} height={44} rx={7} fill={colors.primary} opacity={0.22} />
      <Rect x={25} y={10} width={14} height={44} rx={7} fill={colors.primary} opacity={0.22} />
      <Rect x={25} y={30} width={14} height={24} rx={7} fill={colors.primary} opacity={0.62} />
      <Rect x={43} y={10} width={14} height={44} rx={7} fill={colors.primary} />
      <Path
        d="M46 33l3.6 3.6 5.8-7"
        fill="none"
        stroke={colors.onPrimary}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
