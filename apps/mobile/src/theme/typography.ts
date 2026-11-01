import type { TextStyle } from 'react-native';

/** One font file per weight: Android only maps a family name to a file when it is declared per weight. */
export const fontFamily = {
  medium: 'PlusJakartaSans-Medium',
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extrabold: 'PlusJakartaSans-ExtraBold',
} as const;

export type TextVariant =
  'display' | 'headline' | 'titleL' | 'titleM' | 'bodyL' | 'bodyM' | 'labelL' | 'labelS';

/** Type scale from the brief. Letter spacing is in px (em value x font size). */
export const typography: Record<TextVariant, TextStyle> = {
  display: {
    fontFamily: fontFamily.extrabold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.72,
  },
  headline: {
    fontFamily: fontFamily.extrabold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.28,
  },
  titleL: { fontFamily: fontFamily.extrabold, fontSize: 22, lineHeight: 28 },
  titleM: { fontFamily: fontFamily.bold, fontSize: 18, lineHeight: 24 },
  bodyL: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 24 },
  bodyM: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20 },
  labelL: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  labelS: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.24,
  },
};
