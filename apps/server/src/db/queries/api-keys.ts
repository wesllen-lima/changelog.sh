import { createHash } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { newId } from '../../lib/id'
import { apiKeys } from '../schema'
import type { DrizzleDb } from '../index'

export type ApiKey = typeof apiKeys.$inferSelect

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export function createApiKey(
  db: DrizzleDb,
  projectId: string,
  label: string,
): { key: string; record: ApiKey } {
  const key = newId()
  const record: ApiKey = {
    id: newId(),
    projectId,
    keyHash: hashKey(key),
    label,
    lastUsedAt: null,
    createdAt: new Date().toISOString(),
  }
  db.insert(apiKeys).values(record).run()
  return { key, record }
}

export function validateApiKey(db: DrizzleDb, key: string): ApiKey | null {
  const rows = db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, hashKey(key)))
    .limit(1)
    .all()
  if (rows.length === 0) return null

  const lastUsedAt = new Date().toISOString()
  db.update(apiKeys).set({ lastUsedAt }).where(eq(apiKeys.id, rows[0].id)).run()

  return { ...rows[0], lastUsedAt }
}

export async function listApiKeys(db: DrizzleDb, projectId: string): Promise<ApiKey[]> {
  return db.select().from(apiKeys).where(eq(apiKeys.projectId, projectId))
}

export function revokeApiKey(db: DrizzleDb, id: string): void {
  db.delete(apiKeys).where(eq(apiKeys.id, id)).run()
}
