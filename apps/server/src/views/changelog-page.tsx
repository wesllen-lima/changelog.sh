import type { FC } from 'hono/jsx'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

type RawEntry = {
  id: string
  title: string
  body: string
  tags: string[]
  publishedAt: string
}

type Props = {
  projectName: string
  slug: string
  accentColor: string
  entries: RawEntry[]
}

function renderMarkdown(src: string): string {
  const html = marked.parse(src, { async: false }) as string
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      code: ['class'],
    },
  })
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function pageStyles(accent: string): string {
  return `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}:root{--accent:${accent}}body{font-family:system-ui,-apple-system,sans-serif;color:#111827;background:#fff;line-height:1.6}.wrap{max-width:720px;margin:0 auto;padding:2rem 1rem}header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:3rem;padding-bottom:1.5rem;border-bottom:1px solid #e5e7eb}h1{font-size:1.5rem;font-weight:700}.rss{font-size:.75rem;color:#6b7280;text-decoration:none;border:1px solid #e5e7eb;border-radius:4px;padding:2px 8px}.rss:hover{border-color:var(--accent);color:var(--accent)}article{padding:2.5rem 0;border-bottom:1px solid #e5e7eb}article:last-child{border-bottom:none}time{font-size:.8rem;color:#6b7280;display:block;margin-bottom:.5rem}h2{font-size:1.125rem;font-weight:600;margin-bottom:.75rem}.tags{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:1rem}.tag{font-size:.7rem;font-weight:500;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--accent) 12%,transparent);color:var(--accent)}.prose{color:#374151;font-size:.9375rem}.prose p{margin:.75em 0}.prose h1,.prose h2,.prose h3,.prose h4{font-weight:600;line-height:1.3;margin:1.25em 0 .5em}.prose h1{font-size:1.5em}.prose h2{font-size:1.25em}.prose h3{font-size:1.125em}.prose ul,.prose ol{margin:.75em 0;padding-left:1.5em}.prose li{margin:.25em 0}.prose code{font-size:.875em;background:#f3f4f6;padding:.15em .35em;border-radius:3px;font-family:ui-monospace,monospace}.prose pre{background:#1e1e2e;color:#cdd6f4;padding:1rem;border-radius:6px;overflow-x:auto;margin:1em 0}.prose pre code{background:none;padding:0;color:inherit}.prose a{color:var(--accent)}.prose a:hover{text-decoration:underline}.prose blockquote{border-left:3px solid var(--accent);padding-left:1rem;color:#6b7280;margin:1em 0}.empty{color:#6b7280;padding:2rem 0}@media(max-width:640px){.wrap{padding:1.25rem 1rem}h1{font-size:1.25rem}}`
}

export const ChangelogPage: FC<Props> = ({ projectName, slug, accentColor, entries }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{projectName} — Changelog</title>
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${projectName} Changelog`}
          href={`/${slug}/rss.xml`}
        />
        <style dangerouslySetInnerHTML={{ __html: pageStyles(accentColor) }} />
      </head>
      <body>
        <div class="wrap">
          <header>
            <h1>{projectName}</h1>
            <a class="rss" href={`/${slug}/rss.xml`}>
              RSS
            </a>
          </header>
          <main>
            {entries.length === 0 ? (
              <p class="empty">No entries published yet.</p>
            ) : (
              entries.map((e) => {
                return (
                  <article id={e.id} key={e.id}>
                    <time datetime={e.publishedAt}>{fmtDate(e.publishedAt)}</time>
                    <h2>{e.title}</h2>
                    {e.tags.length > 0 && (
                      <div class="tags">
                        {e.tags.map((t) => (
                          <span key={t} class="tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div
                      class="prose"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(e.body) }}
                    />
                  </article>
                )
              })
            )}
          </main>
        </div>
      </body>
    </html>
  )
}
