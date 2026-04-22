import { describe, it, expect } from 'bun:test'
import { mock } from 'bun:test'
import { Hono } from 'hono'
import { createTestDb } from '../db/test-utils'
import { createProject } from '../db/queries/projects'
import { newId } from '../lib/id'

const testDb = createTestDb()
const USER_A = newId()

createProject(testDb, { name: 'Keys Test', slug: 'keys-test', ownerId: USER_A })

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

const { default: apiKeyRoutes } = await import('./api-keys')
const app = new Hono().route('/api', apiKeyRoutes)

function authed(userId: string, opts: RequestInit = {}): RequestInit {
  return {
    ...opts,
    headers: {
      'x-test-user-id': userId,
      'content-type': 'application/json',
      ...((opts.headers as Record<string, string>) ?? {}),
    },
  }
}

describe('GET /api/projects/:slug/keys', () => {
  it('returns 401 without auth', async () => {
    const res = await app.request('/api/projects/keys-test/keys')
    expect(res.status).toBe(401)
  })

  it('returns key list for owner', async () => {
    const res = await app.request('/api/projects/keys-test/keys', authed(USER_A))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  it('returns 404 for non-owner', async () => {
    const res = await app.request('/api/projects/keys-test/keys', authed(newId()))
    expect(res.status).toBe(404)
  })
})

describe('POST /api/projects/:slug/keys', () => {
  it('creates a key and returns plain text once', async () => {
    const res = await app.request(
      '/api/projects/keys-test/keys',
      authed(USER_A, {
        method: 'POST',
        body: JSON.stringify({ label: 'CI deploy' }),
      }),
    )
    expect(res.status).toBe(201)
    const body = (await res.json()) as { key: string; record: { id: string; label: string } }
    expect(typeof body.key).toBe('string')
    expect(body.record.label).toBe('CI deploy')
    expect((body.record as Record<string, unknown>).keyHash).toBeUndefined()
  })

  it('returns 422 on missing label', async () => {
    const res = await app.request(
      '/api/projects/keys-test/keys',
      authed(USER_A, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    )
    expect(res.status).toBe(422)
  })
})

describe('DELETE /api/keys/:id', () => {
  it('revokes a key', async () => {
    const create = await app.request(
      '/api/projects/keys-test/keys',
      authed(USER_A, {
        method: 'POST',
        body: JSON.stringify({ label: 'Temp' }),
      }),
    )
    const { record } = (await create.json()) as { record: { id: string } }

    const del = await app.request(`/api/keys/${record.id}`, authed(USER_A, { method: 'DELETE' }))
    expect(del.status).toBe(204)
  })

  it('returns 404 for key not owned by user', async () => {
    const res = await app.request(`/api/keys/${newId()}`, authed(USER_A, { method: 'DELETE' }))
    expect(res.status).toBe(404)
  })
})
