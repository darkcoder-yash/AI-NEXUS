import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  WS_PORT: z.string().default('4001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'staging', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // APIs
  GEMINI_API_KEY: z.string().min(1),
  OPENROUTER_API_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Rate Limiting
  MAX_REQUESTS_PER_WINDOW: z.string().default('100').transform(Number),
  WINDOW_SIZE_MS: z.string().default('900000').transform(Number), // 15 mins

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const config = parsed.data;
