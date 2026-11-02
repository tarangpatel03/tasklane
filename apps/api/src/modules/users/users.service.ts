import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, TaskStatus, UserStatus } from '@task-app/shared';
import { DataSource, EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginatedResult } from '../../common/types/paginatedResult.types';
import { AuthUser } from '../../common/types/authUser.types';
import { escapeLike } from '../../common/utils/escapeLike.util';
import { AuthTokenType } from '../auth-tokens/authTokenType.enum';
import { AuthTokensService, SETUP_TOKEN_VALID_HOURS } from '../auth-tokens/authTokens.service';
import { MailService } from '../mail/mail.service';
import { accountCreatedEmail } from '../mail/templates/accountCreated.template';
import { RefreshTokensService } from '../refresh-tokens/refreshTokens.service';
import { Task } from '../tasks/entities/task.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { QueryUsersDto } from './dto/queryUsers.dto';
import { SettableStatus, UpdateUserDto } from './dto/updateUser.dto';
import { User } from './entities/user.entity';

const EMAIL_TAKEN = 'A user with this email already exists';

interface OpenTaskSummary {
  id: string;
  title: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly refreshTokens: RefreshTokensService,
    private readonly authTokens: AuthTokensService,
    private readonly mail: MailService,
    private readonly dataSource: DataSource,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.users.findOneBy({ id });
  }

  findByIds(ids: string[]): Promise<User[]> {
    return this.users.findBy({ id: In(ids) });
  }

  /** Emails are stored lowercase, so the lookup lowercases the input. */
  findByEmail(email: string): Promise<User | null> {
    return this.users.findOneBy({ email: email.toLowerCase() });
  }

  /** The new user starts `invited` with no password and gets an email with the setup link. */
  async create(dto: CreateUserDto): Promise<User> {
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException(EMAIL_TAKEN);
    }
    const { user, setupToken } = await this.dataSource.transaction(async (manager) => {
      const created = await manager.getRepository(User).save(
        manager.getRepository(User).create({
          name: dto.name,
          email: dto.email,
          role: dto.role,
          status: UserStatus.INVITED,
          passwordHash: null,
        }),
      );
      const token = await this.authTokens.issue(created.id, AuthTokenType.SETUP, manager);
      return { user: created, setupToken: token };
    });
    this.sendInvite(user, setupToken);
    return user;
  }

  /** Sends a fresh setup link to a user who has not set a password yet. The earlier link stops working. */
  async resendInvite(id: string): Promise<void> {
    const user = await this.users.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status !== UserStatus.INVITED) {
      throw new ConflictException('Only a user who has not set up their account can be re-invited');
    }
    this.sendInvite(user, await this.authTokens.issue(user.id, AuthTokenType.SETUP));
  }

  /** Stores the password hash. `status` is set in the same write so a password and its status never drift apart. */
  async setPassword(
    userId: string,
    passwordHash: string,
    status: UserStatus,
    manager: EntityManager,
  ): Promise<void> {
    await manager.getRepository(User).update({ id: userId }, { passwordHash, status });
  }

  async list(actor: AuthUser, query: QueryUsersDto): Promise<PaginatedResult<User>> {
    const qb = this.users.createQueryBuilder('user');
    this.restrictToVisible(qb, actor);
    if (query.role) {
      qb.andWhere('user.role = :roleFilter', { roleFilter: query.role });
    }
    if (query.status) {
      qb.andWhere('user.status = :statusFilter', { statusFilter: query.status });
    }
    if (query.search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${escapeLike(query.search)}%`,
      });
    }
    const [items, total] = await qb
      .orderBy('user.name', 'ASC')
      .addOrderBy('user.id', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
    return new PaginatedResult(items, total, query.page, query.limit);
  }

  /** Users the caller may not see are reported as missing, so ids cannot be probed. */
  async getVisible(actor: AuthUser, id: string): Promise<User> {
    const user = await this.users.findOneBy({ id });
    if (!user || !this.canView(actor, user)) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /** Admin only (enforced by the controller). Field rules and the status rules run in one transaction. */
  update(actor: AuthUser, id: string, dto: UpdateUserDto): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(User);
      const user = await repository.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (dto.name !== undefined) {
        user.name = dto.name;
      }
      if (dto.email !== undefined && dto.email !== user.email) {
        if (await repository.findOneBy({ email: dto.email })) {
          throw new ConflictException(EMAIL_TAKEN);
        }
        user.email = dto.email;
      }
      if (dto.role !== undefined && dto.role !== user.role) {
        this.assertRoleChangeAllowed(actor, user);
        await this.assertNoOpenTasks(user.id, manager);
        user.role = dto.role;
      }
      if (dto.status !== undefined) {
        await this.applyStatus(actor, user, dto.status, manager);
      }
      return repository.save(user);
    });
  }

  /** Same rules as setting the status to `deactivated` through `update`. */
  async deactivate(actor: AuthUser, id: string): Promise<void> {
    await this.update(actor, id, { status: UserStatus.DEACTIVATED });
  }

  /** Admin sees everyone, a Manager sees Employees and self, an Employee sees self. */
  private canView(actor: AuthUser, user: User): boolean {
    if (actor.role === Role.ADMIN || actor.id === user.id) {
      return true;
    }
    return actor.role === Role.MANAGER && user.role === Role.EMPLOYEE;
  }

  private restrictToVisible(qb: SelectQueryBuilder<User>, actor: AuthUser): void {
    if (actor.role === Role.MANAGER) {
      qb.andWhere('(user.role = :employeeRole OR user.id = :actorId)', {
        employeeRole: Role.EMPLOYEE,
        actorId: actor.id,
      });
    } else if (actor.role !== Role.ADMIN) {
      qb.andWhere('user.id = :actorId', { actorId: actor.id });
    }
  }

  private assertRoleChangeAllowed(actor: AuthUser, user: User): void {
    if (user.id === actor.id) {
      throw new ConflictException('You cannot change your own role');
    }
    if (user.role === Role.ADMIN) {
      throw new ConflictException('The role of an Admin account cannot be changed');
    }
  }

  private async applyStatus(
    actor: AuthUser,
    user: User,
    status: SettableStatus,
    manager: EntityManager,
  ): Promise<void> {
    if (status === user.status) {
      return;
    }

    if (status === UserStatus.ACTIVE) {
      if (user.status !== UserStatus.DEACTIVATED) {
        throw new ConflictException(
          'Only a deactivated user can be activated. An invited user becomes active by setting up their account',
        );
      }
      // Someone deactivated before setting a password still has to set one, so they go back to invited.
      user.status = user.passwordHash ? UserStatus.ACTIVE : UserStatus.INVITED;
      return;
    }

    if (user.id === actor.id) {
      throw new ConflictException('You cannot deactivate your own account');
    }
    if (user.role === Role.ADMIN && user.status === UserStatus.ACTIVE) {
      // Locking the active Admin rows makes two Admins deactivating each other at once run one after the other.
      const activeAdmins = await manager.getRepository(User).find({
        select: { id: true },
        where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
        lock: { mode: 'pessimistic_write' },
      });
      if (activeAdmins.length <= 1) {
        throw new ConflictException('The last Admin cannot be deactivated');
      }
    }
    await this.assertNoOpenTasks(user.id, manager);

    user.status = UserStatus.DEACTIVATED;
    await this.refreshTokens.revokeAllForUser(user.id, manager);
  }

  /** Mail is sent after the request's work is done and must never delay or fail it, so it is not awaited. */
  private sendInvite(user: User, setupToken: string): void {
    void this.mail.send(
      user.email,
      accountCreatedEmail({
        name: user.name,
        setupUrl: this.authTokens.buildUrl(AuthTokenType.SETUP, setupToken),
        validHours: SETUP_TOKEN_VALID_HOURS,
      }),
    );
  }

  private async assertNoOpenTasks(userId: string, manager: EntityManager): Promise<void> {
    const openTasks = await this.findOpenTasks(userId, manager);
    if (openTasks.length > 0) {
      throw new ConflictException({
        message: 'This user is on open tasks. Reassign them first',
        details: openTasks.map((task) => ({
          field: 'tasks',
          messages: [`${task.title} (${task.id})`],
        })),
      });
    }
  }

  /**
   * Tasks that are not completed or deleted where the user is the Manager or an assignee. It queries the
   * Task entity directly because importing TasksModule here would make the modules depend on each other.
   */
  private findOpenTasks(userId: string, manager: EntityManager): Promise<OpenTaskSummary[]> {
    return manager
      .getRepository(Task)
      .createQueryBuilder('task')
      .select(['task.id', 'task.title'])
      .where('task.status != :done', { done: TaskStatus.COMPLETED })
      .andWhere(
        '(task.managerId = :userId OR EXISTS (SELECT 1 FROM task_assignees ta WHERE ta.task_id = task.id AND ta.user_id = :userId))',
        { userId },
      )
      .orderBy('task.createdAt', 'ASC')
      .take(50)
      .getMany();
  }
}
