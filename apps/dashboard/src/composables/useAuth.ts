import { ref, readonly } from 'vue'
import { useRouter } from 'vue-router'
import { api } from './useApi'
import type { User } from '@changelog/types'

const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useAuth(): {
  user: Readonly<typeof user>
  loading: Readonly<typeof loading>
  error: Readonly<typeof error>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchMe: () => Promise<
    { ok: true; data: { user: User } } | { ok: false; error: string; status: number }
  >
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
      const result = await api.post<{ user: User }>('/auth/sign-in/email', { email, password })
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

  async function signOut(): Promise<void> {
    await api.post('/auth/sign-out')
    user.value = null
    await router.push('/login')
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    signIn,
    signOut,
    fetchMe,
  }
}
