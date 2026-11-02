import * as Joi from 'joi';

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface EnvVars {
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL?: LogLevel;
  API_PORT: number;
  ADMIN_CORS_ORIGIN: string;
  PUBLIC_BASE_URL?: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_TTL: string;
  REFRESH_TTL_DAYS: number;
  SMTP_HOST?: string;
  SMTP_PORT: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  MAIL_FROM?: string;
}

const envSchema = Joi.object<EnvVars>({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  // Empty counts as unset: the default depends on NODE_ENV and is applied in `buildConfig`.
  LOG_LEVEL: Joi.string()
    .valid(...LOG_LEVELS)
    .empty(''),
  API_PORT: Joi.number().port().default(3000),
  ADMIN_CORS_ORIGIN: Joi.string().uri().required(),
  PUBLIC_BASE_URL: Joi.string().uri().empty(''),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  REFRESH_TTL_DAYS: Joi.number().integer().min(1).default(7),
  // Mail is optional: an empty SMTP_HOST falls back to an Ethereal test account. Empty values count as unset.
  SMTP_HOST: Joi.string().empty(''),
  SMTP_PORT: Joi.number().port().empty('').default(587),
  SMTP_USER: Joi.string().empty(''),
  SMTP_PASS: Joi.string().empty(''),
  MAIL_FROM: Joi.string().empty(''),
})
  .and('SMTP_USER', 'SMTP_PASS')
  .unknown(true);

/**
 * Validates raw env values and applies defaults. Throws a readable error so the app
 * fails at startup instead of on the first request.
 */
export function validateEnv(raw: Record<string, unknown>): EnvVars {
  const { error, value } = envSchema.validate(raw, { abortEarly: false });
  if (error) {
    throw new Error(`Invalid environment: ${error.message}`);
  }
  return value as EnvVars; // Joi validated the shape above
}

export interface SeedEnvVars {
  SEED_ADMIN_EMAIL: string;
  SEED_ADMIN_PASSWORD: string;
}

const seedEnvSchema = Joi.object<SeedEnvVars>({
  SEED_ADMIN_EMAIL: Joi.string().email().required(),
  SEED_ADMIN_PASSWORD: Joi.string().min(8).required(),
}).unknown(true);

/** Separate from the API schema: only the seed script needs these, the running API does not. */
export function validateSeedEnv(raw: Record<string, unknown>): SeedEnvVars {
  const { error, value } = seedEnvSchema.validate(raw, { abortEarly: false });
  if (error) {
    throw new Error(`Invalid seed environment: ${error.message}`);
  }
  return value as SeedEnvVars; // Joi validated the shape above
}

/** Reads and validates the seed variables from the process environment. */
export function loadSeedEnv(): SeedEnvVars {
  return validateSeedEnv(process.env);
}
