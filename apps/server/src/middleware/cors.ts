import { cors } from 'hono/cors'
import { config } from '../config'

export const corsMiddleware = cors({
  origin: config.NODE_ENV === 'production' ? (config.ALLOWED_ORIGIN ?? '') : '*',
  credentials: true,
})
