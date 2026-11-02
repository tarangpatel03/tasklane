import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/auth-context';
import { ForgotPasswordScreen } from '../screens/forgot-password-screen';
import { LoginScreen } from '../screens/login-screen';
import { TaskDetailScreen } from '../screens/task-detail-screen';
import { TaskFormScreen } from '../screens/task-form-screen';
import { MainTabs } from './main-tabs';
import type { RootStackParamList } from './types';
import { SCREENS } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Screens draw their own headers, so the native one is off. The signed-in state decides the stack. */
export function RootNavigator(): ReactNode {
  const { status } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'signedIn' ? (
        <>
          <Stack.Screen name={SCREENS.Main} component={MainTabs} />
          <Stack.Screen name={SCREENS.TaskDetail} component={TaskDetailScreen} />
          <Stack.Screen
            name={SCREENS.TaskForm}
            component={TaskFormScreen}
            // The screen draws its own scrim and card on wide windows, so the stack only has to be see-through.
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name={SCREENS.Login} component={LoginScreen} />
          <Stack.Screen name={SCREENS.ForgotPassword} component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
