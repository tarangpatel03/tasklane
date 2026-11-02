import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { Task } from '../../../../../api/tasks.api';
import { colors, radii, sizes, spacing } from '../../../../../theme';
import { AppText } from '../../../../brand/AppText';
import { BackButton } from '../../../../buttons/BackButton';
import { CloseButton } from '../../../../buttons/CloseButton';
import { SkeletonBlock } from '../../../../feedback/Skeleton';
import { Wash } from '../../../../layout/Wash';
import { PriorityTag } from '../../../PriorityTag';
import { StatusBadge } from '../../../StatusBadge';
import type { DetailVariant } from '../../taskDetailView.types';

interface DetailHeaderProps {
  variant: DetailVariant;
  /** Back button (screen) or close button (sheet). Not used in the pane. */
  onDismiss?: () => void;
  /** Undefined while the task is loading or failed to load. */
  task?: Task;
  loading: boolean;
  /** Shows the Edit and Delete buttons. */
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  /** Left padding (window inset plus margin). The right side is derived from the safe area. */
  paddingLeft: number;
  padding: number;
}

/** Wash with back or close button, Edit and Delete for the task's Manager, tags and the title. */
export function DetailHeader({
  variant,
  onDismiss,
  task,
  loading,
  canManage,
  onEdit,
  onDelete,
  paddingLeft,
  padding,
}: DetailHeaderProps): ReactNode {
  const insets = useSafeAreaInsets();
  const titleStyle = variant === 'pane' ? styles.titlePane : styles.title;

  return (
    <View style={styles.washWrap}>
      <Wash />
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.lg,
            paddingLeft,
            paddingRight: insets.right + padding,
          },
        ]}
      >
        <View style={styles.headerRow}>
          {variant === 'screen' && onDismiss ? <BackButton onPress={onDismiss} /> : null}
          {variant === 'sheet' && onDismiss ? <CloseButton onPress={onDismiss} /> : null}
          <AppText variant="titleM" style={styles.headerTitle}>
            Task detail
          </AppText>
          {canManage ? (
            <>
              <Pressable accessibilityRole="button" onPress={onEdit} style={styles.editPill}>
                <AppText variant="labelL" color={colors.onPrimaryContainer}>
                  Edit
                </AppText>
              </Pressable>
              <Pressable
                accessibilityLabel="Delete task"
                accessibilityRole="button"
                onPress={onDelete}
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
        {task ? (
          <>
            <View style={styles.tags}>
              <PriorityTag priority={task.priority} />
              <StatusBadge status={task.status} large />
            </View>
            <AppText variant="headline" style={titleStyle}>
              {task.title}
            </AppText>
          </>
        ) : null}
        {loading ? (
          <View style={styles.headerSkeleton}>
            <SkeletonBlock width={160} height={36} radius={radii.pill} />
            <SkeletonBlock width="80%" height={32} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  titlePane: { fontSize: 30, lineHeight: 36 },
  headerSkeleton: { gap: spacing.md },
});
