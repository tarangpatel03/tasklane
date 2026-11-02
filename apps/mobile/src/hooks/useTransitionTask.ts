import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { TaskAction } from '@task-app/shared';
import { toMessage } from '../api/errorMessage.api';
import { transitionTask, type Task } from '../api/tasks.api';
import { useSnackbar } from '../components/feedback/Snackbar';
import { taskKeys } from '../api/queryKeys.api';

interface TransitionInput {
  taskId: string;
  action: TaskAction;
  /** Required by the API for REJECT. */
  comment?: string;
}

const SUCCESS_MESSAGE: Record<TaskAction, string> = {
  [TaskAction.START]: 'Task started',
  [TaskAction.SUBMIT]: 'Submitted for review',
  [TaskAction.COMPLETE]: 'Task completed',
  [TaskAction.APPROVE]: 'Task approved',
  [TaskAction.REJECT]: 'Task rejected',
};

/** Runs a workflow action, then refreshes every task query and confirms with a snackbar. */
export function useTransitionTask(): UseMutationResult<Task, Error, TransitionInput> {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  return useMutation({
    mutationFn: (input: TransitionInput) =>
      transitionTask(input.taskId, input.action, input.comment),
    onSuccess: (updated, input) => {
      queryClient.setQueryData(taskKeys.detail(input.taskId), updated);
      // List, counts, review queue and history all depend on the status.
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      snackbar.show(SUCCESS_MESSAGE[input.action]);
    },
    onError: (error) => {
      snackbar.show(toMessage(error));
      // The status may have changed elsewhere, so show the truth.
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
