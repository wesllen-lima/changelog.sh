<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { signIn, sendMagicLink, loading, error, magicLinkEnabled, fetchConfig } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
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
  <div style="display: flex; min-height: 100vh; background: var(--bg)">
    <!-- Left — brand panel -->
    <div
      style="
        flex: 0 0 52%;
        background: #0d0d0c;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 48px;
        overflow: hidden;
        position: relative;
      "
    >
      <!-- Radial glow -->
      <div
        style="
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse 60% 40% at 30% 60%,
              rgba(10, 102, 64, 0.22) 0%,
              transparent 70%
            ),
            radial-gradient(ellipse 40% 30% at 70% 20%, rgba(10, 102, 64, 0.1) 0%, transparent 70%);
        "
      />

      <!-- Logo -->
      <div
        style="
          display: flex;
          align-items: center;
          gap: 10px;
          animation: fadeUp 400ms var(--ease-spring) both;
        "
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 20 20"
          fill="none"
        >
          <rect
            width="20"
            height="20"
            rx="5"
            fill="white"
          />
          <rect
            x="5"
            y="6.5"
            width="5"
            height="1.5"
            rx="0.75"
            fill="#0d0d0c"
          />
          <rect
            x="5"
            y="9.5"
            width="9"
            height="1.5"
            rx="0.75"
            fill="#0d0d0c"
          />
          <rect
            x="5"
            y="12.5"
            width="7"
            height="1.5"
            rx="0.75"
            fill="#0d0d0c"
          />
        </svg>
        <span
          style="font-family: var(--font-mono); font-size: 14px; font-weight: 500; color: white"
        >
          changelog.sh
        </span>
      </div>

      <!-- Headline + preview -->
      <div>
        <p
          style="
            font-family: var(--font-display);
            font-size: 36px;
            line-height: 1.2;
            color: white;
            margin-bottom: 16px;
            animation: fadeUp 400ms 80ms var(--ease-spring) both;
          "
        >
          Keep your users<br>in the loop,<br>
          <em style="color: rgba(255, 255, 255, 0.55); font-style: italic">effortlessly.</em>
        </p>
        <p
          style="
            font-size: 14px;
            color: rgba(255, 255, 255, 0.45);
            line-height: 1.65;
            max-width: 340px;
            animation: fadeUp 400ms 140ms var(--ease-spring) both;
          "
        >
          Changelog self-hosted. One Docker command, one script tag. No accounts, no vendor lock-in.
        </p>

        <!-- Fake changelog preview -->
        <div
          style="
            margin-top: 32px;
            background: rgba(255, 255, 255, 0.055);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--r-lg);
            overflow: hidden;
            animation: fadeUp 400ms 200ms var(--ease-spring) both;
          "
        >
          <div
            style="
              padding: 12px 16px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <span
              style="
                font-family: var(--font-mono);
                font-size: 11px;
                color: rgba(255, 255, 255, 0.4);
              "
            >
              acme-app
            </span>
            <span
              style="
                font-family: var(--font-mono);
                font-size: 10px;
                font-weight: 500;
                background: rgba(10, 102, 64, 0.5);
                color: #6ee7b7;
                border-radius: 99px;
                padding: 2px 8px;
              "
            >What's new</span>
          </div>
          <div
            v-for="(entry, i) in [
              { tag: 'new', title: 'Dark mode support', date: 'Today' },
              { tag: 'fix', title: 'RSS feed encoding fixed', date: '5d ago' },
              { tag: 'performance', title: 'Dashboard load time −60%', date: '12d ago' },
            ]"
            :key="i"
            :style="{
              padding: '11px 16px',
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: `fadeUp 300ms ${200 + i * 80}ms var(--ease-spring) both`,
            }"
          >
            <span
              :style="{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                fontWeight: '500',
                borderRadius: '99px',
                padding: '2px 7px',
                flexShrink: '0',
                background:
                  entry.tag === 'new'
                    ? 'rgba(10,102,64,.45)'
                    : entry.tag === 'fix'
                      ? 'rgba(185,28,28,.4)'
                      : 'rgba(146,64,14,.45)',
                color:
                  entry.tag === 'new' ? '#6ee7b7' : entry.tag === 'fix' ? '#fca5a5' : '#fcd34d',
              }"
            >{{ entry.tag }}</span>
            <span style="font-size: 13px; color: rgba(255, 255, 255, 0.75); flex: 1">{{
              entry.title
            }}</span>
            <span
              style="
                font-family: var(--font-mono);
                font-size: 10px;
                color: rgba(255, 255, 255, 0.25);
              "
            >{{ entry.date }}</span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div style="display: flex; gap: 24px; animation: fadeUp 400ms 280ms var(--ease-spring) both">
        <span
          v-for="s in ['MIT License', 'SQLite', '< 4 kb widget']"
          :key="s"
          style="font-family: var(--font-mono); font-size: 11px; color: rgba(255, 255, 255, 0.28)"
        >{{ s }}</span>
      </div>
    </div>

    <!-- Right — form panel -->
    <div
      style="
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 40px;
      "
    >
      <div style="width: 100%; max-width: 360px">
        <!-- Magic link sent -->
        <div
          v-if="magicLinkSent"
          style="text-align: center; animation: fadeUp 300ms var(--ease-spring) both"
        >
          <div
            style="
              width: 56px;
              height: 56px;
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
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 8px">
            Verifique seu email
          </h2>
          <p style="font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 8px">
            Link enviado para <strong style="color: var(--text)">{{ email }}</strong>
          </p>
          <p style="font-size: 12px; color: var(--dimmed); margin-bottom: 28px">
            Expira em 5 minutos.
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
          <h2
            style="
              font-size: 22px;
              font-weight: 600;
              color: var(--text);
              margin-bottom: 6px;
              animation: fadeUp 300ms var(--ease-spring) both;
            "
          >
            Bem-vindo de volta
          </h2>
          <p
            style="
              font-size: 13px;
              color: var(--muted);
              margin-bottom: 28px;
              animation: fadeUp 300ms 60ms var(--ease-spring) both;
            "
          >
            {{
              magicLinkEnabled
                ? 'Insira seu email para receber um link de acesso.'
                : 'Insira suas credenciais para continuar.'
            }}
          </p>

          <!-- Error -->
          <div
            v-if="error"
            style="
              background: var(--red-bg);
              color: var(--red);
              border: 1px solid var(--red-border);
              border-radius: var(--r-sm);
              padding: 10px 14px;
              font-size: 13px;
              margin-bottom: 16px;
              display: flex;
              gap: 8px;
              align-items: center;
            "
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="7"
                cy="7"
                r="6"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <path
                d="M7 4.5v3M7 9.5v.3"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
            {{ error }}
          </div>

          <form
            @submit.prevent="handleSubmit"
            style="
              display: flex;
              flex-direction: column;
              gap: 14px;
              animation: fadeUp 300ms 80ms var(--ease-spring) both;
            "
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
                  padding: 10px 13px;
                  background: var(--surface);
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

            <div v-if="magicLinkEnabled === false">
              <label
                style="
                  display: block;
                  font-size: 12px;
                  font-weight: 500;
                  color: var(--muted);
                  margin-bottom: 6px;
                "
              >
                Senha
              </label>
              <div style="position: relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="••••••••"
                  style="
                    width: 100%;
                    padding: 10px 40px 10px 13px;
                    background: var(--surface);
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

            <button
              type="submit"
              :disabled="loading || !email || (magicLinkEnabled === false && !password)"
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
              <!-- Spinner -->
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
              <span v-if="loading">{{ magicLinkEnabled ? 'Enviando…' : 'Entrando…' }}</span>
              <span v-else-if="magicLinkEnabled">Enviar link de acesso</span>
              <span v-else-if="magicLinkEnabled === false">Entrar</span>
              <span v-else>Carregando…</span>
            </button>
          </form>

          <p
            v-if="magicLinkEnabled"
            style="margin-top: 16px; text-align: center; font-size: 12px; color: var(--dimmed)"
          >
            Sem senha — um link é enviado para seu email.
          </p>
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
