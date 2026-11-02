import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Task } from '../../../../../api/tasks.api';
import { colors, spacing } from '../../../../../theme';
import { dueText, isOverdue } from '../../../../../utils/taskFormat.util';
import { AppText } from '../../../../brand/AppText';
import { Card } from '../Card';
import { InfoRow } from '../InfoRow';

/** Description plus due date and review requirement. */
export function DescriptionCard({ task }: { task: Task }): ReactNode {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <Card title="Description">
      {task.description ? (
        <AppText variant="bodyL">{task.description}</AppText>
      ) : (
        <AppText variant="bodyL" color={colors.textSecondary}>
          No description
        </AppText>
      )}
      <View style={styles.rows}>
        <InfoRow
          label="Due date"
          value={dueText(task.dueDate, task.status)}
          valueColor={overdue ? colors.errorText : undefined}
        />
        <InfoRow
          label="Review"
          value={task.requiresReview ? 'Manager approval required' : 'Not required'}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  rows: { gap: spacing.md },
});
