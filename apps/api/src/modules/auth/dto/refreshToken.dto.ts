import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Body for both refresh and logout. */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  refreshToken!: string;
}
