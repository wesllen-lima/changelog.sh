type WEntry = {
  id: string
  title: string
  body: string
  tags: string[]
  publishedAt: string
}

const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17 3.75a.75.75 0 0 1 .75.75v13a.75.75 0 0 1-1.166.619L11 14.45V8.55l5.584-3.669A.75.75 0 0 1 17 3.75zM5.5 8.5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2H9.5V8.5H5.5zM6.75 14l.875 3.5H9.5l-.875-3.5H6.75zM20 9.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 20 9.5z"/></svg>'

const STYLES = `:host{position:fixed;bottom:24px;right:24px;z-index:9999;font-family:system-ui,sans-serif}@keyframes cl-pulse{0%,100%{box-shadow:0 0 0 0 rgba(var(--cl-accent-rgb,10,102,64),.35),0 2px 8px rgba(0,0,0,.2)}70%{box-shadow:0 0 0 7px rgba(var(--cl-accent-rgb,10,102,64),0),0 2px 8px rgba(0,0,0,.2)}}.btn{width:44px;height:44px;border-radius:12px;border:none;cursor:pointer;background:var(--cl-accent,#111110);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.2);position:relative;transition:transform .15s,opacity .15s}.btn:hover{opacity:.88;transform:translateY(-1px)}.btn--pulse{animation:cl-pulse 2.4s ease-in-out infinite}.badge{position:absolute;top:-5px;right:-5px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid #fff}.panel{position:fixed;bottom:80px;right:24px;width:340px;max-width:calc(100vw - 48px);background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.15);overflow:hidden}.ph{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #f0f0f0}.ph h2{font-size:14px;font-weight:600;color:#111;margin:0}.cls{border:none;background:none;cursor:pointer;color:#999;font-size:18px;line-height:1;padding:4px}.cls:hover{color:#111}.entries{max-height:320px;overflow-y:auto}.entry{padding:12px 16px;border-bottom:1px solid #f5f5f5}.entry:last-child{border-bottom:none}.entry time{font-size:11px;color:#888;display:block;margin-bottom:4px}.entry h3{font-size:13px;font-weight:600;color:#111;margin:0 0 4px}.entry p{font-size:12px;color:#555;line-height:1.5;margin:0}.tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px}.tag{font-size:10px;background:#f0f0f0;color:#555;padding:1px 6px;border-radius:999px}.foot{display:block;padding:10px 16px;text-align:center;font-size:12px;color:var(--cl-accent,#6366f1);text-decoration:none;border-top:1px solid #f0f0f0}.foot:hover{text-decoration:underline}`

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}

class ChangelogWidget extends HTMLElement {
  #entries: WEntry[] = []
  #open = false
  #root: ShadowRoot

  constructor() {
    super()
    this.#root = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    void this.#load()
  }

  async #load(): Promise<void> {
    const slug = this.dataset['project']
    const api = this.dataset['api'] ?? ''
    if (!slug) return
    try {
      const r = await fetch(`${api}/widget/${slug}/entries`)
      if (r.ok) {
        this.#entries = (await r.json()) as WEntry[]
        this.#render()
      }
    } catch {}
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

    const entriesHtml = this.#entries
      .slice(0, 5)
      .map(
        (e) => `<div class="entry">
  <time>${fmtDate(e.publishedAt)}</time>
  <h3>${esc(e.title)}</h3>
  ${e.tags?.length ? `<div class="tags">${e.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
  <p>${esc(truncate(e.body, 80))}</p>
</div>`,
      )
      .join('')

    this.#root.innerHTML = `<style>${STYLES}</style>
<button class="btn${unread && !this.#open ? ' btn--pulse' : ''}" part="button" aria-label="What's new${unread ? ` — ${unread} new` : ''}">
  ${ICON}
  ${unread ? `<span class="badge">${unread > 9 ? '9+' : unread}</span>` : ''}
</button>
${
  this.#open
    ? `<div class="panel" role="dialog" aria-modal="true" aria-label="What's new">
  <div class="ph"><h2>What's new</h2><button class="cls" aria-label="Close">✕</button></div>
  <div class="entries">${entriesHtml}</div>
  <a class="foot" href="${esc(api)}/${esc(slug)}">See full changelog →</a>
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
