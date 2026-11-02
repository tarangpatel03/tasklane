import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../../../../theme';
import { AppText } from '../../../../brand/AppText';
import { TextButton } from '../../../../buttons/TextButton';

/** Inline failure for a part of the detail (comments, history), so an error is not mistaken for "empty". */
export function LoadNote({ text, onRetry }: { text: string; onRetry: () => void }): ReactNode {
  return (
    <View style={styles.note}>
      <AppText variant="bodyM" color={colors.textSecondary}>
        {text}
      </AppText>
      <TextButton label="Retry" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
});
