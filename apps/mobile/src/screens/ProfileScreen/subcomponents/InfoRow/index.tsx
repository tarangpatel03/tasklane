import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../../components/brand/AppText';
import { colors, spacing } from '../../../../theme';

const ROW_HEIGHT = 56;

export function InfoRow({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <View style={styles.infoRow}>
      <AppText variant="labelL" color={colors.textSecondary}>
        {label}
      </AppText>
      <AppText variant="bodyL" numberOfLines={1} style={styles.infoValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    minHeight: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  infoValue: { flexShrink: 1, textAlign: 'right' },
});
