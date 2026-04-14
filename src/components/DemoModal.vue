<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  demo: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const onEsc = (event) => {
  if (event.key === 'Escape' && props.demo) {
    emit('close')
  }
}

watch(
  () => props.demo,
  (value) => {
    if (value) {
      document.addEventListener('keydown', onEsc)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onEsc)
  document.body.style.overflow = ''
})
</script>

<template>
  <div
    v-if="demo"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-2xl font-semibold text-slate-900">{{ demo.title }}</h3>
          <p class="mt-2 text-sm text-slate-600">{{ demo.description }}</p>
        </div>
        <button
          type="button"
          class="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          @click="$emit('close')"
        >
          <XMarkIcon class="size-6" />
        </button>
      </div>

      <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Example Output</p>
        <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {{ demo.exampleOutput }}
        </p>
      </div>
    </div>
  </div>
</template>
