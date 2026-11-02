import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Task } from '../../../../../api/tasks.api';
import { colors, fontFamily, spacing } from '../../../../../theme';
import { AppText } from '../../../../brand/AppText';
import { Avatar } from '../../../../brand/Avatar';
import { Card } from '../Card';

/** The task's Manager and Employees. `userId` marks the viewer's own avatar. */
export function PeopleCard({ task, userId }: { task: Task; userId?: string }): ReactNode {
  return (
    <Card title="People">
      {task.manager ? (
        <View style={styles.person}>
          <View style={styles.managerRing}>
            <Avatar
              id={task.manager.id}
              name={task.manager.name}
              size={42}
              own={task.manager.id === userId}
            />
          </View>
          <View style={styles.personText}>
            <AppText variant="bodyL" style={styles.personName}>
              {task.manager.name}
            </AppText>
            <AppText variant="labelS" color={colors.primaryPressed}>
              Manager
            </AppText>
          </View>
        </View>
      ) : null}
      {task.assignees.map((person) => (
        <View key={person.id} style={styles.person}>
          <Avatar id={person.id} name={person.name} size={48} own={person.id === userId} />
          <View style={styles.personText}>
            <AppText variant="bodyL" style={styles.personName}>
              {person.name}
            </AppText>
            <AppText variant="labelS" color={colors.textSecondary}>
              Employee
            </AppText>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  personText: { flex: 1 },
  personName: { fontFamily: fontFamily.bold },
  managerRing: {
    padding: 3,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: colors.primary,
  },
});
