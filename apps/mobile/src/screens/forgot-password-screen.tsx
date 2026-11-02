import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { forgotPassword } from '../api/auth';
import { toMessage } from '../api/error-message';
import { AppButton } from '../components/app-button';
import { AppText } from '../components/app-text';
import { AuthLayout } from '../components/auth-layout';
import { BackButton } from '../components/back-button';
import { Banner } from '../components/banner';
import { Entrance } from '../components/entrance';
import { TextField } from '../components/text-field';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import { SCREENS } from '../navigation/routes';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/** Asks for the email only; the new password is set on the web page from the emailed link. */
export function ForgotPasswordScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, typeof SCREENS.ForgotPassword>): ReactNode {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const emailError =
    submitted && !EMAIL_PATTERN.test(email.trim()) ? 'Enter a valid email address' : undefined;

  const submit = async (): Promise<void> => {
    setSubmitted(true);
    setServerError(null);
    if (!EMAIL_PATTERN.test(email.trim())) return;

    setBusy(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (error) {
      setServerError(toMessage(error, { 429: 'Please wait a minute and try again.' }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <Entrance index={0} style={styles.back}>
        <BackButton onPress={() => navigation.goBack()} />
      </Entrance>

      {sent ? (
        <Entrance index={1} style={styles.header}>
          <AppText variant="headline">Check your email</AppText>
          <AppText variant="bodyL" color={colors.textSecondary}>
            If that email has an account, a reset link is on its way. The link is valid for 1 hour.
          </AppText>
          <AppButton label="Back to sign in" onPress={() => navigation.goBack()} />
        </Entrance>
      ) : (
        <>
          <Entrance index={1} style={styles.header}>
            <AppText variant="headline">Forgot password?</AppText>
            <AppText variant="bodyL" color={colors.textSecondary}>
              Enter your work email and we will send you a link to set a new password.
            </AppText>
          </Entrance>

          {serverError ? <Banner message={serverError} /> : null}

          <Entrance index={2}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="send"
              textContentType="emailAddress"
              onSubmitEditing={() => void submit()}
            />
          </Entrance>

          <Entrance index={3}>
            <AppButton label="Send reset link" loading={busy} onPress={() => void submit()} />
          </Entrance>
        </>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: 'flex-start' },
  header: { gap: spacing.lg },
});
