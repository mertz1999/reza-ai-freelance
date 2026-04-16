<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-xs leading-relaxed text-slate-600">
      {{ description }}
    </p>
    <div class="mt-3">
      <slot />
    </div>
  </section>
</template>
