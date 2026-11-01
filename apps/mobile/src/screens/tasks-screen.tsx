import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Role, type TaskStatus } from '@task-app/shared';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchTasks, fetchTaskSummary, type Task } from '../api/tasks';
import { useAuth } from '../auth/auth-context';
import { AppText } from '../components/app-text';
import { NAV_CLEARANCE } from '../components/bottom-nav';
import { EmptyState } from '../components/empty-state';
import { Entrance } from '../components/entrance';
import { FilterChip } from '../components/filter-chip';
import { EmptyPane, ListDetail, PaneSwap } from '../components/list-detail';
import { SideSheet } from '../components/side-sheet';
import { SkeletonCard } from '../components/skeleton';
import { SummaryTile } from '../components/summary-tile';
import { TaskCard } from '../components/task-card';
import { Wash } from '../components/wash';
import { useWindowClass } from '../hooks/use-window-class';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { colors, elevation, radii, sizes, spacing, tablet } from '../theme';
import { ROLE_LABEL, STATUS_LABEL, STATUS_ORDER } from '../utils/task-format';
import { TaskDetailView } from './task-detail-view';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Tasks'>,
  NativeStackScreenProps<RootStackParamList>
>;

/** Gap between cards, and between the two card columns on medium windows. */
const CARD_GAP = spacing.lg;

