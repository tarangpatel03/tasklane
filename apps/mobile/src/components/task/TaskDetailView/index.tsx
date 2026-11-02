import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Role, TaskAction } from '@task-app/shared';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { Keyframe, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toMessage } from '../../../api/errorMessage.api';
import { taskKeys } from '../../../api/queryKeys.api';
import {
  deleteTask,
  fetchComments,
  fetchHistory,
  fetchTask,
  postComment,
} from '../../../api/tasks.api';
import { useAuth } from '../../../auth/auth.context';
import { useTransitionTask } from '../../../hooks/useTransitionTask';
import { useWindowClass } from '../../../hooks/useWindowClass';
import type { RootStackParamList } from '../../../navigation/navigation.types';
import { SCREENS } from '../../../navigation/routes';
import { colors, duration, easing, spacing, tablet } from '../../../theme';
import { EmptyState } from '../../feedback/EmptyState';
import { useSnackbar } from '../../feedback/Snackbar';
import { RejectSheet } from '../../sheets/RejectSheet';
import { footerFor } from './detailFooter.util';
import { CommentsCard } from './subcomponents/CommentsCard';
import { DeleteTaskSheet } from './subcomponents/DeleteTaskSheet';
import { DescriptionCard } from './subcomponents/DescriptionCard';
import { DetailFooter } from './subcomponents/DetailFooter';
import { DetailHeader } from './subcomponents/DetailHeader';
import { DetailSkeleton } from './subcomponents/DetailSkeleton';
import { HistoryCard } from './subcomponents/HistoryCard';
import { PeopleCard } from './subcomponents/PeopleCard';
import type { DetailVariant } from './taskDetailView.types';

interface TaskDetailViewProps {
  taskId: string;
  variant: DetailVariant;
  /** Back button (screen) or close button (sheet). Not used in the pane. */
  onDismiss?: () => void;
  /** Called once the task has been deleted, so the host can leave or clear its selection. */
  onDeleted: () => void;
}

/** Room the pinned action bar takes, so the last card scrolls clear of it. */
const ACTION_BAR_SPACE = 120;
/** Padding of the detail body per variant (the screen variant follows the window margin). */
const SHEET_PADDING = 24;
const PANE_PADDING = 32;
/** The pane needs this much width for two columns; narrower panes stack the cards. */
const TWO_COLUMN_MIN_PANE = 700;

/** Content slides in 60px from the right over 450ms (brief: detail enters on phone). */
const slideIn = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: 60 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }], easing: easing.emphasized },
}).duration(duration.sharedElement);

/**
 * One task: details, people, comments, status history and the actions the viewer may take.
 * The same view is a pushed screen on phones, a side sheet on medium windows and a pane on wide ones.
 */
export function TaskDetailView({
  taskId,
  variant,
  onDismiss,
  onDeleted,
}: TaskDetailViewProps): ReactNode {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { margin, width } = useWindowClass();
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const snackbar = useSnackbar();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isPane = variant === 'pane';
  const padding = { screen: margin, sheet: SHEET_PADDING, pane: PANE_PADDING }[variant];
  const leftInset = variant === 'screen' ? insets.left : 0;
  const twoColumns = isPane && width - tablet.listPane >= TWO_COLUMN_MIN_PANE;

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const task = useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => fetchTask(taskId),
  });
  const comments = useQuery({
    queryKey: taskKeys.comments(taskId),
    queryFn: () => fetchComments(taskId),
  });
  const history = useQuery({
    queryKey: taskKeys.history(taskId),
    queryFn: () => fetchHistory(taskId),
  });

  const transition = useTransitionTask();
  const remove = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: () => {
      setDeleteOpen(false);
      onDeleted();
      // Drop the cached task first so its queries do not refetch a 404.
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      snackbar.show('Task deleted');
    },
    onError: (error) => snackbar.show(toMessage(error)),
  });

  const addComment = async (body: string): Promise<void> => {
    try {
      await postComment(taskId, body);
      await queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
    } catch (error) {
      snackbar.show(toMessage(error));
      throw error;
    }
  };

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
    content = <DetailSkeleton />;
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
    const descriptionCard = <DescriptionCard task={data} />;
    const peopleCard = <PeopleCard task={data} userId={user?.id} />;
    const commentsCard = (
      <CommentsCard
        comments={commentItems}
        failed={comments.isError}
        userId={user?.id}
        onRetry={() => void comments.refetch()}
        onSend={addComment}
      />
    );
    const historyCard = (
      <HistoryCard
        entries={historyItems}
        failed={history.isError}
        onRetry={() => void history.refetch()}
      />
    );

    content = (
      <Animated.View
        entering={reduceMotion || variant !== 'screen' ? undefined : slideIn}
        style={styles.cards}
      >
        {twoColumns ? (
          <View style={styles.columns}>
            <View style={styles.column}>
              {descriptionCard}
              {peopleCard}
            </View>
            <View style={styles.column}>
              {commentsCard}
              {historyCard}
            </View>
          </View>
        ) : (
          <>
            {descriptionCard}
            {peopleCard}
            {commentsCard}
            {historyCard}
          </>
        )}
      </Animated.View>
    );
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: isPane ? spacing.xxl : insets.bottom + ACTION_BAR_SPACE,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              colors={[colors.primary]}
              progressViewOffset={insets.top}
            />
          }
        >
          <DetailHeader
            variant={variant}
            onDismiss={onDismiss}
            task={data}
            loading={task.isPending}
            canManage={isTaskManager}
            onEdit={() => navigation.navigate(SCREENS.TaskForm, { taskId })}
            onDelete={() => setDeleteOpen(true)}
            paddingLeft={leftInset + padding}
            padding={padding}
          />
          <View
            style={{
              paddingLeft: leftInset + padding,
              paddingRight: insets.right + padding,
            }}
          >
            {content}
          </View>
        </ScrollView>

        {data && footer && !hideFooter ? (
          <DetailFooter
            footer={footer}
            isPane={isPane}
            busy={busy}
            approving={busy && transition.variables?.action === TaskAction.APPROVE}
            paddingLeft={leftInset + padding}
            padding={padding}
            onAction={(action) => transition.mutate({ taskId, action })}
            onReject={() => setRejectOpen(true)}
          />
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

      <DeleteTaskSheet
        visible={deleteOpen}
        taskTitle={data?.title ?? ''}
        deleting={remove.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => remove.mutate()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  cards: { gap: spacing.lg, paddingTop: spacing.lg },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  column: { flex: 1, gap: spacing.lg },
});
