import type { NavigatorScreenParams } from '@react-navigation/native';
import { SCREENS } from './routes';

/** The signed-in tabs. `selectedId` is the task shown in the detail pane on wide windows. */
export type TabParamList = {
  [SCREENS.Tasks]: { selectedId?: string } | undefined;
  [SCREENS.Review]: { selectedId?: string } | undefined;
  [SCREENS.Profile]: undefined;
};

/** Routes of the root stack. Signed-out users get Login and ForgotPassword, signed-in users the tabs. */
export type RootStackParamList = {
  [SCREENS.Login]: undefined;
  [SCREENS.ForgotPassword]: undefined;
  [SCREENS.Main]: NavigatorScreenParams<TabParamList> | undefined;
  /** `from` is the tab to return to with this task selected if the window grows to the split layout. */
  [SCREENS.TaskDetail]: { taskId: string; from?: typeof SCREENS.Tasks | typeof SCREENS.Review };
  /** Create a task, or edit the one with `taskId`. */
  [SCREENS.TaskForm]: { taskId?: string };
};
