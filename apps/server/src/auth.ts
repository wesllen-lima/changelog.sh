import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import { config } from './config'
import { users, sessions, accounts, verifications } from './db/schema'

export const auth = betterAuth({
  secret: config.BETTER_AUTH_SECRET,
  baseURL: `http://localhost:${config.PORT}`,
  trustedOrigins: ['http://localhost:5173'],
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
