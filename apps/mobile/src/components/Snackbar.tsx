import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useWindowClass } from '../hooks/useWindowClass';
import { colors, duration, easing, fontFamily, radii, spacing, tablet } from '../theme';
import { AppText } from './AppText';

const VISIBLE_MS = 2200;
/** Distance of the snackbar above the bottom edge, from the brief. */
const BOTTOM_OFFSET = 108;
const CORNER_MAX_WIDTH = 360;

interface SnackbarMessage {
  id: number;
  text: string;
}

interface SnackbarControls {
  show: (text: string) => void;
}

function SnackbarView({
  message,
  onHide,
}: {
  message: SnackbarMessage;
  onHide: () => void;
}): ReactNode {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { windowClass, margin } = useWindowClass();
  // On wide windows the message sits in the bottom right corner, above the detail pane action bar.
  const corner = windowClass === 'expanded';

  useEffect(() => {
    const timer = setTimeout(onHide, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message.id, onHide]);

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      entering={
        reduceMotion
          ? FadeIn.duration(duration.reduced)
          : SlideInDown.duration(duration.sheet).easing(easing.emphasized)
      }
      exiting={FadeOut.duration(duration.exit)}
      pointerEvents="none"
      style={[
        styles.bar,
        corner
          ? {
              left: undefined,
              right: margin + insets.right,
              bottom: insets.bottom + tablet.actionBar + spacing.lg,
              maxWidth: CORNER_MAX_WIDTH,
            }
          : { bottom: insets.bottom + BOTTOM_OFFSET },
      ]}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path
          d="M5 12.5l4.5 4.5L19 7.5"
          fill="none"
          stroke={colors.snackbarCheck}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <AppText variant="bodyM" color={colors.onPrimary} style={styles.text}>
        {message.text}
      </AppText>
    </Animated.View>
  );
}

const SnackbarContext = createContext<SnackbarControls | null>(null);

/** Hosts the snackbar at the app root, so a message outlives the screen that raised it. */
export function SnackbarProvider({ children }: { children: ReactNode }): ReactNode {
  const [message, setMessage] = useState<SnackbarMessage | null>(null);
  const show = useCallback((text: string) => setMessage({ id: Date.now(), text }), []);
  const hide = useCallback(() => setMessage(null), []);
  const controls = useMemo(() => ({ show }), [show]);

  return (
    <SnackbarContext.Provider value={controls}>
      {children}
      {message ? <SnackbarView key={message.id} message={message} onHide={hide} /> : null}
    </SnackbarContext.Provider>
  );
}

/** Dark confirmation bar that stays for 2.2s. Showing a new message replaces the current one. */
export function useSnackbar(): SnackbarControls {
  const value = useContext(SnackbarContext);
  if (!value) throw new Error('useSnackbar must be used inside SnackbarProvider');
  return value;
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    alignSelf: 'center',
    maxWidth: 480,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.l - 4,
    backgroundColor: colors.snackbar,
  },
  text: { flex: 1, fontFamily: fontFamily.semibold },
});
