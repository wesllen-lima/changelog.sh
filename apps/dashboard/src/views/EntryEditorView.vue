<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import TagPill from '../components/TagPill.vue'
import { useEntries } from '../composables/useEntries'
import { useProjects } from '../composables/useProjects'
import { useToast } from '../composables/useToast'

const route = useRoute()
const router = useRouter()
const { entries, createEntry, updateEntry, publishEntry } = useEntries()
const { current } = useProjects()
const toast = useToast()

const isNew = computed(() => route.name === 'entry-new')

const title = ref('')
const body = ref('')
const tags = ref<string[]>([])
const entryId = ref<string | null>(null)
const saving = ref(false)
const publishing = ref(false)
const saved = ref(false)
const publishedOk = ref(false)
const tagMenuOpen = ref(false)
const saveError = ref<string | null>(null)

type Snapshot = { title: string; body: string; tags: string[] }
const lastSaved = ref<Snapshot | null>(null)

const isDirty = computed(() => {
  if (isNew.value && !entryId.value) return title.value.trim() !== '' || body.value.trim() !== ''
  if (!lastSaved.value) return false
  return (
    title.value !== lastSaved.value.title ||
    body.value !== lastSaved.value.body ||
    JSON.stringify(tags.value) !== JSON.stringify(lastSaved.value.tags)
  )
})

const AVAILABLE_TAGS = ['new', 'fix', 'improvement', 'performance']
const unusedTags = computed(() => AVAILABLE_TAGS.filter((t) => !tags.value.includes(t)))

const wordCount = computed(() => body.value.split(/\s+/).filter(Boolean).length)

