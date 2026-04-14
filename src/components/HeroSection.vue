<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

defineEmits(['view-demos', 'contact'])

const valueItems = [
  'No lead is forgotten after a call or meeting.',
  'Follow-ups are sent at the right time automatically.',
  'Voice notes become clean and structured CRM updates.',
  'Sales teams get clear next actions every day.',
  'Managers spot pipeline risks before deals go cold.',
  'Hot leads are prioritized so reps focus on revenue.',
  'Objections from calls are captured and summarized instantly.',
  'Teams spend less time on admin and more time selling.',
  'Conversations turn into practical insights, not missed details.',
  'Your process becomes consistent across every sales rep.',
]

const groupIndex = ref(0)
const isTransitioning = ref(false)
const isPaused = ref(false)
let transitionTimer = null
let autoRotateTimer = null

const totalGroups = Math.ceil(valueItems.length / 3)

const visibleItems = computed(() => {
  const start = groupIndex.value * 3

  return Array.from({ length: 3 }, (_, offset) => {
    const itemIndex = (start + offset) % valueItems.length
    return {
      id: `${itemIndex}-${valueItems[itemIndex]}`,
      text: valueItems[itemIndex],
    }
  })
})

const showNextGroup = () => {
  if (isTransitioning.value || isPaused.value) return

  isTransitioning.value = true
  transitionTimer = window.setTimeout(() => {
    groupIndex.value = (groupIndex.value + 1) % totalGroups
    isTransitioning.value = false
  }, 260)
}

const startAutoRotation = () => {
  if (autoRotateTimer || isPaused.value) return
  autoRotateTimer = window.setInterval(() => {
    showNextGroup()
  }, 3000)
}

const stopAutoRotation = () => {
  if (!autoRotateTimer) return
  window.clearInterval(autoRotateTimer)
  autoRotateTimer = null
}

const togglePause = () => {
  isPaused.value = !isPaused.value

  if (isPaused.value) {
    stopAutoRotation()
  } else {
    startAutoRotation()
  }
}

onMounted(() => {
  startAutoRotation()
})

onBeforeUnmount(() => {
  if (transitionTimer) {
    window.clearTimeout(transitionTimer)
  }
  stopAutoRotation()
})
</script>

<template>
  <section
    id="home"
    class="section-fade mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-18 md:flex-row md:items-center md:gap-12 md:pt-24"
  >
    <div class="md:w-3/5">
      <p
        class="mb-4 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
      >
        Freelance AI Developer for Sales Teams
      </p>
      <h1 class="text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-5xl">
        AI Systems That Help Sales Teams Close More Deals
      </h1>
      <p class="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
        I build AI tools that automate follow-ups, update your CRM from voice notes, and turn
        conversations into actionable insights.
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          @click="$emit('view-demos')"
        >
          View Demos
        </button>
        <button
          type="button"
          class="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400"
          @click="$emit('contact')"
        >
          Contact Me
        </button>
      </div>
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:w-2/5">
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Core Value</p>
      <p class="mt-3 text-lg leading-relaxed text-slate-800">
        I help businesses reduce manual work and close more deals using AI.
      </p>
      <div
        class="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4"
        @mouseenter="stopAutoRotation"
        @mouseleave="!isPaused && startAutoRotation()"
      >
        <div class="mb-3 flex items-center justify-between">
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">
            Key Sales Signals
          </p>
          <button
            type="button"
            class="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-200"
            @click="togglePause"
          >
            {{ isPaused ? 'Resume' : 'Pause' }}
          </button>
        </div>
        <div class="h-[172px] overflow-hidden">
          <ul
            class="flex flex-col gap-2.5 transition-opacity duration-200"
            :class="isTransitioning ? 'opacity-0' : 'opacity-100'"
          >
            <li
              v-for="item in visibleItems"
              :key="item.id"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-snug text-slate-700"
            >
              {{ item.text }}
            </li>
          </ul>
        </div>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <span
            v-for="dot in totalGroups"
            :key="dot"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="groupIndex === dot - 1 ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-300'"
          ></span>
        </div>
      </div>
    </div>
  </section>
</template>
