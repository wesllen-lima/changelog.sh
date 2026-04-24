import type { MiddlewareHandler } from 'hono'

type Window = { count: number; resetAt: number }

const store = new Map<string, Window>()

function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function rateLimit(max: number, windowMs: number): MiddlewareHandler {
  return async (c, next) => {
    const key = `${c.req.path}:${getIp(c.req.raw)}`
    const now = Date.now()

    let w = store.get(key)
    if (!w || now > w.resetAt) {
      w = { count: 0, resetAt: now + windowMs }
      store.set(key, w)
    }

    w.count++

    if (w.count > max) {
      const retryAfter = Math.ceil((w.resetAt - now) / 1000)
      return c.json({ error: 'Too many requests' }, 429, {
        'Retry-After': String(retryAfter),
      })
    }

    await next()
  }
}
