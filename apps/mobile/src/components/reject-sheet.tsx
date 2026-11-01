import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, fontFamily, radii, spacing } from '../theme';
import { ActionButton } from './action-button';
import { AppText } from './app-text';
import { BottomSheet } from './bottom-sheet';

interface RejectSheetProps {
  visible: boolean;
  taskTitle: string;
  busy: boolean;
  onClose: () => void;
  /** Called with the trimmed reason; the reason lives in the status history only. */
  onReject: (reason: string) => void;
}

/** Bottom sheet that asks for the reason before a task goes back to Working. */
export function RejectSheet({
  visible,
  taskTitle,
  busy,
  onClose,
  onReject,
}: RejectSheetProps): ReactNode {
  const [reason, setReason] = useState('');

  // A reason typed for one task must not appear on the next.
  useEffect(() => {
    if (!visible) setReason('');
  }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={() => !busy && onClose()}>
      <AppText variant="titleL">Reject task?</AppText>
      <AppText variant="bodyL" color={colors.textSecondary} numberOfLines={2}>
        {taskTitle}
      </AppText>
      <View style={styles.reasonWrap}>
        <AppText variant="labelL" color={colors.textStrong}>
          Reason for rejecting (required)
        </AppText>
        <TextInput
          accessibilityLabel="Reason for rejecting"
          value={reason}
          onChangeText={setReason}
          multiline
          maxLength={2000}
          textAlignVertical="top"
          placeholder="Tell the team what needs to change"
          placeholderTextColor={colors.textSecondary}
          style={styles.reasonInput}
        />
      </View>
      <View style={styles.buttons}>
        <ActionButton label="Cancel" variant="outlined" disabled={busy} onPress={onClose} />
        <ActionButton
          label="Reject task"
          variant="destructive"
          loading={busy}
          disabled={reason.trim().length === 0}
          onPress={() => onReject(reason.trim())}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  reasonWrap: { gap: spacing.sm },
  reasonInput: {
    minHeight: 112,
    padding: spacing.lg,
    borderRadius: radii.m,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
  buttons: { flexDirection: 'row', gap: spacing.md },
});
