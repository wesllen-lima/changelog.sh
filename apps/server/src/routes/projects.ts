import { Hono } from 'hono'
import { z } from 'zod'
import { requireSession, type SessionVariables } from '../middleware/auth'
import {
  listProjects,
  createProjectForUser,
  updateProjectForUser,
  deleteProjectForUser,
} from '../services/projects'

const customTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
})

const createSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(60).optional(),
  description: z.string().max(500).optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  customTags: z.array(customTagSchema).optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(60).optional(),
  description: z.string().max(500).nullable().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  customTags: z.array(customTagSchema).optional(),
})

const projectRoutes = new Hono<{ Variables: SessionVariables }>()

projectRoutes.use('/*', requireSession)

projectRoutes.get('/', async (c) => {
  const result = await listProjects(c.get('userId'))
  if (!result.ok) return c.json({ error: result.error }, result.status as 500)
  return c.json(result.data)
})

projectRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.format() }, 422)

  const result = await createProjectForUser(c.get('userId'), parsed.data)
  if (!result.ok) return c.json({ error: result.error }, result.status as 409 | 422)
  return c.json(result.data, 201)
})

projectRoutes.patch('/:id', async (c) => {
  const body = await c.req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.format() }, 422)

  const result = await updateProjectForUser(c.get('userId'), c.req.param('id'), parsed.data)
  if (!result.ok) return c.json({ error: result.error }, result.status as 404 | 409 | 422)
  return c.json(result.data)
})

projectRoutes.delete('/:id', async (c) => {
  const result = await deleteProjectForUser(c.get('userId'), c.req.param('id'))
  if (!result.ok) return c.json({ error: result.error }, result.status as 404)
  return c.body(null, 204)
})

export default projectRoutes
