import type { TaskPriority } from '@task-app/shared';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { PRIORITY_LABEL } from '../../utils/taskFormat.util';
import { AppText } from '../brand/AppText';
import { PriorityIcon } from './PriorityIcon';

/** 28px tag, radius 10: three-bar icon plus the priority name. */
export function PriorityTag({ priority }: { priority: TaskPriority }): ReactNode {
  const tone = colors.priority[priority];
  return (
    <View style={[styles.tag, { backgroundColor: tone.background }]}>
      <PriorityIcon priority={priority} color={tone.foreground} />
      <AppText variant="labelS" color={tone.foreground}>
        {PRIORITY_LABEL[priority]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.xs,
    alignSelf: 'flex-start',
  },
});
