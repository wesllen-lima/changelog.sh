import { db } from '../db'
import {
  getProject,
  getProjectsByOwner,
  createProject,
  updateProject,
  deleteProject,
  type Project,
  type ProjectUpdate,
} from '../db/queries/projects'
import { ok, err, type Result } from '../lib/result'
import { slugify } from '../lib/slug'

export async function listProjects(userId: string): Promise<Result<Project[]>> {
  const data = await getProjectsByOwner(db, userId)
  return ok(data)
}

export async function getProjectBySlug(slug: string): Promise<Result<Project>> {
  const project = await getProject(db, slug)
  if (!project) return err('Project not found', 404)
  return ok(project)
}

export async function createProjectForUser(
  userId: string,
  data: { name: string; description?: string; accentColor?: string; slug?: string },
): Promise<Result<Project>> {
  const slug = data.slug ? slugify(data.slug) : slugify(data.name)
  if (!slug) return err('Invalid project name', 422)

  const existing = await getProject(db, slug)
  if (existing) return err('Slug already in use', 409)

  const project = createProject(db, {
    name: data.name,
    slug,
    description: data.description,
    accentColor: data.accentColor,
    ownerId: userId,
  })
  return ok(project)
}

export async function updateProjectForUser(
  userId: string,
  id: string,
  data: ProjectUpdate,
): Promise<Result<Project>> {
  const rows = await getProjectsByOwner(db, userId)
  const project = rows.find((p) => p.id === id)
  if (!project) return err('Project not found', 404)
  updateProject(db, id, data)
  return ok({ ...project, ...data })
}

export async function deleteProjectForUser(userId: string, id: string): Promise<Result<void>> {
  const rows = await getProjectsByOwner(db, userId)
  if (!rows.some((p) => p.id === id)) return err('Project not found', 404)
  deleteProject(db, id)
  return ok(undefined)
}
