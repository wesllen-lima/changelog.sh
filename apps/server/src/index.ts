import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { config } from './config'
import { db } from './db'
import { users } from './db/schema'
import { auth } from './auth'
import { errorHandler } from './middleware/error'
import { corsMiddleware } from './middleware/cors'
import projectRoutes from './routes/projects'
import entryRoutes from './routes/entries'
import apiKeyRoutes from './routes/api-keys'
import widgetRoutes from './routes/widget'
import staticRoutes from './routes/static'
import publicRoutes from './routes/public'

async function bootstrap(): Promise<void> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, config.ADMIN_EMAIL))
    .get()

  if (!existing) {
    await auth.api.signUpEmail({
      body: { email: config.ADMIN_EMAIL, password: config.ADMIN_PASSWORD, name: 'Admin' },
    })
  }
}

const app = new Hono()

app.use('/*', corsMiddleware)
app.onError(errorHandler)

// Custom /auth/me — returns session user in our format
app.get('/auth/me', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  return c.json({ user: session.user })
})

// Better Auth handler — all email/password, session, and sign-out routes
app.on(['GET', 'POST'], '/api/auth/**', (c) => auth.handler(c.req.raw))

app.route('/api/projects', projectRoutes)
app.route('/api', entryRoutes)
app.route('/api', apiKeyRoutes)
app.route('/widget', widgetRoutes)
app.route('/', staticRoutes)
app.route('/', publicRoutes)

app.get('/', (c) => c.text('changelog.sh'))

await bootstrap()

export default { port: config.PORT, fetch: app.fetch }
