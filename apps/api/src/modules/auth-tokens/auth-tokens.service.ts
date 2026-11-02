import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { EntityManager, IsNull, MoreThan, Repository } from 'typeorm';
import { AppConfig } from '../../config/configuration';
import { AuthTokenType } from './auth-token-type';
import { AuthToken } from './entities/auth-token.entity';
import { API_BASE_PATH, ROUTES } from '@task-app/shared';

export const SETUP_TOKEN_VALID_HOURS = 48;
export const RESET_TOKEN_VALID_MINUTES = 60;

const VALID_FOR_MS: Record<AuthTokenType, number> = {
  [AuthTokenType.SETUP]: SETUP_TOKEN_VALID_HOURS * 60 * 60 * 1000,
  [AuthTokenType.RESET]: RESET_TOKEN_VALID_MINUTES * 60 * 1000,
};

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * One-time links for setting or resetting a password. The token is 256 random bits, so only a
 * plain SHA-256 is stored and no attempt counter is needed.
 */
@Injectable()
export class AuthTokensService {
  constructor(
    @InjectRepository(AuthToken) private readonly tokens: Repository<AuthToken>,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** Creates a token and returns the raw value. Older unused tokens of the same type stop working. */
  async issue(userId: string, type: AuthTokenType, manager?: EntityManager): Promise<string> {
    const repository = this.repositoryFor(manager);
    await repository.update({ userId, type, usedAt: IsNull() }, { usedAt: new Date() });

    const token = randomBytes(32).toString('base64url');
    await repository.save(
      repository.create({
        userId,
        type,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + VALID_FOR_MS[type]),
        usedAt: null,
      }),
    );
    return token;
  }

  /** The token with its user, if it is of this type, unused and not expired. */
  findValid(
    rawToken: string,
    type: AuthTokenType,
    manager?: EntityManager,
  ): Promise<AuthToken | null> {
    return this.repositoryFor(manager).findOne({
      where: {
        tokenHash: hashToken(rawToken),
        type,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: { user: true },
    });
  }

  /** Marks the token used. Returns false if it was already used, so a link works only once. */
  async consume(id: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.repositoryFor(manager).update(
      { id, usedAt: IsNull() },
      { usedAt: new Date() },
    );
    return !!result.affected;
  }

  /** Whether a token of this type was created for the user in the last `seconds`, used or not. */
  async issuedWithin(userId: string, type: AuthTokenType, seconds: number): Promise<boolean> {
    const count = await this.tokens.count({
      where: { userId, type, createdAt: MoreThan(new Date(Date.now() - seconds * 1000)) },
    });
    return count > 0;
  }

  buildUrl(type: AuthTokenType, rawToken: string): string {
    const baseUrl = this.config.get('publicBaseUrl', { infer: true });
    return `${baseUrl}${API_BASE_PATH}/${ROUTES.account.controller}/${type}?token=${encodeURIComponent(rawToken)}`;
  }

  private repositoryFor(manager?: EntityManager): Repository<AuthToken> {
    return manager ? manager.getRepository(AuthToken) : this.tokens;
  }
}
