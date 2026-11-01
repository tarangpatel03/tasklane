import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { TaskAction, TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { useState } from 'react';
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
import { fetchTasks, fetchTaskSummary, type Task } from '../api/tasks';
import { AppText } from '../components/app-text';
import { NAV_CLEARANCE, ManagerNav } from '../components/bottom-nav';
import { EmptyState } from '../components/empty-state';
import { Entrance } from '../components/entrance';
import { RejectSheet } from '../components/reject-sheet';
import { ReviewCard } from '../components/review-card';
import { SkeletonCard } from '../components/skeleton';
import { TextButton } from '../components/text-button';
import { Wash } from '../components/wash';
import { useTransitionTask } from '../hooks/use-transition-task';
import type { RootStackParamList } from '../navigation/types';
import { colors, duration, easing, fontFamily, radii, screenMargin, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

const COLUMN_MAX_WIDTH = 560;
const SKELETON_COUNT = 3;

/** A handled card slides 60px right and fades over 200ms; the cards below then close the gap over 300ms. */
const handledExit = new Keyframe({
  0: { opacity: 1, transform: [{ translateX: 0 }] },
  100: { opacity: 0, transform: [{ translateX: 60 }], easing: easing.accelerate },
}).duration(duration.exit);

/** Tasks In Review for the signed-in Manager, with Approve and Reject on each card. */
export function ReviewScreen({ navigation }: Props): ReactNode {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const transition = useTransitionTask();
  const [refreshing, setRefreshing] = useState(false);
  const [rejectTask, setRejectTask] = useState<Task | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const margin = screenMargin.compact;

  const summary = useQuery({ queryKey: ['tasks', 'summary'], queryFn: fetchTaskSummary });
  const list = useInfiniteQuery({
    queryKey: ['tasks', 'list', TaskStatus.IN_REVIEW],
    queryFn: ({ pageParam }) => fetchTasks(TaskStatus.IN_REVIEW, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const tasks = list.data?.pages.flatMap((page) => page.items) ?? [];
  const waiting = summary.data?.[TaskStatus.IN_REVIEW] ?? tasks.length;
  const showSkeleton = list.isPending || refreshing;
  const busyTaskId = transition.isPending ? transition.variables.taskId : null;

  const refresh = async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([summary.refetch(), list.refetch()]);
    setRefreshing(false);
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
                busy={busyTaskId === task.id}
                onOpen={() => navigation.navigate('TaskDetail', { taskId: task.id })}
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

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            colors={[colors.primary]}
            progressViewOffset={insets.top}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + NAV_CLEARANCE }}
      >
        <View style={styles.washWrap}>
          <Wash />
          <View
            style={{
              paddingTop: insets.top + spacing.xl,
              paddingLeft: insets.left + margin,
              paddingRight: insets.right + margin,
            }}
          >
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
        <View
          style={[
            styles.column,
            styles.cards,
            { paddingLeft: insets.left + margin, paddingRight: insets.right + margin },
          ]}
        >
          {body}
        </View>
      </ScrollView>
      <ManagerNav active="Review" />
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
  column: { width: '100%', maxWidth: COLUMN_MAX_WIDTH, alignSelf: 'center' },
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
