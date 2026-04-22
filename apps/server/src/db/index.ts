import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { config } from '../config'
import * as schema from './schema'

if (config.DATABASE_URL) {
  throw new Error('Cloud database mode (DATABASE_URL) is not enabled in this build. See Sprint 7.')
}

mkdirSync(dirname(config.DB_PATH), { recursive: true })

const sqlite = new Database(config.DB_PATH)
sqlite.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')

export const db = drizzle(sqlite, { schema })
export type DrizzleDb = typeof db
