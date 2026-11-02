import { TaskPriority } from '@task-app/shared';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { PRIORITY_LABEL } from '../../utils/taskFormat.util';
import { AppText } from '../brand/AppText';
import { PriorityIcon } from '../task/PriorityIcon';

const OPTIONS = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH];

interface PriorityPickerProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
}

/** Three 52px tiles; the selected one takes its priority colours. */
export function PriorityPicker({ value, onChange }: PriorityPickerProps): ReactNode {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {OPTIONS.map((priority) => {
        const selected = priority === value;
        const tone = colors.priority[priority];
        return (
          <Pressable
            key={priority}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(priority)}
            style={[
              styles.tile,
              selected && { backgroundColor: tone.background, borderColor: tone.foreground },
            ]}
          >
            <PriorityIcon
              priority={priority}
              color={selected ? tone.foreground : colors.textSecondary}
            />
            <AppText variant="labelL" color={selected ? tone.foreground : colors.textStrong}>
              {PRIORITY_LABEL[priority]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.m,
    borderWidth: 2,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
  },
});
