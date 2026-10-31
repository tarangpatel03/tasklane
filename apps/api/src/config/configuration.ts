import { join } from 'path';
import { EnvVars, validateEnv } from './env.validation';

/** The single .env lives at the repo root, shared by all apps. */
export const ENV_FILE_PATH = join(__dirname, '..', '..', '..', '..', '.env');

export interface AppConfig {
  nodeEnv: EnvVars['NODE_ENV'];
  port: number;
  adminCorsOrigin: string;
  /** Host that email links point to, without a trailing slash. */
  publicBaseUrl: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  auth: {
    accessSecret: string;
    accessTtl: string;
    refreshTtlDays: number;
  };
  mail: {
    host?: string;
    port: number;
    user?: string;
    pass?: string;
    from?: string;
  };
}

/** Maps validated env values to the typed config read through ConfigService. */
export function buildConfig(env: EnvVars): AppConfig {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.API_PORT,
    adminCorsOrigin: env.ADMIN_CORS_ORIGIN,
    publicBaseUrl: (env.PUBLIC_BASE_URL ?? `http://localhost:${env.API_PORT}`).replace(/\/+$/, ''),
    database: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      name: env.DB_NAME,
    },
    auth: {
      accessSecret: env.JWT_ACCESS_SECRET,
      accessTtl: env.JWT_ACCESS_TTL,
      refreshTtlDays: env.REFRESH_TTL_DAYS,
    },
    mail: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      from: env.MAIL_FROM,
    },
  };
}

/** ConfigModule loader: validates process.env (after .env is loaded) and builds the config. */
export function loadConfig(): AppConfig {
  return buildConfig(validateEnv(process.env));
}
