<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { signIn, loading, error } = useAuth()

const email = ref('')
const password = ref('')

async function handleSubmit() {
  if (!email.value || !password.value) return
  await signIn(email.value, password.value)
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
          Sign in to your dashboard
        </span>
      </div>

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
              transition:
                border-color 150ms ease,
                box-shadow 150ms ease;
            "
            @focus="
              (e) => ((e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px var(--accent)')
            "
            @blur="(e) => ((e.target as HTMLInputElement).style.boxShadow = 'none')"
          >
        </div>

        <!-- Password -->
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
            Password
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
              transition:
                border-color 150ms ease,
                box-shadow 150ms ease;
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
          :disabled="loading || !email || !password"
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
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
        >
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>
