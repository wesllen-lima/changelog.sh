import { describe, it, expect } from 'bun:test'
import { mock } from 'bun:test'
import { Hono } from 'hono'
import { createTestDb } from '../db/test-utils'
import { createProject } from '../db/queries/projects'
import { newId } from '../lib/id'

const testDb = createTestDb()
const USER_A = newId()
const USER_B = newId()

const project = createProject(testDb, {
  name: 'Acme Corp',
  slug: 'acme-corp',
  ownerId: USER_A,
})

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

const { default: projectRoutes } = await import('./projects')
const app = new Hono().route('/api/projects', projectRoutes)

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

describe('GET /api/projects', () => {
  it('returns 401 without auth', async () => {
    const res = await app.request('/api/projects')
    expect(res.status).toBe(401)
  })

  it('returns project list for owner', async () => {
    const res = await app.request('/api/projects', authed(USER_A))
    expect(res.status).toBe(200)
    const body = (await res.json()) as Array<{ id: string }>
    expect(body.some((p) => p.id === project.id)).toBe(true)
  })

  it('returns empty list for non-owner', async () => {
    const res = await app.request('/api/projects', authed(USER_B))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})

describe('POST /api/projects', () => {
  it('returns 401 without auth', async () => {
    const res = await app.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'X' }),
    })
    expect(res.status).toBe(401)
  })

  it('creates a project', async () => {
    const res = await app.request(
      '/api/projects',
      authed(USER_A, {
        method: 'POST',
        body: JSON.stringify({ name: 'New Project' }),
      }),
    )
    expect(res.status).toBe(201)
    const body = (await res.json()) as { name: string; slug: string }
    expect(body.name).toBe('New Project')
    expect(body.slug).toBe('new-project')
  })

  it('returns 422 on missing name', async () => {
    const res = await app.request(
      '/api/projects',
      authed(USER_A, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    )
    expect(res.status).toBe(422)
  })

  it('returns 409 on duplicate slug', async () => {
    const res = await app.request(
      '/api/projects',
      authed(USER_A, {
        method: 'POST',
        body: JSON.stringify({ name: 'Acme Corp' }),
      }),
    )
    expect(res.status).toBe(409)
  })
})

describe('PATCH /api/projects/:id', () => {
  it('updates a project owned by the user', async () => {
    const res = await app.request(
      `/api/projects/${project.id}`,
      authed(USER_A, {
        method: 'PATCH',
        body: JSON.stringify({ description: 'Updated' }),
      }),
    )
    expect(res.status).toBe(200)
  })

  it('returns 404 for project not owned by user', async () => {
    const res = await app.request(
      `/api/projects/${project.id}`,
      authed(USER_B, {
        method: 'PATCH',
        body: JSON.stringify({ description: 'Hack' }),
      }),
    )
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/projects/:id', () => {
  it('returns 404 for project not owned by user', async () => {
    const res = await app.request(
      `/api/projects/${project.id}`,
      authed(USER_B, { method: 'DELETE' }),
    )
    expect(res.status).toBe(404)
  })

  it('deletes owned project', async () => {
    const toDelete = createProject(testDb, { name: 'Temp', slug: 'temp-delete', ownerId: USER_A })
    const res = await app.request(
      `/api/projects/${toDelete.id}`,
      authed(USER_A, { method: 'DELETE' }),
    )
    expect(res.status).toBe(204)
  })
})
