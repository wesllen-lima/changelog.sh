import { describe, it, expect } from 'bun:test'
import { mock } from 'bun:test'
import { Hono } from 'hono'
import { createTestDb } from '../db/test-utils'
import { createProject } from '../db/queries/projects'
import { createEntry, publishEntry } from '../db/queries/entries'
import { newId } from '../lib/id'

const testDb = createTestDb()
const ownerId = newId()

const project = createProject(testDb, {
  name: 'Acme Corp',
  slug: 'acme-corp',
  ownerId,
  accentColor: '#6366f1',
})

const e1 = createEntry(testDb, {
  projectId: project.id,
  title: 'First release',
  body: '## Hello\n\nThis is the **first** entry.',
  tags: ['feat', 'launch'],
})
publishEntry(testDb, e1.id)

const e2 = createEntry(testDb, {
  projectId: project.id,
  title: 'Draft entry',
  body: 'Not published yet.',
})

mock.module('../db', () => ({ db: testDb }))

const { default: publicRoutes } = await import('./public')
const app = new Hono().route('/', publicRoutes)

describe('GET /:slug', () => {
  it('returns 200 with HTML for a known project', async () => {
    const res = await app.request('/acme-corp')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
  })

  it('renders published entries', async () => {
    const res = await app.request('/acme-corp')
    const html = await res.text()
    expect(html).toContain('First release')
    expect(html).toContain('Acme Corp')
  })

  it('does not render draft entries', async () => {
    const res = await app.request('/acme-corp')
    const html = await res.text()
    expect(html).not.toContain(e2.title)
  })

  it('includes RSS link in head', async () => {
    const res = await app.request('/acme-corp')
    const html = await res.text()
    expect(html).toContain('application/rss+xml')
    expect(html).toContain('/acme-corp/rss.xml')
  })

  it('returns 404 for unknown project', async () => {
    const res = await app.request('/no-such-project')
    expect(res.status).toBe(404)
  })
})

describe('GET /:slug/rss.xml', () => {
  it('returns 200 with correct content-type', async () => {
    const res = await app.request('/acme-corp/rss.xml')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/rss+xml')
  })

  it('returns valid RSS 2.0 structure', async () => {
    const res = await app.request('/acme-corp/rss.xml')
    const xml = await res.text()
    expect(xml).toContain('<?xml version="1.0"')
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('</channel>')
    expect(xml).toContain('<item>')
    expect(xml).toContain('</item>')
  })

  it('includes published entry title and guid', async () => {
    const res = await app.request('/acme-corp/rss.xml')
    const xml = await res.text()
    expect(xml).toContain('<title>First release</title>')
    expect(xml).toContain(`<guid isPermaLink="false">${e1.id}</guid>`)
  })

  it('does not include draft entries', async () => {
    const res = await app.request('/acme-corp/rss.xml')
    const xml = await res.text()
    expect(xml).not.toContain(e2.title)
  })

  it('includes tag categories', async () => {
    const res = await app.request('/acme-corp/rss.xml')
    const xml = await res.text()
    expect(xml).toContain('<category>feat</category>')
    expect(xml).toContain('<category>launch</category>')
  })

  it('includes atom:link self-reference', async () => {
    const res = await app.request('/acme-corp/rss.xml')
    const xml = await res.text()
    expect(xml).toContain('rel="self"')
    expect(xml).toContain('/acme-corp/rss.xml')
  })

  it('returns 404 for unknown project', async () => {
    const res = await app.request('/no-such-project/rss.xml')
    expect(res.status).toBe(404)
  })
})
