import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { newId } from '../../lib/id'
import { entries } from '../schema'
import type { DrizzleDb } from '../index'

export type Entry = typeof entries.$inferSelect
export type NewEntry = {
  projectId: string
  title: string
  body?: string
  tags?: string[]
}
export type EntryUpdate = {
  title?: string
  body?: string
  tags?: string[]
}

export async function getEntries(
  db: DrizzleDb,
  projectId: string,
  opts: { limit?: number; publishedOnly?: boolean } = {},
): Promise<Entry[]> {
  const where = opts.publishedOnly
    ? and(eq(entries.projectId, projectId), isNotNull(entries.publishedAt))
    : eq(entries.projectId, projectId)

  const q = db.select().from(entries).where(where).orderBy(desc(entries.createdAt))
  return opts.limit ? q.limit(opts.limit) : q
}

export function getEntry(db: DrizzleDb, id: string): Promise<Entry | null> {
  return db
    .select()
    .from(entries)
    .where(eq(entries.id, id))
    .limit(1)
    .then((r) => r[0] ?? null)
}

export function createEntry(db: DrizzleDb, data: NewEntry): Entry {
  const now = new Date().toISOString()
  const entry: Entry = {
    id: newId(),
    projectId: data.projectId,
    title: data.title,
    body: data.body ?? '',
    tags: JSON.stringify(data.tags ?? []),
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  }
  db.insert(entries).values(entry).run()
  return entry
}

export function updateEntry(db: DrizzleDb, id: string, data: EntryUpdate): void {
  const set: Partial<Entry> = { updatedAt: new Date().toISOString() }
  if (data.title !== undefined) set.title = data.title
  if (data.body !== undefined) set.body = data.body
  if (data.tags !== undefined) set.tags = JSON.stringify(data.tags)
  db.update(entries).set(set).where(eq(entries.id, id)).run()
}

export function deleteEntry(db: DrizzleDb, id: string): void {
  db.delete(entries).where(eq(entries.id, id)).run()
}

export function publishEntry(db: DrizzleDb, id: string): void {
  db.update(entries)
    .set({ publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(entries.id, id))
    .run()
}

export function unpublishEntry(db: DrizzleDb, id: string): void {
  db.update(entries)
    .set({ publishedAt: null, updatedAt: new Date().toISOString() })
    .where(eq(entries.id, id))
    .run()
}
