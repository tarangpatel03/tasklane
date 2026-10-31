import { Role, UserStatus } from '@task-app/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Uniqueness is enforced by a manual index on lower(email) created in the migration.
 * `synchronize: false` stops TypeORM from dropping it, since it cannot model expression indexes.
 */
@Entity('users')
@Index('UQ_users_email_lower', { synchronize: false })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'name', type: 'varchar', length: 120 })
  name!: string;

  /** Stored lowercase. */
  @Column({ name: 'email', type: 'varchar', length: 255 })
  email!: string;

  /** Null until the user finishes account setup. */
  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash!: string | null;

  @Column({ name: 'role', type: 'enum', enum: Role, enumName: 'user_role' })
  role!: Role;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    enumName: 'user_status',
    default: UserStatus.INVITED,
  })
  status!: UserStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
