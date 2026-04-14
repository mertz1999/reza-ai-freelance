<script setup>
defineProps({
  links: {
    type: Array,
    required: true,
  },
})

const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <button
        type="button"
        class="text-left text-lg font-semibold tracking-tight text-slate-900"
        @click="scrollToSection('home')"
      >
        Reza Tanakizadeh
      </button>

      <ul class="hidden items-center gap-6 md:flex">
        <li v-for="link in links" :key="link.id">
          <button
            type="button"
            class="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            @click="scrollToSection(link.id)"
          >
            {{ link.label }}
          </button>
        </li>
      </ul>

      <button
        type="button"
        class="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        @click="scrollToSection('contact')"
      >
        Contact Me
      </button>
    </nav>
  </header>
</template>
