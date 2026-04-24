import { ref, readonly } from 'vue'
import { api } from './useApi'
import type { Entry, Result } from '@changelog/types'

const entries = ref<Entry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useEntries(): {
  entries: Readonly<typeof entries>
  loading: Readonly<typeof loading>
  error: Readonly<typeof error>
  fetchEntries: (slug: string, publishedOnly?: boolean) => Promise<void>
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
  async function fetchEntries(slug: string, publishedOnly = false): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const qs = publishedOnly ? '?published=true' : ''
      const result = await api.get<Entry[]>(`/api/projects/${slug}/entries${qs}`)
      if (result.ok) {
        entries.value = result.data
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
    if (result.ok) entries.value.unshift(result.data)
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
    if (result.ok) entries.value = entries.value.filter((e) => e.id !== id)
    return result
  }

  async function duplicateEntry(id: string): Promise<Result<Entry>> {
    const result = await api.post<Entry>(`/api/entries/${id}/duplicate`)
    if (result.ok) entries.value.unshift(result.data)
    return result
  }

  return {
    entries: readonly(entries),
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
