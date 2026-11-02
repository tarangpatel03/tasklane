import type { ReactNode } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';

interface ErrorIconProps {
  size?: number;
  color?: string;
}

/** Circle with an exclamation mark. Errors never rely on colour alone. */
export function ErrorIcon({ size = 16, color = colors.errorText }: ErrorIconProps): ReactNode {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" accessible={false}>
      <Circle cx={8} cy={8} r={7} fill="none" stroke={color} strokeWidth={1.5} />
      <Path d="M8 4.5v4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={8} cy={11.2} r={0.9} fill={color} />
    </Svg>
  );
}
