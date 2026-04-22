import { Hono } from 'hono'
import { resolve } from 'node:path'

const widgetPath = resolve(import.meta.dir, '../../../../packages/widget/dist/widget.js')

const app = new Hono()

app.get('/widget.js', async (c) => {
  const file = Bun.file(widgetPath)
  if (!(await file.exists())) {
    return c.text('Widget not built. Run: cd packages/widget && bun run build', 404)
  }
  return new Response(file, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
})

export default app
