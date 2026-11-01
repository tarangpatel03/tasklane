/** Colour tokens from docs/design-brief.md. Light theme only. */
export const colors = {
  primary: '#5B4FD6',
  primaryPressed: '#4338B8',
  primaryContainer: '#E6E1FF',
  onPrimaryContainer: '#2F2791',
  onPrimary: '#FFFFFF',

  background: '#F6F4FD',
  surface: '#FFFFFF',
  surfaceVariant: '#EEEAF8',
  surfaceTint: '#F1EEFF',
  inputBackground: '#FBFAFF',
  outline: '#D5D0EA',
  outlineSoft: '#E6E2F3',

  textPrimary: '#1C1B2E',
  textSecondary: '#5F5C74',
  textStrong: '#3A3752',

  washStart: '#E4DEFF',
  washEnd: '#F6F4FD',

  focusRing: 'rgba(91, 79, 214, 0.18)',

  error: '#C2282D',
  errorBackground: '#FFDAD8',
  errorText: '#A3262A',
  approve: '#17653F',
  destructive: '#A3262A',
  rejectBackground: '#FFDAD8',
  rejectText: '#8A1E22',

  disabledBackground: '#ECEAF3',
  disabledText: '#8B889E',

  scrim: 'rgba(28, 27, 46, 0.42)',
  shadow: '#3C288C',

  status: {
    TODO: { background: '#ECE8FF', foreground: '#4B3FB0' },
    WORKING: { background: '#DDEBFF', foreground: '#1E58B8' },
    IN_REVIEW: { background: '#FFE8D1', foreground: '#8F4A00' },
    COMPLETED: { background: '#D5F5E3', foreground: '#17653F' },
  },
  /** Soft avatar pairs from the brief; a user always maps to the same pair. */
  avatarPairs: [
    { background: '#C9C1FF', foreground: '#2F2791' },
    { background: '#BFE0FF', foreground: '#12407F' },
    { background: '#FFD9B8', foreground: '#6E3900' },
    { background: '#C8F0DA', foreground: '#17653F' },
    { background: '#FFD0E0', foreground: '#7A1E45' },
  ],
  avatarOverflow: { background: '#ECEAF3', foreground: '#3A3752' },
  ownAvatar: { background: '#2F2791', foreground: '#FFFFFF' },
  snackbar: '#1C1B2E',
  snackbarCheck: '#9BE7BE',
  priority: {
    LOW: { background: '#E3EAF2', foreground: '#3D4F63' },
    MEDIUM: { background: '#FFEFC2', foreground: '#6B4B00' },
    HIGH: { background: '#FFDAD8', foreground: '#8A1E22' },
  },
} as const;
