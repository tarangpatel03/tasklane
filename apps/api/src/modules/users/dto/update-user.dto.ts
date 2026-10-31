import { UserStatus } from '@task-app/shared';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ASSIGNABLE_ROLES, AssignableRole } from './create-user.dto';
import { normalizeEmail, trim } from './transforms';

/** `invited` is not settable: a user becomes active by setting up their account. */
export const SETTABLE_STATUSES = [UserStatus.ACTIVE, UserStatus.DEACTIVATED] as const;
export type SettableStatus = (typeof SETTABLE_STATUSES)[number];

export class UpdateUserDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsIn(ASSIGNABLE_ROLES)
  role?: AssignableRole;

  @IsOptional()
  @IsIn(SETTABLE_STATUSES)
  status?: SettableStatus;
}
