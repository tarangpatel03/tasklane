import { Logger } from '@nestjs/common';
import { Role, TaskStatus, UserStatus } from '@task-app/shared';
import * as argon2 from 'argon2';
import { EntityManager } from 'typeorm';
import { loadDemoSeedEnv } from '../../config/env.validation';
import { TaskAssignee } from '../../modules/tasks/entities/task-assignee.entity';
import { TaskComment } from '../../modules/tasks/entities/task-comment.entity';
import { TaskStatusHistory } from '../../modules/tasks/entities/task-status-history.entity';
import { Task } from '../../modules/tasks/entities/task.entity';
import { User } from '../../modules/users/entities/user.entity';
import dataSource from '../data-source';
import { DEMO_PEOPLE, DEMO_TASKS, DemoActor, DemoKey, DemoTask, demoEmail } from './demo-data';

const logger = new Logger('SeedDemo');
const DAY_MS = 24 * 60 * 60 * 1000;

interface Step {
  from: TaskStatus | null;
  to: TaskStatus;
  actor: DemoActor;
  comment: string | null;
}

/** The real path through the workflow that ends in the task's status (spec section 5). */
function buildSteps(task: DemoTask): Step[] {
  const worker = task.assignees[0];
  const reviewer: DemoActor = task.manager ?? 'admin';
  const requiresReview = task.requiresReview ?? true;
  const steps: Step[] = [{ from: null, to: TaskStatus.TODO, actor: task.createdBy, comment: null }];
  const add = (
    from: TaskStatus,
    to: TaskStatus,
    actor: DemoActor,
    comment: string | null,
  ): void => {
    steps.push({ from, to, actor, comment });
  };

  if (task.status === TaskStatus.TODO) {
    return steps;
  }
  add(TaskStatus.TODO, TaskStatus.WORKING, worker, null);
  if (task.status === TaskStatus.WORKING) {
    return steps;
  }
  if (!requiresReview) {
    add(TaskStatus.WORKING, TaskStatus.COMPLETED, worker, null);
    return steps;
  }
  add(TaskStatus.WORKING, TaskStatus.IN_REVIEW, worker, null);
  if (task.rejectedOnce) {
    add(TaskStatus.IN_REVIEW, TaskStatus.WORKING, reviewer, task.rejectedOnce);
    add(TaskStatus.WORKING, TaskStatus.IN_REVIEW, worker, null);
  }
  if (task.status === TaskStatus.COMPLETED) {
    add(TaskStatus.IN_REVIEW, TaskStatus.COMPLETED, reviewer, null);
  }
  return steps;
}

async function insertTask(
  manager: EntityManager,
  demo: DemoTask,
  ids: Map<DemoActor, string>,
  now: number,
): Promise<void> {
  const idOf = (actor: DemoActor): string => {
    const id = ids.get(actor);
    if (!id) {
      throw new Error(`Unknown demo actor: ${actor}`);
    }
    return id;
  };
  const steps = buildSteps(demo);
  const createdAt = now - demo.createdDaysAgo * DAY_MS;
  // Steps are spread evenly between creation and now, so history reads in order and never lies in the future.
  const gap = (now - createdAt) / (steps.length + 1);
  const stepTime = (index: number): Date => new Date(createdAt + gap * index);
  const lastTime = stepTime(steps.length - 1);

  const tasks = manager.getRepository(Task);
  const task = await tasks.save(
    tasks.create({
      title: demo.title,
      description: demo.description,
      priority: demo.priority,
      status: demo.status,
      dueDate: demo.dueInDays === null ? undefined : new Date(now + demo.dueInDays * DAY_MS),
      requiresReview: demo.requiresReview ?? true,
      managerId: demo.manager ? idOf(demo.manager) : undefined,
      createdBy: idOf(demo.createdBy),
      completedAt: demo.status === TaskStatus.COMPLETED ? lastTime : undefined,
      createdAt: stepTime(0),
      updatedAt: lastTime,
    }),
  );

  await manager
    .getRepository(TaskAssignee)
    .insert(
      demo.assignees.map((key) => ({ taskId: task.id, userId: idOf(key), addedAt: stepTime(0) })),
    );
  await manager.getRepository(TaskStatusHistory).insert(
    steps.map((step, index) => ({
      taskId: task.id,
      fromStatus: step.from,
      toStatus: step.to,
      actorId: idOf(step.actor),
      comment: step.comment,
      createdAt: stepTime(index),
    })),
  );
  if (demo.comments?.length) {
    await manager.getRepository(TaskComment).insert(
      demo.comments.map((comment, index) => ({
        taskId: task.id,
        authorId: idOf(comment.author),
        body: comment.body,
        createdAt: stepTime(Math.min(index + 1, steps.length - 1)),
      })),
    );
  }
}

/**
 * Creates demo Managers, Employees and sample tasks. Needs an existing Admin (`seed:admin`).
 * Does nothing if the demo accounts already exist, so running it twice is safe.
 */
async function seedDemo(): Promise<void> {
  const env = loadDemoSeedEnv();
  await dataSource.initialize();
  try {
    const users = dataSource.getRepository(User);
    const admin = await users.findOneBy({ role: Role.ADMIN, status: UserStatus.ACTIVE });
    if (!admin) {
      throw new Error('No active Admin found. Run seed:admin first.');
    }
    if (await users.existsBy({ email: demoEmail(DEMO_PEOPLE[0].key) })) {
      logger.log('Demo data already exists, nothing to do.');
      return;
    }

    const passwordHash = await argon2.hash(env.SEED_DEMO_PASSWORD);
    const now = Date.now();
    await dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(User);
      const created = await repository.save(
        DEMO_PEOPLE.map((person) =>
          repository.create({
            name: person.name,
            email: demoEmail(person.key),
            passwordHash,
            role: person.role,
            status: UserStatus.ACTIVE,
          }),
        ),
      );
      const ids = new Map<DemoActor, string>([['admin', admin.id]]);
      created.forEach((user, index) => ids.set(DEMO_PEOPLE[index].key, user.id));

      for (const demo of DEMO_TASKS) {
        await insertTask(manager, demo, ids, now);
      }
    });
    logger.log(
      `Demo data created: ${DEMO_PEOPLE.length} users and ${DEMO_TASKS.length} tasks. Log in with ${demoEmail('maya')} (Manager) or ${demoEmail('aisha')} (Employee).`,
    );
  } finally {
    await dataSource.destroy();
  }
}

seedDemo().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : 'Seed failed');
  process.exitCode = 1;
});
