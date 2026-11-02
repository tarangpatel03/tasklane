import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@task-app/shared';
import * as argon2 from 'argon2';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager } from 'typeorm';
import { AuthTokenType } from '../auth-tokens/authTokenType.enum';
import { AuthTokensService, RESET_TOKEN_VALID_MINUTES } from '../auth-tokens/authTokens.service';
import { MailService } from '../mail/mail.service';
import { passwordResetEmail } from '../mail/templates/passwordReset.template';
import { RefreshTokensService } from '../refresh-tokens/refreshTokens.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/authResponse.dto';

const RESET_COOLDOWN_SECONDS = 60;
const INVALID_CREDENTIALS = 'Invalid email or password';
const INVALID_REFRESH_TOKEN = 'Invalid or expired refresh token';

@Injectable()
export class AuthService {
  /** Verified against when the email is unknown, so response time does not reveal which emails exist. */
  private dummyHash?: Promise<string>;

  constructor(
    private readonly refreshTokens: RefreshTokensService,
    private readonly authTokens: AuthTokensService,
    private readonly mail: MailService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  /** Same 401 for unknown email, wrong password, and invited or deactivated accounts. */
  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(email);
    const hash = user?.passwordHash ?? (await this.getDummyHash());
    const passwordOk = await argon2.verify(hash, password);
    if (!user || !user.passwordHash || !passwordOk || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    return this.issueTokens(user);
  }

  /**
   * Rotates the refresh token. A revoked token showing up again means it may have been stolen,
   * so every session of that user is revoked.
   */
  async refresh(token: string): Promise<AuthResponseDto> {
    const stored = await this.refreshTokens.findByRawToken(token);
    if (!stored) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN);
    }
    if (stored.revokedAt) {
      await this.refreshTokens.revokeAllForUser(stored.userId);
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN);
    }
    if (stored.expiresAt <= new Date() || stored.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN);
    }

    return this.dataSource.transaction(async (manager) => {
      if (!(await this.refreshTokens.revokeIfActive(stored.id, manager))) {
        throw new UnauthorizedException(INVALID_REFRESH_TOKEN);
      }
      return this.issueTokens(stored.user, manager);
    });
  }

  /**
   * Changes the password of a signed-in user, signs them out everywhere and hands back a fresh token
   * pair for this device. A wrong current password is a 400, not a 401: the mobile client treats a 401
   * as an expired session and would log the user out.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user || user.status !== UserStatus.ACTIVE || !user.passwordHash) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    if (!(await argon2.verify(user.passwordHash, currentPassword))) {
      throw this.invalidPassword('currentPassword', 'Current password is incorrect');
    }
    if (currentPassword === newPassword) {
      throw this.invalidPassword('newPassword', 'Choose a password you have not used just now');
    }
    const passwordHash = await argon2.hash(newPassword);

    return this.dataSource.transaction(async (manager) => {
      await this.usersService.setPassword(user.id, passwordHash, UserStatus.ACTIVE, manager);
      await this.refreshTokens.revokeAllForUser(user.id, manager);
      return this.issueTokens(user, manager);
    });
  }

  private invalidPassword(field: string, message: string): BadRequestException {
    return new BadRequestException({ message, details: [{ field, messages: [message] }] });
  }

  async logout(userId: string, token: string): Promise<void> {
    await this.refreshTokens.revokeOwn(userId, token);
  }

  /**
   * Emails a reset link to an active user. Unknown, invited and deactivated emails do nothing, and
   * the mail is not awaited, so neither the response nor its timing says whether the email exists.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.status !== UserStatus.ACTIVE) {
      return;
    }
    // Stops the endpoint from being used to flood one person's inbox.
    if (await this.authTokens.issuedWithin(user.id, AuthTokenType.RESET, RESET_COOLDOWN_SECONDS)) {
      return;
    }
    const token = await this.authTokens.issue(user.id, AuthTokenType.RESET);
    void this.mail.send(
      user.email,
      passwordResetEmail({
        name: user.name,
        resetUrl: this.authTokens.buildUrl(AuthTokenType.RESET, token),
        validMinutes: RESET_TOKEN_VALID_MINUTES,
      }),
    );
  }

  /** For the page behind an email link: the account's email if the link can still be used. */
  async previewToken(type: AuthTokenType, token: string): Promise<{ email: string } | null> {
    const stored = await this.authTokens.findValid(token, type);
    return stored && this.canRedeem(type, stored.user) ? { email: stored.user.email } : null;
  }

  /**
   * Sets the password from a setup or reset link. The link works once. A reset also signs the
   * user out everywhere. Returns null when the link is not usable.
   */
  async redeem(
    type: AuthTokenType,
    token: string,
    password: string,
  ): Promise<{ email: string } | null> {
    if (!(await this.previewToken(type, token))) {
      return null;
    }
    const passwordHash = await argon2.hash(password);

    return this.dataSource.transaction(async (manager) => {
      const stored = await this.authTokens.findValid(token, type, manager);
      if (!stored || !this.canRedeem(type, stored.user)) {
        return null;
      }
      if (!(await this.authTokens.consume(stored.id, manager))) {
        return null;
      }
      await this.usersService.setPassword(stored.userId, passwordHash, UserStatus.ACTIVE, manager);
      if (type === AuthTokenType.RESET) {
        await this.refreshTokens.revokeAllForUser(stored.userId, manager);
      }
      return { email: stored.user.email };
    });
  }

  /** A setup link is for someone who has no password yet, a reset link for someone who has one. */
  private canRedeem(type: AuthTokenType, user: User): boolean {
    return user.status === (type === AuthTokenType.SETUP ? UserStatus.INVITED : UserStatus.ACTIVE);
  }

  private async issueTokens(user: User, manager?: EntityManager): Promise<AuthResponseDto> {
    const refreshToken = await this.refreshTokens.issue(user.id, manager);
    const accessToken = await this.jwtService.signAsync({ sub: user.id });
    return plainToInstance(
      AuthResponseDto,
      { accessToken, refreshToken, user },
      { excludeExtraneousValues: true },
    );
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= argon2.hash('not-a-real-password');
    return this.dummyHash;
  }
}
