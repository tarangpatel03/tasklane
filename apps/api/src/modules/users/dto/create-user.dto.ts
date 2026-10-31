import { Role } from '@task-app/shared';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { normalizeEmail, trim } from './transforms';

/** Admin accounts come from the seed script, never from the API. */
export const ASSIGNABLE_ROLES = [Role.MANAGER, Role.EMPLOYEE] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export class CreateUserDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsIn(ASSIGNABLE_ROLES)
  role!: AssignableRole;
}
