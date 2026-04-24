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

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  new: { bg: '#e8f5ee', color: '#0a6640' },
  novo: { bg: '#e8f5ee', color: '#0a6640' },
  fix: { bg: '#fef2f2', color: '#b91c1c' },
  correção: { bg: '#fef2f2', color: '#b91c1c' },
  improvement: { bg: '#eff6ff', color: '#1d4ed8' },
  melhoria: { bg: '#eff6ff', color: '#1d4ed8' },
  performance: { bg: '#fffbeb', color: '#92400e' },
}

function tagStyle(tag: string, accent: string): { bg: string; color: string } {
  const c = TAG_COLORS[tag.toLowerCase()]
  if (c) return c
  return { bg: `${accent}20`, color: accent }
}

function css(accent: string): string {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
    :root {
      --accent: ${accent};
      --accent-bg: ${accent}20;
      --accent-border: ${accent}60;
      --bg: #f5f4f1;
      --surface: #ffffff;
      --border: rgba(0,0,0,.07);
      --border-md: rgba(0,0,0,.11);
      --text: #111110;
      --muted: #706d68;
      --dimmed: #a8a49d;
      --font-ui: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      --font-mono: 'DM Mono', 'Fira Mono', ui-monospace, monospace;
      --font-serif: 'Instrument Serif', 'Playfair Display', Georgia, serif;
    }
    html { font-size: 15px; }
    body {
      font-family: var(--font-ui);
      color: var(--text);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.6;
    }
    a { color: inherit; text-decoration: none; }

    /* ── Nav ── */
    .nav {
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(245,244,241,.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 13px;
    }
    .nav-logo {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .nav-logo span {
      color: #fff;
      font-family: var(--font-serif);
      font-size: 18px;
      font-weight: 400;
      font-style: italic;
      line-height: 1;
    }
    .nav-title {
      font-family: var(--font-serif);
      font-size: 18px;
      letter-spacing: -.015em;
      line-height: 1.2;
    }
    .nav-title em {
      font-style: italic;
      color: var(--accent);
    }
    .nav-sub {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dimmed);
      margin-top: 1px;
    }
    .rss-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--muted);
      border: 1px solid var(--border-md);
      border-radius: 7px;
      padding: 5px 12px;
      background: var(--surface);
      transition: border-color .14s, color .14s;
    }
    .rss-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
      text-decoration: none;
    }

    /* ── Main ── */
    .main {
      max-width: 900px;
      margin: 0 auto;
      padding: 8px 52px 80px;
    }

    /* ── Timeline entry ── */
    .entry {
      display: grid;
      grid-template-columns: 80px 1px 1fr;
      gap: 0 32px;
      padding-top: 44px;
    }

    /* Date column */
    .entry-date-col {
      text-align: right;
      padding-top: 3px;
      user-select: none;
    }
    .entry-date-month {
      font-family: var(--font-mono);
      font-size: 9.5px;
      color: var(--dimmed);
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: 1px;
    }
    .entry-date-day {
      font-family: var(--font-serif);
      font-size: 40px;
      font-weight: 400;
      line-height: 1;
      color: var(--text);
      margin: 1px 0;
    }
    .entry-date-year {
      font-family: var(--font-mono);
      font-size: 9.5px;
      color: var(--dimmed);
    }

    /* Timeline spine */
    .entry-spine {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .entry-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--accent);
      border: 2.5px solid var(--bg);
      box-shadow: 0 0 0 2px var(--accent-border);
      margin-top: 5px;
      flex-shrink: 0;
      z-index: 1;
    }
    .entry-line {
      width: 1px;
      flex: 1;
      margin-top: 5px;
      background: linear-gradient(to bottom, var(--accent-border), var(--border));
    }

    /* Content */
    .entry-body {}
    .entry-tags {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-weight: 500;
      padding: 2px 9px;
      border-radius: 99px;
      font-family: var(--font-mono);
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
      font-family: var(--font-serif);
      font-size: 22px;
      font-weight: 400;
      letter-spacing: -.015em;
      line-height: 1.25;
      color: var(--text);
      margin-bottom: 12px;
    }

    /* Prose */
    .prose { font-size: .9375rem; color: var(--muted); line-height: 1.75; }
    .prose p { margin: .65em 0; }
    .prose p:first-child { margin-top: 0; }
    .prose p:last-child { margin-bottom: 0; }
    .prose ul, .prose ol { margin: .65em 0; padding-left: 1.4em; }
    .prose li { margin: .25em 0; }
    .prose strong { font-weight: 600; color: var(--text); }
    .prose em { font-style: italic; }
    .prose h1,.prose h2,.prose h3 {
      font-family: var(--font-serif);
      font-weight: 400;
      line-height: 1.3;
      margin: 1.1em 0 .4em;
      color: var(--text);
    }
    .prose h1 { font-size: 1.3em; }
    .prose h2 { font-size: 1.1em; }
    .prose h3 { font-size: 1em; font-weight: 600; font-family: var(--font-ui); }
    .prose code {
      font-family: var(--font-mono);
      font-size: .86em;
      background: rgba(0,0,0,.05);
      border: 1px solid var(--border-md);
      padding: .12em .36em;
      border-radius: 4px;
      color: var(--text);
    }
    .prose pre {
      background: #1a1a18;
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
      border-left: 3px solid var(--accent-border);
      padding-left: 1em;
      color: var(--muted);
      margin: 1em 0;
      font-style: italic;
    }
    .prose hr { border: none; border-top: 1px solid var(--border); margin: 1.5em 0; }

    /* Empty */
    .empty {
      grid-column: 3;
      padding: 4rem 0;
      text-align: center;
      color: var(--dimmed);
      font-size: .9375rem;
    }

    /* Footer */
    .footer {
      max-width: 900px;
      margin: 60px auto 0;
      padding: 20px 52px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-left { font-size: 12px; color: var(--dimmed); }
    .footer-right {
      font-family: var(--font-mono);
      font-size: 11px;
      color: #c4c0b8;
    }
    .footer-right a { color: inherit; }
    .footer-right a:hover { color: var(--muted); text-decoration: underline; }

    @media (max-width: 680px) {
      .nav-inner, .main { padding-left: 20px; padding-right: 20px; }
      .footer { padding-left: 20px; padding-right: 20px; }
      .nav-sub { display: none; }
      .entry { grid-template-columns: 56px 1px 1fr; gap: 0 18px; }
      .entry-date-day { font-size: 30px; }
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #151513;
        --surface: #1d1d1b;
        --border: rgba(255,255,255,.07);
        --border-md: rgba(255,255,255,.11);
        --text: #f0ede8;
        --muted: #a09d98;
        --dimmed: #68655f;
        color-scheme: dark;
      }
      .nav {
        background: rgba(21,21,19,.88);
      }
      .rss-btn {
        background: rgba(255,255,255,.04);
      }
      .prose code {
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.1);
      }
      .footer-right {
        color: #555552;
      }
    }
  `
}

export const ChangelogPage: FC<Props> = ({ projectName, slug, accentColor, entries, origin }) => {
  const initial = projectName.charAt(0).toUpperCase()
  const canonicalUrl = `${origin}/${slug}`
  const rssUrl = `${origin}/${slug}/rss.xml`
  const description = `${projectName} changelog — updates, fixes and improvements.`

  const sorted = [...entries].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{projectName} — Changelog</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" type="application/rss+xml" title={`${projectName} Changelog`} href={rssUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${projectName} — Changelog`} />
        <meta property="og:description" content={description} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: css(accentColor) }} />
      </head>
      <body>
        {/* Nav */}
        <nav class="nav">
          <div class="nav-inner">
            <div class="nav-brand">
              <div class="nav-logo">
                <span>{initial}</span>
              </div>
              <div>
                <div class="nav-title">
                  {projectName} <em>Changelog</em>
                </div>
                <div class="nav-sub">Updates &amp; release notes</div>
              </div>
            </div>
            <a class="rss-btn" href={rssUrl}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="8.5" width="2.5" height="2.5" rx=".8" fill="currentColor" />
                <path d="M1 6A4 4 0 015 10" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" fill="none" />
                <path d="M1 3a7 7 0 017 7" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" fill="none" />
              </svg>
              RSS feed
            </a>
          </div>
        </nav>

        {/* Entries */}
        <main class="main">
          {sorted.length === 0 ? (
            <div style="padding:80px 0;text-align:center;color:var(--dimmed);font-size:.9375rem">
              No entries published yet. Check back soon.
            </div>
          ) : (
            sorted.map((entry, idx) => {
              const d = new Date(entry.publishedAt)
              const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
              const day = d.getDate().toString()
              const year = d.getFullYear().toString()
              const isLast = idx === sorted.length - 1

              return (
                <div class="entry" key={entry.id} id={entry.id}>
                  {/* Date column */}
                  <div class="entry-date-col">
                    <div class="entry-date-month">{month}</div>
                    <div class="entry-date-day">{day}</div>
                    <div class="entry-date-year">{year}</div>
                  </div>

                  {/* Timeline spine */}
                  <div class="entry-spine">
                    <div class="entry-dot" />
                    {!isLast && <div class="entry-line" />}
                  </div>

                  {/* Content */}
                  <div class="entry-body">
                    {entry.tags.length > 0 && (
                      <div class="entry-tags">
                        {entry.tags.map((t) => {
                          const s = tagStyle(t, accentColor)
                          return (
                            <span key={t} class="tag" style={`background:${s.bg};color:${s.color}`}>
                              <span class="tag-dot" style={`background:${s.color}`} />
                              {t}
                            </span>
                          )
                        })}
                      </div>
                    )}
                    <h2 class="entry-title">{entry.title}</h2>
                    {entry.body.trim() && (
                      <div class="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.body) }} />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </main>

        {/* Footer */}
        <footer class="footer">
          <span class="footer-left">© {new Date().getFullYear()} {projectName}</span>
          <span class="footer-right">
            Powered by <a href="https://changelog.sh" target="_blank" rel="noopener">changelog.sh</a>
          </span>
        </footer>
      </body>
    </html>
  )
}
