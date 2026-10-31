import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from '@task-app/shared';
import * as argon2 from 'argon2';
import { plainToInstance } from 'class-transformer';
import { createHash, randomBytes } from 'crypto';
import { DataSource, IsNull, Repository } from 'typeorm';
import { AppConfig } from '../../config/configuration';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshToken } from './entities/refresh-token.entity';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const INVALID_CREDENTIALS = 'Invalid email or password';
const INVALID_REFRESH_TOKEN = 'Invalid or expired refresh token';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  /** Verified against when the email is unknown, so response time does not reveal which emails exist. */
  private dummyHash?: Promise<string>;

  constructor(
    @InjectRepository(RefreshToken) private readonly refreshTokens: Repository<RefreshToken>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
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
    const stored = await this.refreshTokens.findOne({
      where: { tokenHash: hashToken(token) },
      relations: { user: true },
    });
    if (!stored) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN);
    }
    if (stored.revokedAt) {
      await this.revokeAllForUser(stored.userId);
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN);
    }
    if (stored.expiresAt <= new Date() || stored.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN);
    }

    return this.dataSource.transaction(async (manager) => {
      // The conditional update makes two concurrent refreshes with the same token race safely.
      const result = await manager.update(
        RefreshToken,
        { id: stored.id, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
      if (!result.affected) {
        throw new UnauthorizedException(INVALID_REFRESH_TOKEN);
      }
      return this.issueTokens(stored.user, manager.getRepository(RefreshToken));
    });
  }

  /** Revokes only the caller's own token. Unknown or already revoked tokens are ignored. */
  async logout(userId: string, token: string): Promise<void> {
    await this.refreshTokens.update(
      { tokenHash: hashToken(token), userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /** For password change and deactivation (checkpoints 2.2 and 2.3). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokens.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  private async issueTokens(
    user: User,
    repository: Repository<RefreshToken> = this.refreshTokens,
  ): Promise<AuthResponseDto> {
    const { refreshTtlDays } = this.config.get('auth', { infer: true });
    const refreshToken = randomBytes(48).toString('base64url');
    await repository.save(
      repository.create({
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTtlDays * MS_PER_DAY),
        revokedAt: null,
      }),
    );

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
