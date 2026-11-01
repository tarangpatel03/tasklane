import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radii, sizes, spacing } from '../theme';
import { AppText } from './app-text';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** 48px pill. Selected is filled violet with a check; unselected is outlined on white. */
export function FilterChip({ label, selected, onPress }: FilterChipProps): ReactNode {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      {selected && (
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path
            d="M5 12.5l4.5 4.5L19 7.5"
            fill="none"
            stroke={colors.onPrimary}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
      <AppText variant="labelL" color={selected ? colors.onPrimary : colors.textStrong}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: sizes.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
