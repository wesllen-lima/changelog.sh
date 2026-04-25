import { and, count, desc, eq, isNotNull, like } from 'drizzle-orm'
import { newId } from '../../lib/id'
import { entries } from '../schema'
import type { DrizzleDb } from '../index'

type EntryRow = typeof entries.$inferSelect

export type Entry = Omit<EntryRow, 'tags'> & { tags: string[] }

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

function toEntry(row: EntryRow): Entry {
  let tags: string[] = []
  try {
    const parsed = JSON.parse(row.tags)
    if (Array.isArray(parsed)) tags = parsed
  } catch {
    tags = []
  }
  return { ...row, tags }
}

export type PaginatedEntries = { items: Entry[]; total: number }

export async function getEntries(
  db: DrizzleDb,
  projectId: string,
  opts: { limit?: number; offset?: number; publishedOnly?: boolean; q?: string } = {},
): Promise<PaginatedEntries> {
  const { limit = 100, offset = 0, publishedOnly = false, q } = opts

  const statusWhere = publishedOnly
    ? and(eq(entries.projectId, projectId), isNotNull(entries.publishedAt))
    : eq(entries.projectId, projectId)

  const where = q ? and(statusWhere, like(entries.title, `%${q}%`)) : statusWhere

  const [countRow] = await db.select({ total: count() }).from(entries).where(where)
  const total = countRow?.total ?? 0

  const rows = await db
    .select()
    .from(entries)
    .where(where)
    .orderBy(desc(entries.createdAt))
    .limit(limit)
    .offset(offset)

  return { items: rows.map(toEntry), total }
}

export async function getEntry(db: DrizzleDb, id: string): Promise<Entry | null> {
  const row = await db
    .select()
    .from(entries)
    .where(eq(entries.id, id))
    .limit(1)
    .then((r) => r[0] ?? null)
  return row ? toEntry(row) : null
}

export function createEntry(db: DrizzleDb, data: NewEntry): Entry {
  const now = new Date().toISOString()
  const row: EntryRow = {
    id: newId(),
    projectId: data.projectId,
    title: data.title,
    body: data.body ?? '',
    tags: JSON.stringify(data.tags ?? []),
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  }
  db.insert(entries).values(row).run()
  return toEntry(row)
}

export function updateEntry(db: DrizzleDb, id: string, data: EntryUpdate): void {
  const set: Partial<EntryRow> = { updatedAt: new Date().toISOString() }
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

export function duplicateEntry(db: DrizzleDb, source: Entry): Entry {
  const now = new Date().toISOString()
  const row: EntryRow = {
    id: newId(),
    projectId: source.projectId,
    title: `${source.title} (copy)`,
    body: source.body,
    tags: JSON.stringify(source.tags),
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  }
  db.insert(entries).values(row).run()
  return toEntry(row)
}
