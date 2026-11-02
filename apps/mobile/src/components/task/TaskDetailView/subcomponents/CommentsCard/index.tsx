import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { TaskComment } from '../../../../../api/tasks.api';
import { colors, radii, spacing } from '../../../../../theme';
import { relativeTime } from '../../../../../utils/taskFormat.util';
import { AppText } from '../../../../brand/AppText';
import { Avatar } from '../../../../brand/Avatar';
import { Card } from '../Card';
import { LoadNote } from '../LoadNote';
import { CommentComposer } from './subcomponents/CommentComposer';

interface CommentsCardProps {
  comments: TaskComment[];
  /** True when loading the comments failed, so the card shows a retry note instead of "No comments yet". */
  failed: boolean;
  /** `userId` marks the viewer's own avatar. */
  userId?: string;
  onRetry: () => void;
  onSend: (body: string) => Promise<void>;
}

/** Comment list with the composer. */
export function CommentsCard({
  comments,
  failed,
  userId,
  onRetry,
  onSend,
}: CommentsCardProps): ReactNode {
  return (
    <Card title={`Comments (${comments.length})`}>
      {failed ? (
        <LoadNote text="Couldn't load comments." onRetry={onRetry} />
      ) : comments.length === 0 ? (
        <AppText variant="bodyM" color={colors.textSecondary}>
          No comments yet
        </AppText>
      ) : (
        comments.map((comment) => (
          <View key={comment.id} style={styles.comment}>
            <Avatar
              id={comment.author.id}
              name={comment.author.name}
              size={36}
              own={comment.author.id === userId}
            />
            <View style={styles.bubble}>
              <AppText variant="labelL">{comment.author.name}</AppText>
              <AppText variant="bodyM">{comment.body}</AppText>
              <AppText variant="labelS" color={colors.textSecondary}>
                {relativeTime(comment.createdAt)}
              </AppText>
            </View>
          </View>
        ))
      )}
      <CommentComposer onSend={onSend} />
    </Card>
  );
}

const styles = StyleSheet.create({
  comment: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  bubble: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.m,
    backgroundColor: colors.background,
  },
});
