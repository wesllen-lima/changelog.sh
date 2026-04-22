<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjects } from '../composables/useProjects'

const router = useRouter()
const { createProject } = useProjects()

const step = ref<1 | 2>(1)
const projectName = ref('')
const creating = ref(false)
const error = ref<string | null>(null)
const createdSlug = ref('')

async function handleCreate() {
  if (!projectName.value.trim() || creating.value) return
  creating.value = true
  error.value = null
  try {
    const result = await createProject({ name: projectName.value.trim() })
    if (result.ok) {
      createdSlug.value = result.data.slug
      step.value = 2
    } else {
      error.value = result.error
    }
  } finally {
    creating.value = false
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
    <div style="width: 100%; max-width: 480px">
      <!-- Logo -->
      <div
        style="
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 48px;
          justify-content: center;
        "
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
        >
          <rect
            width="28"
            height="28"
            rx="7"
            fill="#111110"
          />
          <rect
            x="7"
            y="9"
            width="7"
            height="2"
            rx="1"
            fill="white"
          />
          <rect
            x="7"
            y="13"
            width="13"
            height="2"
            rx="1"
            fill="white"
          />
          <rect
            x="7"
            y="17"
            width="10"
            height="2"
            rx="1"
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
        >changelog.sh</span>
      </div>

      <!-- Step 1 — Create project -->
      <div v-if="step === 1">
        <div style="text-align: center; margin-bottom: 40px">
          <h1
            style="
              font-size: 26px;
              font-weight: 600;
              color: var(--text);
              margin-bottom: 10px;
              font-family: var(--font-ui);
            "
          >
            Bem-vindo ao changelog.sh
          </h1>
          <p style="font-size: 14px; color: var(--muted); line-height: 1.6">
            Vamos criar seu primeiro projeto. É o namespace do seu changelog — aparece na URL
            pública e no snippet de embed.
          </p>
        </div>

        <!-- Step indicator -->
        <div
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
            margin-bottom: 32px;
          "
        >
          <div
            style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--text);
              color: white;
              font-size: 11px;
              font-family: var(--font-mono);
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            1
          </div>
          <div style="width: 32px; height: 1px; background: var(--border-md)" />
          <div
            style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--bg3);
              color: var(--dimmed);
              font-size: 11px;
              font-family: var(--font-mono);
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            2
          </div>
          <span
            style="
              font-size: 12px;
              color: var(--dimmed);
              font-family: var(--font-mono);
              margin-left: 4px;
            "
          >Criar projeto</span>
        </div>

        <div
          style="
            background: var(--surface);
            border-radius: var(--r-xl);
            box-shadow: var(--sh-md);
            padding: 32px;
          "
        >
          <div style="margin-bottom: 20px">
            <label
              style="
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: var(--muted);
                margin-bottom: 6px;
              "
            >Nome do projeto</label>
            <input
              v-model="projectName"
              placeholder="Meu App"
              @keydown.enter="handleCreate"
              style="
                width: 100%;
                padding: 10px 14px;
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
            <div
              v-if="projectName.trim()"
              style="
                margin-top: 6px;
                font-family: var(--font-mono);
                font-size: 11px;
                color: var(--dimmed);
              "
            >
              URL pública:
              <span style="color: var(--accent)">localhost:3456/{{ projectName.trim().toLowerCase().replace(/\s+/g, '-') }}</span>
            </div>
          </div>

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

          <button
            @click="handleCreate"
            :disabled="!projectName.trim() || creating"
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
            "
            :style="{
              opacity: !projectName.trim() || creating ? '0.4' : '1',
              cursor: !projectName.trim() || creating ? 'not-allowed' : 'pointer',
            }"
            @mouseover="
              (e) => {
                if (projectName.trim() && !creating)
                  (e.currentTarget as HTMLElement).style.opacity = '0.87'
              }
            "
            @mouseleave="
              (e) => {
                if (projectName.trim() && !creating)
                  (e.currentTarget as HTMLElement).style.opacity = '1'
              }
            "
          >
            {{ creating ? 'Criando…' : 'Criar projeto →' }}
          </button>
        </div>
      </div>

      <!-- Step 2 — First entry -->
      <div v-else>
        <div style="text-align: center; margin-bottom: 40px">
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
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M11 4v14M4 11h14"
                stroke="var(--accent)"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <h1
            style="
              font-size: 26px;
              font-weight: 600;
              color: var(--text);
              margin-bottom: 10px;
              font-family: var(--font-ui);
            "
          >
            Projeto criado!
          </h1>
          <p style="font-size: 14px; color: var(--muted); line-height: 1.6">
            Seu changelog está em
            <a
              :href="`http://localhost:3456/${createdSlug}`"
              target="_blank"
              style="color: var(--accent); font-family: var(--font-mono); font-size: 13px"
            >localhost:3456/{{ createdSlug }}</a>. Agora escreva sua primeira entry para ele aparecer lá.
          </p>
        </div>

        <!-- Step indicator -->
        <div
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
            margin-bottom: 32px;
          "
        >
          <div
            style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--accent-bg);
              border: 1.5px solid var(--accent);
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2.5 6l2.5 2.5 4.5-5"
                stroke="var(--accent)"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div style="width: 32px; height: 1px; background: var(--accent)" />
          <div
            style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--text);
              color: white;
              font-size: 11px;
              font-family: var(--font-mono);
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            2
          </div>
          <span
            style="
              font-size: 12px;
              color: var(--dimmed);
              font-family: var(--font-mono);
              margin-left: 4px;
            "
          >Primeira entry</span>
        </div>

        <div
          style="
            background: var(--surface);
            border-radius: var(--r-xl);
            box-shadow: var(--sh-md);
            padding: 32px;
          "
        >
          <!-- What a good entry looks like -->
          <div
            style="
              background: var(--bg);
              border-radius: var(--r-md);
              border: 1px solid var(--border-md);
              padding: 16px;
              margin-bottom: 24px;
            "
          >
            <div
              style="
                font-family: var(--font-mono);
                font-size: 10px;
                color: var(--dimmed);
                text-transform: uppercase;
                letter-spacing: 0.06em;
                margin-bottom: 10px;
              "
            >
              Exemplo de entry
            </div>
            <div style="font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 4px">
              Lançamento inicial — v1.0
            </div>
            <div style="font-size: 12px; color: var(--muted); line-height: 1.6">
              ## O que há de novo<br>
              Primeira versão pública do projeto. Inclui autenticação, dashboard e widget
              embeddável.
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px">
            <button
              @click="router.push('/entries/new')"
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
              "
              @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
              @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
            >
              Escrever primeira entry →
            </button>
            <button
              @click="router.push('/entries')"
              style="
                width: 100%;
                padding: 11px;
                background: none;
                color: var(--muted);
                border: 1px solid var(--border-md);
                border-radius: var(--r-sm);
                font-size: 13px;
                font-family: var(--font-ui);
                cursor: pointer;
              "
              @mouseover="
                (e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-dk)')
              "
              @mouseleave="
                (e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-md)')
              "
            >
              Ir para o dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
