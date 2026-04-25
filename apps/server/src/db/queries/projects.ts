import { eq } from 'drizzle-orm'
import { newId } from '../../lib/id'
import { projects } from '../schema'
import type { DrizzleDb } from '../index'

type ProjectRow = typeof projects.$inferSelect

export type CustomTag = { name: string; color: string }

export type Project = Omit<ProjectRow, 'customTags'> & { customTags: CustomTag[] }

export type NewProject = {
  name: string
  slug: string
  description?: string
  accentColor?: string
  customTags?: CustomTag[]
  ownerId: string
}
export type ProjectUpdate = {
  name?: string
  slug?: string
  description?: string | null
  accentColor?: string
  customTags?: CustomTag[]
}

function toProject(row: ProjectRow): Project {
  let customTags: CustomTag[] = []
  try {
    const parsed = JSON.parse(row.customTags)
    if (Array.isArray(parsed)) customTags = parsed
  } catch {
    customTags = []
  }
  return { ...row, customTags }
}

export function getProject(db: DrizzleDb, slug: string): Promise<Project | null> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1)
    .then((r) => (r[0] ? toProject(r[0]) : null))
}

export async function getProjectsByOwner(db: DrizzleDb, userId: string): Promise<Project[]> {
  const rows = await db.select().from(projects).where(eq(projects.ownerId, userId))
  return rows.map(toProject)
}

export function createProject(db: DrizzleDb, data: NewProject): Project {
  const row: ProjectRow = {
    id: newId(),
    name: data.name,
    slug: data.slug,
    description: data.description ?? null,
    accentColor: data.accentColor ?? '#6366f1',
    customTags: JSON.stringify(data.customTags ?? []),
    ownerId: data.ownerId,
    createdAt: new Date().toISOString(),
  }
  db.insert(projects).values(row).run()
  return toProject(row)
}

export function updateProject(db: DrizzleDb, id: string, data: ProjectUpdate): void {
  const set: Partial<ProjectRow> = {}
  if (data.name !== undefined) set.name = data.name
  if (data.slug !== undefined) set.slug = data.slug
  if (data.description !== undefined) set.description = data.description
  if (data.accentColor !== undefined) set.accentColor = data.accentColor
  if (data.customTags !== undefined) set.customTags = JSON.stringify(data.customTags)
  db.update(projects).set(set).where(eq(projects.id, id)).run()
}

export function deleteProject(db: DrizzleDb, id: string): void {
  db.delete(projects).where(eq(projects.id, id)).run()
}
