import { describe, it, expect } from 'bun:test'
import { mock } from 'bun:test'
import { Hono } from 'hono'
import { createTestDb } from '../db/test-utils'
import { createProject } from '../db/queries/projects'
import { createEntry, publishEntry } from '../db/queries/entries'
import { newId } from '../lib/id'

const testDb = createTestDb()
const ownerId = newId()

const project = createProject(testDb, { name: 'Widget Test', slug: 'widget-test', ownerId })
const published = createEntry(testDb, {
  projectId: project.id,
  title: 'Published Entry',
  body: 'Content',
})
publishEntry(testDb, published.id)
createEntry(testDb, { projectId: project.id, title: 'Draft Entry' })

mock.module('../db', () => ({ db: testDb }))

const { default: widgetRoutes } = await import('./widget')
const app = new Hono().route('/widget', widgetRoutes)

describe('GET /widget/:slug/entries', () => {
  it('returns only published entries', async () => {
    const res = await app.request('/widget/widget-test/entries')
    expect(res.status).toBe(200)
    const body = (await res.json()) as Array<{ id: string; title: string; publishedAt: string }>
    expect(body.length).toBe(1)
    expect(body[0].id).toBe(published.id)
    expect(body[0].title).toBe('Published Entry')
    expect(body[0].publishedAt).not.toBeNull()
  })

  it('returns tags as parsed array', async () => {
    const withTags = createEntry(testDb, {
      projectId: project.id,
      title: 'Tagged',
      tags: ['fix', 'perf'],
    })
    publishEntry(testDb, withTags.id)

    const res = await app.request('/widget/widget-test/entries')
    expect(res.status).toBe(200)
    const body = (await res.json()) as Array<{ tags: string[] }>
    const tagged = body.find((e) => (e as { title?: string }).title === 'Tagged')
    expect(tagged?.tags).toEqual(['fix', 'perf'])
  })

  it('returns 404 for unknown project', async () => {
    const res = await app.request('/widget/no-such/entries')
    expect(res.status).toBe(404)
  })

  it('does not require authentication', async () => {
    const res = await app.request('/widget/widget-test/entries')
    expect(res.status).toBe(200)
  })

  it('returns at most 10 entries', async () => {
    for (let i = 0; i < 12; i++) {
      const e = createEntry(testDb, { projectId: project.id, title: `Entry ${i}` })
      publishEntry(testDb, e.id)
    }
    const res = await app.request('/widget/widget-test/entries')
    const body = (await res.json()) as unknown[]
    expect(body.length).toBeLessThanOrEqual(10)
  })
})
