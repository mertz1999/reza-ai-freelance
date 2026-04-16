<script setup>
defineProps({
  mode: {
    type: String,
    default: 'mock',
  },
})
</script>

<template>
  <span
    v-if="mode === 'real'"
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    :class="
      mode === 'real'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700'
    "
  >
    <span
      class="size-1.5 rounded-full"
      :class="mode === 'real' ? 'bg-emerald-500' : 'bg-amber-500'"
    ></span>
    AI Real Output
  </span>
</template>
