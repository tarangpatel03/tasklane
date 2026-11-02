import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { toMessage } from '../../../../api/errorMessage.api';
import { changePassword } from '../../../../api/auth.api';
import { spacing } from '../../../../theme';
import { ActionButton } from '../../../../components/buttons/ActionButton';
import { AppText } from '../../../../components/brand/AppText';
import { Banner } from '../../../../components/feedback/Banner';
import { BottomSheet } from '../../../../components/sheets/BottomSheet';
import { TextField } from '../../../../components/inputs/TextField';

interface ChangePasswordSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Called after the password was changed and the new tokens are stored. */
  onChanged: () => void;
}

/** Bottom sheet with Current, New and Confirm password. The API checks the length (8 to 128). */
export function ChangePasswordSheet({
  visible,
  onClose,
  onChanged,
}: ChangePasswordSheetProps): ReactNode {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Passwords are never kept after the sheet closes.
  useEffect(() => {
    if (visible) return;
    setCurrent('');
    setNext('');
    setConfirm('');
    setSubmitted(false);
    setError(null);
  }, [visible]);

  const mismatch = next !== confirm;
  const missing = current === '' || next === '';

  const submit = async (): Promise<void> => {
    setSubmitted(true);
    setError(null);
    if (missing || mismatch) return;
    setBusy(true);
    try {
      await changePassword(current, next);
      onChanged();
    } catch (failure) {
      setError(toMessage(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={() => !busy && onClose()}>
      <AppText variant="titleL">Change password</AppText>
      <View style={styles.fields}>
        {error ? <Banner message={error} /> : null}
        <TextField
          label="Current password"
          secret
          value={current}
          onChangeText={setCurrent}
          autoCapitalize="none"
          autoComplete="current-password"
          maxLength={128}
          error={submitted && current === '' ? 'Enter your current password' : undefined}
        />
        <TextField
          label="New password"
          secret
          value={next}
          onChangeText={setNext}
          autoCapitalize="none"
          autoComplete="new-password"
          maxLength={128}
          error={submitted && next === '' ? 'Enter a new password' : undefined}
        />
        <TextField
          label="Confirm new password"
          secret
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="none"
          autoComplete="new-password"
          maxLength={128}
          error={submitted && next !== '' && mismatch ? "Passwords don't match" : undefined}
        />
      </View>
      <View style={styles.buttons}>
        <ActionButton label="Cancel" variant="outlined" disabled={busy} onPress={onClose} />
        <ActionButton
          label="Update password"
          variant="primary"
          loading={busy}
          onPress={() => void submit()}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.lg },
  buttons: { flexDirection: 'row', gap: spacing.md },
});
