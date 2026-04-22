import { ref, readonly } from 'vue'
import { useRouter } from 'vue-router'
import { api } from './useApi'
import type { User } from '@changelog/types'

const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const magicLinkEnabled = ref<boolean | null>(null)

async function fetchConfig(): Promise<void> {
  if (magicLinkEnabled.value !== null) return
  const result = await api.get<{ magicLinkEnabled: boolean }>('/api/config')
  if (result.ok) magicLinkEnabled.value = result.data.magicLinkEnabled
}

export function useAuth(): {
  user: Readonly<typeof user>
  loading: Readonly<typeof loading>
  error: Readonly<typeof error>
  magicLinkEnabled: Readonly<typeof magicLinkEnabled>
  signIn: (email: string, password: string) => Promise<void>
  sendMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => Promise<void>
  fetchMe: () => Promise<
    { ok: true; data: { user: User } } | { ok: false; error: string; status: number }
  >
  fetchConfig: () => Promise<void>
} {
  const router = useRouter()

  async function fetchMe(): Promise<
    { ok: true; data: { user: User } } | { ok: false; error: string; status: number }
  > {
    const result = await api.get<{ user: User }>('/auth/me')
    if (result.ok) {
      user.value = result.data.user
    } else {
      user.value = null
    }
    return result
  }

  async function signIn(email: string, password: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const result = await api.post<{ user: User }>('/api/auth/sign-in/email', { email, password })
      if (result.ok) {
        user.value = result.data.user
        await router.push('/entries')
      } else {
        error.value = result.error
      }
    } finally {
      loading.value = false
    }
  }

  async function sendMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
    loading.value = true
    error.value = null
    try {
      const callbackURL = `${window.location.origin}/auth/callback`
      const result = await api.post('/api/auth/magic-link/send', { email, callbackURL })
      if (!result.ok) {
        error.value = result.error
        return { ok: false, error: result.error }
      }
      return { ok: true }
    } finally {
      loading.value = false
    }
  }

  async function signOut(): Promise<void> {
    await api.post('/api/auth/sign-out')
    user.value = null
    await router.push('/login')
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    magicLinkEnabled: readonly(magicLinkEnabled),
    signIn,
    sendMagicLink,
    signOut,
    fetchMe,
    fetchConfig,
  }
}
