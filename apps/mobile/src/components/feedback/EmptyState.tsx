import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { AppText } from '../brand/AppText';
import { Logo } from '../brand/Logo';
import { TextButton } from '../buttons/TextButton';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Size of the mark tile: 80 on lists, 96 for the review queue. */
  tileSize?: number;
}

/** Geometric mark, one sentence and an optional action. Also used for load errors. */
export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  tileSize = 80,
}: EmptyStateProps): ReactNode {
  return (
    <View style={styles.wrap}>
      <View style={[styles.tile, { width: tileSize, height: tileSize }]}>
        <Logo size={tileSize / 2} />
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
    borderRadius: radii.l,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center' },
});
