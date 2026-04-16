<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  demo: {
    type: Object,
    required: true,
  },
})

defineEmits(['open'])
</script>

<template>
  <article
    class="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
  >
    <div class="flex items-start justify-between gap-3">
      <component :is="demo.icon" class="size-8 text-indigo-600" />
      <span class="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
        Demo
      </span>
    </div>
    <h3 class="mt-4 text-xl font-semibold text-slate-900">{{ demo.title }}</h3>
    <p class="mt-3 text-sm leading-relaxed text-slate-600">{{ demo.description }}</p>
    <ul class="mt-4 space-y-1.5 text-sm text-slate-700">
      <li v-for="point in demo.points" :key="point" class="flex items-start gap-2">
        <span class="mt-1.5 size-1.5 rounded-full bg-indigo-500"></span>
        <span>{{ point }}</span>
      </li>
    </ul>
    <RouterLink
      v-if="demo.route"
      :to="demo.route"
      class="mt-auto inline-flex self-start rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      View Demo
    </RouterLink>
    <button
      v-else
      type="button"
      class="mt-auto inline-flex self-start rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      @click="$emit('open', demo)"
    >
      View Demo
    </button>
  </article>
</template>
