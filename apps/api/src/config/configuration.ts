import { join } from 'path';
import { EnvVars, validateEnv } from './env.validation';

/** The single .env lives at the repo root, shared by all apps. */
export const ENV_FILE_PATH = join(__dirname, '..', '..', '..', '..', '.env');

export interface AppConfig {
  nodeEnv: EnvVars['NODE_ENV'];
  port: number;
  adminCorsOrigin: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
}

/** Maps validated env values to the typed config read through ConfigService. */
export function buildConfig(env: EnvVars): AppConfig {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.API_PORT,
    adminCorsOrigin: env.ADMIN_CORS_ORIGIN,
    database: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      name: env.DB_NAME,
    },
  };
}

/** ConfigModule loader: validates process.env (after .env is loaded) and builds the config. */
export function loadConfig(): AppConfig {
  return buildConfig(validateEnv(process.env));
}
