import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../../components/brand/AppText';
import { colors, spacing } from '../../../../theme';

export function Section({ label, children }: { label: string; children: ReactNode }): ReactNode {
  return (
    <View style={styles.section}>
      <AppText variant="labelL" color={colors.textStrong}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
});
