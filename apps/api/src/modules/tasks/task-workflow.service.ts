import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Role, TaskAction, TaskStatus, UserStatus } from '@task-app/shared';
import { DataSource, EntityManager } from 'typeorm';
import { AuthUser } from '../../common/types/auth-user';
import { MailService } from '../mail/mail.service';
import { reviewResultEmail } from '../mail/templates/review-result.template';
import { submittedForReviewEmail } from '../mail/templates/submitted-for-review.template';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { TransitionTaskDto } from './dto/transition-task.dto';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TaskStatusHistory } from './entities/task-status-history.entity';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

interface TransitionRule {
  from: TaskStatus;
  to: TaskStatus;
  /** Assignees do the work; reviewers (the task's Manager, or an Admin) judge it. */
  by: 'assignee' | 'reviewer';
  /** When set, the task's `requiresReview` flag must match. */
  requiresReview?: boolean;
}

/** Spec section 5. Any pair not listed here is rejected with 409. */
const RULES: Record<TaskAction, TransitionRule> = {
  [TaskAction.START]: { from: TaskStatus.TODO, to: TaskStatus.WORKING, by: 'assignee' },
  [TaskAction.SUBMIT]: {
    from: TaskStatus.WORKING,
    to: TaskStatus.IN_REVIEW,
    by: 'assignee',
    requiresReview: true,
  },
  [TaskAction.COMPLETE]: {
    from: TaskStatus.WORKING,
    to: TaskStatus.COMPLETED,
    by: 'assignee',
    requiresReview: false,
  },
  [TaskAction.APPROVE]: { from: TaskStatus.IN_REVIEW, to: TaskStatus.COMPLETED, by: 'reviewer' },
  [TaskAction.REJECT]: { from: TaskStatus.IN_REVIEW, to: TaskStatus.WORKING, by: 'reviewer' },
};

@Injectable()
export class TaskWorkflowService {
  private readonly logger = new Logger(TaskWorkflowService.name);

  constructor(
    private readonly tasks: TasksService,
    private readonly users: UsersService,
    private readonly mail: MailService,
    private readonly dataSource: DataSource,
  ) {}

  /** Moves the task to its next status if the caller may do that and the task is in the right state. */
  async transition(actor: AuthUser, id: string, dto: TransitionTaskDto): Promise<Task> {
    await this.tasks.assertVisible(actor, id);
    if (dto.action === TaskAction.REJECT && !dto.comment) {
      throw new BadRequestException({
        message: 'A comment is required to reject a task',
        details: [{ field: 'comment', messages: ['Required when rejecting a task'] }],
      });
    }
    const rule = RULES[dto.action];

    await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Task);
      // The lock makes two simultaneous transitions run one after the other, so the status check below is reliable.
      const task = await repository.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      await this.assertMayAct(actor, task, rule, dto.action, manager);
      if (task.status !== rule.from) {
        throw new ConflictException(`Cannot ${dto.action} a task that is ${task.status}`);
      }
      if (rule.requiresReview !== undefined && task.requiresReview !== rule.requiresReview) {
        throw new ConflictException(
          rule.requiresReview
            ? 'This task does not need a review. Complete it instead'
            : 'This task needs a review. Submit it instead',
        );
      }

      task.status = rule.to;
      task.completedAt = rule.to === TaskStatus.COMPLETED ? new Date() : null;
      await repository.save(task);
      await manager.getRepository(TaskStatusHistory).insert({
        taskId: id,
        fromStatus: rule.from,
        toStatus: rule.to,
        actorId: actor.id,
        comment: dto.comment ?? null,
      });
    });

    const updated = await this.tasks.loadOrFail(id);
    // Mail is sent after the transition is committed and must never delay or fail it, so it is not awaited.
    this.notify(actor, dto, updated).catch((error: unknown) => {
      this.logger.error(
        `Could not prepare emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    });
    return updated;
  }

  private async assertMayAct(
    actor: AuthUser,
    task: Task,
    rule: TransitionRule,
    action: TaskAction,
    manager: EntityManager,
  ): Promise<void> {
    let allowed: boolean;
    if (rule.by === 'assignee') {
      allowed =
        actor.role === Role.EMPLOYEE &&
        (await manager.getRepository(TaskAssignee).existsBy({ taskId: task.id, userId: actor.id }));
    } else {
      allowed =
        actor.role === Role.ADMIN || (actor.role === Role.MANAGER && task.managerId === actor.id);
    }
    if (!allowed) {
      throw new ForbiddenException(`You cannot ${action} this task`);
    }
  }

  private async notify(actor: AuthUser, dto: TransitionTaskDto, task: Task): Promise<void> {
    if (dto.action === TaskAction.SUBMIT) {
      await this.notifySubmitted(actor, task);
    } else if (dto.action === TaskAction.APPROVE || dto.action === TaskAction.REJECT) {
      await this.notifyReviewResult(actor, dto, task);
    }
  }

  /** The task's Manager, plus the creator when the creator is an Admin and someone else. */
  private async notifySubmitted(actor: AuthUser, task: Task): Promise<void> {
    const recipients: User[] = [];
    if (task.manager) {
      recipients.push(task.manager);
    }
    if (task.creator.role === Role.ADMIN && task.creator.id !== task.managerId) {
      recipients.push(task.creator);
    }
    const submitter = await this.users.findById(actor.id);
    for (const recipient of recipients.filter(isReachable)) {
      void this.mail.send(
        recipient.email,
        submittedForReviewEmail({
          recipientName: recipient.name,
          taskTitle: task.title,
          submittedByName: submitter?.name ?? 'An assignee',
        }),
      );
    }
  }

  private async notifyReviewResult(
    actor: AuthUser,
    dto: TransitionTaskDto,
    task: Task,
  ): Promise<void> {
    const reviewer = await this.users.findById(actor.id);
    for (const { user } of task.assignees.filter((row) => isReachable(row.user))) {
      void this.mail.send(
        user.email,
        reviewResultEmail({
          recipientName: user.name,
          taskTitle: task.title,
          approved: dto.action === TaskAction.APPROVE,
          reviewerName: reviewer?.name ?? 'The reviewer',
          comment: dto.comment ?? null,
        }),
      );
    }
  }
}

function isReachable(user: User): boolean {
  return user.status !== UserStatus.DEACTIVATED;
}
