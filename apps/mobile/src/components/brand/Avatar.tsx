import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, fontFamily } from '../../theme';
import { hashIndex, initials } from '../../utils/taskFormat.util';
import { AppText } from './AppText';

interface AvatarProps {
  id: string;
  name: string;
  size?: number;
  /** The signed-in user's own avatar uses the deep violet pair. */
  own?: boolean;
  /** Draws the white ring used when avatars overlap. */
  ring?: boolean;
  /** Ring width; 2 when avatars overlap, 4 on the Profile. */
  ringWidth?: number;
}

/** Initials on a soft colour pair; the pair is derived from the id so it never changes. */
export function Avatar({
  id,
  name,
  size = 32,
  own = false,
  ring = false,
  ringWidth = 2,
}: AvatarProps): ReactNode {
  const pair = own
    ? colors.ownAvatar
    : colors.avatarPairs[hashIndex(id, colors.avatarPairs.length)];
  return (
    <View
      accessibilityLabel={name}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: pair.background },
        ring && [styles.ring, { borderWidth: ringWidth }],
      ]}
    >
      <AppText
        variant="labelS"
        color={pair.foreground}
        maxFontSizeMultiplier={1.2}
        style={{ fontFamily: fontFamily.bold, fontSize: size * 0.38, lineHeight: size * 0.5 }}
      >
        {initials(name)}
      </AppText>
    </View>
  );
}

interface AvatarStackProps {
  people: Array<{ id: string; name: string }>;
  max?: number;
}

/** Overlapping avatars (8px overlap, white ring) with a "+n" overflow chip. */
export function AvatarStack({ people, max = 3 }: AvatarStackProps): ReactNode {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <View style={styles.stack}>
      {shown.map((person, index) => (
        <View key={person.id} style={index > 0 ? styles.overlap : undefined}>
          <Avatar id={person.id} name={person.name} ring />
        </View>
      ))}
      {extra > 0 && (
        <View
          style={[
            styles.avatar,
            styles.overlap,
            styles.ring,
            styles.more,
            { backgroundColor: colors.avatarOverflow.background },
          ]}
        >
          <AppText variant="labelS" color={colors.avatarOverflow.foreground}>
            {`+${extra}`}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  ring: { borderWidth: 2, borderColor: colors.surface },
  stack: { flexDirection: 'row', alignItems: 'center' },
  overlap: { marginLeft: -8 },
  more: { width: 32, height: 32, borderRadius: 16 },
});
