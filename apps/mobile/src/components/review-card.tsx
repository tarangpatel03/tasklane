import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Task } from '../api/tasks';
import { colors, elevation, fontFamily, radii, spacing } from '../theme';
import { dueText, isOverdue, relativeTime } from '../utils/task-format';
import { ActionButton } from './action-button';
import { AppText } from './app-text';
import { Avatar } from './avatar';
import { PriorityTag } from './priority-tag';
import { StatusBadge } from './status-badge';

interface ReviewCardProps {
  task: Task;
  /** True while this card's Approve or Reject is being sent. */
  busy: boolean;
  onOpen: () => void;
  onApprove: () => void;
  onReject: () => void;
}

/** A task waiting for the Manager: who submitted it and when, with Reject and Approve inline. */
export function ReviewCard({
  task,
  busy,
  onOpen,
  onApprove,
  onReject,
}: ReviewCardProps): ReactNode {
  const overdue = isOverdue(task.dueDate, task.status);
  const submittedBy = task.submittedBy;
  const when = task.submittedAt ? relativeTime(task.submittedAt) : null;

  return (
    <Pressable accessibilityRole="button" onPress={onOpen} style={styles.card}>
      <View style={styles.tags}>
        <PriorityTag priority={task.priority} />
        <StatusBadge status={task.status} />
      </View>
      <AppText variant="titleM" numberOfLines={2}>
        {task.title}
      </AppText>
      {submittedBy ? (
        <View style={styles.submitter}>
          <Avatar id={submittedBy.id} name={submittedBy.name} size={40} />
          <View style={styles.submitterText}>
            <AppText variant="bodyM" style={styles.name}>
              {`Submitted by ${submittedBy.name}`}
            </AppText>
            <AppText variant="labelS" color={overdue ? colors.errorText : colors.textSecondary}>
              {[when, dueText(task.dueDate, task.status)].filter(Boolean).join(' · ')}
            </AppText>
          </View>
        </View>
      ) : null}
      <View style={styles.buttons}>
        <ActionButton label="Reject" variant="reject" compact disabled={busy} onPress={onReject} />
        <ActionButton
          label="Approve"
          variant="approve"
          compact
          loading={busy}
          onPress={onApprove}
        />
      </View>
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
  tags: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  submitter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  submitterText: { flex: 1 },
  name: { fontFamily: fontFamily.bold },
  buttons: { flexDirection: 'row', gap: spacing.md },
});