const previewHtml = computed(() => {
  if (!body.value.trim()) return ''
  return body.value
    .split('\n')
    .map((line) => {
      if (line.startsWith('### ')) return `<h3>${esc(line.slice(4))}</h3>`
      if (line.startsWith('## ')) return `<h2>${esc(line.slice(3))}</h2>`
      if (line.startsWith('# ')) return `<h1>${esc(line.slice(2))}</h1>`
      if (line.startsWith('> ')) return `<blockquote>${inline(line.slice(2))}</blockquote>`
      if (line.startsWith('- ')) return `<li>${inline(line.slice(2))}</li>`
      if (line === '---') return '<hr>'
      if (!line.trim()) return '<br>'
      return `<p>${inline(line)}</p>`
    })
    .join('\n')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
})

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inline(s: string) {
  let r = esc(s)
  r = r.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  r = r.replace(/\*(.+?)\*/g, '<em>$1</em>')
  r = r.replace(/`([^`]+)`/g, '<code>$1</code>')
  return r
}

function snapshotCurrent(): Snapshot {
  return { title: title.value, body: body.value, tags: [...tags.value] }
}

async function handleSaveDraft() {
  if (!current.value || saving.value) return
  if (!title.value.trim()) {
    saveError.value = 'Title is required'
    return
  }
  saving.value = true
  saveError.value = null
  try {
    if (isNew.value) {
      const result = await createEntry(current.value.slug, {
        title: title.value,
        body: body.value,
        tags: tags.value,
      })
      if (result.ok) {
        entryId.value = result.data.id
        lastSaved.value = snapshotCurrent()
        router.replace(`/entries/${result.data.id}`)
        toast.success('Draft saved')
      } else {
        saveError.value = result.error
        return
      }
    } else {
      const result = await updateEntry(route.params.id as string, {
        title: title.value,
        body: body.value,
        tags: tags.value,
      })
      if (!result.ok) {
        saveError.value = result.error
        return
      }
      lastSaved.value = snapshotCurrent()
      toast.success('Draft saved')
    }
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } finally {
    saving.value = false
  }
}

function onKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault()
    handleSaveDraft()
  }
  if (e.key === 'Escape' && tagMenuOpen.value) tagMenuOpen.value = false
}

onBeforeRouteLeave(() => {
  if (isDirty.value) return window.confirm('You have unsaved changes. Leave without saving?')
})

async function handlePublish() {
  await handleSaveDraft()
  if (!entryId.value && !isNew.value) return
  publishing.value = true
  try {
    await publishEntry(entryId.value ?? (route.params.id as string))
    toast.success('Entry published', {
      action: { label: 'View', fn: () => window.open(`/${current.value?.slug}`, '_blank') },
    })
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
  window.addEventListener('keydown', onKeyDown)
  if (!isNew.value) {
    const id = route.params.id as string
    const entry = entries.value.find((e) => e.id === id)
    if (entry) {
      title.value = entry.title
      body.value = entry.body
      tags.value = [...entry.tags]
      entryId.value = entry.id
      lastSaved.value = snapshotCurrent()
    }
  }
})

onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

function addTag(t: string): void {
  tags.value.push(t)
  tagMenuOpen.value = false
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
        padding: 0 20px 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--surface);
      "
    >
      <!-- Left: back + breadcrumb -->
      <div style="display: flex; align-items: center; gap: 6px">
        <button
          @click="router.push('/entries')"
          style="
            background: none;
            border: none;
            cursor: pointer;
            color: var(--dimmed);
            padding: 6px;
            border-radius: var(--r-sm);
            display: flex;
            align-items: center;
          "
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg2)')"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'none')"
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
        <span style="font-size: 13px; color: var(--dimmed)">Entries</span>
        <span style="font-size: 13px; color: var(--faint)">/</span>
        <span style="font-size: 13px; font-weight: 500; color: var(--text)">
          {{ isNew ? 'New entry' : title || 'Edit entry' }}
        </span>
      </div>

      <!-- Right: status + actions -->
      <div style="display: flex; align-items: center; gap: 8px">
        <span
          v-if="saved"
          style="
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--accent);
            animation: fadeIn 150ms;
          "
        >✓ Saved</span>
        <span
          v-if="publishedOk"
          style="font-family: var(--font-mono); font-size: 11px; color: var(--accent)"
        >✓ Published!</span>
        <span
          v-if="saveError"
          style="font-family: var(--font-mono); font-size: 11px; color: var(--red)"
        >{{ saveError }}</span>
        <span
          v-if="isDirty && !saving"
          style="font-family: var(--font-mono); font-size: 11px; color: var(--dimmed)"
        >Unsaved</span>

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
            white-space: nowrap;
          "
          @mouseover="
            (e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-dk)')
          "
        >
          {{ saving ? 'Saving…' : 'Save draft' }}
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
            white-space: nowrap;
          "
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
        >
          {{ publishing ? 'Publishing…' : 'Publish →' }}
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
          font-size: 24px;
          font-weight: 600;
          font-family: var(--font-ui);
          color: var(--text);
          background: transparent;
          margin-bottom: 14px;
          caret-color: var(--accent);
          line-height: 1.3;
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
              padding: 3px 10px;
              font-size: 11px;
              font-family: var(--font-mono);
              color: var(--dimmed);
              cursor: pointer;
              transition:
                border-color 120ms,
                color 120ms;
            "
            @mouseover="
              (e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--accent)'
                el.style.color = 'var(--accent)'
              }
            "
            @mouseleave="
              (e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--border-dk)'
                el.style.color = 'var(--dimmed)'
              }
            "
          >
            + tag
          </button>
          <Transition name="dropdown">
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
                border: 1px solid var(--border-md);
                overflow: hidden;
                min-width: 160px;
              "
            >
              <button
                v-for="t in unusedTags"
                :key="t"
                @click="addTag(t)"
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
                  transition: background 80ms;
                "
                @mouseover="
                  (e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg)')
                "
                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'none')"
              >
                <TagPill :tag="t" />
              </button>
            </div>
          </Transition>
        </div>
        <span
          v-if="unusedTags.length === 0 && tags.length > 0"
          style="font-family: var(--font-mono); font-size: 11px; color: var(--dimmed)"
        >All tags added</span>
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
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <span>Markdown</span>
            <span style="color: var(--faint)">⌘S to save</span>
          </div>
          <textarea
            v-model="body"
            placeholder="## What's new?&#10;&#10;Describe this update…&#10;&#10;- Feature A&#10;- Feature B"
            style="
              width: 100%;
              min-height: 320px;
              border: none;
              outline: none;
              background: transparent;
              padding: 16px;
              font-family: var(--font-mono);
              font-size: 13px;
              line-height: 1.8;
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
            v-if="previewHtml"
            class="prose"
            style="padding: 16px; min-height: 320px"
            v-html="previewHtml"
          />
          <div
            v-else
            style="
              padding: 16px;
              min-height: 320px;
              color: var(--faint);
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
      <div style="display: flex; align-items: center; gap: 16px">
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--dimmed)">
          {{ wordCount }} {{ wordCount === 1 ? 'word' : 'words' }}
        </span>
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--faint)">
          ⌘S save · ⌘K commands
        </span>
      </div>
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
          {{ saving ? 'Saving…' : 'Save draft' }}
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

<style scoped>
.dropdown-enter-active {
  animation: scaleIn 150ms var(--ease-spring) both;
}
.dropdown-leave-active {
  transition: opacity 100ms;
}
.dropdown-leave-to {
  opacity: 0;
}
</style>
