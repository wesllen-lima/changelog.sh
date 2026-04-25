import { ref, readonly } from 'vue'
import { api } from './useApi'
import type { ApiKey, Result } from '@changelog/types'

const keys = ref<ApiKey[]>([])
const newKeyPlaintext = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useApiKeys(): {
  keys: Readonly<typeof keys>
  newKeyPlaintext: Readonly<typeof newKeyPlaintext>
  loading: Readonly<typeof loading>
  error: Readonly<typeof error>
  fetchKeys: (slug: string) => Promise<void>
  generateKey: (slug: string, label: string) => Promise<Result<{ key: string } & ApiKey>>
  revokeKey: (id: string) => Promise<Result<undefined>>
  rotateKey: (id: string) => Promise<Result<{ key: string } & ApiKey>>
  clearNewKey: () => void
} {
  async function fetchKeys(slug: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const result = await api.get<ApiKey[]>(`/api/projects/${slug}/keys`)
      if (result.ok) keys.value = result.data
      else error.value = result.error
    } finally {
      loading.value = false
    }
  }

  async function generateKey(
    slug: string,
    label: string,
  ): Promise<Result<{ key: string } & ApiKey>> {
    const result = await api.post<{ key: string } & ApiKey>(`/api/projects/${slug}/keys`, { label })
    if (result.ok) {
      newKeyPlaintext.value = result.data.key
      keys.value.push(result.data)
    }
    return result
  }

  async function revokeKey(id: string): Promise<Result<undefined>> {
    const result = await api.delete<undefined>(`/api/keys/${id}`)
    if (result.ok) keys.value = keys.value.filter((k) => k.id !== id)
    return result
  }

  async function rotateKey(id: string): Promise<Result<{ key: string } & ApiKey>> {
    const result = await api.post<{ key: string } & ApiKey>(`/api/keys/${id}/rotate`)
    if (result.ok) {
      keys.value = keys.value.filter((k) => k.id !== id)
      keys.value.push(result.data)
      newKeyPlaintext.value = result.data.key
    }
    return result
  }

  function clearNewKey(): void {
    newKeyPlaintext.value = null
  }

  return {
    keys: readonly(keys),
    newKeyPlaintext: readonly(newKeyPlaintext),
    loading: readonly(loading),
    error: readonly(error),
    fetchKeys,
    generateKey,
    revokeKey,
    rotateKey,
    clearNewKey,
  }
}
