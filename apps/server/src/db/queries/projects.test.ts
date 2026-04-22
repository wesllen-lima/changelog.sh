import { describe, expect, test, beforeEach } from 'bun:test'
import { createTestDb, type TestDb } from '../test-utils'
import {
  createProject,
  deleteProject,
  getProject,
  getProjectsByOwner,
  updateProject,
} from './projects'

let db: TestDb

beforeEach(() => {
  db = createTestDb()
})

describe('createProject', () => {
  test('creates and returns a project', () => {
    const project = createProject(db, {
      name: 'My App',
      slug: 'my-app',
      ownerId: 'user_123',
    })

    expect(project.id).toHaveLength(21)
    expect(project.name).toBe('My App')
    expect(project.slug).toBe('my-app')
    expect(project.ownerId).toBe('user_123')
    expect(project.accentColor).toBe('#6366f1')
    expect(project.description).toBeNull()
    expect(project.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('accepts optional fields', () => {
    const project = createProject(db, {
      name: 'My App',
      slug: 'my-app',
      ownerId: 'user_123',
      description: 'A cool app',
      accentColor: '#ff0000',
    })

    expect(project.description).toBe('A cool app')
    expect(project.accentColor).toBe('#ff0000')
  })
})

describe('getProject', () => {
  test('returns project by slug', async () => {
    const created = createProject(db, { name: 'My App', slug: 'my-app', ownerId: 'user_123' })
    const found = await getProject(db, 'my-app')

    expect(found?.id).toBe(created.id)
    expect(found?.slug).toBe('my-app')
  })

  test('returns null for unknown slug', async () => {
    const found = await getProject(db, 'unknown')
    expect(found).toBeNull()
  })
})

describe('getProjectsByOwner', () => {
  test('returns all projects for owner', async () => {
    createProject(db, { name: 'A', slug: 'a', ownerId: 'user_1' })
    createProject(db, { name: 'B', slug: 'b', ownerId: 'user_1' })
    createProject(db, { name: 'C', slug: 'c', ownerId: 'user_2' })

    const user1Projects = await getProjectsByOwner(db, 'user_1')
    expect(user1Projects).toHaveLength(2)

    const user2Projects = await getProjectsByOwner(db, 'user_2')
    expect(user2Projects).toHaveLength(1)
  })

  test('returns empty array when owner has no projects', async () => {
    const found = await getProjectsByOwner(db, 'user_nobody')
    expect(found).toHaveLength(0)
  })
})

describe('updateProject', () => {
  test('updates specified fields', async () => {
    const project = createProject(db, { name: 'Old', slug: 'old', ownerId: 'user_1' })
    updateProject(db, project.id, { name: 'New', accentColor: '#abc' })

    const found = await getProject(db, 'old')
    expect(found?.name).toBe('New')
    expect(found?.accentColor).toBe('#abc')
  })
})

describe('deleteProject', () => {
  test('removes project', async () => {
    const project = createProject(db, { name: 'My App', slug: 'my-app', ownerId: 'user_1' })
    deleteProject(db, project.id)

    const found = await getProject(db, 'my-app')
    expect(found).toBeNull()
  })
})
