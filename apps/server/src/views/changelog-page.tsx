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
  origin: string
}

function renderMarkdown(src: string): string {
  const html = marked.parse(src, { async: false }) as string
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, code: ['class'] },
  })
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86_400_000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d} days ago`
  return fmtDate(iso)
}

const TAG_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  new:         { bg: '#e8f5ee', color: '#0a6640', dot: '#0a6640' },
  novo:        { bg: '#e8f5ee', color: '#0a6640', dot: '#0a6640' },
  fix:         { bg: '#fef2f2', color: '#b91c1c', dot: '#b91c1c' },
  correção:    { bg: '#fef2f2', color: '#b91c1c', dot: '#b91c1c' },
  improvement: { bg: '#eff6ff', color: '#1d4ed8', dot: '#1d4ed8' },
  melhoria:    { bg: '#eff6ff', color: '#1d4ed8', dot: '#1d4ed8' },
  performance: { bg: '#fffbeb', color: '#92400e', dot: '#92400e' },
}

function tagStyle(tag: string, accent: string) {
  const c = TAG_COLORS[tag.toLowerCase()]
  if (c) return c
  return { bg: `${accent}18`, color: accent, dot: accent }
}

function css(accent: string): string {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
    :root { --accent: ${accent}; --accent-bg: ${accent}18; }
    html { font-size: 15px; }
    body {
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      color: #111110;
      background: #f9f8f6;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Layout */
    .page { min-height: 100vh; display: flex; flex-direction: column; }
    .wrap { max-width: 680px; margin: 0 auto; padding: 0 1.25rem; width: 100%; }

    /* Nav */
    .nav {
      border-bottom: 1px solid rgba(0,0,0,.07);
      background: rgba(249,248,246,.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .nav-inner {
      max-width: 680px;
      margin: 0 auto;
      padding: 0 1.25rem;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 9px;
    }
    .nav-logo {
      width: 22px;
      height: 22px;
      border-radius: 5px;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .nav-logo span {
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
    }
    .nav-name {
      font-size: 14px;
      font-weight: 600;
      color: #111110;
    }
    .nav-actions { display: flex; align-items: center; gap: 8px; }
    .rss-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 500;
      color: #706d68;
      border: 1px solid rgba(0,0,0,.11);
      border-radius: 6px;
      padding: 4px 10px;
      background: #fff;
      transition: border-color .12s, color .12s;
      cursor: pointer;
    }
    .rss-btn:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

    /* Hero */
    .hero {
      padding: 3.5rem 0 2.5rem;
      border-bottom: 1px solid rgba(0,0,0,.07);
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: .04em;
      text-transform: uppercase;
      color: var(--accent);
      background: var(--accent-bg);
      border-radius: 99px;
      padding: 3px 10px;
      margin-bottom: 14px;
      font-family: 'DM Mono', 'Fira Mono', ui-monospace, monospace;
    }
    .hero-title {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -.02em;
      line-height: 1.2;
      margin-bottom: 10px;
      color: #111110;
    }
    .hero-sub {
      font-size: .9375rem;
      color: #706d68;
      line-height: 1.6;
    }

    /* Entries */
    .entries { padding: 2.5rem 0; flex: 1; }
    .entry-group { margin-bottom: 3rem; }
    .entry-year {
      font-size: 12px;
      font-weight: 500;
      color: #a8a49d;
      letter-spacing: .06em;
      text-transform: uppercase;
      font-family: 'DM Mono', 'Fira Mono', ui-monospace, monospace;
      margin-bottom: 1.25rem;
      padding-bottom: .5rem;
      border-bottom: 1px solid rgba(0,0,0,.06);
    }
    article {
      padding: 1.75rem 0;
      border-bottom: 1px solid rgba(0,0,0,.06);
    }
    article:last-child { border-bottom: none; }
    .entry-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: .75rem;
      flex-wrap: wrap;
    }
    .entry-date {
      font-size: 12px;
      font-weight: 500;
      color: #a8a49d;
      font-family: 'DM Mono', 'Fira Mono', ui-monospace, monospace;
      white-space: nowrap;
    }
    .entry-tags { display: flex; gap: 5px; flex-wrap: wrap; }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 99px;
      font-family: 'DM Mono', 'Fira Mono', ui-monospace, monospace;
      letter-spacing: .02em;
      white-space: nowrap;
    }
    .tag-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .entry-title {
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -.015em;
      line-height: 1.35;
      margin-bottom: .875rem;
      color: #111110;
    }

    /* Prose */
    .prose { color: #374151; font-size: .9375rem; line-height: 1.75; }
    .prose p { margin: .75em 0; }
    .prose p:first-child { margin-top: 0; }
    .prose p:last-child  { margin-bottom: 0; }
    .prose h1,.prose h2,.prose h3,.prose h4 {
      font-weight: 600;
      line-height: 1.3;
      margin: 1.25em 0 .5em;
      color: #111110;
    }
    .prose h1 { font-size: 1.375em; }
    .prose h2 { font-size: 1.2em; }
    .prose h3 { font-size: 1.05em; }
    .prose ul,.prose ol { margin: .75em 0; padding-left: 1.5em; }
    .prose li { margin: .3em 0; }
    .prose code {
      font-size: .85em;
      background: #f3f2f0;
      border: 1px solid rgba(0,0,0,.08);
      padding: .15em .4em;
      border-radius: 4px;
      font-family: 'DM Mono', 'Fira Mono', ui-monospace, monospace;
      color: #374151;
    }
    .prose pre {
      background: #1a1a1a;
      color: #e2e2e0;
      padding: 1rem 1.25rem;
      border-radius: 10px;
      overflow-x: auto;
      margin: 1em 0;
      font-size: .85em;
      line-height: 1.7;
    }
    .prose pre code { background: none; border: none; padding: 0; color: inherit; font-size: inherit; }
    .prose a { color: var(--accent); }
    .prose a:hover { text-decoration: underline; }
    .prose blockquote {
      border-left: 3px solid var(--accent);
      padding-left: 1rem;
      color: #706d68;
      margin: 1em 0;
      font-style: italic;
    }
    .prose hr { border: none; border-top: 1px solid rgba(0,0,0,.08); margin: 1.5em 0; }
    .prose strong { font-weight: 600; color: #111110; }

    /* Empty */
    .empty {
      padding: 4rem 0;
      text-align: center;
      color: #a8a49d;
      font-size: .9375rem;
    }

    /* Footer */
    .footer {
      border-top: 1px solid rgba(0,0,0,.07);
      padding: 1.5rem 0;
    }
    .footer-inner {
      max-width: 680px;
      margin: 0 auto;
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-left { font-size: 12px; color: #a8a49d; }
    .footer-right {
      font-size: 11px;
      color: #c4c0b8;
      font-family: 'DM Mono', 'Fira Mono', ui-monospace, monospace;
    }
    .footer-right a { color: inherit; }
    .footer-right a:hover { color: #706d68; }

    @media (max-width: 640px) {
      .hero { padding: 2.25rem 0 1.75rem; }
      .hero-title { font-size: 1.625rem; }
      .entries { padding: 1.75rem 0; }
    }
  `
}

