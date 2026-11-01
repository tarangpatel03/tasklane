import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Role, TaskAction, TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { Keyframe, useReducedMotion } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import {
  fetchComments,
  fetchHistory,
  fetchTask,
  postComment,
  deleteTask,
  type Task,
} from '../api/tasks';
import { toMessage } from '../api/error-message';
import { useAuth } from '../auth/auth-context';
import { ActionButton } from '../components/action-button';
import { AppText } from '../components/app-text';
import { Avatar } from '../components/avatar';
import { BackButton } from '../components/back-button';
import { BottomSheet } from '../components/bottom-sheet';
import { CommentComposer } from '../components/comment-composer';
import { EmptyState } from '../components/empty-state';
import { HistoryTimeline } from '../components/history-timeline';
import { PriorityTag } from '../components/priority-tag';
import { RejectSheet } from '../components/reject-sheet';
import { useSnackbar } from '../components/snackbar';
import { StatusBadge } from '../components/status-badge';
import { Wash } from '../components/wash';
import { useTransitionTask } from '../hooks/use-transition-task';
import type { RootStackParamList } from '../navigation/types';
import {
  colors,
  duration,
  easing,
  elevation,
  fontFamily,
  radii,
  screenMargin,
  sizes,
  spacing,
} from '../theme';
import { dueText, formatDate, isOverdue, relativeTime } from '../utils/task-format';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

const COLUMN_MAX_WIDTH = 560;
/** Room the pinned action bar takes, so the last card scrolls clear of it. */
const ACTION_BAR_SPACE = 120;

/** Content slides in 60px from the right over 450ms (brief: detail enters on phone). */
const slideIn = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: 60 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }], easing: easing.emphasized },
}).duration(duration.sharedElement);

type Footer =
  | {
      kind: 'actions';
      actions: Array<{ action: TaskAction; label: string; variant: 'primary' | 'approve' }>;
    }
  | { kind: 'review' }
  | { kind: 'line'; text: string };

/** What the viewer can do now. Only a hint: the API still checks every transition. */
function footerFor(task: Task, userId: string, role: Role): Footer {
  const isAssignee = task.assignees.some((person) => person.id === userId);
  const isManager = role === Role.MANAGER && task.manager?.id === userId;

  if (isAssignee && task.status === TaskStatus.TODO) {
    return {
      kind: 'actions',
      actions: [{ action: TaskAction.START, label: 'Start', variant: 'primary' }],
    };
  }
  if (isAssignee && task.status === TaskStatus.WORKING) {
    return task.requiresReview
      ? {
          kind: 'actions',
          actions: [{ action: TaskAction.SUBMIT, label: 'Submit for review', variant: 'primary' }],
        }
      : {
          kind: 'actions',
          actions: [{ action: TaskAction.COMPLETE, label: 'Complete', variant: 'approve' }],
        };
  }
  if (isManager && task.status === TaskStatus.IN_REVIEW) return { kind: 'review' };
  if (task.status === TaskStatus.COMPLETED) return { kind: 'line', text: 'Task completed' };
  if (isAssignee) return { kind: 'line', text: 'Waiting for manager review' };
  return { kind: 'line', text: 'Approve or reject when In Review' };
}

