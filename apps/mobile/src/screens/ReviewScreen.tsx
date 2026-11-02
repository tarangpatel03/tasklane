import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { TaskAction, TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { Keyframe, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchTasks, fetchTaskSummary, type Task } from '../api/tasks.api';
import { AppText } from '../components/brand/AppText';
import { NAV_CLEARANCE } from '../components/navigation/BottomNav';
import { EmptyState } from '../components/feedback/EmptyState';
import { Entrance } from '../components/layout/Entrance';
import { EmptyPane, ListDetail, PaneSwap } from '../components/layout/ListDetail';
import { RejectSheet } from '../components/sheets/RejectSheet';
import { ReviewCard } from '../components/task/ReviewCard';
import { SideSheet } from '../components/sheets/SideSheet';
import { SkeletonCard } from '../components/feedback/Skeleton';
import { TextButton } from '../components/buttons/TextButton';
import { Wash } from '../components/layout/Wash';
import { useTransitionTask } from '../hooks/useTransitionTask';
import { useWindowClass } from '../hooks/useWindowClass';
import type { RootStackParamList, TabParamList } from '../navigation/navigation.types';
import { colors, duration, easing, fontFamily, radii, spacing, tablet } from '../theme';
import { TaskDetailView } from './TaskDetailView';
import { SCREENS } from '../navigation/routes';
import { taskKeys } from '../api/queryKeys.api';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, typeof SCREENS.Review>,
  NativeStackScreenProps<RootStackParamList>
>;

const SKELETON_COUNT = 3;

/** A handled card slides 60px right and fades over 200ms; the cards below then close the gap over 300ms. */
const handledExit = new Keyframe({
  0: { opacity: 1, transform: [{ translateX: 0 }] },
  100: { opacity: 0, transform: [{ translateX: 60 }], easing: easing.accelerate },
}).duration(duration.exit);

/** Tasks In Review for the signed-in Manager, with Approve and Reject on each card. */
export function ReviewScreen({ navigation, route }: Props): ReactNode {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const transition = useTransitionTask();
  const { windowClass, margin } = useWindowClass();
  const expanded = windowClass === 'expanded';
  const medium = windowClass === 'medium';
  const [refreshing, setRefreshing] = useState(false);
  const [rejectTask, setRejectTask] = useState<Task | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  // The open task. It lives here so it survives rotation and window changes.
  const [selectedId, setSelectedId] = useState<string | null>(route.params?.selectedId ?? null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const summary = useQuery({ queryKey: taskKeys.summary(), queryFn: fetchTaskSummary });
  const list = useInfiniteQuery({
    queryKey: taskKeys.list(TaskStatus.IN_REVIEW),
    queryFn: ({ pageParam }) => fetchTasks(TaskStatus.IN_REVIEW, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const tasks = list.data?.pages.flatMap((page) => page.items) ?? [];
  const waiting = summary.data?.[TaskStatus.IN_REVIEW] ?? tasks.length;
  const showSkeleton = list.isPending || refreshing;
  const busyTaskId = transition.isPending ? transition.variables.taskId : null;
  const firstTaskId = tasks[0]?.id ?? null;
  const selectedInQueue = selectedId !== null && tasks.some((task) => task.id === selectedId);

  // A task handed over by the detail screen when the window grew to the split layout.
  const paramId = route.params?.selectedId;
  useEffect(() => {
    if (paramId) setSelectedId(paramId);
  }, [paramId]);

  // The split layout shows the queue's tasks only: start with the first, and move on when the
  // open one leaves the queue (approved or rejected). Waits for the refetch so it never flickers.
  useEffect(() => {
    if (!expanded || list.isFetching) return;
    if (!selectedInQueue) setSelectedId(firstTaskId);
  }, [expanded, list.isFetching, selectedInQueue, firstTaskId]);

  // The side sheet only exists on medium windows.
  useEffect(() => {
    if (!medium) setSheetOpen(false);
  }, [medium]);

  const refresh = async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([summary.refetch(), list.refetch()]);
    setRefreshing(false);
  };

  const openTask = (taskId: string): void => {
    if (expanded) {
      setSelectedId(taskId);
    } else if (medium) {
      setSelectedId(taskId);
      setSheetOpen(true);
    } else {
      navigation.navigate(SCREENS.TaskDetail, { taskId, from: SCREENS.Review });
    }
  };

  const handleDeleted = (): void => {
    setSheetOpen(false);
    setSelectedId(null);
  };

  let body: ReactNode;
  if (showSkeleton) {
    body = Array.from({ length: SKELETON_COUNT }, (_unused, index) => <SkeletonCard key={index} />);
  } else if (list.isError && tasks.length === 0) {
    body = (
      <EmptyState
        title="Couldn't load the review queue"
        message="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => void list.refetch()}
      />
    );
  } else if (tasks.length === 0) {
    body = (
      <EmptyState
        title="Nothing in review"
        message="Tasks your team submits for review will appear here."
        tileSize={96}
      />
    );
  } else {
    body = (
      <>
        {tasks.map((task, index) => (
          <Animated.View
            key={task.id}
            layout={reduceMotion ? undefined : LinearTransition.duration(duration.sheet)}
            exiting={reduceMotion ? undefined : handledExit}
          >
            <Entrance index={index}>
              <ReviewCard
                task={task}
                selected={expanded && selectedId === task.id}
                busy={busyTaskId === task.id}
                onOpen={() => openTask(task.id)}
                onApprove={() => transition.mutate({ taskId: task.id, action: TaskAction.APPROVE })}
                onReject={() => {
                  setRejectTask(task);
                  setRejectOpen(true);
                }}
              />
            </Entrance>
          </Animated.View>
        ))}
        {list.hasNextPage ? (
          list.isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <TextButton label="Show more" onPress={() => void list.fetchNextPage()} />
          )
        ) : null}
      </>
    );
  }

  const queuePane = (
    <View style={styles.flex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          paddingLeft: expanded ? 0 : insets.left,
          paddingRight: expanded ? 0 : insets.right,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            colors={[colors.primary]}
            progressViewOffset={insets.top}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + NAV_CLEARANCE.withButton }}
      >
        <View style={styles.washWrap}>
          <Wash />
          <View style={{ paddingTop: insets.top + spacing.xl, paddingHorizontal: margin }}>
            <View style={[styles.column, styles.header]}>
              <AppText variant="headline" style={styles.title}>
                Review queue
              </AppText>
              <View style={styles.waitingRow}>
                <AppText style={styles.waitingCount}>{String(waiting)}</AppText>
                <AppText variant="bodyM" color={colors.textSecondary}>
                  waiting for your review
                </AppText>
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.column, styles.cards, { paddingHorizontal: margin }]}>{body}</View>
      </ScrollView>
    </View>
  );

  const detail = selectedId ? (
    <PaneSwap key={selectedId}>
      <TaskDetailView taskId={selectedId} variant="pane" onDeleted={handleDeleted} />
    </PaneSwap>
  ) : (
    <EmptyPane title="Nothing in review" message="Select a task from the queue when one arrives." />
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {expanded ? (
        <ListDetail list={queuePane} detail={detail} leftInset={insets.left} />
      ) : (
        queuePane
      )}
      {medium ? (
        <SideSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
          {selectedId ? (
            <TaskDetailView
              key={selectedId}
              taskId={selectedId}
              variant="sheet"
              onDismiss={() => setSheetOpen(false)}
              onDeleted={handleDeleted}
            />
          ) : null}
        </SideSheet>
      ) : null}
      <RejectSheet
        visible={rejectOpen}
        taskTitle={rejectTask?.title ?? ''}
        busy={transition.isPending}
        onClose={() => setRejectOpen(false)}
        onReject={(reason) => {
          if (!rejectTask) return;
          transition.mutate(
            { taskId: rejectTask.id, action: TaskAction.REJECT, comment: reason },
            { onSuccess: () => setRejectOpen(false) },
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  // Single-column content is centred and capped; on wide windows the pane width does that.
  column: { width: '100%', maxWidth: tablet.column, alignSelf: 'center' },
  washWrap: {
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    overflow: 'hidden',
  },
  header: { gap: spacing.xs, paddingBottom: spacing.xxl },
  title: { fontSize: 30, lineHeight: 36 },
  waitingRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  waitingCount: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    lineHeight: 26,
    color: colors.status.IN_REVIEW.foreground,
    fontVariant: ['tabular-nums'],
  },
  cards: { gap: spacing.lg, paddingTop: spacing.xl },
});
