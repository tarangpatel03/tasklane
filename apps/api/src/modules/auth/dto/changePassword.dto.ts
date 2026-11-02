import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  currentPassword!: string;

  /** Same 8 to 128 characters the setup and reset pages accept. */
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
