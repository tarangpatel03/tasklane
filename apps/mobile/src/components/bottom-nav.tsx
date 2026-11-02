import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { Role, TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { fetchTaskSummary } from '../api/tasks';
import { useAuth } from '../auth/auth-context';
import { usePressScale } from '../hooks/use-press-scale';
import { useWindowClass } from '../hooks/use-window-class';
import { colors, duration, easing, elevation, fontFamily, radii, spacing, tablet } from '../theme';
import { AppText } from './app-text';
import { useNavHidden } from './nav-visibility';
import { NewTaskButton } from './new-task-button';
import { SCREENS } from '../navigation/routes';
import { taskKeys } from '../api/query-keys';

export type NavTarget = typeof SCREENS.Tasks | typeof SCREENS.Review | typeof SCREENS.Profile;

/**
 * Bottom space a screen's content needs so the floating nav (and the New task button, for Managers)
 * never covers the last card.
 */
export const NAV_CLEARANCE = { withButton: 190, navOnly: 120 } as const;

const NAV_HEIGHT = 72;
/** Space between the tonal pill's slots, and the inner height of the nav. */
const SLOT_GAP = spacing.sm;
const SLOT_HEIGHT = NAV_HEIGHT - spacing.sm * 2;

const ICON_PATHS: Record<NavTarget, string> = {
  Tasks: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  Review: 'M4 13l3.5 3.5L12 12M12 12l3 3 5-6M4 6h16',
  Profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c0-3.3 3.6-5 8-5s8 1.7 8 5',
};

function NavIcon({ target, color }: { target: NavTarget; color: string }): ReactNode {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d={ICON_PATHS[target]}
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface NavItemProps {
  target: NavTarget;
  active: boolean;
  badge?: number;
  onPress: () => void;
}

function NavItem({ target, active, badge = 0, onPress }: NavItemProps): ReactNode {
  const color = active ? colors.onPrimaryContainer : colors.textSecondary;
  const press = usePressScale();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={badge > 0 ? `${target}, ${badge} waiting` : target}
      onPress={onPress}
      style={styles.itemPressable}
      {...press.handlers}
    >
      <Animated.View
        style={[styles.item, active ? styles.itemActive : styles.itemInactive, press.style]}
      >
        <NavIcon target={target} color={color} />
        <AppText
          variant="labelS"
          color={color}
          maxFontSizeMultiplier={1.2}
          style={active ? styles.labelActive : styles.labelInactive}
        >
          {target}
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
      </Animated.View>
    </Pressable>
  );
}

function isNavTarget(name: string): name is NavTarget {
  return name === SCREENS.Tasks || name === SCREENS.Review || name === SCREENS.Profile;
}

/**
 * The tab bar: one floating nav that stays mounted while the tab screens fade behind it. Its pill
 * slides between tabs, and on wide windows the whole nav glides between the list pane (Tasks and
 * Review) and the centre of the window (Profile). Managers also get the New task button on Tasks
 * and Review.
 */
export function BottomNav({ state, navigation }: BottomTabBarProps): ReactNode {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { windowClass, margin, width } = useWindowClass();
  const reduceMotion = useReducedMotion();
  const hidden = useNavHidden();
  const isManager = user?.role === Role.MANAGER;
  const summary = useQuery({
    queryKey: taskKeys.summary(),
    queryFn: fetchTaskSummary,
    enabled: isManager,
  });

  const index = state.index;
  const active = state.routes[index]?.name ?? SCREENS.Tasks;
  const tabCount = state.routes.filter((route) => isNavTarget(route.name)).length;
  const expanded = windowClass === 'expanded';
  // In the split layout the nav sits inside the 420px list pane, except on Profile.
  const inPane = expanded && active !== SCREENS.Profile;
  const showButton = isManager && active !== SCREENS.Profile && !hidden;

  // Slot position of the pill (fractional while it slides) and the width of one slot.
  const position = useSharedValue(index);
  const slotWidth = useSharedValue(0);
  // 0 = centred nav, 1 = nav inside the list pane.
  const pane = useSharedValue(inPane ? 1 : 0);
  const shown = useSharedValue(1);
  const slideMs = reduceMotion ? duration.reduced : duration.sheet;

  useEffect(() => {
    position.value = withTiming(index, { duration: slideMs, easing: easing.emphasized });
  }, [index, slideMs, position]);

  useEffect(() => {
    pane.value = withTiming(inPane ? 1 : 0, { duration: slideMs, easing: easing.emphasized });
  }, [inPane, slideMs, pane]);

  useEffect(() => {
    shown.value = withTiming(hidden ? 0 : 1, {
      duration: reduceMotion ? duration.reduced : duration.fade,
      easing: easing.standard,
    });
  }, [hidden, reduceMotion, shown]);

  const centredWidth = Math.min(
    tablet.navCentred,
    width - spacing.lg * 2 - insets.left - insets.right,
  );
  const centredLeft = (width - centredWidth) / 2;
  const paneLeft = (tablet.listPane + insets.left - tablet.navInPane) / 2;

  const navStyle = useAnimatedStyle(() => ({
    width: interpolate(pane.value, [0, 1], [centredWidth, tablet.navInPane]),
    left: interpolate(pane.value, [0, 1], [centredLeft, paneLeft]),
    opacity: shown.value,
  }));
  const indicatorStyle = useAnimatedStyle(() => ({
    width: slotWidth.value,
    opacity: slotWidth.value > 0 ? 1 : 0,
    transform: [{ translateX: position.value * (slotWidth.value + SLOT_GAP) }],
  }));

  const onTrackLayout = (event: LayoutChangeEvent): void => {
    slotWidth.value =
      (event.nativeEvent.layout.width - SLOT_GAP * (tabCount - 1)) / Math.max(tabCount, 1);
  };

  const press = (routeKey: string, routeName: string, params: object | undefined): void => {
    const focused = state.routes[state.index]?.key === routeKey;
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(routeName, params);
  };

  // New task floats at the window's right margin, or at the right edge of the list pane.
  const buttonRight = expanded
    ? width - (tablet.listPane + insets.left) + margin
    : margin + insets.right;

  return (
    <>
      <NewTaskButton
        visible={showButton}
        right={buttonRight}
        onPress={() => navigation.navigate(SCREENS.TaskForm, {})}
      />
      <Animated.View
        accessibilityRole="tablist"
        pointerEvents={hidden ? 'none' : 'auto'}
        style={[styles.nav, { bottom: insets.bottom + spacing.md }, navStyle]}
      >
        <View style={styles.track} onLayout={onTrackLayout}>
          <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
          {state.routes.map((route) =>
            isNavTarget(route.name) ? (
              <NavItem
                key={route.key}
                target={route.name}
                active={active === route.name}
                badge={
                  route.name === SCREENS.Review ? (summary.data?.[TaskStatus.IN_REVIEW] ?? 0) : 0
                }
                onPress={() => press(route.key, route.name, route.params)}
              />
            ) : null,
          )}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    height: NAV_HEIGHT,
    padding: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...elevation.l3,
  },
  track: { flex: 1, flexDirection: 'row', gap: SLOT_GAP },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: SLOT_HEIGHT,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryContainer,
  },
  itemPressable: { flex: 1 },
  item: {
    flex: 1,
    height: SLOT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  itemActive: { flexDirection: 'row', gap: spacing.sm },
  itemInactive: { gap: 2 },
  labelActive: { fontSize: 13, lineHeight: 16 },
  labelInactive: { fontSize: 11, lineHeight: 14, fontFamily: fontFamily.semibold },
  badge: {
    position: 'absolute',
    top: 4,
    right: spacing.lg,
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
