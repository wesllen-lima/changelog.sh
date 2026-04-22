import { eq } from 'drizzle-orm'
import { newId } from '../../lib/id'
import { projects } from '../schema'
import type { DrizzleDb } from '../index'

export type Project = typeof projects.$inferSelect
export type NewProject = {
  name: string
  slug: string
  description?: string
  accentColor?: string
  ownerId: string
}
export type ProjectUpdate = {
  name?: string
  description?: string
  accentColor?: string
}

export function getProject(db: DrizzleDb, slug: string): Promise<Project | null> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1)
    .then((r) => r[0] ?? null)
}

export async function getProjectsByOwner(db: DrizzleDb, userId: string): Promise<Project[]> {
  return db.select().from(projects).where(eq(projects.ownerId, userId))
}

export function createProject(db: DrizzleDb, data: NewProject): Project {
  const project: Project = {
    id: newId(),
    name: data.name,
    slug: data.slug,
    description: data.description ?? null,
    accentColor: data.accentColor ?? '#6366f1',
    ownerId: data.ownerId,
    createdAt: new Date().toISOString(),
  }
  db.insert(projects).values(project).run()
  return project
}

export function updateProject(db: DrizzleDb, id: string, data: ProjectUpdate): void {
  const set: Partial<Project> = {}
  if (data.name !== undefined) set.name = data.name
  if (data.description !== undefined) set.description = data.description
  if (data.accentColor !== undefined) set.accentColor = data.accentColor
  db.update(projects).set(set).where(eq(projects.id, id)).run()
}

export function deleteProject(db: DrizzleDb, id: string): void {
  db.delete(projects).where(eq(projects.id, id)).run()
}
