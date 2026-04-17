<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { clearUserApiKey, getUserApiKey, setUserApiKey } from '../utils/userApiKey'

const isOpen = ref(false)
const apiKeyInput = ref('')
const localMessage = ref('')

const openModal = () => {
  apiKeyInput.value = getUserApiKey()
  localMessage.value = ''
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const saveKey = () => {
  if (!apiKeyInput.value.trim()) {
    localMessage.value = 'Please enter a valid OpenAI API key.'
    return
  }

  setUserApiKey(apiKeyInput.value)
  localMessage.value = 'API key stored for this session.'
  setTimeout(() => {
    closeModal()
  }, 250)
}

const clearKey = () => {
  clearUserApiKey()
  apiKeyInput.value = ''
  localMessage.value = 'API key removed.'
}

const onRequireKey = () => {
  openModal()
}

const clearOnUnload = () => {
  clearUserApiKey()
}

onMounted(() => {
  window.addEventListener('openai-key-required', onRequireKey)
  window.addEventListener('beforeunload', clearOnUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('openai-key-required', onRequireKey)
  window.removeEventListener('beforeunload', clearOnUnload)
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4"
    role="dialog"
    aria-modal="true"
  >
    <div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
      <div class="mb-3 flex items-center gap-2">
        <ExclamationTriangleIcon class="size-5 text-amber-600" />
        <h2 class="text-lg font-semibold text-slate-900">Add OpenAI API Key</h2>
      </div>

      <p class="text-sm leading-relaxed text-slate-700">
        Your key is used only in your current browser session and sent directly from browser to OpenAI.
        This app does not store or process your OpenAI API key on any backend.
      </p>
      <p class="mt-1 text-xs text-slate-500">
        The key is automatically removed when the page is reloaded or closed.
      </p>

      <label class="mt-4 block text-xs font-medium uppercase tracking-wide text-slate-500">
        OpenAI API Key
      </label>
      <input
        v-model="apiKeyInput"
        type="password"
        class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
        placeholder="sk-..."
      />

      <p v-if="localMessage" class="mt-3 text-xs text-slate-600">{{ localMessage }}</p>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          @click="saveKey"
        >
          Save Key
        </button>
        <button
          type="button"
          class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400"
          @click="clearKey"
        >
          Remove Key
        </button>
        <button
          type="button"
          class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400"
          @click="closeModal"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
