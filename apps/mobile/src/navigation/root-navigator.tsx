import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/auth-context';
import { ForgotPasswordScreen } from '../screens/forgot-password-screen';
import { LoginScreen } from '../screens/login-screen';
import { ReviewScreen } from '../screens/review-screen';
import { TaskDetailScreen } from '../screens/task-detail-screen';
import { TaskFormScreen } from '../screens/task-form-screen';
import { TasksScreen } from '../screens/tasks-screen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Screens draw their own headers, so the native one is off. The signed-in state decides the stack. */
export function RootNavigator(): ReactNode {
  const { status } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'signedIn' ? (
        <>
          <Stack.Screen name="Tasks" component={TasksScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Review" component={ReviewScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="TaskForm" component={TaskFormScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
