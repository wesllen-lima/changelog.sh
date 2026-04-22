<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import TagPill from '../components/TagPill.vue'
import { useEntries } from '../composables/useEntries'
import { useProjects } from '../composables/useProjects'

const route = useRoute()
const router = useRouter()
const { entries, fetchEntries, createEntry, updateEntry, publishEntry } = useEntries()
const { current } = useProjects()

const isNew = computed(() => route.params.id === 'new')

const title = ref('')
const body = ref('')
const tags = ref<string[]>([])
const entryId = ref<string | null>(null)
const saving = ref(false)
const publishing = ref(false)
const saved = ref(false)
const publishedOk = ref(false)
const tagMenuOpen = ref(false)

const AVAILABLE_TAGS = ['new', 'fix', 'improvement', 'performance']
const unusedTags = computed(() => AVAILABLE_TAGS.filter((t) => !tags.value.includes(t)))

const wordCount = computed(() => body.value.split(/\s+/).filter(Boolean).length)

// Minimal markdown → HTML (preview only)
const previewHtml = computed(() => {
  if (!body.value.trim()) return ''
  return body.value
    .split('\n')
    .map((line) => {
      if (line.startsWith('## ')) return `<h2>${escape(line.slice(3))}</h2>`
      if (line.startsWith('# ')) return `<h1>${escape(line.slice(2))}</h1>`
      if (line.startsWith('- ')) return `<li>${inlineEscape(line.slice(2))}</li>`
      if (line === '---') return '<hr>'
      if (!line.trim()) return '<br>'
      return `<p>${inlineEscape(line)}</p>`
    })
    .join('\n')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
})

