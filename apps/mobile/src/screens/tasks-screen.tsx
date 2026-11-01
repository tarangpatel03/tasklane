import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Role, type TaskStatus } from '@task-app/shared';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useState } from 'react';
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
import { ManagerNav, NAV_CLEARANCE } from '../components/bottom-nav';
import { EmptyState } from '../components/empty-state';
import { Entrance } from '../components/entrance';
import { FilterChip } from '../components/filter-chip';
import { SkeletonCard } from '../components/skeleton';
import { SummaryTile } from '../components/summary-tile';
import { TaskCard } from '../components/task-card';
import { TextButton } from '../components/text-button';
import { Wash } from '../components/wash';
import type { RootStackParamList } from '../navigation/types';
import { colors, elevation, radii, screenMargin, sizes, spacing } from '../theme';
import { ROLE_LABEL, STATUS_LABEL, STATUS_ORDER } from '../utils/task-format';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

const SKELETON_COUNT = 3;
/** Widest the content gets before the split pane arrives in 5.5. */
const COLUMN_MAX_WIDTH = 560;

/** Centres content and caps its width so wide windows do not stretch cards edge to edge. */
function Column({ children }: { children: ReactNode }): ReactNode {
  return <View style={styles.column}>{children}</View>;
}

/** Tasks the signed-in Manager or Employee may see, filtered by status tiles or chips. */
export function TasksScreen({ navigation }: Props): ReactNode {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [filter, setFilter] = useState<TaskStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
  const margin = screenMargin.compact;
  const isManager = user?.role === Role.MANAGER;

  const refresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([summary.refetch(), list.refetch()]);
    setRefreshing(false);
  }, [summary, list]);

  const toggle = (status: TaskStatus): void =>
    setFilter((current) => (current === status ? null : status));

  const header = (
    <View>
      <View style={styles.washWrap}>
        <Wash />
        <View
          style={{
            paddingTop: insets.top + spacing.lg,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
        >
          <Column>
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
                {[STATUS_ORDER.slice(0, 2), STATUS_ORDER.slice(2)].map((row) => (
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
          </Column>
        </View>
      </View>

      <Column>
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
      </Column>
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

  const renderItem = ({ item, index }: { item: Task; index: number }): ReactNode => (
    <Column>
      <Entrance index={index} style={[styles.item, { paddingHorizontal: margin }]}>
        <TaskCard
          task={item}
          onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
        />
      </Entrance>
    </Column>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={showSkeleton ? [] : tasks}
        // The filter is part of the key so changing it remounts the rows and restaggers them.
        keyExtractor={(task) => `${filter ?? 'all'}-${task.id}`}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={
          showSkeleton ? (
            <Column>
              <View style={[styles.skeletons, { paddingHorizontal: margin }]}>
                {Array.from({ length: SKELETON_COUNT }, (_unused, index) => (
                  <SkeletonCard key={index} />
                ))}
              </View>
            </Column>
          ) : (
            body
          )
        }
        ListFooterComponent={
          <Column>
            {list.isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={styles.more} />
            ) : null}
            {/* Temporary until Profile (5.6) has the real Log out. */}
            <View style={styles.logout}>
              <TextButton label="Log out" onPress={() => void logout()} />
            </View>
          </Column>
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
          paddingBottom: insets.bottom + (isManager ? NAV_CLEARANCE : spacing.xxxl),
        }}
      />
      <ManagerNav active="Tasks" />
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
  item: { paddingBottom: spacing.lg },
  skeletons: { gap: spacing.lg },
  more: { paddingVertical: spacing.lg },
  logout: { alignItems: 'center', paddingTop: spacing.lg },
});
