import { Hono } from 'hono'
import { z } from 'zod'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import {
  listEntries,
  createEntryForProject,
  updateEntryForCaller,
  deleteEntryForCaller,
  publishEntryForCaller,
  unpublishEntryForCaller,
} from '../services/entries'

const createSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  body: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const entryRoutes = new Hono<{ Variables: AuthVariables }>()

entryRoutes.get('/projects/:slug/entries', requireAuth, async (c) => {
  const publishedOnly = c.req.query('published') === 'true'
  const result = await listEntries(c.req.param('slug'), { publishedOnly })
  if (!result.ok) return c.json({ error: result.error }, result.status as 404)
  return c.json(result.data)
})

entryRoutes.post('/projects/:slug/entries', requireAuth, async (c) => {
  const body = await c.req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.format() }, 422)

  const result = await createEntryForProject(
    c.req.param('slug'),
    c.get('userId') ?? null,
    c.get('apiKeyProjectId') ?? null,
    parsed.data,
  )
  if (!result.ok) return c.json({ error: result.error }, result.status as 404 | 403)
  return c.json(result.data, 201)
})

entryRoutes.patch('/entries/:id', requireAuth, async (c) => {
  const body = await c.req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.format() }, 422)

  const result = await updateEntryForCaller(
    c.req.param('id'),
    c.get('userId') ?? null,
    c.get('apiKeyProjectId') ?? null,
    parsed.data,
  )
  if (!result.ok) return c.json({ error: result.error }, result.status as 404 | 403)
  return c.json(result.data)
})

entryRoutes.delete('/entries/:id', requireAuth, async (c) => {
  const result = await deleteEntryForCaller(
    c.req.param('id'),
    c.get('userId') ?? null,
    c.get('apiKeyProjectId') ?? null,
  )
  if (!result.ok) return c.json({ error: result.error }, result.status as 404 | 403)
  return c.body(null, 204)
})

entryRoutes.post('/entries/:id/publish', requireAuth, async (c) => {
  const result = await publishEntryForCaller(
    c.req.param('id'),
    c.get('userId') ?? null,
    c.get('apiKeyProjectId') ?? null,
  )
  if (!result.ok) return c.json({ error: result.error }, result.status as 404 | 403)
  return c.json(result.data)
})

entryRoutes.post('/entries/:id/unpublish', requireAuth, async (c) => {
  const result = await unpublishEntryForCaller(
    c.req.param('id'),
    c.get('userId') ?? null,
    c.get('apiKeyProjectId') ?? null,
  )
  if (!result.ok) return c.json({ error: result.error }, result.status as 404 | 403)
  return c.json(result.data)
})

export default entryRoutes
