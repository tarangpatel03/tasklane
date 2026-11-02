import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Role } from '@task-app/shared';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/auth.context';
import { BottomNav } from '../components/BottomNav';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { colors } from '../theme';
import type { TabParamList } from './navigation.types';
import { SCREENS } from './routes';

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Tasks, Review (Managers) and Profile. The tabs stay mounted once opened, so switching is a fade
 * with no rebuild, and one floating nav (the tab bar) slides its pill between them.
 */
export function MainTabs(): ReactNode {
  const { user } = useAuth();
  const isManager = user?.role === Role.MANAGER;

  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen name={SCREENS.Tasks} component={TasksScreen} />
      {isManager ? <Tab.Screen name={SCREENS.Review} component={ReviewScreen} /> : null}
      <Tab.Screen name={SCREENS.Profile} component={ProfileScreen} />
    </Tab.Navigator>
  );
}
