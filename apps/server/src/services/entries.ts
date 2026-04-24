import { db } from '../db'
import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  publishEntry,
  unpublishEntry,
  duplicateEntry,
  type Entry,
  type NewEntry,
  type EntryUpdate,
} from '../db/queries/entries'
import { getProjectsByOwner } from '../db/queries/projects'
import { getProject } from '../db/queries/projects'
import { ok, err, type Result } from '../lib/result'

export async function listEntries(
  projectSlug: string,
  opts: { publishedOnly?: boolean; limit?: number } = {},
): Promise<Result<Entry[]>> {
  const project = await getProject(db, projectSlug)
  if (!project) return err('Project not found', 404)
  const data = await getEntries(db, project.id, opts)
  return ok(data)
}

export async function getEntryById(id: string): Promise<Result<Entry>> {
  const entry = await getEntry(db, id)
  if (!entry) return err('Entry not found', 404)
  return ok(entry)
}

export async function createEntryForProject(
  projectSlug: string,
  callerId: string | null,
  callerProjectId: string | null,
  data: Omit<NewEntry, 'projectId'>,
): Promise<Result<Entry>> {
  const project = await getProject(db, projectSlug)
  if (!project) return err('Project not found', 404)

  if (!(await canWriteProject(project.id, callerId, callerProjectId))) {
    return err('Forbidden', 403)
  }

  const entry = createEntry(db, { ...data, projectId: project.id })
  return ok(entry)
}

export async function updateEntryForCaller(
  id: string,
  callerId: string | null,
  callerProjectId: string | null,
  data: EntryUpdate,
): Promise<Result<Entry>> {
  const entry = await getEntry(db, id)
  if (!entry) return err('Entry not found', 404)

  if (!(await canWriteProject(entry.projectId, callerId, callerProjectId))) {
    return err('Forbidden', 403)
  }

  updateEntry(db, id, data)
  const updated = await getEntry(db, id)
  if (!updated) return err('Entry not found', 404)
  return ok(updated)
}

export async function deleteEntryForCaller(
  id: string,
  callerId: string | null,
  callerProjectId: string | null,
): Promise<Result<void>> {
  const entry = await getEntry(db, id)
  if (!entry) return err('Entry not found', 404)

  if (!(await canWriteProject(entry.projectId, callerId, callerProjectId))) {
    return err('Forbidden', 403)
  }

  deleteEntry(db, id)
  return ok(undefined)
}

export async function publishEntryForCaller(
  id: string,
  callerId: string | null,
  callerProjectId: string | null,
): Promise<Result<Entry>> {
  const entry = await getEntry(db, id)
  if (!entry) return err('Entry not found', 404)

  if (!(await canWriteProject(entry.projectId, callerId, callerProjectId))) {
    return err('Forbidden', 403)
  }

  publishEntry(db, id)
  const updated = await getEntry(db, id)
  if (!updated) return err('Entry not found', 404)
  return ok(updated)
}

export async function unpublishEntryForCaller(
  id: string,
  callerId: string | null,
  callerProjectId: string | null,
): Promise<Result<Entry>> {
  const entry = await getEntry(db, id)
  if (!entry) return err('Entry not found', 404)

  if (!(await canWriteProject(entry.projectId, callerId, callerProjectId))) {
    return err('Forbidden', 403)
  }

  unpublishEntry(db, id)
  const updated = await getEntry(db, id)
  if (!updated) return err('Entry not found', 404)
  return ok(updated)
}

export async function duplicateEntryForCaller(
  id: string,
  callerId: string | null,
  callerProjectId: string | null,
): Promise<Result<Entry>> {
  const entry = await getEntry(db, id)
  if (!entry) return err('Entry not found', 404)

  if (!(await canWriteProject(entry.projectId, callerId, callerProjectId))) {
    return err('Forbidden', 403)
  }

  const copy = duplicateEntry(db, entry)
  return ok(copy)
}

async function canWriteProject(
  projectId: string,
  userId: string | null,
  apiKeyProjectId: string | null,
): Promise<boolean> {
  if (apiKeyProjectId !== null) return apiKeyProjectId === projectId
  if (userId !== null) {
    const owned = await getProjectsByOwner(db, userId)
    return owned.some((p) => p.id === projectId)
  }
  return false
}
