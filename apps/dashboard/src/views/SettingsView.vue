<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import WidgetPreview from '../components/WidgetPreview.vue'
import { useProjects } from '../composables/useProjects'
import { useApiKeys } from '../composables/useApiKeys'
import type { WidgetEntry } from '@changelog/types'

const { current, updateProject, deleteProject } = useProjects()
const { keys, newKeyPlaintext, fetchKeys, generateKey, revokeKey, clearNewKey } = useApiKeys()

// Project form
const form = reactive({ name: '', description: '', accentColor: '#0a6640', slug: '' })
const saving = ref(false)
const saveOk = ref(false)

// API keys
const newKeyLabel = ref('')
const generatingKey = ref(false)
const snippetCopied = ref(false)
const keyCopied = ref(false)

// Danger zone
const deleteConfirmSlug = ref('')
const deleteModalOpen = ref(false)
const deleting = ref(false)

// Widget preview — use static sample entries for preview
const previewEntries = computed<WidgetEntry[]>(() => [
  {
    id: '1',
    title: 'Widget now supports dark mode',
    body: 'Adapts automatically to prefers-color-scheme.',
    tags: ['new'],
    publishedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Fixed RSS feed encoding',
    body: 'Special characters no longer break the XML feed.',
    tags: ['fix'],
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '3',
    title: 'Dashboard load time −60%',
    body: 'Bundle splitting and query optimisation.',
    tags: ['performance'],
    publishedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
])

const embedSnippet = computed(
  () =>
    `<script src="${window.location.origin}/widget.js"><\/script>\n<changelog-widget project-id="${current.value?.slug ?? 'your-project'}"><\/changelog-widget>`,
)

function copySnippet() {
  navigator.clipboard.writeText(embedSnippet.value).catch(() => {})
  snippetCopied.value = true
  setTimeout(() => (snippetCopied.value = false), 2000)
}

function copyKey(key: string) {
  navigator.clipboard.writeText(key).catch(() => {})
  keyCopied.value = true
  setTimeout(() => (keyCopied.value = false), 2000)
}

async function handleSave() {
  if (!current.value || saving.value) return
  saving.value = true
  try {
    await updateProject(current.value.id, {
      name: form.name,
      description: form.description || null,
      accentColor: form.accentColor,
    })
    saveOk.value = true
    setTimeout(() => (saveOk.value = false), 2000)
  } finally {
    saving.value = false
  }
}

async function handleGenerateKey() {
  if (!current.value || !newKeyLabel.value.trim() || generatingKey.value) return
  generatingKey.value = true
  try {
    await generateKey(current.value.slug, newKeyLabel.value.trim())
    newKeyLabel.value = ''
  } finally {
    generatingKey.value = false
  }
}

async function handleDelete() {
  if (!current.value || deleteConfirmSlug.value !== current.value.slug || deleting.value) return
  deleting.value = true
  try {
    await deleteProject(current.value.id)
    deleteModalOpen.value = false
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  if (current.value) {
    form.name = current.value.name
    form.description = current.value.description ?? ''
    form.accentColor = current.value.accentColor ?? '#0a6640'
    form.slug = current.value.slug
    fetchKeys(current.value.slug)
  }
})

watch(current, (p) => {
  if (p) {
    form.name = p.name
    form.description = p.description ?? ''
    form.accentColor = p.accentColor ?? '#0a6640'
    form.slug = p.slug
    fetchKeys(p.slug)
  }
})

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--bg)',
  border: '1px solid var(--border-md)',
  borderRadius: 'var(--r-sm)',
  fontSize: '14px',
  fontFamily: 'var(--font-ui)',
  color: 'var(--text)',
  outline: 'none',
}

function focusInput(e: Event) {
  ;(e.target as HTMLElement).style.boxShadow = '0 0 0 2px var(--accent)'
  ;(e.target as HTMLElement).style.borderColor = 'transparent'
}

function blurInput(e: Event) {
  ;(e.target as HTMLElement).style.boxShadow = 'none'
  ;(e.target as HTMLElement).style.borderColor = 'rgba(0,0,0,0.11)'
}
</script>

