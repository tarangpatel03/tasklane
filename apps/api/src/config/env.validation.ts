import * as Joi from 'joi';

export interface EnvVars {
  NODE_ENV: 'development' | 'production' | 'test';
  API_PORT: number;
  ADMIN_CORS_ORIGIN: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_TTL: string;
  REFRESH_TTL_DAYS: number;
}

const envSchema = Joi.object<EnvVars>({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  API_PORT: Joi.number().port().default(3000),
  ADMIN_CORS_ORIGIN: Joi.string().uri().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  REFRESH_TTL_DAYS: Joi.number().integer().min(1).default(7),
}).unknown(true);

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