function groupByYear(entries: RawEntry[]): Map<string, RawEntry[]> {
  const map = new Map<string, RawEntry[]>()
  for (const e of entries) {
    const year = new Date(e.publishedAt).getFullYear().toString()
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(e)
  }
  return map
}

export const ChangelogPage: FC<Props> = ({ projectName, slug, accentColor, entries, origin }) => {
  const groups = groupByYear(entries)
  const years = [...groups.keys()].sort((a, b) => Number(b) - Number(a))
  const initial = projectName.charAt(0).toUpperCase()
  const canonicalUrl = `${origin}/${slug}`
  const rssUrl = `${origin}/${slug}/rss.xml`
  const description = `Changelog for ${projectName} — all product updates, fixes and improvements.`

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{projectName} — Changelog</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" type="application/rss+xml" title={`${projectName} Changelog`} href={rssUrl} />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${projectName} — Changelog`} />
        <meta property="og:description" content={description} />
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: css(accentColor) }} />
      </head>
      <body>
        <div class="page">
          {/* Nav */}
          <nav class="nav">
            <div class="nav-inner">
              <div class="nav-brand">
                <div class="nav-logo">
                  <span>{initial}</span>
                </div>
                <span class="nav-name">{projectName}</span>
              </div>
              <div class="nav-actions">
                <a class="rss-btn" href={rssUrl}>
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <circle cx="3" cy="11" r="1.5" fill="currentColor"/>
                    <path d="M2 7.5A5.5 5.5 0 019.5 15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    <path d="M2 3A9 9 0 0113 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                  RSS
                </a>
              </div>
            </div>
          </nav>

          {/* Hero */}
          <div class="hero">
            <div class="wrap">
              <div class="hero-badge">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <circle cx="4" cy="4" r="3" fill="currentColor"/>
                </svg>
                Changelog
              </div>
              <h1 class="hero-title">{projectName}</h1>
              <p class="hero-sub">
                {entries.length === 0
                  ? 'Updates, fixes and improvements — stay in the loop.'
                  : `${entries.length} update${entries.length === 1 ? '' : 's'} published.`}
              </p>
            </div>
          </div>

          {/* Entries */}
          <div class="entries">
            <div class="wrap">
              {entries.length === 0 ? (
                <div class="empty">No entries published yet. Check back soon.</div>
              ) : (
                years.map((year) => (
                  <div class="entry-group" key={year}>
                    <div class="entry-year">{year}</div>
                    {groups.get(year)!.map((e) => {
                      return (
                        <article id={e.id} key={e.id}>
                          <div class="entry-meta">
                            <time class="entry-date" datetime={e.publishedAt} title={fmtDate(e.publishedAt)}>
                              {relativeDate(e.publishedAt)}
                            </time>
                            {e.tags.length > 0 && (
                              <div class="entry-tags">
                                {e.tags.map((t) => {
                                  const s = tagStyle(t, accentColor)
                                  return (
                                    <span
                                      key={t}
                                      class="tag"
                                      style={`background:${s.bg};color:${s.color}`}
                                    >
                                      <span class="tag-dot" style={`background:${s.dot}`} />
                                      {t}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                          <h2 class="entry-title">{e.title}</h2>
                          {e.body.trim() && (
                            <div
                              class="prose"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(e.body) }}
                            />
                          )}
                        </article>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <footer class="footer">
            <div class="footer-inner">
              <span class="footer-left">
                © {new Date().getFullYear()} {projectName}
              </span>
              <span class="footer-right">
                Powered by <a href="https://changelog.sh" target="_blank" rel="noopener">changelog.sh</a>
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
