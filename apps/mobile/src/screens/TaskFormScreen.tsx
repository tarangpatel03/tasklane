import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TaskPriority } from '@task-app/shared';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { toMessage } from '../api/errorMessage.api';
import { createTask, fetchTask, updateTask, type TaskInput } from '../api/tasks.api';
import { fetchEmployees } from '../api/users.api';
import { AppButton } from '../components/buttons/AppButton';
import { AppText } from '../components/brand/AppText';
import { Banner } from '../components/feedback/Banner';
import { CloseButton } from '../components/buttons/CloseButton';
import { EmployeeRow } from '../components/task/EmployeeRow';
import { Entrance } from '../components/layout/Entrance';
import { PriorityPicker } from '../components/inputs/PriorityPicker';
import { useSnackbar } from '../components/feedback/Snackbar';
import { SwitchRow } from '../components/inputs/SwitchRow';
import { TextButton } from '../components/buttons/TextButton';
import { TextField } from '../components/inputs/TextField';
import { useWindowClass } from '../hooks/useWindowClass';
import type { RootStackParamList } from '../navigation/navigation.types';
import { colors, elevation, radii, sizes, spacing, tablet } from '../theme';
import { formatDate } from '../utils/taskFormat.util';
import { SCREENS } from '../navigation/routes';
import { taskKeys, userKeys } from '../api/queryKeys.api';

type Props = NativeStackScreenProps<RootStackParamList, typeof SCREENS.TaskForm>;

const COLUMN_MAX_WIDTH = 560;

interface FormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: Date | null;
  requiresReview: boolean;
  assigneeIds: string[];
}

const EMPTY_FORM: FormValues = {
  title: '',
  description: '',
  priority: TaskPriority.MEDIUM,
  dueDate: null,
  requiresReview: true,
  assigneeIds: [],
};

/** A picked day counts as due until the end of that day (local time). */
function toDueIso(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString();
}

function toInput(values: FormValues): TaskInput {
  const description = values.description.trim();
  return {
    title: values.title.trim(),
    description: description === '' ? null : description,
    priority: values.priority,
    dueDate: values.dueDate ? toDueIso(values.dueDate) : null,
    requiresReview: values.requiresReview,
    assigneeIds: values.assigneeIds,
  };
}

/** Only the fields that differ from `initial`, so an edit never overwrites what it did not touch. */
function changedFields(values: FormValues, initial: FormValues): Partial<TaskInput> {
  const next = toInput(values);
  const before = toInput(initial);
  const changes: Partial<TaskInput> = {};
  if (next.title !== before.title) changes.title = next.title;
  if (next.description !== before.description) changes.description = next.description;
  if (next.priority !== before.priority) changes.priority = next.priority;
  if (values.dueDate?.getTime() !== initial.dueDate?.getTime()) changes.dueDate = next.dueDate;
  if (next.requiresReview !== before.requiresReview) changes.requiresReview = next.requiresReview;
  const sameIds =
    next.assigneeIds.length === before.assigneeIds.length &&
    next.assigneeIds.every((id) => before.assigneeIds.includes(id));
  if (!sameIds) changes.assigneeIds = next.assigneeIds;
  return changes;
}

