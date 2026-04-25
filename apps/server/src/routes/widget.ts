import { Hono } from 'hono'
import { listEntries } from '../services/entries'

const widgetRoutes = new Hono()

widgetRoutes.get('/:slug/entries', async (c) => {
  const result = await listEntries(c.req.param('slug'), { publishedOnly: true, limit: 10 })
  if (!result.ok) return c.json({ error: result.error }, result.status as 404)

  const entries = result.data.items.map((e) => ({
    id: e.id,
    title: e.title,
    body: e.body,
    tags: e.tags,
    publishedAt: e.publishedAt,
  }))

  return c.json(entries)
})

export default widgetRoutes
