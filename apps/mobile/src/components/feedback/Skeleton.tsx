import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, elevation, radii, spacing } from '../../theme';

const SHIMMER_MS = 1400;
const SHIMMER_FROM = colors.surfaceVariant;
const SHIMMER_TO = '#F8F6FD';

/** One shimmering rectangle; skeleton screens are built from these. */
export function SkeletonBlock({
  width,
  height,
  radius = radii.xs,
}: {
  width: number | `${number}%`;
  height: number;
  radius?: number;
}): ReactNode {
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(
      withTiming(1, { duration: SHIMMER_MS, easing: Easing.linear }),
      -1,
      true,
    );
  }, [progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [SHIMMER_FROM, SHIMMER_TO]),
  }));

  return <Animated.View style={[{ width, height, borderRadius: radius }, animatedStyle]} />;
}

/** A task card drawn in shimmer, shown while the list loads. */
export function SkeletonCard(): ReactNode {
  return (
    <View
      style={styles.card}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.row}>
        <SkeletonBlock width={72} height={28} />
        <SkeletonBlock width={96} height={32} />
      </View>
      <SkeletonBlock width="80%" height={24} />
      <View style={styles.row}>
        <SkeletonBlock width={120} height={20} />
        <SkeletonBlock width={72} height={32} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.l,
    padding: spacing.xl,
    gap: spacing.md,
    ...elevation.l2,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
