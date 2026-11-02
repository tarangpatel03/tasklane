import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../../../../theme';
import { AppText } from '../../../../brand/AppText';

export function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}): ReactNode {
  return (
    <View style={styles.infoRow}>
      <AppText variant="labelL" color={colors.textSecondary}>
        {label}
      </AppText>
      <AppText variant="bodyL" color={valueColor} style={styles.infoValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: { gap: spacing.xs },
  infoValue: { flexShrink: 1 },
});
