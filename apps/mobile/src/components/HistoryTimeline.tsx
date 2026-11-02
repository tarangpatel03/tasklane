import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { TaskHistoryEntry } from '../api/tasks.api';
import { colors, spacing } from '../theme';
import { formatDate } from '../utils/taskFormat.util';
import { AppText } from './AppText';
import { StatusBadge } from './StatusBadge';

/** Status changes with a dot per entry and a connecting line. Pass entries newest first. */
export function HistoryTimeline({ entries }: { entries: TaskHistoryEntry[] }): ReactNode {
  return (
    <View>
      {entries.map((entry, index) => {
        const last = index === entries.length - 1;
        return (
          <View key={entry.id} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[styles.dot, { backgroundColor: colors.status[entry.toStatus].foreground }]}
              />
              {!last && <View style={styles.line} />}
            </View>
            <View style={[styles.body, !last && styles.bodySpaced]}>
              <StatusBadge status={entry.toStatus} />
              <AppText variant="bodyM" color={colors.textSecondary}>
                {`${entry.actor.name} · ${formatDate(entry.createdAt)}`}
              </AppText>
              {entry.comment ? <AppText variant="bodyM">{entry.comment}</AppText> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  rail: { width: 14, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: spacing.sm },
  line: { flex: 1, width: 2, backgroundColor: colors.outline },
  body: { flex: 1, gap: spacing.xs },
  bodySpaced: { paddingBottom: spacing.lg },
});
