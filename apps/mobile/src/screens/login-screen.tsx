import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ComponentRef, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { toMessage } from '../api/error-message';
import { useAuth } from '../auth/auth-context';
import { AppButton } from '../components/app-button';
import { AppText } from '../components/app-text';
import { AuthLayout } from '../components/auth-layout';
import { Banner } from '../components/banner';
import { Entrance } from '../components/entrance';
import { Logo } from '../components/logo';
import { TextButton } from '../components/text-button';
import { TextField } from '../components/text-field';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/** Email and password sign in. Errors show after the first submit. */
export function LoginScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Login'>): ReactNode {
  const { login } = useAuth();
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const emailError =
    submitted && !EMAIL_PATTERN.test(email.trim()) ? 'Enter a valid email address' : undefined;
  const passwordError = submitted && password.length === 0 ? 'Enter your password' : undefined;

  const submit = async (): Promise<void> => {
    setSubmitted(true);
    setServerError(null);
    if (!EMAIL_PATTERN.test(email.trim()) || password.length === 0) return;

    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      setServerError(
        toMessage(error, {
          401: 'Email or password is incorrect.',
          429: 'Too many attempts. Please wait a minute and try again.',
        }),
      );
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <Entrance index={0} style={styles.header}>
        <Logo size={64} />
        <AppText variant="display" style={styles.title}>
          Welcome back
        </AppText>
        <AppText variant="bodyL" color={colors.textSecondary}>
          Sign in with your work email.
        </AppText>
      </Entrance>

      {serverError ? <Banner message={serverError} /> : null}

      <Entrance index={1}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          textContentType="emailAddress"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
      </Entrance>

      <Entrance index={2}>
        <TextField
          label="Password"
          inputRef={passwordRef}
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          secret
          autoCapitalize="none"
          autoComplete="current-password"
          autoCorrect={false}
          returnKeyType="done"
          textContentType="password"
          onSubmitEditing={() => void submit()}
        />
      </Entrance>

      <Entrance index={3} style={styles.forgot}>
        <TextButton
          label="Forgot password?"
          onPress={() => navigation.navigate('ForgotPassword')}
        />
      </Entrance>

      <Entrance index={4}>
        <AppButton label="Sign in" loading={busy} onPress={() => void submit()} />
      </Entrance>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md },
  title: { fontSize: 34, lineHeight: 40 },
  forgot: { alignItems: 'flex-end' },
});
