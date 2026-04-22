import { Hono } from 'hono'
import { auth } from '../auth'

const authRoutes = new Hono()

authRoutes.get('/me', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  return c.json({ user: session.user })
})

authRoutes.on(['GET', 'POST'], '/**', (c) => {
  const url = new URL(c.req.raw.url)
  url.pathname = `/api/auth${url.pathname.replace(/^\/auth/, '')}`
  return auth.handler(new Request(url.toString(), c.req.raw))
})

export default authRoutes
