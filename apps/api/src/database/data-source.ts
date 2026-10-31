import { DataSource } from 'typeorm';
import { ENV_FILE_PATH, buildConfig } from '../config/configuration';
import { validateEnv } from '../config/env.validation';
import { buildDatabaseOptions } from './database.options';

// The CLI runs outside Nest, so it loads the root .env itself (built into Node, no extra package).
process.loadEnvFile(ENV_FILE_PATH);

/** Entry point for the TypeORM CLI (`yarn workspace @task-app/api typeorm ...`). */
export default new DataSource({
  ...buildDatabaseOptions(buildConfig(validateEnv(process.env)).database),
  entities: [`${__dirname}/../modules/**/entities/*.entity.{ts,js}`],
});
