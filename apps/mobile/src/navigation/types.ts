/** Routes of the root stack. Signed-out users get Login and ForgotPassword, signed-in users the app. */
export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Tasks: undefined;
  Review: undefined;
  /** Create a task, or edit the one with `taskId`. */
  TaskForm: { taskId?: string };
  TaskDetail: { taskId: string };
};
