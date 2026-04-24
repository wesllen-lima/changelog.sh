<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, remove } = useToast()

const icons = {
  success: `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  error: `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  info: `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 8v5M12 16v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  warning: `<path d="M10.3 4.3a2 2 0 013.4 0l7 12A2 2 0 0119 19H5a2 2 0 01-1.7-2.7l7-12z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M12 9v4M12 16v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
}

const colors = {
  success: 'var(--accent)',
  error: 'var(--red)',
  info: 'var(--blue)',
  warning: 'var(--amber)',
}
</script>

<template>
  <Teleport to="body">
    <div
      style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      "
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        style="
          pointer-events: all;
          background: var(--surface);
          border: 1px solid var(--border-md);
          border-radius: var(--r-lg);
          box-shadow: var(--sh-xl);
          padding: 14px 16px;
          min-width: 260px;
          max-width: 360px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: slideInRight 200ms var(--ease-spring) both;
        "
      >
        <!-- Icon -->
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style="flex-shrink: 0; margin-top: 1px"
          :style="{ color: colors[toast.type] }"
          v-html="icons[toast.type]"
        />

        <!-- Content -->
        <div style="flex: 1; min-width: 0">
          <div style="font-size: 13px; font-weight: 500; color: var(--text); line-height: 1.4">
            {{ toast.title }}
          </div>
          <div
            v-if="toast.message"
            style="font-size: 12px; color: var(--muted); margin-top: 2px; line-height: 1.5"
          >
            {{ toast.message }}
          </div>
          <button
            v-if="toast.action"
            @click="
              toast.action!.fn()
              remove(toast.id)
            "
            style="
              background: none;
              border: none;
              padding: 0;
              margin-top: 6px;
              font-size: 12px;
              font-weight: 500;
              font-family: var(--font-ui);
              cursor: pointer;
            "
            :style="{ color: colors[toast.type] }"
          >
            {{ toast.action.label }} →
          </button>
        </div>

        <!-- Dismiss -->
        <button
          @click="remove(toast.id)"
          style="
            background: none;
            border: none;
            cursor: pointer;
            color: var(--dimmed);
            padding: 2px;
            border-radius: 4px;
            flex-shrink: 0;
            line-height: 1;
          "
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--muted)')"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--dimmed)')"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11 3L3 11M3 3l8 8"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>