function escape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inlineEscape(s: string) {
  let r = escape(s)
  r = r.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  r = r.replace(/`([^`]+)`/g, '<code>$1</code>')
  return r
}

async function handleSaveDraft() {
  if (!current.value || saving.value) return
  saving.value = true
  try {
    if (isNew.value) {
      const result = await createEntry(current.value.slug, {
        title: title.value,
        body: body.value,
        tags: tags.value,
      })
      if (result.ok) {
        entryId.value = result.data.id
        router.replace(`/entries/${result.data.id}`)
      }
    } else {
      await updateEntry(route.params.id as string, {
        title: title.value,
        body: body.value,
        tags: tags.value,
      })
    }
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } finally {
    saving.value = false
  }
}

async function handlePublish() {
  await handleSaveDraft()
  if (!entryId.value && !isNew.value) return
  publishing.value = true
  try {
    await publishEntry(entryId.value ?? (route.params.id as string))
    publishedOk.value = true
    setTimeout(() => {
      publishedOk.value = false
      router.push('/entries')
    }, 1200)
  } finally {
    publishing.value = false
  }
}

onMounted(() => {
  if (!isNew.value) {
    const id = route.params.id as string
    const entry = entries.value.find((e) => e.id === id)
    if (entry) {
      title.value = entry.title
      body.value = entry.body
      tags.value = [...entry.tags]
      entryId.value = entry.id
    }
  }
})
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
      <div style="display: flex; align-items: center; gap: 10px">
        <button
          @click="router.push('/entries')"
          style="
            background: none;
            border: none;
            cursor: pointer;
            color: var(--dimmed);
            padding: 4px;
            border-radius: 4px;
            display: flex;
          "
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M10 4L6 8l4 4"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h1 style="font-size: 20px; font-weight: 600; color: var(--text)">
          {{ isNew ? 'New entry' : 'Edit entry' }}
        </h1>
      </div>
      <div style="display: flex; align-items: center; gap: 8px">
        <span
          v-if="saved"
          style="font-family: var(--font-mono); font-size: 12px; color: var(--accent)"
        >✓ Saved</span>
        <span
          v-if="publishedOk"
          style="font-family: var(--font-mono); font-size: 12px; color: var(--accent)"
        >✓ Published!</span>
        <button
          @click="handleSaveDraft"
          :disabled="saving"
          style="
            padding: 7px 14px;
            border-radius: var(--r-sm);
            border: 1px solid var(--border-dk);
            background: var(--surface);
            font-size: 13px;
            font-weight: 500;
            font-family: var(--font-ui);
            cursor: pointer;
            color: var(--text);
          "
          @mouseover="
            (e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-dk)')
          "
        >
          Save draft
        </button>
        <button
          @click="handlePublish"
          :disabled="publishing || !title"
          style="
            padding: 7px 14px;
            border-radius: var(--r-sm);
            border: none;
            background: var(--text);
            color: white;
            font-size: 13px;
            font-weight: 500;
            font-family: var(--font-ui);
            cursor: pointer;
          "
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
        >
          Publish
        </button>
      </div>
    </div>

    <!-- Editor body -->
    <div style="flex: 1; overflow: auto; padding: 28px 28px 0">
      <!-- Title -->
      <input
        v-model="title"
        placeholder="Entry title…"
        style="
          width: 100%;
          border: none;
          outline: none;
          font-size: 22px;
          font-weight: 600;
          font-family: var(--font-ui);
          color: var(--text);
          background: transparent;
          margin-bottom: 14px;
          caret-color: var(--accent);
        "
      >

      <!-- Tags -->
      <div
        style="
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 18px;
          flex-wrap: wrap;
          position: relative;
        "
      >
        <TagPill
          v-for="tag in tags"
          :key="tag"
          :tag="tag"
          removable
          @remove="tags = tags.filter((t) => t !== tag)"
        />
        <div style="position: relative">
          <button
            @click="tagMenuOpen = !tagMenuOpen"
            style="
              background: var(--bg2);
              border: 1px dashed var(--border-dk);
              border-radius: 99px;
              padding: 2px 10px;
              font-size: 11px;
              font-family: var(--font-mono);
              color: var(--dimmed);
              cursor: pointer;
            "
          >
            + tag
          </button>
          <div
            v-if="tagMenuOpen && unusedTags.length"
            style="
              position: absolute;
              top: calc(100% + 6px);
              left: 0;
              z-index: 50;
              background: var(--surface);
              box-shadow: var(--sh-lg);
              border-radius: var(--r-md);
              overflow: hidden;
              min-width: 150px;
            "
          >
            <button
              v-for="t in unusedTags"
              :key="t"
              @click="
                () => {
                  tags.push(t)
                  tagMenuOpen = false
                }
              "
              style="
                width: 100%;
                background: none;
                border: none;
                padding: 9px 14px;
                text-align: left;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: var(--font-ui);
              "
              @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg2)')"
              @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'none')"
            >
              <TagPill :tag="t" />
            </button>
          </div>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid var(--border); margin-bottom: 20px">

      <!-- Two-column editor -->
      <div
        style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border-md);
          border-radius: var(--r-md);
          overflow: hidden;
          margin-bottom: 28px;
        "
      >
        <!-- Markdown -->
        <div style="background: var(--bg)">
          <div
            style="
              padding: 9px 14px;
              border-bottom: 1px solid var(--border);
              font-family: var(--font-mono);
              font-size: 10px;
              color: var(--dimmed);
              letter-spacing: 0.05em;
              text-transform: uppercase;
            "
          >
            Markdown
          </div>
          <textarea
            v-model="body"
            placeholder="## What's new?&#10;&#10;Describe this update…&#10;&#10;- Feature A&#10;- Feature B"
            style="
              width: 100%;
              min-height: 280px;
              border: none;
              outline: none;
              background: transparent;
              padding: 16px;
              font-family: var(--font-mono);
              font-size: 13px;
              line-height: 1.75;
              color: var(--text);
              resize: vertical;
              caret-color: var(--accent);
            "
          />
        </div>

        <!-- Preview -->
        <div style="background: var(--surface)">
          <div
            style="
              padding: 9px 14px;
              border-bottom: 1px solid var(--border);
              font-family: var(--font-mono);
              font-size: 10px;
              color: var(--dimmed);
              letter-spacing: 0.05em;
              text-transform: uppercase;
            "
          >
            Preview
          </div>
          <div
            class="prose"
            style="padding: 16px; min-height: 280px"
            v-if="previewHtml"
            v-html="previewHtml"
          />
          <div
            v-else
            style="
              padding: 16px;
              min-height: 280px;
              color: var(--dimmed);
              font-style: italic;
              font-size: 13px;
            "
          >
            Nothing to preview yet…
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div
      style="
        border-top: 1px solid var(--border);
        padding: 12px 28px;
        background: var(--surface);
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <span style="font-family: var(--font-mono); font-size: 11px; color: var(--dimmed)">
        {{ wordCount }} words · Markdown supported
      </span>
      <div style="display: flex; gap: 8px">
        <button
          @click="handleSaveDraft"
          :disabled="saving"
          style="
            padding: 7px 14px;
            border-radius: var(--r-sm);
            border: 1px solid var(--border-dk);
            background: var(--surface);
            font-size: 13px;
            font-weight: 500;
            font-family: var(--font-ui);
            cursor: pointer;
            color: var(--text);
          "
        >
          Save draft
        </button>
        <button
          @click="handlePublish"
          :disabled="publishing || !title"
          style="
            padding: 7px 14px;
            border-radius: var(--r-sm);
            border: none;
            background: var(--text);
            color: white;
            font-size: 13px;
            font-weight: 500;
            font-family: var(--font-ui);
            cursor: pointer;
          "
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
        >
          Publish →
        </button>
      </div>
    </div>
  </AppLayout>
</template>
