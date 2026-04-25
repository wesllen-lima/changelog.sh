import { Hono } from 'hono'
import { listEntries } from '../services/entries'
import { getProjectBySlug } from '../services/projects'
import { ChangelogPage } from '../views/changelog-page'
import { marked } from 'marked'

const app = new Hono()

app.get('/:slug/rss.xml', async (c) => {
  const { slug } = c.req.param()

  const projectResult = await getProjectBySlug(slug)
  if (!projectResult.ok) return c.text('Not Found', 404)

  const entriesResult = await listEntries(slug, { publishedOnly: true, limit: 500 })
  const entries = entriesResult.ok ? entriesResult.data.items : []

  const origin = new URL(c.req.url).origin
  const project = projectResult.data

  const items = entries
    .filter((e) => e.publishedAt)
    .map((e) => {
      const bodyHtml = marked.parse(e.body, { async: false }) as string
      const categories = e.tags.map((t) => `<category>${escXml(t)}</category>`).join('')
      return `
    <item>
      <title>${escXml(e.title)}</title>
      <link>${origin}/${slug}</link>
      <guid isPermaLink="false">${e.id}</guid>
      <pubDate>${new Date(e.publishedAt!).toUTCString()}</pubDate>
      ${categories}
      <description><![CDATA[${bodyHtml}]]></description>
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(project.name)} Changelog</title>
    <link>${origin}/${slug}</link>
    <description>Changelog for ${escXml(project.name)}</description>
    <language>en</language>
    <atom:link href="${origin}/${slug}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return c.body(xml, 200, { 'Content-Type': 'application/rss+xml; charset=utf-8' })
})

app.get('/:slug', async (c) => {
  const { slug } = c.req.param()

  const projectResult = await getProjectBySlug(slug)
  if (!projectResult.ok) return c.text('Not Found', 404)

  const entriesResult = await listEntries(slug, { publishedOnly: true, limit: 500 })
  const entries = entriesResult.ok ? entriesResult.data.items : []

  const project = projectResult.data
  const origin = new URL(c.req.url).origin

  return c.html(
    <ChangelogPage
      projectName={project.name}
      slug={slug}
      accentColor={project.accentColor ?? '#0a6640'}
      origin={origin}
      entries={
        entries.filter((e) => e.publishedAt !== null) as {
          id: string
          title: string
          body: string
          tags: string[]
          publishedAt: string
        }[]
      }
    />,
  )
})

function escXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default app
