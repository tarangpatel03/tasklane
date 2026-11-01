import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../theme';
import { AppText } from './app-text';
import { Logo } from './logo';
import { TextButton } from './text-button';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Geometric mark, one sentence and an optional action. Also used for load errors. */
export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps): ReactNode {
  return (
    <View style={styles.wrap}>
      <View style={styles.tile}>
        <Logo size={40} />
      </View>
      <AppText variant="titleM" style={styles.center}>
        {title}
      </AppText>
      <AppText variant="bodyM" color={colors.textSecondary} style={styles.center}>
        {message}
      </AppText>
      {actionLabel && onAction ? <TextButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },
  tile: {
    width: 80,
    height: 80,
    borderRadius: radii.l,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center' },
});
