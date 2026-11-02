import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthUser } from '../../common/types/auth-user';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ROUTES } from '@task-app/shared';

@ApiTags('Auth')
@Controller(ROUTES.auth.controller)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Log in with email and password' })
  @Post(ROUTES.auth.login)
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Exchange a refresh token for a new token pair' })
  @Post(ROUTES.auth.refresh)
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  /** Always answers 200, whether or not the email belongs to an account. */
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Email a password reset link' })
  @Post(ROUTES.auth.forgotPassword)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<null> {
    await this.authService.forgotPassword(dto.email);
    return null;
  }

  /** Revokes every session and returns a fresh token pair for the calling device. */
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change the password and revoke all sessions' })
  @Post(ROUTES.auth.changePassword)
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<AuthResponseDto> {
    return this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a refresh token' })
  @Post(ROUTES.auth.logout)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: AuthUser, @Body() dto: RefreshTokenDto): Promise<null> {
    await this.authService.logout(user.id, dto.refreshToken);
    return null;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user' })
  @Get(ROUTES.auth.me)
  async me(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    const found = await this.usersService.findById(user.id);
    return plainToInstance(UserResponseDto, found, { excludeExtraneousValues: true });
  }
}
