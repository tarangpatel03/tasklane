import type { ReactNode } from 'react';
import type { TaskHistoryEntry } from '../../../../../api/tasks.api';
import { colors } from '../../../../../theme';
import { AppText } from '../../../../brand/AppText';
import { Card } from '../Card';
import { LoadNote } from '../LoadNote';
import { HistoryTimeline } from './subcomponents/HistoryTimeline';

interface HistoryCardProps {
  /** Newest first. */
  entries: TaskHistoryEntry[];
  /** True when loading the history failed, so the card shows a retry note instead of "No changes yet". */
  failed: boolean;
  onRetry: () => void;
}

/** Status changes of the task. */
export function HistoryCard({ entries, failed, onRetry }: HistoryCardProps): ReactNode {
  return (
    <Card title="Status history">
      {failed ? (
        <LoadNote text="Couldn't load the history." onRetry={onRetry} />
      ) : entries.length === 0 ? (
        <AppText variant="bodyM" color={colors.textSecondary}>
          No changes yet
        </AppText>
      ) : (
        <HistoryTimeline entries={entries} />
      )}
    </Card>
  );
}
