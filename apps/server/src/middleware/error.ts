import type { ErrorHandler } from 'hono'
import { logger } from '../lib/logger'

export const errorHandler: ErrorHandler = (err, c) => {
  logger.error('Unhandled error', { err: err.message, path: c.req.path })
  return c.json({ error: 'Internal server error' }, 500)
}
