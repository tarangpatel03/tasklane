import type { TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useCountUp } from '../hooks/use-count-up';
import { colors, fontFamily, radii, spacing } from '../theme';
import { STATUS_LABEL } from '../utils/task-format';
import { AppText } from './app-text';
import { StatusIcon } from './status-icon';

interface SummaryTileProps {
  status: TaskStatus;
  count: number;
  active: boolean;
  onPress: () => void;
}

/** Status tile with a count-up number. The active tile gets a 2.5px ring in its status colour. */
export function SummaryTile({ status, count, active, onPress }: SummaryTileProps): ReactNode {
  const tone = colors.status[status];
  const shown = useCountUp(count);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${STATUS_LABEL[status]}, ${count} tasks`}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.tile,
        { backgroundColor: tone.background, borderColor: active ? tone.foreground : 'transparent' },
      ]}
    >
      <StatusIcon status={status} color={tone.foreground} checkColor={tone.background} size={16} />
      <AppText variant="labelL" color={tone.foreground}>
        {STATUS_LABEL[status]}
      </AppText>
      <AppText variant="headline" color={tone.foreground} style={styles.count}>
        {String(shown)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 88,
    borderRadius: radii.l,
    borderWidth: 2.5,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  count: {
    fontFamily: fontFamily.extrabold,
    fontSize: 34,
    lineHeight: 40,
    fontVariant: ['tabular-nums'],
  },
});
