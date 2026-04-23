import { Hono } from 'hono'
import { resolve, extname } from 'node:path'
import type { Context } from 'hono'

const devWidgetPath = resolve(import.meta.dir, '../../../../packages/widget/dist/widget.js')
const widgetPath = process.env.WIDGET_PATH ?? devWidgetPath
const dashboardDir = process.env.DASHBOARD_DIR ?? null

const MIME: Record<string, string> = {
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

const SPA_PREFIXES = ['/login', '/onboarding', '/entries', '/projects', '/settings', '/auth']

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

if (dashboardDir) {
  const dir = dashboardDir

  const serveAsset = async (c: Context, rel: string): Promise<Response> => {
    const file = Bun.file(resolve(dir, rel))
    if (!(await file.exists())) return c.notFound() as unknown as Response
    const mime = MIME[extname(rel)] ?? 'application/octet-stream'
    return new Response(file, { headers: { 'Content-Type': mime } })
  }

  app.get('/assets/*', (c) => serveAsset(c, c.req.path.slice(1)))
  app.get('/icons.svg', (c) => serveAsset(c, 'icons.svg'))

  const spaIndex = async (c: Context): Promise<Response> => {
    const file = Bun.file(resolve(dir, 'index.html'))
    const html = await file.text()
    return c.html(html) as unknown as Response
  }

  app.get('/', spaIndex)
  for (const prefix of SPA_PREFIXES) {
    app.get(prefix, spaIndex)
    app.get(`${prefix}/*`, spaIndex)
  }
}

export default app
