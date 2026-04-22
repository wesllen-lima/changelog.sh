import { createTestDb, type TestDb } from '../db/test-utils'
import { createProject } from '../db/queries/projects'
import type { Project } from '../db/queries/projects'
import { newId } from '../lib/id'

export function makeTestDb(): TestDb {
  return createTestDb()
}

export function seedProject(db: TestDb, ownerId: string): Project {
  return createProject(db, {
    name: 'Test Project',
    slug: 'test-project',
    ownerId,
    description: 'A test project',
  })
}

export const TEST_USER_ID = newId()
export const OTHER_USER_ID = newId()

export function makeSessionHeader(userId: string = TEST_USER_ID): Record<string, string> {
  return { 'x-test-user-id': userId }
}