function Section({ label, children }: { label: string; children: ReactNode }): ReactNode {
  return (
    <View style={styles.section}>
      <AppText variant="labelL" color={colors.textStrong}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

/** Create a task, or edit the one in `route.params.taskId`. Managers only; the API enforces it too. */
export function TaskFormScreen({ navigation, route }: Props): ReactNode {
  const taskId = route.params.taskId;
  const editing = taskId !== undefined;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  const { windowClass, margin, height } = useWindowClass();

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [initial, setInitial] = useState<FormValues>(EMPTY_FORM);
  const [loaded, setLoaded] = useState(!editing);
  const [created, setCreated] = useState(false);

  const existing = useQuery({
    queryKey: taskKeys.detail(taskId ?? ''),
    queryFn: () => fetchTask(taskId ?? ''),
    enabled: editing,
  });
  const employees = useQuery({ queryKey: userKeys.employees(), queryFn: fetchEmployees });

  // The form is filled once, when the task arrives; later refetches must not overwrite typing.
  useEffect(() => {
    if (loaded || !existing.data) return;
    const task = existing.data;
    const filled: FormValues = {
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      requiresReview: task.requiresReview,
      assigneeIds: task.assignees.map((person) => person.id),
    };
    setValues(filled);
    setInitial(filled);
    setLoaded(true);
  }, [loaded, existing.data]);

  const save = useMutation({
    mutationFn: () =>
      editing ? updateTask(taskId, changedFields(values, initial)) : createTask(toInput(values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      if (editing) {
        snackbar.show('Task updated');
        navigation.goBack();
      } else {
        setCreated(true);
      }
    },
  });

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]): void =>
    setValues((current) => ({ ...current, [key]: value }));

  const toggleEmployee = (id: string): void =>
    update(
      'assigneeIds',
      values.assigneeIds.includes(id)
        ? values.assigneeIds.filter((current) => current !== id)
        : [...values.assigneeIds, id],
    );

  const openDatePicker = (): void =>
    DateTimePickerAndroid.open({
      value: values.dueDate ?? new Date(),
      mode: 'date',
      onValueChange: (_event, date) => update('dueDate', date),
    });

  const valid = values.title.trim().length > 0 && values.assigneeIds.length > 0;
  const changed = Object.keys(changedFields(values, initial)).length > 0;
  const canSubmit = loaded && valid && (!editing || changed);
  let buttonLabel = editing ? 'Save changes' : 'Create task';
  if (!valid) buttonLabel = 'Add a title and an Employee';

  const reviewEffect = values.requiresReview
    ? 'Assignees submit for review and you approve or reject.'
    : 'Assignees can mark the task complete themselves.';

  let employeeList: ReactNode;
  if (employees.isPending) {
    employeeList = <ActivityIndicator color={colors.primary} style={styles.loading} />;
  } else if (employees.isError) {
    employeeList = (
      <View style={styles.note}>
        <AppText variant="bodyM" color={colors.textSecondary}>
          Couldn't load Employees.
        </AppText>
        <TextButton label="Retry" onPress={() => void employees.refetch()} />
      </View>
    );
  } else if (employees.data.length === 0) {
    employeeList = (
      <AppText variant="bodyM" color={colors.textSecondary}>
        There are no Employees yet. Ask an Admin to add some.
      </AppText>
    );
  } else {
    employeeList = (
      <View style={styles.employees}>
        {employees.data.map((person) => (
          <EmployeeRow
            key={person.id}
            id={person.id}
            name={person.name}
            selected={values.assigneeIds.includes(person.id)}
            onPress={() => toggleEmployee(person.id)}
          />
        ))}
      </View>
    );
  }

  let body: ReactNode;
  if (editing && !loaded) {
    body = existing.isError ? (
      <View style={styles.note}>
        <AppText variant="bodyM" color={colors.textSecondary}>
          Couldn't load this task.
        </AppText>
        <TextButton label="Retry" onPress={() => void existing.refetch()} />
      </View>
    ) : (
      <ActivityIndicator color={colors.primary} style={styles.loading} />
    );
  } else {
    body = (
      <>
        <TextField
          label="Title"
          value={values.title}
          onChangeText={(text) => update('title', text)}
          maxLength={120}
          returnKeyType="next"
        />
        <TextField
          label="Description (optional)"
          value={values.description}
          onChangeText={(text) => update('description', text)}
          maxLength={2000}
          multiline
          numberOfLines={3}
        />
        <Section label="Priority">
          <PriorityPicker value={values.priority} onChange={(next) => update('priority', next)} />
        </Section>
        <Section label="Due date (optional)">
          <View style={styles.dateRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Due date"
              onPress={openDatePicker}
              style={styles.dateField}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4"
                  fill="none"
                  stroke={colors.textSecondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <AppText
                variant="bodyL"
                color={values.dueDate ? colors.textPrimary : colors.textSecondary}
              >
                {values.dueDate ? formatDate(values.dueDate.toISOString()) : 'Pick a date'}
              </AppText>
            </Pressable>
            {values.dueDate ? (
              <TextButton label="Clear" onPress={() => update('dueDate', null)} />
            ) : null}
          </View>
        </Section>
        <SwitchRow
          label="Requires review"
          value={values.requiresReview}
          onChange={(next) => update('requiresReview', next)}
          effect={reviewEffect}
        />
        <Section label="Employees">
          <AppText variant="bodyM" color={colors.textSecondary}>
            {`${values.assigneeIds.length} selected`}
          </AppText>
          {employeeList}
        </Section>
      </>
    );
  }

  // Phones show the form full screen; wider windows show it as a centred card over a scrim.
  const modal = windowClass !== 'compact';
  const pagePadding = modal ? spacing.xl + spacing.xs : margin;
  const sideInsets = modal ? { left: 0, right: 0 } : { left: insets.left, right: insets.right };

  return (
    <View style={modal ? styles.scrim : styles.root}>
      <StatusBar barStyle="dark-content" />
      {modal ? (
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          onPress={() => navigation.goBack()}
        />
      ) : null}
      <KeyboardAvoidingView
        behavior="padding"
        pointerEvents="box-none"
        style={modal ? styles.modalHost : styles.flex}
      >
        <View
          style={modal ? [styles.card, { maxHeight: height - tablet.modalMargin }] : styles.flex}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.scroll}
            contentContainerStyle={{
              paddingTop: modal ? spacing.xl : insets.top + spacing.lg,
              paddingBottom: spacing.xxl,
              paddingLeft: sideInsets.left + pagePadding,
              paddingRight: sideInsets.right + pagePadding,
            }}
          >
            <View style={styles.column}>
              <View style={styles.headerRow}>
                <CloseButton onPress={() => navigation.goBack()} />
                <View style={styles.rolePill}>
                  <AppText variant="labelS" color={colors.primaryPressed}>
                    Manager
                  </AppText>
                </View>
              </View>
              <AppText variant="headline" style={styles.title}>
                {editing ? 'Edit task' : 'Create task'}
              </AppText>
              <View style={styles.fields}>{body}</View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                paddingBottom: modal ? spacing.lg : insets.bottom + spacing.md,
                paddingLeft: sideInsets.left + pagePadding,
                paddingRight: sideInsets.right + pagePadding,
              },
            ]}
          >
            <View style={styles.column}>
              {save.isError ? <Banner message={toMessage(save.error)} /> : null}
              <AppButton
                label={buttonLabel}
                disabled={!canSubmit}
                loading={save.isPending}
                onPress={() => save.mutate()}
              />
            </View>
          </View>

          {created ? (
            <View style={styles.overlay}>
              <Entrance style={styles.overlayContent}>
                <View style={styles.doneTile}>
                  <Svg width={48} height={48} viewBox="0 0 24 24">
                    <Path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      fill="none"
                      stroke={colors.onPrimary}
                      strokeWidth={2.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <AppText variant="headline" style={styles.center}>
                  Task created
                </AppText>
                <AppText variant="bodyL" color={colors.textSecondary} style={styles.center}>
                  The selected Employees have been assigned and will see it in their list.
                </AppText>
                <AppButton
                  label="Back to review queue"
                  onPress={() => {
                    navigation.popTo(SCREENS.Main, { screen: SCREENS.Review });
                  }}
                />
              </Entrance>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  column: { width: '100%', maxWidth: COLUMN_MAX_WIDTH, alignSelf: 'center', gap: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  modalHost: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '100%',
    maxWidth: tablet.column,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.background,
    ...elevation.l3,
  },
  scroll: { flexGrow: 0, flexShrink: 1 },
  rolePill: {
    minHeight: 24,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryContainer,
  },
  title: { fontSize: 30, lineHeight: 36 },
  fields: { gap: spacing.xl },
  section: { gap: spacing.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dateField: {
    flex: 1,
    minHeight: sizes.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.m,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.inputBackground,
  },
  employees: { gap: spacing.sm },
  loading: { paddingVertical: spacing.xxxl },
  note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  footer: {
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  overlayContent: { width: '100%', maxWidth: 420, alignItems: 'stretch', gap: spacing.lg },
  doneTile: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: radii.xl - 4,
    backgroundColor: colors.approve,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
});