<template>
  <AppLayout>
    <!-- Top bar -->
    <div
      style="
        height: 56px;
        flex-shrink: 0;
        border-bottom: 1px solid var(--border);
        padding: 0 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--surface);
      "
    >
      <h1 style="font-size: 20px; font-weight: 600">
        Settings
      </h1>
      <div style="display: flex; align-items: center; gap: 8px">
        <span
          v-if="saveOk"
          style="font-family: var(--font-mono); font-size: 12px; color: var(--accent)"
        >✓ Saved</span>
        <button
          @click="handleSave"
          :disabled="saving"
          style="
            padding: 7px 16px;
            background: var(--text);
            color: white;
            border: none;
            border-radius: var(--r-sm);
            font-size: 13px;
            font-weight: 500;
            font-family: var(--font-ui);
            cursor: pointer;
          "
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
        >
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </div>

    <div style="flex: 1; overflow: auto; padding: 28px; max-width: 760px">
      <!-- ── Project ── -->
      <section style="margin-bottom: 36px">
        <h2 style="font-size: 15px; font-weight: 600; margin-bottom: 16px">
          Project
        </h2>

        <div style="display: flex; flex-direction: column; gap: 14px">
          <!-- Name -->
          <div>
            <label
              style="
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: var(--muted);
                margin-bottom: 5px;
              "
            >Name</label>
            <input
              v-model="form.name"
              placeholder="My App"
              :style="inputStyle"
              @focus="focusInput"
              @blur="blurInput"
            >
          </div>

          <!-- Slug (read-only display + warning) -->
          <div>
            <label
              style="
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: var(--muted);
                margin-bottom: 5px;
              "
            >Slug</label>
            <input
              :value="form.slug"
              disabled
              :style="{ ...inputStyle, opacity: '0.6', cursor: 'not-allowed' }"
            >
            <p
              style="
                font-size: 12px;
                color: var(--amber);
                margin-top: 5px;
                display: flex;
                align-items: center;
                gap: 5px;
              "
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M6 1L1 10h10L6 1z"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linejoin="round"
                />
                <path
                  d="M6 5v2.5"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                />
                <circle
                  cx="6"
                  cy="9"
                  r="0.5"
                  fill="currentColor"
                />
              </svg>
              Changing the slug breaks existing embeds. Contact support to rename.
            </p>
          </div>

          <!-- Description -->
          <div>
            <label
              style="
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: var(--muted);
                margin-bottom: 5px;
              "
            >Description</label>
            <textarea
              v-model="form.description"
              placeholder="What does this project track?"
              rows="2"
              :style="{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-ui)' }"
              @focus="focusInput"
              @blur="blurInput"
            />
          </div>

          <!-- Accent color -->
          <div>
            <label
              style="
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: var(--muted);
                margin-bottom: 5px;
              "
            >Accent color</label>
            <div style="display: flex; align-items: center; gap: 10px">
              <div
                :style="{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--r-sm)',
                  background: form.accentColor,
                  border: '1px solid var(--border-md)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }"
              >
                <input
                  type="color"
                  v-model="form.accentColor"
                  style="
                    opacity: 0;
                    position: absolute;
                    inset: 0;
                    cursor: pointer;
                    width: 100%;
                    height: 100%;
                  "
                >
              </div>
              <input
                v-model="form.accentColor"
                placeholder="#0a6640"
                :style="{
                  ...inputStyle,
                  width: '120px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                }"
                @focus="focusInput"
                @blur="blurInput"
              >
              <div style="display: flex; gap: 6px">
                <button
                  v-for="c in ['#0a6640', '#1d4ed8', '#6d28d9', '#92400e', '#be185d', '#111110']"
                  :key="c"
                  @click="form.accentColor = c"
                  :style="{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: c,
                    border:
                      form.accentColor === c ? '2px solid var(--text)' : '2px solid transparent',
                    cursor: 'pointer',
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr style="border: none; border-top: 1px solid var(--border); margin-bottom: 36px">

      <!-- ── Widget ── -->
      <section style="margin-bottom: 36px">
        <h2 style="font-size: 15px; font-weight: 600; margin-bottom: 16px">
          Widget
        </h2>

        <!-- Live preview -->
        <div style="margin-bottom: 20px">
          <WidgetPreview
            :slug="current?.slug ?? ''"
            :entries="previewEntries"
            :project-name="current?.name"
          />
        </div>

        <!-- Snippet -->
        <div style="background: #1a1a1a; border-radius: var(--r-md); overflow: hidden">
          <div
            style="
              padding: 9px 16px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.07);
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span
              style="
                font-family: var(--font-mono);
                font-size: 10px;
                color: #6b6b78;
                letter-spacing: 0.05em;
                text-transform: uppercase;
              "
            >HTML</span>
            <button
              @click="copySnippet"
              style="
                background: none;
                border: none;
                cursor: pointer;
                font-family: var(--font-mono);
                font-size: 11px;
                color: #6b6b78;
                transition: color 150ms ease;
              "
              :style="{ color: snippetCopied ? '#4ade80' : '#6b6b78' }"
            >
              {{ snippetCopied ? '✓ Copied' : 'Copy snippet' }}
            </button>
          </div>
          <div style="padding: 16px 20px; overflow-x: auto">
            <pre
              style="font-family: var(--font-mono); font-size: 13px; line-height: 1.8; margin: 0"
            ><code><span style="color:#7dd3fc;">&lt;script</span> <span style="color:#86efac;">src</span><span style="color:#e2e2e0;">=</span><span style="color:#fca5a5;">"{{ (typeof window !== 'undefined' ? window.location.origin : 'https://your-instance.com') }}/widget.js"</span><span style="color:#7dd3fc;">&gt;&lt;/script&gt;</span>
