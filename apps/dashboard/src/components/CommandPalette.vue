<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const open = ref(false)
const query = ref('')
const activeIdx = ref(0)

const allActions = [
  { id: 'entries', label: 'Go to Entries', path: '/entries', hint: 'G E', icon: 'entries' },
  { id: 'new-entry', label: 'New Entry', path: '/entries/new', hint: 'C', icon: 'plus' },
  { id: 'projects', label: 'Go to Projects', path: '/projects', hint: 'G P', icon: 'projects' },
  { id: 'settings', label: 'Go to Settings', path: '/settings', hint: 'G S', icon: 'settings' },
]

const filtered = computed(() => {
  if (!query.value.trim()) return allActions
  const q = query.value.toLowerCase()
  return allActions.filter((a) => a.label.toLowerCase().includes(q))
})

watch(filtered, () => (activeIdx.value = 0))

function execute(path: string) {
  open.value = false
  query.value = ''
  router.push(path)
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    open.value = !open.value
    if (open.value) query.value = ''
    return
  }
  if (!open.value) return
  if (e.key === 'Escape') {
    open.value = false
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIdx.value = Math.min(activeIdx.value + 1, filtered.value.length - 1)
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIdx.value = Math.max(activeIdx.value - 1, 0)
  }
  if (e.key === 'Enter' && filtered.value[activeIdx.value])
    execute(filtered.value[activeIdx.value].path)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

defineExpose({ open })
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      v-if="open"
      @click="open = false"
      style="
        position: fixed;
        inset: 0;
        z-index: 8000;
        background: rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(4px);
        animation: fadeIn 120ms ease both;
      "
    />

    <!-- Palette -->
    <div
      v-if="open"
      style="
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 8001;
        width: 100%;
        max-width: 520px;
        background: var(--surface);
        border-radius: var(--r-xl);
        box-shadow: var(--sh-2xl);
        overflow: hidden;
        border: 1px solid var(--border-md);
        animation: scaleIn 160ms var(--ease-spring) both;
      "
    >
      <!-- Search input -->
      <div
        style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
        "
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style="flex-shrink: 0; color: var(--dimmed)"
        >
          <circle
            cx="7"
            cy="7"
            r="5"
            stroke="currentColor"
            stroke-width="1.4"
          />
          <path
            d="M11 11l3 3"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
          />
        </svg>
        <input
          v-model="query"
          ref="inputRef"
          autofocus
          placeholder="Type a command…"
          style="
            flex: 1;
            border: none;
            outline: none;
            background: transparent;
            font-size: 14px;
            font-family: var(--font-ui);
            color: var(--text);
          "
        >
        <kbd
          style="
            font-size: 10px;
            font-family: var(--font-mono);
            color: var(--dimmed);
            background: var(--bg2);
            border: 1px solid var(--border-md);
            border-radius: 4px;
            padding: 2px 6px;
          "
        >esc</kbd>
      </div>

      <!-- Results -->
      <div style="padding: 6px">
        <div
          v-if="filtered.length === 0"
          style="padding: 24px; text-align: center; font-size: 13px; color: var(--dimmed)"
        >
          No results
        </div>
        <button
          v-for="(action, i) in filtered"
          :key="action.id"
          @click="execute(action.path)"
          @mouseover="activeIdx = i"
          style="
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 10px;
            border: none;
            border-radius: var(--r-sm);
            cursor: pointer;
            text-align: left;
            font-family: var(--font-ui);
            transition: background 80ms;
          "
          :style="{ background: activeIdx === i ? 'var(--bg2)' : 'transparent' }"
        >
          <!-- Icon -->
          <div
            style="
              width: 28px;
              height: 28px;
              border-radius: var(--r-xs);
              background: var(--bg2);
              border: 1px solid var(--border);
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              color: var(--muted);
            "
          >
            <svg
              v-if="action.icon === 'entries'"
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M2 4h10M2 7h7M2 10h9"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else-if="action.icon === 'plus'"
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else-if="action.icon === 'projects'"
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
            >
              <rect
                x="1.5"
                y="1.5"
                width="4.5"
                height="4.5"
                rx="1"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <rect
                x="8"
                y="1.5"
                width="4.5"
                height="4.5"
                rx="1"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <rect
                x="1.5"
                y="8"
                width="4.5"
                height="4.5"
                rx="1"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <rect
                x="8"
                y="8"
                width="4.5"
                height="4.5"
                rx="1"
                stroke="currentColor"
                stroke-width="1.3"
              />
            </svg>
            <svg
              v-else-if="action.icon === 'settings'"
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="7"
                cy="7"
                r="2"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <path
                d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <!-- Label -->
          <span style="font-size: 13px; font-weight: 500; color: var(--text); flex: 1">
            {{ action.label }}
          </span>

          <!-- Current badge -->
          <span
            v-if="route.path.startsWith(action.path) && action.path !== '/entries/new'"
            style="
              font-family: var(--font-mono);
              font-size: 9px;
              font-weight: 500;
              color: var(--accent);
              background: var(--accent-bg);
              border-radius: 99px;
              padding: 2px 7px;
            "
          >current</span>

          <!-- Hint -->
          <kbd
            v-else
            style="
              font-size: 10px;
              font-family: var(--font-mono);
              color: var(--dimmed);
              background: var(--bg2);
              border: 1px solid var(--border-md);
              border-radius: 4px;
              padding: 2px 6px;
            "
          >{{ action.hint }}</kbd>
        </button>
      </div>

      <!-- Footer -->
      <div
        style="
          padding: 8px 16px;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 12px;
          background: var(--bg);
        "
      >
        <span style="font-size: 11px; color: var(--dimmed); font-family: var(--font-mono)">↑↓ navigate</span>
        <span style="font-size: 11px; color: var(--dimmed); font-family: var(--font-mono)">↵ open</span>
        <span style="font-size: 11px; color: var(--dimmed); font-family: var(--font-mono)">esc close</span>
      </div>
    </div>
  </Teleport>
</template>
