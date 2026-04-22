<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { signIn, sendMagicLink, loading, error, magicLinkEnabled, fetchConfig } = useAuth()

const email = ref('')
const password = ref('')
const magicLinkSent = ref(false)

onMounted(fetchConfig)

async function handleSubmit() {
  if (magicLinkEnabled.value) {
    if (!email.value) return
    const result = await sendMagicLink(email.value)
    if (result.ok) magicLinkSent.value = true
  } else {
    if (!email.value || !password.value) return
    await signIn(email.value, password.value)
  }
}
</script>

<template>
  <div
    style="
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    "
  >
    <div
      style="
        width: 100%;
        max-width: 380px;
        background: var(--surface);
        border-radius: var(--r-xl);
        box-shadow: var(--sh-md);
        padding: 32px;
      "
    >
      <!-- Logo -->
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
        "
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
        >
          <rect
            width="36"
            height="36"
            rx="9"
            fill="#111110"
          />
          <rect
            x="9"
            y="12"
            width="9"
            height="2.5"
            rx="1.25"
            fill="white"
          />
          <rect
            x="9"
            y="17"
            width="16"
            height="2.5"
            rx="1.25"
            fill="white"
          />
          <rect
            x="9"
            y="22"
            width="13"
            height="2.5"
            rx="1.25"
            fill="white"
          />
        </svg>
        <span
          style="
            font-family: var(--font-mono);
            font-size: 15px;
            font-weight: 500;
            color: var(--text);
          "
        >
          changelog.sh
        </span>
        <span style="font-size: 13px; color: var(--muted); margin-top: 2px">
          {{ magicLinkSent ? 'Verifique seu email' : 'Entrar no dashboard' }}
        </span>
      </div>

      <!-- Magic link sent state -->
      <div
        v-if="magicLinkSent"
        style="text-align: center"
      >
        <div
          style="
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: var(--accent-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
          "
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              stroke="var(--accent)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <p style="font-size: 14px; color: var(--text); font-weight: 500; margin-bottom: 8px">
          Link enviado para {{ email }}
        </p>
        <p style="font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 24px">
          Clique no link no email para entrar. Ele expira em 5 minutos.
        </p>
        <button
          @click="magicLinkSent = false"
          style="
            background: none;
            border: none;
            cursor: pointer;
            color: var(--accent);
            font-size: 13px;
            font-weight: 500;
            font-family: var(--font-ui);
          "
        >
          Usar outro email
        </button>
      </div>

      <!-- Login form -->
      <div v-else>
        <!-- Error banner -->
        <div
          v-if="error"
          style="
            background: var(--red-bg);
            color: var(--red);
            border-radius: var(--r-sm);
            padding: 10px 14px;
            font-size: 13px;
            margin-bottom: 16px;
            border: 1px solid rgba(185, 28, 28, 0.15);
          "
        >
          {{ error }}
        </div>

        <form
          @submit.prevent="handleSubmit"
          style="display: flex; flex-direction: column; gap: 12px"
        >
          <!-- Email -->
          <div>
            <label
              style="
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: var(--muted);
                margin-bottom: 5px;
              "
            >
              Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="admin@example.com"
              style="
                width: 100%;
                padding: 9px 12px;
                background: var(--bg);
                border: 1px solid var(--border-md);
                border-radius: var(--r-sm);
                font-size: 14px;
                font-family: var(--font-ui);
                color: var(--text);
                outline: none;
              "
              @focus="
                (e) => ((e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px var(--accent)')
              "
              @blur="(e) => ((e.target as HTMLInputElement).style.boxShadow = 'none')"
            >
          </div>

          <!-- Password — only shown when magic link is disabled -->
          <div v-if="magicLinkEnabled === false">
            <label
              style="
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: var(--muted);
                margin-bottom: 5px;
              "
            >
              Senha
            </label>
            <input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              style="
                width: 100%;
                padding: 9px 12px;
                background: var(--bg);
                border: 1px solid var(--border-md);
                border-radius: var(--r-sm);
                font-size: 14px;
                font-family: var(--font-ui);
                color: var(--text);
                outline: none;
              "
              @focus="
                (e) => ((e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px var(--accent)')
              "
              @blur="(e) => ((e.target as HTMLInputElement).style.boxShadow = 'none')"
            >
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading || !email || (magicLinkEnabled === false && !password)"
            style="
              width: 100%;
              padding: 10px;
              background: var(--text);
              color: white;
              border: none;
              border-radius: var(--r-sm);
              font-size: 14px;
              font-weight: 500;
              font-family: var(--font-ui);
              cursor: pointer;
              margin-top: 4px;
            "
            :style="{
              opacity: loading || !email || (magicLinkEnabled === false && !password) ? '0.4' : '1',
              cursor:
                loading || !email || (magicLinkEnabled === false && !password)
                  ? 'not-allowed'
                  : 'pointer',
            }"
            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
          >
            <span v-if="loading">{{ magicLinkEnabled ? 'Enviando…' : 'Entrando…' }}</span>
            <span v-else-if="magicLinkEnabled">Enviar link de acesso</span>
            <span v-else-if="magicLinkEnabled === false">Entrar</span>
            <span v-else>Carregando…</span>
          </button>
        </form>

        <!-- Mode indicator -->
        <div
          v-if="magicLinkEnabled"
          style="margin-top: 16px; text-align: center"
        >
          <span style="font-size: 12px; color: var(--dimmed)">
            Sem senha. Um link é enviado para seu email.
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
