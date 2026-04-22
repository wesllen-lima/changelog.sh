<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { fetchMe } = useAuth()

onMounted(async () => {
  const result = await fetchMe()
  if (result.ok) {
    await router.replace('/entries')
  } else {
    await router.replace('/login')
  }
})
</script>

<template>
  <div
    style="
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
    "
  >
    <span style="font-family: var(--font-mono); font-size: 13px; color: var(--dimmed)">
      Verificando…
    </span>
  </div>
</template>
