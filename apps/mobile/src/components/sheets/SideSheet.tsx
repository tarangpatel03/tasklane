import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { colors, duration, easing, elevation, radii, tablet } from '../../theme';
import { hideNav } from '../navigation/navVisibility.store';

interface SideSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Detail panel that slides in from the right on medium windows: 560px, radius 32 on the left
 * corners, scrim that closes on tap. It is an overlay inside the screen, not a Modal, so the
 * app-level snackbar stays visible above it.
 */
export function SideSheet({ visible, onClose, children }: SideSheetProps): ReactNode {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const panelWidth = Math.min(tablet.sideSheet, width);
  const [mounted, setMounted] = useState(visible);
  const translateX = useSharedValue(panelWidth);
  const scrim = useSharedValue(0);

  useEffect(() => {
    const time = reduceMotion ? duration.reduced : duration.sharedElement;
    if (visible) {
      setMounted(true);
      translateX.value = withTiming(0, { duration: time, easing: easing.emphasized });
      scrim.value = withTiming(1, { duration: duration.fade });
      return;
    }
    scrim.value = withTiming(0, { duration: duration.exit });
    translateX.value = withTiming(
      panelWidth,
      { duration: duration.exit, easing: easing.accelerate },
      (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      },
    );
  }, [visible, reduceMotion, panelWidth, translateX, scrim]);

  // The nav floats above every screen, so it steps aside while the sheet (or its exit) is on screen.
  useEffect(() => (mounted ? hideNav() : undefined), [mounted]);

  // The hardware back button closes the sheet before it leaves the screen.
  useEffect(() => {
    if (!visible) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  if (!mounted) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
      </Animated.View>
      <Animated.View style={[styles.panel, { width: panelWidth }, panelStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    elevation: 24,
    alignItems: 'flex-end',
  },
  scrim: { backgroundColor: colors.scrim },
  panel: {
    height: '100%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderBottomLeftRadius: radii.xl,
    overflow: 'hidden',
    ...elevation.l3,
  },
});
