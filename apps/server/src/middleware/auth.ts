import type { Context, MiddlewareHandler } from 'hono'
import { auth } from '../auth'
import { validateApiKey } from '../db/queries/api-keys'
import { db } from '../db'
import type { User } from '../auth'

export type AuthVariables = {
  userId?: string
  apiKeyProjectId?: string
}

export type SessionVariables = {
  userId: string
  apiKeyProjectId?: string
}

async function resolveSession(c: Context): Promise<User | null> {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  return session?.user ?? null
}

function resolveApiKey(c: Context): string | null {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) return null
  const key = header.slice(7)
  const record = validateApiKey(db, key)
  return record?.projectId ?? null
}

export const requireSession: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const user = await resolveSession(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  c.set('userId', user.id)
  await next()
}

export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const user = await resolveSession(c)
  if (user) {
    c.set('userId', user.id)
    return await next()
  }

  const projectId = resolveApiKey(c)
  if (projectId) {
    c.set('apiKeyProjectId', projectId)
    return await next()
  }

  return c.json({ error: 'Unauthorized' }, 401)
}
