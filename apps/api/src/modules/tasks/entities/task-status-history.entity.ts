import { TaskStatus } from '@task-app/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

@Entity('task_status_history')
@Index(['taskId', 'createdAt'])
export class TaskStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId!: string;

  @ManyToOne(() => Task, (task) => task.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  /** Null for the row that records task creation. */
  @Column({
    name: 'from_status',
    type: 'enum',
    enum: TaskStatus,
    enumName: 'task_status',
    nullable: true,
  })
  fromStatus!: TaskStatus | null;

  @Column({ name: 'to_status', type: 'enum', enum: TaskStatus, enumName: 'task_status' })
  toStatus!: TaskStatus;

  @Column({ name: 'actor_id', type: 'uuid' })
  actorId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'actor_id' })
  actor!: User;

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
