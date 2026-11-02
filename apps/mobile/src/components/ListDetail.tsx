import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, Keyframe, useReducedMotion } from 'react-native-reanimated';
import { colors, duration, easing, spacing, tablet } from '../theme';
import { AppText } from './AppText';
import { Logo } from './Logo';

interface ListDetailProps {
  /** Left pane: the list with its header and nav. */
  list: ReactNode;
  /** Right pane: the selected task's detail, or an empty-state placeholder. */
  detail: ReactNode;
  /** Safe-area inset on the left edge (landscape cutouts), applied to the list pane only. */
  leftInset: number;
}

/** Wide-window layout: a fixed 420px list pane with a hairline border and the detail filling the rest. */
export function ListDetail({ list, detail, leftInset }: ListDetailProps): ReactNode {
  return (
    <View style={styles.row}>
      <View
        style={[styles.listPane, { width: tablet.listPane + leftInset, paddingLeft: leftInset }]}
      >
        {list}
      </View>
      <View style={styles.detailPane}>{detail}</View>
    </View>
  );
}

/** Detail swap: 300ms fade with a 24px slide in from the right. */
const swapIn = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: 24 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }], easing: easing.emphasized },
}).duration(duration.sheet);

/** Wrap the detail with `key={taskId}` so choosing another task replays the swap. */
export function PaneSwap({ children }: { children: ReactNode }): ReactNode {
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View
      entering={reduceMotion ? FadeIn.duration(duration.reduced) : swapIn}
      style={styles.flex}
    >
      {children}
    </Animated.View>
  );
}

/** Right-pane placeholder when nothing is selected. */
export function EmptyPane({ title, message }: { title: string; message: string }): ReactNode {
  return (
    <View style={styles.empty}>
      <Logo size={56} />
      <AppText variant="titleM" style={styles.center}>
        {title}
      </AppText>
      <AppText variant="bodyM" color={colors.textSecondary} style={styles.center}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  listPane: {
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.outlineSoft,
  },
  detailPane: { flex: 1, backgroundColor: colors.inputBackground },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxxl,
  },
  center: { textAlign: 'center' },
});
