import type { ReactNode } from 'react';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, radii, sizes, spacing } from '../../theme';

interface CommentComposerProps {
  /** Resolves when the comment is saved; the field clears only then. */
  onSend: (body: string) => Promise<void>;
}

/** 48px pill input with a 48px round send button. */
export function CommentComposer({ onSend }: CommentComposerProps): ReactNode {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const canSend = text.trim().length > 0 && !sending;

  const send = async (): Promise<void> => {
    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
    } catch {
      // The caller reports the failure; the text stays so nothing is lost.
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.row}>
      <TextInput
        accessibilityLabel="Write a comment"
        value={text}
        onChangeText={setText}
        placeholder="Write a comment"
        placeholderTextColor={colors.textSecondary}
        maxLength={2000}
        multiline
        style={styles.input}
      />
      <Pressable
        accessibilityLabel="Send comment"
        accessibilityRole="button"
        disabled={!canSend}
        onPress={() => void send()}
        style={[styles.send, !canSend && styles.sendDisabled]}
      >
        {sending ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path
              d="M4 12l16-8-6 16-3-7z"
              fill="none"
              stroke={canSend ? colors.onPrimary : colors.disabledText}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  input: {
    flex: 1,
    minHeight: sizes.touchTarget,
    maxHeight: 120,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.l,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
  send: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: sizes.touchTarget / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: colors.disabledBackground },
});
