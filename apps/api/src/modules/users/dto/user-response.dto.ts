import { Role, UserStatus } from '@task-app/shared';
import { Expose } from 'class-transformer';

/** Public view of a user. Fields not exposed here (such as the password hash) never leave the API. */
export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  role!: Role;

  @Expose()
  status!: UserStatus;

  @Expose()
  createdAt!: Date;
}
