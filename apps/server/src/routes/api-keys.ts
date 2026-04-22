import { Hono } from 'hono'
import { z } from 'zod'
import { requireSession, type SessionVariables } from '../middleware/auth'
import { listKeysForProject, createKeyForProject, revokeKeyForUser } from '../services/api-keys'

const createSchema = z.object({
  label: z.string().min(1).max(100),
})

const apiKeyRoutes = new Hono<{ Variables: SessionVariables }>()

apiKeyRoutes.use('/*', requireSession)

apiKeyRoutes.get('/projects/:slug/keys', async (c) => {
  const result = await listKeysForProject(c.get('userId'), c.req.param('slug'))
  if (!result.ok) return c.json({ error: result.error }, result.status as 404)
  return c.json(result.data)
})

apiKeyRoutes.post('/projects/:slug/keys', async (c) => {
  const body = await c.req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.format() }, 422)

  const result = await createKeyForProject(c.get('userId'), c.req.param('slug'), parsed.data.label)
  if (!result.ok) return c.json({ error: result.error }, result.status as 404)
  return c.json(result.data, 201)
})

apiKeyRoutes.delete('/keys/:id', async (c) => {
  const result = await revokeKeyForUser(c.get('userId'), c.req.param('id'))
  if (!result.ok) return c.json({ error: result.error }, result.status as 404)
  return c.body(null, 204)
})

export default apiKeyRoutes
