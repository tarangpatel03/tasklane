import type { ReactNode } from 'react';
import { Text, type TextProps } from 'react-native';
import { colors, typography, type TextVariant } from '../../theme';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  children: ReactNode;
}

/** Themed text. Honours the user's font scale; pass `maxFontSizeMultiplier` only on tight UI. */
export function AppText({
  variant = 'bodyM',
  color = colors.textPrimary,
  style,
  children,
  ...rest
}: AppTextProps): ReactNode {
  return (
    <Text {...rest} style={[typography[variant], { color }, style]}>
      {children}
    </Text>
  );
}
