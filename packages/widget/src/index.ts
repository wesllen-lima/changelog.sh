type WEntry = {
  id: string
  title: string
  body: string
  tags: string[]
  publishedAt: string
}

const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17 3.75a.75.75 0 0 1 .75.75v13a.75.75 0 0 1-1.166.619L11 14.45V8.55l5.584-3.669A.75.75 0 0 1 17 3.75zM5.5 8.5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2H9.5V8.5H5.5zM6.75 14l.875 3.5H9.5l-.875-3.5H6.75zM20 9.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 20 9.5z"/></svg>'

const STYLES = `
:host{font-family:system-ui,sans-serif;position:fixed;z-index:9999}
:host([data-position="bottom-right"]){bottom:24px;right:24px}
:host([data-position="bottom-left"]){bottom:24px;left:24px}
:host([data-position="top-right"]){top:24px;right:24px}
:host([data-position="top-left"]){top:24px;left:24px}
:host(:not([data-position])){bottom:24px;right:24px}

:host{
  --cl-bg:#ffffff;--cl-surface:#f8f8f7;--cl-border:#e8e6e2;
  --cl-text:#111110;--cl-muted:#706d68;--cl-dimmed:#a8a49d;
  --cl-tag-bg:#f0efec;--cl-shadow:0 8px 32px rgba(0,0,0,.14),0 0 0 1px rgba(0,0,0,.07);
}
@media(prefers-color-scheme:dark){
  :host{
    --cl-bg:#1c1c1a;--cl-surface:#252523;--cl-border:#2e2e2b;
    --cl-text:#f0ede8;--cl-muted:#9c9890;--cl-dimmed:#666360;
    --cl-tag-bg:#2e2e2b;--cl-shadow:0 8px 32px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.07);
  }
}
:host([data-theme="dark"]){
  --cl-bg:#1c1c1a;--cl-surface:#252523;--cl-border:#2e2e2b;
  --cl-text:#f0ede8;--cl-muted:#9c9890;--cl-dimmed:#666360;
  --cl-tag-bg:#2e2e2b;--cl-shadow:0 8px 32px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.07);
}
:host([data-theme="light"]){
  --cl-bg:#ffffff;--cl-surface:#f8f8f7;--cl-border:#e8e6e2;
  --cl-text:#111110;--cl-muted:#706d68;--cl-dimmed:#a8a49d;
  --cl-tag-bg:#f0efec;--cl-shadow:0 8px 32px rgba(0,0,0,.14),0 0 0 1px rgba(0,0,0,.07);
}

@keyframes cl-pulse{
  0%,100%{box-shadow:0 0 0 0 rgba(var(--cl-accent-rgb,10,102,64),.35),0 2px 8px rgba(0,0,0,.2)}
  70%{box-shadow:0 0 0 7px rgba(var(--cl-accent-rgb,10,102,64),0),0 2px 8px rgba(0,0,0,.2)}
}
@keyframes cl-in{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:none}}

.btn{
  width:44px;height:44px;border-radius:12px;border:none;cursor:pointer;
  background:var(--cl-accent,#111110);color:#fff;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 8px rgba(0,0,0,.2);position:relative;
  transition:transform .15s,opacity .15s;
}
.btn:hover{opacity:.88;transform:translateY(-1px)}
.btn--pulse{animation:cl-pulse 2.4s ease-in-out infinite}
.badge{
  position:absolute;top:-5px;right:-5px;background:#ef4444;color:#fff;
  font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;
  display:flex;align-items:center;justify-content:center;padding:0 4px;
  border:2px solid var(--cl-bg,#fff);
}
.panel{
  position:fixed;width:340px;max-width:calc(100vw - 48px);
  background:var(--cl-bg);border-radius:14px;
  box-shadow:var(--cl-shadow);overflow:hidden;
  animation:cl-in 180ms cubic-bezier(.16,1,.3,1) both;
}
:host([data-position="bottom-right"]) .panel,:host(:not([data-position])) .panel{bottom:80px;right:24px}
:host([data-position="bottom-left"]) .panel{bottom:80px;left:24px}
:host([data-position="top-right"]) .panel{top:80px;right:24px}
:host([data-position="top-left"]) .panel{top:80px;left:24px}

.ph{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;border-bottom:1px solid var(--cl-border);
  background:var(--cl-surface);
}
.ph-title{font-size:13px;font-weight:600;color:var(--cl-text);margin:0}
.ph-right{display:flex;align-items:center;gap:8px}
.unread-badge{
  font-size:10px;font-weight:600;
  background:var(--cl-accent,#111110);color:#fff;
  border-radius:99px;padding:1px 7px;
}
.cls{
  border:none;background:none;cursor:pointer;color:var(--cl-dimmed);
  font-size:16px;line-height:1;padding:2px 4px;border-radius:4px;
  transition:color .12s;
}
.cls:hover{color:var(--cl-text)}
.entries{max-height:320px;overflow-y:auto}
.loading{
  padding:32px 16px;text-align:center;
  font-size:12px;color:var(--cl-dimmed);
}
.empty{padding:32px 16px;text-align:center;font-size:12px;color:var(--cl-dimmed)}
.entry{
  padding:12px 16px;border-bottom:1px solid var(--cl-border);
  background:var(--cl-bg);
}
.entry:last-child{border-bottom:none}
.entry-meta{
  display:flex;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap;
}
.entry time{font-size:11px;color:var(--cl-dimmed);margin-left:auto;white-space:nowrap}
.entry h3{font-size:13px;font-weight:600;color:var(--cl-text);margin:0 0 4px;line-height:1.35}
.entry p{font-size:12px;color:var(--cl-muted);line-height:1.55;margin:0}
.entry code{
  font-size:11px;background:var(--cl-tag-bg);border:1px solid var(--cl-border);
  padding:.1em .35em;border-radius:3px;font-family:ui-monospace,monospace;
}
.tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px}
.tag{
  font-size:10px;background:var(--cl-tag-bg);color:var(--cl-muted);
  padding:1px 6px;border-radius:999px;font-weight:500;
}
.foot{
  display:block;padding:10px 16px;text-align:center;
  font-size:12px;color:var(--cl-accent,#0a6640);text-decoration:none;
  border-top:1px solid var(--cl-border);background:var(--cl-surface);
  transition:opacity .12s;
}
.foot:hover{opacity:.75;text-decoration:none}
`

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmtDate(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function renderBody(raw: string): string {
  const truncated = raw.length > 120 ? raw.slice(0, 120) + '…' : raw
  return truncated
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

class ChangelogWidget extends HTMLElement {
  #entries: WEntry[] = []
  #open = false
  #loading = false
  #root: ShadowRoot

  static get observedAttributes(): string[] {
    return ['data-project', 'data-api', 'data-theme', 'data-position']
  }

  constructor() {
    super()
    this.#root = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    void this.#load()
    document.addEventListener('keydown', this.#onKey)
  }

  disconnectedCallback(): void {
    document.removeEventListener('keydown', this.#onKey)
  }

  attributeChangedCallback(name: string): void {
    if (name === 'data-project' || name === 'data-api') {
      this.#entries = []
      void this.#load()
    } else {
      this.#render()
    }
  }

  readonly #onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.#open) {
      this.#open = false
      this.#render()
    }
  }

  async #load(): Promise<void> {
    const slug = this.dataset['project']
    const api = this.dataset['api'] ?? ''
    if (!slug) return
    this.#loading = true
    this.#render()
    try {
      const r = await fetch(`${api}/widget/${slug}/entries`)
      if (r.ok) this.#entries = (await r.json()) as WEntry[]
    } catch {
      // render empty state
    } finally {
      this.#loading = false
      this.#render()
    }
  }

  #lsKey(): string {
    return `cl-seen-${this.dataset['project'] ?? ''}`
  }

  #unread(): number {
    const seen = localStorage.getItem(this.#lsKey())
    if (!seen) return this.#entries.length
    return this.#entries.filter((e) => e.publishedAt > seen).length
  }

  #markSeen(): void {
    const first = this.#entries[0]
    if (first) localStorage.setItem(this.#lsKey(), first.publishedAt)
  }

  #toggle(): void {
    this.#open = !this.#open
    if (this.#open) this.#markSeen()
    this.#render()
  }

  #render(): void {
    const unread = this.#unread()
    const api = this.dataset['api'] ?? ''
    const slug = this.dataset['project'] ?? ''

    let bodyHtml = ''
    if (this.#loading) {
      bodyHtml = '<div class="loading">Loading…</div>'
    } else if (this.#entries.length === 0) {
      bodyHtml = '<div class="empty">No updates yet.</div>'
    } else {
      bodyHtml = this.#entries
        .slice(0, 5)
        .map(
          (e) => `<div class="entry">
  <div class="entry-meta">
    ${e.tags?.length ? `<div class="tags">${e.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
    <time>${fmtDate(e.publishedAt)}</time>
  </div>
  <h3>${esc(e.title)}</h3>
  ${e.body.trim() ? `<p>${renderBody(esc(e.body))}</p>` : ''}
</div>`,
        )
        .join('')
    }

    this.#root.innerHTML = `<style>${STYLES}</style>
<button class="btn${unread && !this.#open ? ' btn--pulse' : ''}" part="button" aria-label="What's new${unread ? ` — ${unread} new` : ''}">
  ${ICON}
  ${unread ? `<span class="badge">${unread > 9 ? '9+' : unread}</span>` : ''}
</button>
${
  this.#open
    ? `<div class="panel" role="dialog" aria-modal="true" aria-label="What's new">
  <div class="ph">
    <h2 class="ph-title">What's new</h2>
    <div class="ph-right">
      ${unread ? `<span class="unread-badge">${unread} new</span>` : ''}
      <button class="cls" aria-label="Close">✕</button>
    </div>
  </div>
  <div class="entries">${bodyHtml}</div>
  <a class="foot" href="${esc(api)}/${esc(slug)}" target="_blank" rel="noopener">See full changelog →</a>
</div>`
    : ''
}`

    this.#root.querySelector('.btn')?.addEventListener('click', () => this.#toggle())
    this.#root.querySelector('.cls')?.addEventListener('click', () => {
      this.#open = false
      this.#render()
    })
  }
}

customElements.define('changelog-widget', ChangelogWidget)
