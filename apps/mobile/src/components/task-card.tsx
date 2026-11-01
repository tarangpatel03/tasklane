import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import type { Task } from '../api/tasks';
import { colors, duration, easing, elevation, pressScale, radii, spacing } from '../theme';
import { dueText, isOverdue } from '../utils/task-format';
import { AppText } from './app-text';
import { AvatarStack } from './avatar';
import { PriorityTag } from './priority-tag';
import { StatusBadge } from './status-badge';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  /** The task shown in the detail pane on wide windows. */
  selected?: boolean;
}

/** Task summary card: priority and status, title, due text and the assignees. Scales to .98 when pressed. */
export function TaskCard({ task, onPress, selected = false }: TaskCardProps): ReactNode {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const overdue = isOverdue(task.dueDate, task.status);
  const dueColor = overdue ? colors.errorText : colors.textSecondary;

  const animateTo = (value: number): void => {
    scale.value = reduceMotion
      ? value
      : withTiming(value, { duration: duration.press, easing: easing.standard });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      onPressIn={() => animateTo(pressScale.card)}
      onPressOut={() => animateTo(1)}
    >
      <Animated.View style={[styles.card, selected && styles.cardSelected, animatedStyle]}>
        {selected ? <View pointerEvents="none" style={styles.ring} /> : null}
        <View style={styles.tags}>
          <PriorityTag priority={task.priority} />
          <StatusBadge status={task.status} />
        </View>
        <AppText variant="titleM" numberOfLines={2}>
          {task.title}
        </AppText>
        <View style={styles.footer}>
          <View style={styles.due}>
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Circle cx={12} cy={12} r={9} fill="none" stroke={dueColor} strokeWidth={2.2} />
              <Path
                d="M12 7.5V12l3 2"
                fill="none"
                stroke={dueColor}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <AppText variant="bodyM" color={dueColor} style={styles.dueText}>
              {dueText(task.dueDate, task.status)}
            </AppText>
          </View>
          <AvatarStack people={task.assignees} />
        </View>
      </Animated.View>
    </Pressable>
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
  cardSelected: { backgroundColor: colors.surfaceTint },
  // Inset ring: drawn over the card so the layout does not shift when the selection moves.
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.l,
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
  tags: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  due: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dueText: { flexShrink: 1 },
});
