import dotenv from 'dotenv';
import { z } from 'zod';
import { existsSync } from 'fs';

const envFile = process.env.NODE_ENV === 'production'
  ? '.production.env'
  : process.env.NODE_ENV === 'test'
    ? '.test.env'
    : '.development.env';

if (existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config();
}

const envSchema = z.object({
  PORT: z.string().default('8888').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('3306').transform(Number),
  DB_USERNAME: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_DATABASE: z.string().default('bear_spark'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:', parseResult.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parseResult.data;

export const isDev = config.NODE_ENV === 'development';
export const isProd = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';
