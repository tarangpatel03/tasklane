import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { AppConfig } from '../../config/configuration';
import { RefreshToken } from './entities/refreshToken.entity';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Revoked rows stay this long so reuse of a rotated (possibly stolen) token is still detected. */
const REVOKED_RETENTION_DAYS = 7;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Owns refresh token persistence. Tokens are random strings; only their SHA-256 is stored.
 * Kept apart from AuthModule so UsersModule can revoke sessions without importing it.
 */
@Injectable()
export class RefreshTokensService {
  private readonly logger = new Logger(RefreshTokensService.name);

  constructor(
    @InjectRepository(RefreshToken) private readonly tokens: Repository<RefreshToken>,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** Creates a token for the user and returns the raw value, which is never stored. */
  async issue(userId: string, manager?: EntityManager): Promise<string> {
    const repository = this.repositoryFor(manager);
    const { refreshTtlDays } = this.config.get('auth', { infer: true });
    const token = randomBytes(48).toString('base64url');
    await repository.save(
      repository.create({
        userId,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + refreshTtlDays * MS_PER_DAY),
        revokedAt: null,
      }),
    );
    return token;
  }

  findByRawToken(token: string): Promise<RefreshToken | null> {
    return this.tokens.findOne({
      where: { tokenHash: hashToken(token) },
      relations: { user: true },
    });
  }

  /** Returns false if the token was already revoked, so two concurrent refreshes cannot both win. */
  async revokeIfActive(id: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.repositoryFor(manager).update(
      { id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    return !!result.affected;
  }

  /** Revokes only the caller's own token. Unknown or already revoked tokens are ignored. */
  async revokeOwn(userId: string, token: string): Promise<void> {
    await this.tokens.update(
      { tokenHash: hashToken(token), userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /** For deactivation and password change. */
  async revokeAllForUser(userId: string, manager?: EntityManager): Promise<void> {
    await this.repositoryFor(manager).update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /** Every refresh and login adds a row, so unusable ones are removed daily to keep the table small. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeStale(): Promise<number> {
    const now = new Date();
    const revokedBefore = new Date(now.getTime() - REVOKED_RETENTION_DAYS * MS_PER_DAY);
    const result = await this.tokens
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now })
      .orWhere('revoked_at < :revokedBefore', { revokedBefore })
      .execute();
    const deleted = result.affected ?? 0;
    this.logger.log(`Purged ${deleted} stale refresh tokens`);
    return deleted;
  }

  private repositoryFor(manager?: EntityManager): Repository<RefreshToken> {
    return manager ? manager.getRepository(RefreshToken) : this.tokens;
  }
}
