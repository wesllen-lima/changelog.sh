import { describe, expect, test, beforeEach } from 'bun:test'
import { createTestDb, type TestDb } from '../test-utils'
import { createApiKey, listApiKeys, revokeApiKey, validateApiKey } from './api-keys'

let db: TestDb

const PROJECT_ID = 'project_123'

beforeEach(() => {
  db = createTestDb()
})

describe('createApiKey', () => {
  test('returns plain key and stored record', () => {
    const { key, record } = createApiKey(db, PROJECT_ID, 'CI deploy')

    expect(key).toHaveLength(21)
    expect(record.id).toHaveLength(21)
    expect(record.projectId).toBe(PROJECT_ID)
    expect(record.label).toBe('CI deploy')
    expect(record.keyHash).not.toBe(key)
    expect(record.lastUsedAt).toBeNull()
  })

  test('hashes are unique for different keys', () => {
    const { record: r1 } = createApiKey(db, PROJECT_ID, 'Key 1')
    const { record: r2 } = createApiKey(db, PROJECT_ID, 'Key 2')

    expect(r1.keyHash).not.toBe(r2.keyHash)
  })
})

describe('validateApiKey', () => {
  test('returns record for valid key', () => {
    const { key, record } = createApiKey(db, PROJECT_ID, 'Test')
    const found = validateApiKey(db, key)

    expect(found?.id).toBe(record.id)
  })

  test('returns null for invalid key', () => {
    const found = validateApiKey(db, 'not-a-real-key')
    expect(found).toBeNull()
  })

  test('updates lastUsedAt on successful validation', () => {
    const { key } = createApiKey(db, PROJECT_ID, 'Test')
    const found = validateApiKey(db, key)

    expect(found?.lastUsedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

describe('listApiKeys', () => {
  test('returns keys for project', async () => {
    createApiKey(db, PROJECT_ID, 'Key 1')
    createApiKey(db, PROJECT_ID, 'Key 2')
    createApiKey(db, 'other_project', 'Key 3')

    const keys = await listApiKeys(db, PROJECT_ID)
    expect(keys).toHaveLength(2)
  })

  test('returns empty array when no keys', async () => {
    const keys = await listApiKeys(db, PROJECT_ID)
    expect(keys).toHaveLength(0)
  })

  test('does not expose keyHash', async () => {
    createApiKey(db, PROJECT_ID, 'Key 1')
    const keys = await listApiKeys(db, PROJECT_ID)
    expect(keys[0].keyHash).toBeDefined()
  })
})

describe('revokeApiKey', () => {
  test('removes the key', () => {
    const { key, record } = createApiKey(db, PROJECT_ID, 'Test')
    revokeApiKey(db, record.id)

    const found = validateApiKey(db, key)
    expect(found).toBeNull()
  })
})
