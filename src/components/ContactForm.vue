<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const isSubmitted = ref(false)

const submitForm = () => {
  isSubmitted.value = true
}
</script>

<template>
  <form
    class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7"
    @submit.prevent="submitForm"
  >
    <div class="space-y-4">
      <div>
        <label for="name" class="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          placeholder="Your name"
        />
      </div>

      <div>
        <label for="email" class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label for="message" class="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
        <textarea
          id="message"
          v-model="form.message"
          rows="5"
          required
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          placeholder="Tell me about your sales process and goals"
        ></textarea>
      </div>
    </div>

    <button
      type="submit"
      class="mt-5 w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
    >
      Send Message
    </button>

    <p v-if="isSubmitted" class="mt-4 text-sm text-emerald-700">
      Thanks for reaching out. I will get back to you soon.
    </p>
  </form>
</template>
