import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, elevation, sizes } from '../../theme';

/** 48px round back button on a white disc. */
export function BackButton({ onPress }: { onPress: () => void }): ReactNode {
  return (
    <Pressable
      accessibilityLabel="Back"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path
          d="M15 5l-7 7 7 7"
          fill="none"
          stroke={colors.textPrimary}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: sizes.touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...elevation.l1,
  },
  pressed: { backgroundColor: colors.primaryContainer },
});
