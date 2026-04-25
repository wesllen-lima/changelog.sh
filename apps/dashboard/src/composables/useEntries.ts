import { ref, readonly } from 'vue'
import { api } from './useApi'
import type { Entry, Result } from '@changelog/types'

type PaginatedEntries = { items: Entry[]; total: number }

const entries = ref<Entry[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

export function useEntries(): {
  entries: Readonly<typeof entries>
  total: Readonly<typeof total>
  loading: Readonly<typeof loading>
  error: Readonly<typeof error>
  fetchEntries: (
    slug: string,
    opts?: {
      publishedOnly?: boolean
      limit?: number
      offset?: number
      q?: string
      append?: boolean
    },
  ) => Promise<void>
  createEntry: (
    slug: string,
    payload: { title: string; body: string; tags?: string[] },
  ) => Promise<Result<Entry>>
  updateEntry: (
    id: string,
    payload: Partial<Pick<Entry, 'title' | 'body' | 'tags'>>,
  ) => Promise<Result<Entry>>
  publishEntry: (id: string) => Promise<Result<Entry>>
  unpublishEntry: (id: string) => Promise<Result<Entry>>
  deleteEntry: (id: string) => Promise<Result<undefined>>
  duplicateEntry: (id: string) => Promise<Result<Entry>>
} {
  async function fetchEntries(
    slug: string,
    opts: {
      publishedOnly?: boolean
      limit?: number
      offset?: number
      q?: string
      append?: boolean
    } = {},
  ): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (opts.publishedOnly) params.set('published', 'true')
      if (opts.limit !== undefined) params.set('limit', String(opts.limit))
      if (opts.offset !== undefined) params.set('offset', String(opts.offset))
      if (opts.q) params.set('q', opts.q)
      const qs = params.size > 0 ? `?${params.toString()}` : ''
      const result = await api.get<PaginatedEntries>(`/api/projects/${slug}/entries${qs}`)
      if (result.ok) {
        if (opts.append) entries.value = [...entries.value, ...result.data.items]
        else entries.value = result.data.items
        total.value = result.data.total
      } else {
        error.value = result.error
      }
    } finally {
      loading.value = false
    }
  }

  async function createEntry(
    slug: string,
    payload: { title: string; body: string; tags?: string[] },
  ): Promise<Result<Entry>> {
    const result = await api.post<Entry>(`/api/projects/${slug}/entries`, payload)
    if (result.ok) {
      entries.value.unshift(result.data)
      total.value += 1
    }
    return result
  }

  async function updateEntry(
    id: string,
    payload: Partial<Pick<Entry, 'title' | 'body' | 'tags'>>,
  ): Promise<Result<Entry>> {
    const result = await api.patch<Entry>(`/api/entries/${id}`, payload)
    if (result.ok) {
      const idx = entries.value.findIndex((e) => e.id === id)
      if (idx !== -1) entries.value[idx] = result.data
    }
    return result
  }

  async function publishEntry(id: string): Promise<Result<Entry>> {
    const result = await api.post<Entry>(`/api/entries/${id}/publish`)
    if (result.ok) {
      const idx = entries.value.findIndex((e) => e.id === id)
      if (idx !== -1) entries.value[idx] = result.data
    }
    return result
  }

  async function unpublishEntry(id: string): Promise<Result<Entry>> {
    const result = await api.post<Entry>(`/api/entries/${id}/unpublish`)
    if (result.ok) {
      const idx = entries.value.findIndex((e) => e.id === id)
      if (idx !== -1) entries.value[idx] = result.data
    }
    return result
  }

  async function deleteEntry(id: string): Promise<Result<undefined>> {
    const result = await api.delete<undefined>(`/api/entries/${id}`)
    if (result.ok) {
      entries.value = entries.value.filter((e) => e.id !== id)
      total.value = Math.max(0, total.value - 1)
    }
    return result
  }

  async function duplicateEntry(id: string): Promise<Result<Entry>> {
    const result = await api.post<Entry>(`/api/entries/${id}/duplicate`)
    if (result.ok) {
      entries.value.unshift(result.data)
      total.value += 1
    }
    return result
  }

  return {
    entries: readonly(entries),
    total: readonly(total),
    loading: readonly(loading),
    error: readonly(error),
    fetchEntries,
    createEntry,
    updateEntry,
    publishEntry,
    unpublishEntry,
    deleteEntry,
    duplicateEntry,
  }
}
