import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Modal, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { colors, duration, easing, elevation, radii, screenMargin, spacing } from '../theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Distance dragged down, in dp, that dismisses the sheet. */
const DISMISS_DRAG = 80;
/** Far enough to be off-screen on any phone or tablet before the exit finishes. */
const OFFSCREEN = 900;

/** Height of the on-screen keyboard, so a field inside the sheet is never covered. */
function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) =>
      setHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

/**
 * Bottom sheet: radius 32 on top, 40 x 5 handle, scrim that closes on tap, swipe down to dismiss.
 * Drag uses PanResponder so no gesture library is needed.
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps): ReactNode {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(OFFSCREEN);
  const scrim = useSharedValue(0);

  useEffect(() => {
    const time = reduceMotion ? duration.reduced : duration.sheet;
    if (visible) {
      setMounted(true);
      translateY.value = withTiming(0, { duration: time, easing: easing.emphasized });
      scrim.value = withTiming(1, { duration: duration.fade });
      return;
    }
    scrim.value = withTiming(0, { duration: duration.exit });
    translateY.value = withTiming(
      OFFSCREEN,
      { duration: duration.exit, easing: easing.accelerate },
      (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      },
    );
  }, [visible, reduceMotion, translateY, scrim]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_event, gesture) => {
          translateY.value = Math.max(0, gesture.dy);
        },
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dy > DISMISS_DRAG) {
            onClose();
          } else {
            translateY.value = withTiming(0, { duration: duration.fade, easing: easing.standard });
          }
        },
      }),
    [onClose, translateY],
  );

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  return (
    <Modal transparent statusBarTranslucent visible={mounted} onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          <Pressable
            accessibilityLabel="Close"
            accessibilityRole="button"
            style={StyleSheet.absoluteFill}
            onPress={onClose}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, keyboardHeight) + spacing.xl },
            sheetStyle,
          ]}
        >
          <View {...pan.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  scrim: { backgroundColor: colors.scrim },
  sheet: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: screenMargin.compact,
    gap: spacing.lg,
    ...elevation.l3,
  },
  handleArea: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.outline },
});
