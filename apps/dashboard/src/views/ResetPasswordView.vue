<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { resetPassword, loading, error } = useAuth()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const done = ref(false)
const localError = ref<string | null>(null)

onMounted(() => {
  const t = route.query.token
  if (typeof t === 'string') token.value = t
})

async function handleSubmit(): Promise<void> {
  localError.value = null
  if (newPassword.value.length < 8) {
    localError.value = 'A senha deve ter no mínimo 8 caracteres.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    localError.value = 'As senhas não coincidem.'
    return
  }
  if (!token.value) {
    localError.value = 'Token inválido ou expirado. Solicite um novo link.'
    return
  }
  const result = await resetPassword(token.value, newPassword.value)
  if (result.ok) {
    done.value = true
    setTimeout(() => router.push('/login'), 3000)
  }
}
</script>

<template>
  <div
    style="
      display: flex;
      min-height: 100vh;
      background: var(--bg);
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    "
  >
    <div style="width: 100%; max-width: 360px">
      <!-- Logo -->
      <div
        style="
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          margin-bottom: 32px;
        "
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <rect
            width="20"
            height="20"
            rx="5"
            fill="#111110"
          />
          <rect
            x="5"
            y="6.5"
            width="5"
            height="1.5"
            rx="0.75"
            fill="white"
          />
          <rect
            x="5"
            y="9.5"
            width="9"
            height="1.5"
            rx="0.75"
            fill="white"
          />
          <rect
            x="5"
            y="12.5"
            width="7"
            height="1.5"
            rx="0.75"
            fill="white"
          />
        </svg>
        <span style="font-family: var(--font-mono); font-size: 13px; font-weight: 500">
          changelog.sh
        </span>
      </div>

      <div
        style="
          background: var(--surface);
          border-radius: var(--r-xl);
          box-shadow: var(--sh-md);
          padding: 32px;
        "
      >
        <!-- Success -->
        <div
          v-if="done"
          style="text-align: center"
        >
          <div
            style="
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: var(--accent-bg);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px;
            "
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="var(--accent)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 8px">
            Senha redefinida!
          </h2>
          <p style="font-size: 13px; color: var(--muted); line-height: 1.6">
            Sua senha foi alterada com sucesso. Redirecionando para o login…
          </p>
        </div>

        <!-- Form -->
        <div v-else>
          <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 6px">
            Nova senha
          </h2>
          <p style="font-size: 13px; color: var(--muted); margin-bottom: 24px; line-height: 1.6">
            Escolha uma senha com no mínimo 8 caracteres.
          </p>

          <div
            v-if="localError || error"
            style="
              background: var(--red-bg);
              color: var(--red);
              border-radius: var(--r-sm);
              padding: 10px 14px;
              font-size: 13px;
              margin-bottom: 16px;
            "
          >
            {{ localError ?? error }}
          </div>

          <form
            @submit.prevent="handleSubmit"
            style="display: flex; flex-direction: column; gap: 14px"
          >
            <div>
              <label
                style="
                  display: block;
                  font-size: 12px;
                  font-weight: 500;
                  color: var(--muted);
                  margin-bottom: 6px;
                "
              >
                Nova senha
              </label>
              <div style="position: relative">
                <input
                  v-model="newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  placeholder="••••••••"
                  style="
                    width: 100%;
                    padding: 10px 40px 10px 13px;
                    background: var(--bg);
                    border: 1px solid var(--border-md);
                    border-radius: var(--r-sm);
                    font-size: 14px;
                    font-family: var(--font-ui);
                    color: var(--text);
                    outline: none;
                    transition:
                      border-color 120ms,
                      box-shadow 120ms;
                  "
                  @focus="
                    (e) => {
                      ;(e.target as HTMLInputElement).style.borderColor = 'var(--accent)'
                      ;(e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px var(--accent-bg)'
                    }
                  "
                  @blur="
                    (e) => {
                      ;(e.target as HTMLInputElement).style.borderColor = 'var(--border-md)'
                      ;(e.target as HTMLInputElement).style.boxShadow = 'none'
                    }
                  "
                >
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  style="
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--dimmed);
                    padding: 2px;
                  "
                >
                  <svg
                    v-if="showPassword"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                  <svg
                    v-else
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label
                style="
                  display: block;
                  font-size: 12px;
                  font-weight: 500;
                  color: var(--muted);
                  margin-bottom: 6px;
                "
              >
                Confirmar senha
              </label>
              <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                style="
                  width: 100%;
                  padding: 10px 13px;
                  background: var(--bg);
                  border: 1px solid var(--border-md);
                  border-radius: var(--r-sm);
                  font-size: 14px;
                  font-family: var(--font-ui);
                  color: var(--text);
                  outline: none;
                  transition:
                    border-color 120ms,
                    box-shadow 120ms;
                "
                @focus="
                  (e) => {
                    ;(e.target as HTMLInputElement).style.borderColor = 'var(--accent)'
                    ;(e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px var(--accent-bg)'
                  }
                "
                @blur="
                  (e) => {
                    ;(e.target as HTMLInputElement).style.borderColor = 'var(--border-md)'
                    ;(e.target as HTMLInputElement).style.boxShadow = 'none'
                  }
                "
              >
            </div>

            <button
              type="submit"
              :disabled="loading || !newPassword || !confirmPassword"
              style="
                width: 100%;
                padding: 11px;
                background: var(--text);
                color: white;
                border: none;
                border-radius: var(--r-sm);
                font-size: 14px;
                font-weight: 500;
                font-family: var(--font-ui);
                cursor: pointer;
                margin-top: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              "
              @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
              @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
            >
              <svg
                v-if="loading"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style="animation: spin 700ms linear infinite"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="rgba(255,255,255,.3)"
                  stroke-width="1.5"
                />
                <path
                  d="M7 1.5A5.5 5.5 0 0112.5 7"
                  stroke="white"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              <span>{{ loading ? 'Salvando…' : 'Redefinir senha' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
