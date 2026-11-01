/** Spacing scale from the brief. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radii = {
  xs: 10,
  s: 14,
  m: 18,
  l: 24,
  xl: 32,
  pill: 999,
} as const;

/** Minimum touch target, and the primary button height. */
export const sizes = {
  touchTarget: 48,
  buttonPrimary: 56,
  input: 56,
} as const;

/** Input border: 1.5 normally, 2 when it shows an error. The focus ring is 4 wide. */
export const borders = { input: 1.5, inputError: 2, focusRing: 4 } as const;

/** Widest a form or card gets on large windows. */
export const maxWidths = { form: 480 } as const;

/** Screen margin; phones at 320 wide use the smaller one. */
export const screenMargin = { compact: 20, narrow: 16, medium: 40, expanded: 24 } as const;