function Card({ title, children }: { title: string; children: ReactNode }): ReactNode {
  return (
    <View style={styles.card}>
      <AppText variant="titleM" style={styles.cardTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}): ReactNode {
  return (
    <View style={styles.infoRow}>
      <AppText variant="labelL" color={colors.textSecondary}>
        {label}
      </AppText>
      <AppText variant="bodyL" color={valueColor} style={styles.infoValue}>
        {value}
      </AppText>
    </View>
  );
}

/** One task: details, people, comments, status history and the actions the viewer may take. */
export function TaskDetailScreen({ navigation, route }: Props): ReactNode {
  const { taskId } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const snackbar = useSnackbar();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const margin = screenMargin.compact;

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const task = useQuery({
    queryKey: ['tasks', 'detail', taskId],
    queryFn: () => fetchTask(taskId),
  });
  const comments = useQuery({
    queryKey: ['tasks', 'comments', taskId],
    queryFn: () => fetchComments(taskId),
  });
  const history = useQuery({
    queryKey: ['tasks', 'history', taskId],
    queryFn: () => fetchHistory(taskId),
  });

  const transition = useTransitionTask();
  const remove = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: () => {
      setDeleteOpen(false);
      navigation.goBack();
      // Drop the cached task first so its queries do not refetch a 404.
      queryClient.removeQueries({ queryKey: ['tasks', 'detail', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      snackbar.show('Task deleted');
    },
    onError: (error) => snackbar.show(toMessage(error)),
  });

  const addComment = async (body: string): Promise<void> => {
    try {
      await postComment(taskId, body);
      await queryClient.invalidateQueries({ queryKey: ['tasks', 'comments', taskId] });
    } catch (error) {
      snackbar.show(toMessage(error));
      throw error;
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const refresh = async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([task.refetch(), comments.refetch(), history.refetch()]);
    setRefreshing(false);
  };

  const data = task.data;
  const footer = data && user ? footerFor(data, user.id, user.role) : null;
  const commentItems = comments.data?.items ?? [];
  // The API returns oldest first; the timeline reads newest first.
  const historyItems = [...(history.data?.items ?? [])].reverse();
  const busy = transition.isPending;
  const isTaskManager = user?.role === Role.MANAGER && data?.manager?.id === user.id;
  const hideFooter = keyboardVisible || footer === null;

  let content: ReactNode;
  if (task.isPending) {
    content = <ActivityIndicator color={colors.primary} style={styles.loading} />;
  } else if (task.isError || !data) {
    content = (
      <EmptyState
        title="Couldn't load this task"
        message="It may have been removed, or you may be offline."
        actionLabel="Retry"
        onAction={() => void task.refetch()}
      />
    );
  } else {
    const overdue = isOverdue(data.dueDate, data.status);
    content = (
      <Animated.View entering={reduceMotion ? undefined : slideIn} style={styles.cards}>
        <Card title="Description">
          {data.description ? (
            <AppText variant="bodyL">{data.description}</AppText>
          ) : (
            <AppText variant="bodyL" color={colors.textSecondary}>
              No description
            </AppText>
          )}
          <View style={styles.rows}>
            <InfoRow
              label="Due date"
              value={dueText(data.dueDate, data.status)}
              valueColor={overdue ? colors.errorText : undefined}
            />
            <InfoRow
              label="Review"
              value={data.requiresReview ? 'Manager approval required' : 'Not required'}
            />
          </View>
        </Card>

        <Card title="People">
          {data.manager ? (
            <View style={styles.person}>
              <View style={styles.managerRing}>
                <Avatar
                  id={data.manager.id}
                  name={data.manager.name}
                  size={42}
                  own={data.manager.id === user?.id}
                />
              </View>
              <View style={styles.personText}>
                <AppText variant="bodyL" style={styles.personName}>
                  {data.manager.name}
                </AppText>
                <AppText variant="labelS" color={colors.primaryPressed}>
                  Manager
                </AppText>
              </View>
            </View>
          ) : null}
          {data.assignees.map((person) => (
            <View key={person.id} style={styles.person}>
              <Avatar id={person.id} name={person.name} size={48} own={person.id === user?.id} />
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

        <Card title={`Comments (${commentItems.length})`}>
          {commentItems.length === 0 ? (
            <AppText variant="bodyM" color={colors.textSecondary}>
              No comments yet
            </AppText>
          ) : (
            commentItems.map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <Avatar
                  id={comment.author.id}
                  name={comment.author.name}
                  size={36}
                  own={comment.author.id === user?.id}
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
          <CommentComposer onSend={addComment} />
        </Card>

        <Card title="Status history">
          {historyItems.length === 0 ? (
            <AppText variant="bodyM" color={colors.textSecondary}>
              No changes yet
            </AppText>
          ) : (
            <HistoryTimeline entries={historyItems} />
          )}
        </Card>
      </Animated.View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + ACTION_BAR_SPACE }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              colors={[colors.primary]}
              progressViewOffset={insets.top}
            />
          }
        >
          <View style={styles.washWrap}>
            <Wash />
            <View
              style={{
                paddingTop: insets.top + spacing.lg,
                paddingLeft: insets.left,
                paddingRight: insets.right,
              }}
            >
              <View style={[styles.column, styles.header, { paddingHorizontal: margin }]}>
                <View style={styles.headerRow}>
                  <BackButton onPress={() => navigation.goBack()} />
                  <AppText variant="titleM" style={styles.headerTitle}>
                    Task detail
                  </AppText>
                  {isTaskManager ? (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => navigation.navigate('TaskForm', { taskId })}
                        style={styles.editPill}
                      >
                        <AppText variant="labelL" color={colors.onPrimaryContainer}>
                          Edit
                        </AppText>
                      </Pressable>
                      <Pressable
                        accessibilityLabel="Delete task"
                        accessibilityRole="button"
                        onPress={() => setDeleteOpen(true)}
                        style={styles.deleteButton}
                      >
                        <Svg width={22} height={22} viewBox="0 0 24 24">
                          <Path
                            d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3"
                            fill="none"
                            stroke={colors.destructive}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </Pressable>
                    </>
                  ) : null}
                </View>
                {data ? (
                  <>
                    <View style={styles.tags}>
                      <PriorityTag priority={data.priority} />
                      <StatusBadge status={data.status} large />
                    </View>
                    <AppText variant="headline" style={styles.title}>
                      {data.title}
                    </AppText>
                  </>
                ) : null}
              </View>
            </View>
          </View>
          <View
            style={[
              styles.column,
              {
                paddingHorizontal: margin,
                paddingLeft: margin + insets.left,
                paddingRight: margin + insets.right,
              },
            ]}
          >
            {content}
          </View>
        </ScrollView>

        {data && footer && !hideFooter ? (
          <View
            pointerEvents="box-none"
            style={[styles.footerWrap, { paddingBottom: insets.bottom + spacing.md }]}
          >
            <Svg style={StyleSheet.absoluteFill} pointerEvents="none" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="foot" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.background} stopOpacity={0} />
                  <Stop offset="0.45" stopColor={colors.background} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#foot)" />
            </Svg>
            <View style={[styles.column, styles.footerRow, { paddingHorizontal: margin }]}>
              {footer.kind === 'actions' &&
                footer.actions.map((item) => (
                  <ActionButton
                    key={item.action}
                    label={item.label}
                    variant={item.variant}
                    loading={busy}
                    onPress={() => transition.mutate({ taskId, action: item.action })}
                  />
                ))}
              {footer.kind === 'review' && (
                <>
                  <ActionButton
                    label="Reject"
                    variant="reject"
                    disabled={busy}
                    onPress={() => setRejectOpen(true)}
                  />
                  <ActionButton
                    label="Approve"
                    variant="approve"
                    loading={busy && transition.variables?.action === TaskAction.APPROVE}
                    disabled={busy}
                    onPress={() => transition.mutate({ taskId, action: TaskAction.APPROVE })}
                  />
                </>
              )}
              {footer.kind === 'line' && (
                <View style={styles.statusLine}>
                  <AppText
                    variant="bodyL"
                    color={colors.disabledText}
                    style={styles.statusLineText}
                  >
                    {footer.text}
                  </AppText>
                </View>
              )}
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <RejectSheet
        visible={rejectOpen}
        taskTitle={data?.title ?? ''}
        busy={busy}
        onClose={() => setRejectOpen(false)}
        onReject={(reason) =>
          transition.mutate(
            { taskId, action: TaskAction.REJECT, comment: reason },
            { onSuccess: () => setRejectOpen(false) },
          )
        }
      />

      <BottomSheet visible={deleteOpen} onClose={() => !remove.isPending && setDeleteOpen(false)}>
        <AppText variant="titleL">Delete task?</AppText>
        <AppText variant="bodyL" color={colors.textSecondary} numberOfLines={2}>
          {data?.title ?? ''}
        </AppText>
        <AppText variant="bodyM" color={colors.textSecondary}>
          It disappears from every list. This can't be undone from the app.
        </AppText>
        <View style={styles.sheetButtons}>
          <ActionButton
            label="Cancel"
            variant="outlined"
            disabled={remove.isPending}
            onPress={() => setDeleteOpen(false)}
          />
          <ActionButton
            label="Delete task"
            variant="destructive"
            loading={remove.isPending}
            onPress={() => remove.mutate()}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  column: { width: '100%', maxWidth: COLUMN_MAX_WIDTH, alignSelf: 'center' },
  washWrap: {
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    overflow: 'hidden',
  },
  header: { gap: spacing.lg, paddingBottom: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerTitle: { flex: 1 },
  editPill: {
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: sizes.touchTarget / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tags: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  title: { fontSize: 26, lineHeight: 32 },
  loading: { paddingVertical: spacing.huge },
  cards: { gap: spacing.lg, paddingTop: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.l,
    padding: spacing.xl,
    gap: spacing.lg,
    ...elevation.l2,
  },
  cardTitle: { fontSize: 17, lineHeight: 22, fontFamily: fontFamily.extrabold },
  rows: { gap: spacing.md },
  infoRow: { gap: spacing.xs },
  infoValue: { flexShrink: 1 },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  personText: { flex: 1 },
  personName: { fontFamily: fontFamily.bold },
  managerRing: {
    padding: 3,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  comment: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  bubble: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.m,
    backgroundColor: colors.background,
  },
  footerWrap: { paddingTop: spacing.xxxl, position: 'absolute', left: 0, right: 0, bottom: 0 },
  footerRow: { flexDirection: 'row', gap: spacing.md },
  statusLine: {
    flex: 1,
    minHeight: sizes.buttonPrimary,
    borderRadius: radii.pill,
    backgroundColor: colors.disabledBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  statusLineText: { fontFamily: fontFamily.bold, textAlign: 'center' },

  sheetButtons: { flexDirection: 'row', gap: spacing.md },
});
