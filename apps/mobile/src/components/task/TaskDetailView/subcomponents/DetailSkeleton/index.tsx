import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../../../theme';
import { SkeletonBlock } from '../../../../feedback/Skeleton';
import { Card } from '../Card';

/** Placeholder cards drawn while the task loads. */
export function DetailSkeleton(): ReactNode {
  return (
    <View
      style={styles.cards}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {[0, 1].map((card) => (
        <Card key={card}>
          <SkeletonBlock width={120} height={22} />
          <SkeletonBlock width="100%" height={16} />
          <SkeletonBlock width="85%" height={16} />
          <SkeletonBlock width="60%" height={16} />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: spacing.lg, paddingTop: spacing.lg },
});
