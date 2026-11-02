import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { borders, colors, fontFamily, radii, sizes, spacing, typography } from '../theme';
import { AppText } from './AppText';
import { ErrorIcon } from './ErrorIcon';
import { TextButton } from './TextButton';

interface TextFieldProps extends Omit<TextInputProps, 'style' | 'secureTextEntry'> {
  label: string;
  error?: string;
  /** Password field with a Show / Hide button inside. */
  secret?: boolean;
  inputRef?: ComponentProps<typeof TextInput>['ref'];
}

/** Labelled 56px input: violet border and ring on focus, 2px red border with icon and text on error. */
export function TextField({
  label,
  error,
  secret = false,
  inputRef,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps): ReactNode {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.wrapper}>
      <AppText variant="labelL" color={colors.textStrong}>
        {label}
      </AppText>
      <View
        style={[styles.field, focused && styles.focused, error !== undefined && styles.errored]}
      >
        <TextInput
          {...rest}
          ref={inputRef}
          accessibilityLabel={label}
          secureTextEntry={secret && !revealed}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          // Tight rows stop growing past this; the field itself keeps its 56px height.
          maxFontSizeMultiplier={1.3}
          style={[styles.input, rest.multiline && styles.multiline]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
        {secret ? (
          <TextButton label={revealed ? 'Hide' : 'Show'} onPress={() => setRevealed((v) => !v)} />
        ) : null}
      </View>
      {error !== undefined ? (
        <View accessibilityLiveRegion="polite" style={styles.error}>
          <ErrorIcon />
          <AppText variant="bodyM" color={colors.errorText} style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  field: {
    minHeight: sizes.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderRadius: radii.m,
    borderWidth: borders.input,
    borderColor: colors.outline,
    backgroundColor: colors.inputBackground,
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    boxShadow: `0 0 0 ${borders.focusRing}px ${colors.focusRing}`,
  },
  errored: { borderWidth: borders.inputError, borderColor: colors.error },
  input: {
    ...typography.bodyL,
    flex: 1,
    minHeight: sizes.input,
    paddingVertical: 0,
    color: colors.textPrimary,
    fontFamily: fontFamily.medium,
  },
  // Multiline fields start at the top and keep room above and below the text.
  multiline: { minHeight: 96, paddingVertical: spacing.md, textAlignVertical: 'top' },
  error: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  errorText: { flex: 1 },
});
