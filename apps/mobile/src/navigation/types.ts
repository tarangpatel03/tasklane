import type { NavigatorScreenParams } from '@react-navigation/native';

/** The signed-in tabs. `selectedId` is the task shown in the detail pane on wide windows. */
export type TabParamList = {
  Tasks: { selectedId?: string } | undefined;
  Review: { selectedId?: string } | undefined;
  Profile: undefined;
};

/** Routes of the root stack. Signed-out users get Login and ForgotPassword, signed-in users the tabs. */
export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  /** `from` is the tab to return to with this task selected if the window grows to the split layout. */
  TaskDetail: { taskId: string; from?: 'Tasks' | 'Review' };
  /** Create a task, or edit the one with `taskId`. */
  TaskForm: { taskId?: string };
};
