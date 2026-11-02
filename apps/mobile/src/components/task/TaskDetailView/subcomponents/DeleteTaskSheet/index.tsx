import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../../../../theme';
import { AppText } from '../../../../brand/AppText';
import { ActionButton } from '../../../../buttons/ActionButton';
import { BottomSheet } from '../../../../sheets/BottomSheet';

interface DeleteTaskSheetProps {
  visible: boolean;
  taskTitle: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirmation before a task is deleted. It cannot be dismissed while the delete is running. */
export function DeleteTaskSheet({
  visible,
  taskTitle,
  deleting,
  onClose,
  onConfirm,
}: DeleteTaskSheetProps): ReactNode {
  return (
    <BottomSheet visible={visible} onClose={() => !deleting && onClose()}>
      <AppText variant="titleL">Delete task?</AppText>
      <AppText variant="bodyL" color={colors.textSecondary} numberOfLines={2}>
        {taskTitle}
      </AppText>
      <AppText variant="bodyM" color={colors.textSecondary}>
        It disappears from every list. This can't be undone from the app.
      </AppText>
      <View style={styles.sheetButtons}>
        <ActionButton label="Cancel" variant="outlined" disabled={deleting} onPress={onClose} />
        <ActionButton
          label="Delete task"
          variant="destructive"
          loading={deleting}
          onPress={onConfirm}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetButtons: { flexDirection: 'row', gap: spacing.md },
});
