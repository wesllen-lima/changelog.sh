import { config } from '../config'

type Level = 'debug' | 'info' | 'warn' | 'error'

const levels: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const activeLevel: Level = config.NODE_ENV === 'production' ? 'info' : 'debug'

function log(level: Level, message: string, meta?: Record<string, unknown>): void {
  if (levels[level] < levels[activeLevel]) return

  if (config.NODE_ENV === 'production') {
    process.stdout.write(
      JSON.stringify({ level, message, ...meta, ts: new Date().toISOString() }) + '\n',
    )
    return
  }

  const prefix = `[${level.toUpperCase()}]`
  const line = meta ? `${prefix} ${message} ${JSON.stringify(meta)}` : `${prefix} ${message}`

  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.info(line)
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
}
