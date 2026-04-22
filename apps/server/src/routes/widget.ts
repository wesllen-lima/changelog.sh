import { Hono } from 'hono'
import { listEntries } from '../services/entries'

const widgetRoutes = new Hono()

widgetRoutes.get('/:slug/entries', async (c) => {
  const result = await listEntries(c.req.param('slug'), { publishedOnly: true, limit: 10 })
  if (!result.ok) return c.json({ error: result.error }, result.status as 404)

  const entries = result.data.map((e) => ({
    id: e.id,
    title: e.title,
    body: e.body,
    tags: JSON.parse(e.tags) as string[],
    publishedAt: e.publishedAt,
  }))

  return c.json(entries)
})

export default widgetRoutes
