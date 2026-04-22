import { describe, it, expect } from 'bun:test'
import { mock } from 'bun:test'
import { Hono } from 'hono'
import { createTestDb } from '../db/test-utils'
import { createProject } from '../db/queries/projects'
import { createEntry } from '../db/queries/entries'
import { createApiKey } from '../db/queries/api-keys'
import { newId } from '../lib/id'

const testDb = createTestDb()
const USER_A = newId()

const project = createProject(testDb, { name: 'Acme', slug: 'acme', ownerId: USER_A })
const draft = createEntry(testDb, { projectId: project.id, title: 'Draft', body: 'Hello' })
const { key: rawKey } = createApiKey(testDb, project.id, 'ci')

mock.module('../db', () => ({ db: testDb }))
mock.module('../auth', () => ({
  auth: {
    api: {
      getSession: async ({ headers }: { headers: Headers }) => {
        const userId = headers.get('x-test-user-id')
        if (!userId) return null
        return { user: { id: userId, email: 'test@example.com', name: 'Test' } }
      },
    },
    handler: () => new Response('', { status: 501 }),
  },
}))

const { default: entryRoutes } = await import('./entries')
const app = new Hono().route('/api', entryRoutes)

function sessionHeaders(userId: string): Record<string, string> {
  return { 'x-test-user-id': userId, 'content-type': 'application/json' }
}

function apiKeyHeaders(key: string): Record<string, string> {
  return { authorization: `Bearer ${key}`, 'content-type': 'application/json' }
}

describe('GET /api/projects/:slug/entries', () => {
  it('returns 401 without auth', async () => {
    const res = await app.request('/api/projects/acme/entries')
    expect(res.status).toBe(401)
  })

  it('lists entries with session auth', async () => {
    const res = await app.request('/api/projects/acme/entries', { headers: sessionHeaders(USER_A) })
    expect(res.status).toBe(200)
    const body = (await res.json()) as Array<{ id: string }>
    expect(body.some((e) => e.id === draft.id)).toBe(true)
  })

  it('lists only published entries with ?published=true', async () => {
    const res = await app.request('/api/projects/acme/entries?published=true', {
      headers: sessionHeaders(USER_A),
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as unknown[]
    expect(body.length).toBe(0)
  })

  it('returns 404 for unknown project', async () => {
    const res = await app.request('/api/projects/no-such/entries', {
      headers: sessionHeaders(USER_A),
    })
    expect(res.status).toBe(404)
  })
})

describe('POST /api/projects/:slug/entries', () => {
  it('creates entry with session auth', async () => {
    const res = await app.request('/api/projects/acme/entries', {
      method: 'POST',
      headers: sessionHeaders(USER_A),
      body: JSON.stringify({ title: 'v1.2.0' }),
    })
    expect(res.status).toBe(201)
    const body = (await res.json()) as { title: string }
    expect(body.title).toBe('v1.2.0')
  })

  it('creates entry with API key auth', async () => {
    const res = await app.request('/api/projects/acme/entries', {
      method: 'POST',
      headers: apiKeyHeaders(rawKey),
      body: JSON.stringify({ title: 'From CI' }),
    })
    expect(res.status).toBe(201)
  })

  it('returns 422 on missing title', async () => {
    const res = await app.request('/api/projects/acme/entries', {
      method: 'POST',
      headers: sessionHeaders(USER_A),
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(422)
  })
})

describe('PATCH /api/entries/:id', () => {
  it('updates an entry', async () => {
    const res = await app.request(`/api/entries/${draft.id}`, {
      method: 'PATCH',
      headers: sessionHeaders(USER_A),
      body: JSON.stringify({ title: 'Updated' }),
    })
    expect(res.status).toBe(200)
  })

  it('returns 403 for wrong API key project', async () => {
    const otherProject = createProject(testDb, { name: 'Other', slug: 'other', ownerId: newId() })
    const { key: otherKey } = createApiKey(testDb, otherProject.id, 'test')
    const res = await app.request(`/api/entries/${draft.id}`, {
      method: 'PATCH',
      headers: apiKeyHeaders(otherKey),
      body: JSON.stringify({ title: 'Hack' }),
    })
    expect(res.status).toBe(403)
  })
})

describe('POST /api/entries/:id/publish + unpublish', () => {
  it('publishes then unpublishes an entry', async () => {
    const pub = await app.request(`/api/entries/${draft.id}/publish`, {
      method: 'POST',
      headers: sessionHeaders(USER_A),
    })
    expect(pub.status).toBe(200)

    const unpub = await app.request(`/api/entries/${draft.id}/unpublish`, {
      method: 'POST',
      headers: sessionHeaders(USER_A),
    })
    expect(unpub.status).toBe(200)
  })
})

describe('DELETE /api/entries/:id', () => {
  it('deletes an entry', async () => {
    const toDelete = createEntry(testDb, { projectId: project.id, title: 'Bye' })
    const res = await app.request(`/api/entries/${toDelete.id}`, {
      method: 'DELETE',
      headers: sessionHeaders(USER_A),
    })
    expect(res.status).toBe(204)
  })
})
