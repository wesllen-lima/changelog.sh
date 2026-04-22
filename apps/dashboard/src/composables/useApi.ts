import type { Result } from '@changelog/types'

const BASE = import.meta.env.VITE_API_URL ?? ''

function extractError(b: Record<string, unknown>): string {
  const val = b.message ?? b.error
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null) {
    const zodErr = val as Record<string, unknown>
    const top = zodErr['_errors']
    if (Array.isArray(top) && top.length > 0) return String(top[0])
    for (const key of Object.keys(zodErr)) {
      const field = zodErr[key]
      if (typeof field === 'object' && field !== null) {
        const errs = (field as Record<string, unknown>)['_errors']
        if (Array.isArray(errs) && errs.length > 0) return `${key}: ${String(errs[0])}`
      }
    }
  }
  return 'Request failed'
}

async function request<T>(path: string, init: RequestInit = {}): Promise<Result<T>> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  })

  if (res.status === 204) return { ok: true, data: undefined as T }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    return { ok: false, error: 'Invalid response', status: res.status }
  }

  if (!res.ok) {
    const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
    const msg = extractError(b)
    return { ok: false, error: msg, status: res.status }
  }

  return { ok: true, data: body as T }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
