import { db } from '../db'
import { createApiKey, listApiKeys, revokeApiKey, type ApiKey } from '../db/queries/api-keys'
import { getProject, getProjectsByOwner } from '../db/queries/projects'
import { ok, err, type Result } from '../lib/result'

export async function listKeysForProject(
  userId: string,
  projectSlug: string,
): Promise<Result<Omit<ApiKey, 'keyHash'>[]>> {
  const project = await getProject(db, projectSlug)
  if (!project) return err('Project not found', 404)
  if (project.ownerId !== userId) return err('Project not found', 404)

  const keys = await listApiKeys(db, project.id)
  return ok(keys.map(({ keyHash: _keyHash, ...rest }) => rest))
}

export async function createKeyForProject(
  userId: string,
  projectSlug: string,
  label: string,
): Promise<Result<{ key: string; record: Omit<ApiKey, 'keyHash'> }>> {
  const project = await getProject(db, projectSlug)
  if (!project) return err('Project not found', 404)
  if (project.ownerId !== userId) return err('Project not found', 404)

  const { key, record } = createApiKey(db, project.id, label)
  const { keyHash: _keyHash, ...rest } = record
  return ok({ key, record: rest })
}

export async function revokeKeyForUser(userId: string, keyId: string): Promise<Result<void>> {
  const owned = await getProjectsByOwner(db, userId)
  const ownerProjectIds = new Set(owned.map((p) => p.id))

  const keys = await Promise.all(owned.map((p) => listApiKeys(db, p.id)))
  const allKeys = keys.flat()
  const target = allKeys.find((k) => k.id === keyId && ownerProjectIds.has(k.projectId))

  if (!target) return err('API key not found', 404)

  revokeApiKey(db, keyId)
  return ok(undefined)
}
