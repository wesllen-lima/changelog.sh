import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3456),
  DB_PATH: z.string().default('./data/changelog.db'),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  ADMIN_EMAIL: z.email(),
  DATABASE_URL: z.string().optional(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  ALLOWED_ORIGIN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')
  throw new Error(`Invalid environment variables:\n${issues}`)
}

export const config = parsed.data
