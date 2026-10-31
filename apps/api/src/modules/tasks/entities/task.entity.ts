import { TaskPriority, TaskStatus } from '@task-app/shared';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskAssignee } from './task-assignee.entity';
import { TaskComment } from './task-comment.entity';
import { TaskStatusHistory } from './task-status-history.entity';

@Entity('tasks')
@Index(['managerId', 'status'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'title', type: 'varchar', length: 120 })
  title!: string;

  @Column({ name: 'description', type: 'varchar', length: 2000, nullable: true })
  description!: string | null;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: TaskPriority,
    enumName: 'task_priority',
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({
    name: 'status',
    type: 'enum',
    enum: TaskStatus,
    enumName: 'task_status',
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Index()
  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate!: Date | null;

  @Column({ name: 'requires_review', type: 'boolean', default: true })
  requiresReview!: boolean;

  /** Users are deactivated, never deleted, so RESTRICT protects task history. */
  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId!: string | null;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'manager_id' })
  manager!: User | null;

  @Index()
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt!: Date | null;

  @OneToMany(() => TaskAssignee, (assignee) => assignee.task)
  assignees!: TaskAssignee[];

  @OneToMany(() => TaskComment, (comment) => comment.task)
  comments!: TaskComment[];

  @OneToMany(() => TaskStatusHistory, (entry) => entry.task)
  history!: TaskStatusHistory[];
}
