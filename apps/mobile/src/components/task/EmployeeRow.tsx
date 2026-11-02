import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, spacing } from '../../theme';
import { AppText } from '../brand/AppText';
import { Avatar } from '../brand/Avatar';

interface EmployeeRowProps {
  id: string;
  name: string;
  selected: boolean;
  onPress: () => void;
}

/** 64px selectable row: 40px avatar, name and a 28px check circle. */
export function EmployeeRow({ id, name, selected, onPress }: EmployeeRowProps): ReactNode {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.row, selected && styles.selected]}
    >
      <Avatar id={id} name={name} size={40} />
      <AppText variant="bodyL" numberOfLines={1} style={styles.name}>
        {name}
      </AppText>
      <View style={[styles.check, selected && styles.checkOn]}>
        {selected ? (
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
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
  name: { flex: 1, fontFamily: fontFamily.semibold },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