/** Tasks the signed-in Manager or Employee may see, filtered by status tiles or chips. */
export function TasksScreen({ navigation, route }: Props): ReactNode {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { windowClass, margin, width } = useWindowClass();
  const expanded = windowClass === 'expanded';
  const medium = windowClass === 'medium';
  const [filter, setFilter] = useState<TaskStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // The open task. It lives here (not in the detail) so it survives rotation and window changes.
  const [selectedId, setSelectedId] = useState<string | null>(route.params?.selectedId ?? null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const summary = useQuery({ queryKey: ['tasks', 'summary'], queryFn: fetchTaskSummary });
  const list = useInfiniteQuery({
    queryKey: ['tasks', 'list', filter],
    queryFn: ({ pageParam }) => fetchTasks(filter, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const tasks = list.data?.pages.flatMap((page) => page.items) ?? [];
  const counts = summary.data;
  const total = counts ? STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0) : 0;
  const shownCount = counts ? (filter ? counts[filter] : total) : 0;
  const isManager = user?.role === Role.MANAGER;
  const firstTaskId = tasks[0]?.id ?? null;

  // A task handed over by the detail screen when the window grew to the split layout.
  const paramId = route.params?.selectedId;
  useEffect(() => {
    if (paramId) setSelectedId(paramId);
  }, [paramId]);

  // The split layout starts with the first task open, but never overrides a choice.
  useEffect(() => {
    if (expanded && selectedId === null && firstTaskId !== null) setSelectedId(firstTaskId);
  }, [expanded, selectedId, firstTaskId]);

  // The side sheet only exists on medium windows.
  useEffect(() => {
    if (!medium) setSheetOpen(false);
  }, [medium]);

  const refresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([summary.refetch(), list.refetch()]);
    setRefreshing(false);
  }, [summary, list]);

  const toggle = (status: TaskStatus): void =>
    setFilter((current) => (current === status ? null : status));

  const openTask = (taskId: string): void => {
    if (expanded) {
      setSelectedId(taskId);
    } else if (medium) {
      setSelectedId(taskId);
      setSheetOpen(true);
    } else {
      navigation.navigate('TaskDetail', { taskId, from: 'Tasks' });
    }
  };

  const handleDeleted = (): void => {
    setSheetOpen(false);
    setSelectedId(tasks.find((task) => task.id !== selectedId)?.id ?? null);
  };

  const columns = medium ? 2 : 1;
  const itemWidth =
    columns === 2
      ? (width - insets.left - insets.right - margin * 2 - CARD_GAP) / columns
      : undefined;
  const contentStyle = { maxWidth: windowClass === 'compact' ? tablet.column : undefined };
  const statusRows = medium ? [STATUS_ORDER] : [STATUS_ORDER.slice(0, 2), STATUS_ORDER.slice(2)];

  const header = (
    <View>
      <View style={styles.washWrap}>
        <Wash />
        <View style={{ paddingTop: insets.top + spacing.lg }}>
          <View style={[styles.column, contentStyle]}>
            <View style={[styles.padded, { paddingHorizontal: margin }]}>
              <View style={styles.greetingRow}>
                <View style={styles.greeting}>
                  <AppText variant="bodyM" color={colors.textSecondary}>
                    Hello,
                  </AppText>
                  <AppText variant="headline" numberOfLines={1}>
                    {user?.name.split(' ')[0] ?? ''}
                  </AppText>
                  {user ? (
                    <View style={styles.rolePill}>
                      <AppText variant="labelS" color={colors.primaryPressed}>
                        {ROLE_LABEL[user.role]}
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <Pressable
                  accessibilityLabel="Refresh tasks"
                  accessibilityRole="button"
                  disabled={refreshing}
                  onPress={() => void refresh()}
                  style={styles.refresh}
                >
                  {refreshing ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Svg width={22} height={22} viewBox="0 0 24 24">
                      <Path
                        d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5"
                        fill="none"
                        stroke={colors.textPrimary}
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </Pressable>
              </View>

              <View style={styles.tiles}>
                {statusRows.map((row) => (
                  <View key={row[0]} style={styles.tileRow}>
                    {row.map((status) => (
                      <SummaryTile
                        key={status}
                        status={status}
                        count={counts?.[status] ?? 0}
                        active={filter === status}
                        onPress={() => toggle(status)}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.column, contentStyle]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chips, { paddingHorizontal: margin }]}
        >
          <FilterChip
            label={`All · ${total}`}
            selected={filter === null}
            onPress={() => setFilter(null)}
          />
          {STATUS_ORDER.map((status) => (
            <FilterChip
              key={status}
              label={`${STATUS_LABEL[status]} · ${counts?.[status] ?? 0}`}
              selected={filter === status}
              onPress={() => toggle(status)}
            />
          ))}
        </ScrollView>
        <View style={[styles.listTitle, { paddingHorizontal: margin }]}>
          <AppText variant="titleL">{filter ? STATUS_LABEL[filter] : 'All tasks'}</AppText>
          <AppText variant="bodyM" color={colors.textSecondary}>
            {`${shownCount} ${shownCount === 1 ? 'task' : 'tasks'}`}
          </AppText>
        </View>
      </View>
    </View>
  );

  const showSkeleton = list.isPending || refreshing;
  let body: ReactElement | undefined;
  if (list.isError && tasks.length === 0) {
    body = (
      <EmptyState
        title="Couldn't load tasks"
        message="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => void list.refetch()}
      />
    );
  } else if (!showSkeleton && tasks.length === 0) {
    body = <EmptyState title="No tasks here" message="Nothing matches this status right now." />;
  }

  const renderItem = ({ item, index }: { item: Task; index: number }): ReactNode => {
    const card = (
      <TaskCard
        task={item}
        selected={expanded && selectedId === item.id}
        onPress={() => openTask(item.id)}
      />
    );
    if (itemWidth !== undefined) {
      return (
        <Entrance index={index} style={{ width: itemWidth, marginBottom: CARD_GAP }}>
          {card}
        </Entrance>
      );
    }
    return (
      <View style={[styles.column, contentStyle]}>
        <Entrance index={index} style={[styles.item, { paddingHorizontal: margin }]}>
          {card}
        </Entrance>
      </View>
    );
  };

  const skeletonCount = medium ? 4 : 3;
  const listPane = (
    <View style={styles.flex}>
      <View
        style={[
          styles.flex,
          {
            paddingLeft: expanded ? 0 : insets.left,
            paddingRight: expanded ? 0 : insets.right,
          },
        ]}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          // numColumns cannot change on a mounted list, so a new column count remounts it.
          key={columns}
          numColumns={columns}
          columnWrapperStyle={
            columns > 1 ? { gap: CARD_GAP, paddingHorizontal: margin } : undefined
          }
          data={showSkeleton ? [] : tasks}
          // The filter is part of the key so changing it remounts the rows and restaggers them.
          keyExtractor={(task) => `${filter ?? 'all'}-${task.id}`}
          renderItem={renderItem}
          ListHeaderComponent={header}
          ListEmptyComponent={
            showSkeleton ? (
              <View style={[styles.column, contentStyle]}>
                <View
                  style={[
                    styles.skeletons,
                    medium && styles.skeletonGrid,
                    { paddingHorizontal: margin },
                  ]}
                >
                  {Array.from({ length: skeletonCount }, (_unused, index) => (
                    <View key={index} style={itemWidth ? { width: itemWidth } : styles.flex}>
                      <SkeletonCard />
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              body
            )
          }
          ListFooterComponent={
            <View style={[styles.column, contentStyle]}>
              {list.isFetchingNextPage ? (
                <ActivityIndicator color={colors.primary} style={styles.more} />
              ) : null}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              colors={[colors.primary]}
              progressViewOffset={insets.top}
            />
          }
          onEndReached={() => {
            if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{
            paddingBottom:
              insets.bottom + (isManager ? NAV_CLEARANCE.withButton : NAV_CLEARANCE.navOnly),
          }}
        />
      </View>
    </View>
  );

  const detail = selectedId ? (
    <PaneSwap key={selectedId}>
      <TaskDetailView taskId={selectedId} variant="pane" onDeleted={handleDeleted} />
    </PaneSwap>
  ) : (
    <EmptyPane title="No task selected" message="Choose a task from the list to see it here." />
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {expanded ? <ListDetail list={listPane} detail={detail} leftInset={insets.left} /> : listPane}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  column: { width: '100%', alignSelf: 'center' },
  washWrap: {
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    overflow: 'hidden',
  },
  padded: { paddingBottom: spacing.xl, gap: spacing.xl },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  greeting: { flex: 1, gap: spacing.xs },
  rolePill: {
    alignSelf: 'flex-start',
    minHeight: 24,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    marginTop: spacing.xs,
  },
  refresh: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: sizes.touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...elevation.l1,
  },
  tiles: { gap: spacing.md },
  tileRow: { flexDirection: 'row', gap: spacing.md },
  chips: { gap: spacing.sm, paddingVertical: spacing.lg },
  listTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  item: { paddingBottom: CARD_GAP },
  skeletons: { gap: CARD_GAP },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  more: { paddingVertical: spacing.lg },
});
