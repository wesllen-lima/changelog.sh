<script setup lang="ts">
withDefaults(
  defineProps<{
    tag: string
    removable?: boolean
  }>(),
  { removable: false },
)
const emit = defineEmits<{ remove: [] }>()

const TAG_MAP: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  new: { bg: 'var(--accent-bg)', color: 'var(--accent)', dot: 'var(--accent)', label: 'New' },
  novo: { bg: 'var(--accent-bg)', color: 'var(--accent)', dot: 'var(--accent)', label: 'Novo' },
  fix: { bg: 'var(--red-bg)', color: 'var(--red)', dot: 'var(--red)', label: 'Fix' },
  correção: { bg: 'var(--red-bg)', color: 'var(--red)', dot: 'var(--red)', label: 'Correção' },
  improvement: {
    bg: 'var(--blue-bg)',
    color: 'var(--blue)',
    dot: 'var(--blue)',
    label: 'Improvement',
  },
  melhoria: { bg: 'var(--blue-bg)', color: 'var(--blue)', dot: 'var(--blue)', label: 'Melhoria' },
  performance: {
    bg: 'var(--amber-bg)',
    color: 'var(--amber)',
    dot: 'var(--amber)',
    label: 'Performance',
  },
}

function meta(tag: string) {
  return (
    TAG_MAP[tag.toLowerCase()] ?? {
      bg: 'var(--bg2)',
      color: 'var(--muted)',
      dot: 'var(--dimmed)',
      label: tag,
    }
  )
}
</script>

<template>
  <span
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '2px 8px',
      borderRadius: '99px',
      background: meta(tag).bg,
      color: meta(tag).color,
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      userSelect: 'none',
    }"
  >
    <span
      :style="{
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: meta(tag).dot,
        flexShrink: '0',
      }"
    />
    {{ meta(tag).label }}
    <button
      v-if="removable"
      @click.stop="emit('remove')"
      :style="{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: meta(tag).color,
        padding: '0',
        lineHeight: '1',
        fontSize: '13px',
        marginLeft: '1px',
        opacity: '0.7',
        fontFamily: 'inherit',
      }"
    >
      ×
    </button>
  </span>
</template>
