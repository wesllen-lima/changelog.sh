import { describe, expect, test, beforeEach } from 'bun:test'
import { createTestDb, type TestDb } from '../test-utils'
import {
  createEntry,
  deleteEntry,
  getEntries,
  getEntry,
  publishEntry,
  unpublishEntry,
  updateEntry,
} from './entries'

let db: TestDb

const PROJECT_ID = 'project_123'

beforeEach(() => {
  db = createTestDb()
})

describe('createEntry', () => {
  test('creates and returns an entry', () => {
    const entry = createEntry(db, { projectId: PROJECT_ID, title: 'Hello' })

    expect(entry.id).toHaveLength(21)
    expect(entry.title).toBe('Hello')
    expect(entry.projectId).toBe(PROJECT_ID)
    expect(entry.body).toBe('')
    expect(entry.tags).toEqual([])
    expect(entry.publishedAt).toBeNull()
    expect(entry.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('serializes tags to JSON', () => {
    const entry = createEntry(db, { projectId: PROJECT_ID, title: 'T', tags: ['a', 'b'] })
    expect(entry.tags).toEqual(['a', 'b'])
  })
})

describe('getEntries', () => {
  test('returns all entries for a project', async () => {
    createEntry(db, { projectId: PROJECT_ID, title: 'A' })
    createEntry(db, { projectId: PROJECT_ID, title: 'B' })
    createEntry(db, { projectId: 'other', title: 'C' })

    const { items, total } = await getEntries(db, PROJECT_ID)
    expect(items).toHaveLength(2)
    expect(total).toBe(2)
  })

  test('filters to published only', async () => {
    const e1 = createEntry(db, { projectId: PROJECT_ID, title: 'Draft' })
    const e2 = createEntry(db, { projectId: PROJECT_ID, title: 'Published' })
    publishEntry(db, e2.id)

    const { items } = await getEntries(db, PROJECT_ID, { publishedOnly: true })
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(e2.id)

    void e1
  })

  test('respects limit', async () => {
    createEntry(db, { projectId: PROJECT_ID, title: 'A' })
    createEntry(db, { projectId: PROJECT_ID, title: 'B' })
    createEntry(db, { projectId: PROJECT_ID, title: 'C' })

    const { items, total } = await getEntries(db, PROJECT_ID, { limit: 2 })
    expect(items).toHaveLength(2)
    expect(total).toBe(3)
  })

  test('orders by createdAt descending', async () => {
    createEntry(db, { projectId: PROJECT_ID, title: 'First' })
    await new Promise((r) => setTimeout(r, 2))
    createEntry(db, { projectId: PROJECT_ID, title: 'Second' })

    const { items } = await getEntries(db, PROJECT_ID)
    expect(items[0].title).toBe('Second')
  })
})

describe('getEntry', () => {
  test('returns entry by id', async () => {
    const entry = createEntry(db, { projectId: PROJECT_ID, title: 'Hello' })
    const found = await getEntry(db, entry.id)

    expect(found?.id).toBe(entry.id)
  })

  test('returns null for unknown id', async () => {
    const found = await getEntry(db, 'unknown_id')
    expect(found).toBeNull()
  })
})

describe('updateEntry', () => {
  test('updates specified fields', async () => {
    const entry = createEntry(db, { projectId: PROJECT_ID, title: 'Old' })
    updateEntry(db, entry.id, { title: 'New', body: 'Content', tags: ['feat'] })

    const found = await getEntry(db, entry.id)
    expect(found?.title).toBe('New')
    expect(found?.body).toBe('Content')
    expect(found?.tags).toEqual(['feat'])
  })

  test('updates updatedAt', async () => {
    const entry = createEntry(db, { projectId: PROJECT_ID, title: 'T' })
    const before = entry.updatedAt

    await new Promise((r) => setTimeout(r, 5))
    updateEntry(db, entry.id, { title: 'New' })

    const found = await getEntry(db, entry.id)
    expect(found?.updatedAt).not.toBe(before)
  })
})

describe('deleteEntry', () => {
  test('removes the entry', async () => {
    const entry = createEntry(db, { projectId: PROJECT_ID, title: 'Gone' })
    deleteEntry(db, entry.id)

    const found = await getEntry(db, entry.id)
    expect(found).toBeNull()
  })
})

describe('publishEntry / unpublishEntry', () => {
  test('sets and clears publishedAt', async () => {
    const entry = createEntry(db, { projectId: PROJECT_ID, title: 'T' })
    expect(entry.publishedAt).toBeNull()

    publishEntry(db, entry.id)
    const published = await getEntry(db, entry.id)
    expect(published?.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    unpublishEntry(db, entry.id)
    const unpublished = await getEntry(db, entry.id)
    expect(unpublished?.publishedAt).toBeNull()
  })
})
