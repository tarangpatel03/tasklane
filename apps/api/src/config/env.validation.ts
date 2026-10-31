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
