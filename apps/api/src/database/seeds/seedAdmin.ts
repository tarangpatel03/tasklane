import { Logger } from '@nestjs/common';
import { Role, UserStatus } from '@task-app/shared';
import * as argon2 from 'argon2';
import { loadSeedEnv } from '../../config/env.validation';
import { User } from '../../modules/users/entities/user.entity';
import dataSource from '../dataSource';

const logger = new Logger('SeedAdmin');

/** Creates the first Admin from SEED_ADMIN_* env values. Does nothing if an Admin already exists. */
async function seedAdmin(): Promise<void> {
  const env = loadSeedEnv();
  await dataSource.initialize();
  try {
    const users = dataSource.getRepository(User);
    if (await users.existsBy({ role: Role.ADMIN })) {
      logger.log('An Admin already exists, nothing to do.');
      return;
    }
    await users.insert({
      name: 'Admin',
      email: env.SEED_ADMIN_EMAIL.toLowerCase(),
      passwordHash: await argon2.hash(env.SEED_ADMIN_PASSWORD),
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    });
    logger.log(`Admin created: ${env.SEED_ADMIN_EMAIL.toLowerCase()}`);
  } finally {
    await dataSource.destroy();
  }
}

seedAdmin().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : 'Seed failed');
  process.exitCode = 1;
});
