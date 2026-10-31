import { Role, UserStatus } from '@task-app/shared';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { trim } from './transforms';

export class QueryUsersDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  /** Matches part of the name or email. */
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  search?: string;
}
