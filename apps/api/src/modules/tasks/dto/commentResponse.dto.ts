import { Expose, Type } from 'class-transformer';
import { UserSummaryDto } from './taskResponse.dto';

export class CommentResponseDto {
  @Expose()
  id!: string;

  @Expose()
  body!: string;

  @Expose()
  @Type(() => UserSummaryDto)
  author!: UserSummaryDto;

  @Expose()
  createdAt!: Date;
}
