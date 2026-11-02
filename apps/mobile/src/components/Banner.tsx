import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../theme';
import { AppText } from './AppText';
import { ErrorIcon } from './ErrorIcon';

/** Form-level error message on a red tint. Read out when it appears. */
export function Banner({ message }: { message: string }): ReactNode {
  return (
    <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.banner}>
      <ErrorIcon color={colors.rejectText} />
      <AppText variant="bodyM" color={colors.rejectText} style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.m,
    backgroundColor: colors.errorBackground,
  },
  text: { flex: 1 },
});
