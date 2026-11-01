import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/auth-context';
import { ForgotPasswordScreen } from '../screens/forgot-password-screen';
import { HomeScreen } from '../screens/home-screen';
import { LoginScreen } from '../screens/login-screen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Screens draw their own headers, so the native one is off. The signed-in state decides the stack. */
export function RootNavigator(): ReactNode {
  const { status } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'signedIn' ? (
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
