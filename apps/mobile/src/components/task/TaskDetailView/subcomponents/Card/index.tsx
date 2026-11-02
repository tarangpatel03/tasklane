import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, elevation, fontFamily, radii, spacing } from '../../../../../theme';
import { AppText } from '../../../../brand/AppText';

/** White card with a title. Without a title it is just the card box (used by the loading skeleton). */
export function Card({ title, children }: { title?: string; children: ReactNode }): ReactNode {
  return (
    <View style={styles.card}>
      {title ? (
        <AppText variant="titleM" style={styles.cardTitle}>
          {title}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.l,
    padding: spacing.xl,
    gap: spacing.lg,
    ...elevation.l2,
  },
  cardTitle: { fontSize: 17, lineHeight: 22, fontFamily: fontFamily.extrabold },
});
