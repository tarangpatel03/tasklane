import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useWindowClass } from '../../hooks/useWindowClass';
import type { RootStackParamList } from '../../navigation/navigation.types';
import { colors } from '../../theme';
import { TaskDetailView } from '../../components/task/TaskDetailView';
import { SCREENS } from '../../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, typeof SCREENS.TaskDetail>;

/** Phone detail: a pushed screen around the shared detail view. */
export function TaskDetailScreen({ navigation, route }: Props): ReactNode {
  const { taskId, from } = route.params;
  const { windowClass } = useWindowClass();

  // The window grew (unfold, split-screen, rotation): the list shows the detail in its own pane,
  // so go back to that tab with this task selected.
  useEffect(() => {
    if (windowClass !== 'expanded') return;
    if (from) {
      navigation.popTo(SCREENS.Main, { screen: from, params: { selectedId: taskId } });
    } else {
      navigation.goBack();
    }
  }, [windowClass, navigation, taskId, from]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <TaskDetailView
        taskId={taskId}
        variant="screen"
        onDismiss={() => navigation.goBack()}
        onDeleted={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
