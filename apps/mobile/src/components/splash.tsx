import type { ReactNode } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, duration } from '../theme';
import { Logo } from './logo';
import { Wash } from './wash';

/** Shown while the stored session is read and checked, so the app never opens on a blank screen. */
export function Splash(): ReactNode {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <Wash />
      <Animated.View entering={FadeIn.duration(duration.fade)}>
        <Logo size={96} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
