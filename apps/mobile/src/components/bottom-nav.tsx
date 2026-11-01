import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Role, TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { fetchTaskSummary } from '../api/tasks';
import { useAuth } from '../auth/auth-context';
import type { RootStackParamList } from '../navigation/types';
import { colors, elevation, fontFamily, radii, spacing } from '../theme';
import { AppText } from './app-text';
import { NewTaskButton } from './new-task-button';

type NavTarget = 'Tasks' | 'Review';

/** Bottom space a screen's list needs so the floating nav and New task button never cover the last card. */
export const NAV_CLEARANCE = 190;

const NAV_HEIGHT = 72;
const NAV_MAX_WIDTH = 480;

function NavIcon({ target, color }: { target: NavTarget; color: string }): ReactNode {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      {target === 'Tasks' ? (
        <Path
          d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      ) : (
        <Path
          d="M4 13l3.5 3.5L12 12M12 12l3 3 5-6M4 6h16"
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

interface NavItemProps {
  target: NavTarget;
  label: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}

function NavItem({ target, label, active, badge = 0, onPress }: NavItemProps): ReactNode {
  const color = active ? colors.onPrimaryContainer : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={badge > 0 ? `${label}, ${badge} waiting` : label}
      onPress={onPress}
      style={[styles.item, active ? styles.itemActive : styles.itemInactive]}
    >
      <NavIcon target={target} color={color} />
      <AppText
        variant="labelS"
        color={color}
        maxFontSizeMultiplier={1.2}
        style={active ? styles.labelActive : styles.labelInactive}
      >
        {label}
      </AppText>
      {badge > 0 ? (
        <View style={styles.badge}>
          <AppText
            variant="labelS"
            color={colors.onPrimary}
            maxFontSizeMultiplier={1.1}
            style={styles.badgeText}
          >
            {badge > 99 ? '99+' : String(badge)}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * Floating nav and "New task" button for Managers; renders nothing for other roles.
 * Switching uses `replace`, so the stack does not grow with every tap.
 */
export function ManagerNav({ active }: { active: NavTarget }): ReactNode {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isManager = user?.role === Role.MANAGER;
  const summary = useQuery({
    queryKey: ['tasks', 'summary'],
    queryFn: fetchTaskSummary,
    enabled: isManager,
  });

  if (!isManager) return null;

  const go = (target: NavTarget): void => {
    if (target !== active) navigation.replace(target);
  };

  return (
    <>
      <NewTaskButton onPress={() => navigation.navigate('TaskForm', {})} />
      <View
        pointerEvents="box-none"
        style={[
          styles.wrap,
          {
            bottom: insets.bottom + spacing.md,
            paddingLeft: spacing.lg + insets.left,
            paddingRight: spacing.lg + insets.right,
          },
        ]}
      >
        <View accessibilityRole="tablist" style={styles.nav}>
          <NavItem
            target="Tasks"
            label="Tasks"
            active={active === 'Tasks'}
            onPress={() => go('Tasks')}
          />
          <NavItem
            target="Review"
            label="Review"
            active={active === 'Review'}
            badge={summary.data?.[TaskStatus.IN_REVIEW] ?? 0}
            onPress={() => go('Review')}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  nav: {
    width: '100%',
    maxWidth: NAV_MAX_WIDTH,
    height: NAV_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...elevation.l3,
  },
  item: {
    flex: 1,
    height: NAV_HEIGHT - spacing.sm * 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  itemActive: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primaryContainer },
  itemInactive: { gap: 2 },
  labelActive: { fontSize: 13, lineHeight: 16 },
  labelInactive: { fontSize: 11, lineHeight: 14, fontFamily: fontFamily.semibold },
  badge: {
    position: 'absolute',
    top: 4,
    right: spacing.xl,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, lineHeight: 14 },
});