<span style="color:#7dd3fc;">&lt;changelog-widget</span> <span style="color:#86efac;">project-id</span><span style="color:#e2e2e0;">=</span><span style="color:#fca5a5;">"{{ current?.slug ?? 'your-project' }}"</span><span style="color:#7dd3fc;">&gt;&lt;/changelog-widget&gt;</span></code></pre>
          </div>
        </div>
      </section>

      <hr style="border: none; border-top: 1px solid var(--border); margin-bottom: 36px">

      <!-- ── API Keys ── -->
      <section style="margin-bottom: 36px">
        <h2 style="font-size: 15px; font-weight: 600; margin-bottom: 16px">
          API Keys
        </h2>

        <!-- New key plaintext banner -->
        <div
          v-if="newKeyPlaintext"
          style="
            background: var(--accent-lt);
            border: 1px solid var(--accent-bg);
            border-radius: var(--r-md);
            padding: 14px 16px;
            margin-bottom: 16px;
          "
        >
          <p
            style="
              font-size: 13px;
              font-weight: 500;
              color: var(--accent);
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M7 1.5L12 4v6l-5 2.5L2 10V4L7 1.5z"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linejoin="round"
              />
            </svg>
            New key generated — copy it now. This key will not be shown again.
          </p>
          <div style="display: flex; align-items: center; gap: 8px">
            <code
              style="
                flex: 1;
                font-family: var(--font-mono);
                font-size: 12px;
                background: var(--surface);
                border: 1px solid var(--border-md);
                border-radius: var(--r-sm);
                padding: 7px 12px;
                color: var(--text);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              "
            >{{ newKeyPlaintext }}</code>
            <button
              @click="copyKey(newKeyPlaintext!)"
              style="
                padding: 7px 12px;
                background: var(--accent);
                color: white;
                border: none;
                border-radius: var(--r-sm);
                font-size: 12px;
                font-family: var(--font-ui);
                cursor: pointer;
                white-space: nowrap;
              "
            >
              {{ keyCopied ? '✓ Copied' : 'Copy' }}
            </button>
            <button
              @click="clearNewKey"
              style="
                padding: 7px;
                background: none;
                border: none;
                cursor: pointer;
                color: var(--muted);
              "
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
              >
                <path
                  d="M2 2l9 9M11 2L2 11"
                  stroke="currentColor"
                  stroke-width="1.3"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Keys table -->
        <div
          v-if="keys.length"
          style="
            background: var(--surface);
            border-radius: var(--r-md);
            box-shadow: var(--sh-sm);
            overflow: hidden;
            margin-bottom: 14px;
          "
        >
          <table style="width: 100%; border-collapse: collapse">
            <thead>
              <tr style="background: var(--bg2)">
                <th
                  style="
                    padding: 9px 14px;
                    text-align: left;
                    font-family: var(--font-mono);
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--dimmed);
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    border-bottom: 1px solid var(--border);
                  "
                >
                  Label
                </th>
                <th
                  style="
                    padding: 9px 14px;
                    text-align: left;
                    font-family: var(--font-mono);
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--dimmed);
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    border-bottom: 1px solid var(--border);
                    white-space: nowrap;
                  "
                >
                  Created
                </th>
                <th
                  style="
                    padding: 9px 14px;
                    text-align: left;
                    font-family: var(--font-mono);
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--dimmed);
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    border-bottom: 1px solid var(--border);
                    white-space: nowrap;
                  "
                >
                  Last used
                </th>
                <th
                  style="padding: 9px 14px; border-bottom: 1px solid var(--border); width: 60px"
                />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(key, idx) in keys"
                :key="key.id"
                :style="{
                  borderBottom: idx < keys.length - 1 ? '1px solid var(--border)' : 'none',
                }"
              >
                <td
                  style="padding: 12px 14px; font-size: 13px; font-weight: 500; color: var(--text)"
                >
                  {{ key.label }}
                </td>
                <td
                  style="
                    padding: 12px 14px;
                    font-family: var(--font-mono);
                    font-size: 11px;
                    color: var(--dimmed);
                    white-space: nowrap;
                  "
                >
                  {{ new Date(key.createdAt).toLocaleDateString() }}
                </td>
                <td
                  style="
                    padding: 12px 14px;
                    font-family: var(--font-mono);
                    font-size: 11px;
                    color: var(--dimmed);
                    white-space: nowrap;
                  "
                >
                  {{ key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : '—' }}
                </td>
                <td style="padding: 12px 14px; text-align: right">
                  <button
                    @click="revokeKey(key.id)"
                    style="
                      font-size: 12px;
                      color: var(--red);
                      background: none;
                      border: none;
                      cursor: pointer;
                      font-family: var(--font-ui);
                    "
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Generate new key -->
        <div style="display: flex; gap: 8px; align-items: center">
          <input
            v-model="newKeyLabel"
            placeholder="Key label, e.g. CI/CD"
            @keydown.enter="handleGenerateKey"
            :style="{ ...inputStyle, flex: '1' }"
            @focus="focusInput"
            @blur="blurInput"
          >
          <button
            @click="handleGenerateKey"
            :disabled="!newKeyLabel.trim() || generatingKey"
            style="
              padding: 9px 14px;
              background: var(--text);
              color: white;
              border: none;
              border-radius: var(--r-sm);
              font-size: 13px;
              font-weight: 500;
              font-family: var(--font-ui);
              cursor: pointer;
              white-space: nowrap;
            "
          >
            {{ generatingKey ? 'Generating…' : 'Generate key' }}
          </button>
        </div>
      </section>

      <hr style="border: none; border-top: 1px solid var(--border); margin-bottom: 36px">

      <!-- ── Danger zone ── -->
      <section style="margin-bottom: 40px">
        <h2 style="font-size: 15px; font-weight: 600; margin-bottom: 16px; color: var(--red)">
          Danger zone
        </h2>
        <div
          style="
            background: var(--red-bg);
            border-radius: var(--r-md);
            border-bottom: 1px solid rgba(185, 28, 28, 0.15);
            padding: 18px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          "
        >
          <div>
            <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px">
              Delete project
            </div>
            <div style="font-size: 12px; color: var(--red); opacity: 0.8">
              Permanently delete this project and all its entries. This cannot be undone.
            </div>
          </div>
          <button
            @click="deleteModalOpen = true"
            style="
              padding: 7px 14px;
              background: var(--red);
              color: white;
              border: none;
              border-radius: var(--r-sm);
              font-size: 13px;
              font-weight: 500;
              font-family: var(--font-ui);
              cursor: pointer;
              white-space: nowrap;
              flex-shrink: 0;
            "
          >
            Delete project
          </button>
        </div>
      </section>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div
        v-if="deleteModalOpen"
        style="
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        "
      >
        <div
          style="
            background: var(--surface);
            border-radius: var(--r-xl);
            box-shadow: var(--sh-xl);
            padding: 28px;
            max-width: 400px;
            width: 100%;
          "
        >
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px">
            Delete project?
          </h3>
          <p style="font-size: 13px; color: var(--muted); margin-bottom: 18px; line-height: 1.6">
            This will permanently delete <strong>{{ current?.name }}</strong> and all its entries.
            Type the project slug to confirm.
          </p>
          <input
            v-model="deleteConfirmSlug"
            :placeholder="current?.slug"
            :style="{ ...inputStyle, marginBottom: '14px', fontFamily: 'var(--font-mono)' }"
            @focus="focusInput"
            @blur="blurInput"
          >
          <div style="display: flex; gap: 8px; justify-content: flex-end">
            <button
              @click="
                () => {
                  deleteModalOpen = false
                  deleteConfirmSlug = ''
                }
              "
              style="
                padding: 8px 16px;
                background: none;
                border: 1px solid var(--border-md);
                border-radius: var(--r-sm);
                font-size: 13px;
                font-family: var(--font-ui);
                cursor: pointer;
                color: var(--muted);
              "
            >
              Cancel
            </button>
            <button
              @click="handleDelete"
              :disabled="deleteConfirmSlug !== current?.slug || deleting"
              style="
                padding: 8px 16px;
                background: var(--red);
                color: white;
                border: none;
                border-radius: var(--r-sm);
                font-size: 13px;
                font-weight: 500;
                font-family: var(--font-ui);
                cursor: pointer;
              "
            >
              {{ deleting ? 'Deleting…' : 'Delete permanently' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
