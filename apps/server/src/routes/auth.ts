import { Hono } from 'hono'
import { auth } from '../auth'

const authRoutes = new Hono()

authRoutes.get('/me', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  return c.json({ user: session.user })
})

authRoutes.on(['GET', 'POST'], '/**', (c) => auth.handler(c.req.raw))

export default authRoutes
