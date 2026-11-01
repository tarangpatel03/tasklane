import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, fontFamily, radii, sizes, spacing } from '../theme';
import { AppText } from './app-text';

interface TextButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Text-only button with a 48px touch target. */
export function TextButton({ label, onPress, disabled = false }: TextButtonProps): ReactNode {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <AppText variant="labelL" color={colors.primaryPressed} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.primaryContainer },
  label: { fontFamily: fontFamily.bold },
});
