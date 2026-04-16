<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChartBarIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import AiActionPanel from '../components/AiActionPanel.vue'
import AiErrorBanner from '../components/AiErrorBanner.vue'
import AiLoadingSkeleton from '../components/AiLoadingSkeleton.vue'
import AiModeBadge from '../components/AiModeBadge.vue'
import { useAiAction } from '../composables/useAiAction'
import { aiService } from '../services/aiService'

const transcriptSnippets = [
  {
    speaker: 'Rep',
    text: 'We are better than others and can support your team.',
    score: 'Needs Improvement',
  },
  {
    speaker: 'Client',
    text: 'What proof do you have that onboarding will be fast?',
    score: 'Key Moment',
  },
  {
    speaker: 'Rep',
    text: 'We can share a rollout plan with exact milestones by tomorrow.',
    score: 'Strong Response',
  },
]

const weakResponses = [
  {
    issue: 'Generic value statement',
    original: 'We are better than others.',
    improved:
      'Teams choose us because onboarding is usually completed in under 30 days with clear milestones.',
  },
  {
    issue: 'No direct next step',
    original: 'I can send something later.',
    improved: 'I will send the rollout plan by 5 PM and propose a 20-minute review tomorrow.',
  },
]

const coachingStrategies = [
  'Anchor responses to measurable outcomes (time saved, response speed, revenue impact).',
  'Use one concrete example after each objection.',
  'Always end with one specific next step and a time.',
]

const conversationMetrics = [
  { label: 'Confidence Score', value: '78%' },
  { label: 'Objection Handling', value: '71%' },
  { label: 'Clarity Score', value: '84%' },
  { label: 'Next-Step Quality', value: '67%' },
]

const practicePlan = [
  { step: '1', task: 'Replace generic claims with specific proof statements' },
  { step: '2', task: 'Use 1 ROI example in the first 10 minutes of calls' },
  { step: '3', task: 'Close every call with a date-based action commitment' },
]

const transcriptInput = ref(
  'Rep said: We are better than others. Client asked for proof of onboarding speed. Rep did not confirm a concrete next step.'
)
const coachingSamples = [
  {
    label: 'Weak Value Statement Scenario',
    value:
      'Rep said: We are better than others. Client asked for proof of onboarding speed. Rep did not confirm a concrete next step.',
  },
  {
    label: 'Objection Handling Scenario',
    value:
      'Client asked why pricing is higher than alternatives. Rep responded with generic confidence but gave no measurable business outcome.',
  },
  {
    label: 'Call Closing Scenario',
    value:
      'Call ended with positive feedback, but the rep forgot to confirm next meeting date, owner, and action deadline.',
  },
]
const selectedCoachingSample = ref(coachingSamples[0].value)
const liveWeakResponses = ref(weakResponses)
const liveCoachingStrategies = ref(coachingStrategies)
const liveConversationMetrics = ref(conversationMetrics)
const livePracticePlan = ref(practicePlan)
const coachSummary = ref(
  'Your team is handling discovery well, but loses momentum during objection moments. Focus on proof-based responses and always close with one specific next step.'
)

const coachingAction = useAiAction(aiService.coaching)

const runCoaching = async () => {
  const response = await coachingAction.run(transcriptInput.value)
  liveWeakResponses.value = response.data?.weakResponses || weakResponses
  liveCoachingStrategies.value = response.data?.coachingStrategies || coachingStrategies
  liveConversationMetrics.value = response.data?.conversationMetrics || conversationMetrics
  livePracticePlan.value = response.data?.practicePlan || practicePlan
  coachSummary.value = response.data?.coachSummary || coachSummary.value
}

const applyCoachingSample = () => {
  transcriptInput.value = selectedCoachingSample.value
}
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0e7ff_0%,_#f8fafc_45%,_#ffffff_100%)]">
    <header class="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <RouterLink to="/" class="text-lg font-semibold tracking-tight text-slate-900">
          Reza Tanakizadeh
        </RouterLink>
        <RouterLink
          to="/"
          class="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400"
        >
          Back to Home
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 pb-10 pt-8">
      <section class="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">Demo 5</p>
            <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              Meeting Transcription → Improvement Coach
            </h1>
            <p class="mt-2 max-w-3xl text-sm text-slate-600">
              Coaching dashboard that analyzes sales conversations, detects weak responses,
              and recommends better phrasing and strategy.
            </p>
          </div>
          <AiModeBadge :mode="coachingAction.mode.value" />
        </div>
        <AiActionPanel
          class="mt-5"
          title="Try It Yourself"
          description="Paste transcript text and get instant coaching feedback with improved phrasing."
        >
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Sample Scenario
          </label>
          <select
            v-model="selectedCoachingSample"
            class="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
            @change="applyCoachingSample"
          >
            <option v-for="sample in coachingSamples" :key="sample.label" :value="sample.value">
              {{ sample.label }}
            </option>
          </select>
          <textarea
            v-model="transcriptInput"
            rows="4"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
          ></textarea>
          <div class="mt-3 flex items-center gap-2">
            <button
              type="button"
              class="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              @click="runCoaching"
            >
              Analyze & Coach
            </button>
            <AiModeBadge :mode="coachingAction.mode.value" />
          </div>
          <AiErrorBanner class="mt-3" :message="coachingAction.error.value" />
        </AiActionPanel>
      </section>

      <section class="grid min-h-[calc(100vh-220px)] gap-6 lg:grid-cols-12">
        <aside class="lg:col-span-5">
          <div class="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <DocumentTextIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">Transcription Highlights</h2>
            </div>
            <div class="space-y-3">
              <div
                v-for="snippet in transcriptSnippets"
                :key="`${snippet.speaker}-${snippet.text}`"
                class="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <p class="text-sm font-medium text-slate-900">{{ snippet.speaker }}</p>
                  <span
                    class="rounded-full px-2 py-1 text-[11px]"
                    :class="
                      snippet.score === 'Needs Improvement'
                        ? 'bg-amber-100 text-amber-700'
                        : snippet.score === 'Strong Response'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-indigo-100 text-indigo-700'
                    "
                  >
                    {{ snippet.score }}
                  </span>
                </div>
                <p class="mt-2 text-xs leading-relaxed text-slate-600">{{ snippet.text }}</p>
              </div>
            </div>
          </div>
        </aside>

        <section class="space-y-6 lg:col-span-7">
          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon class="size-5 text-amber-600" />
              <h2 class="text-lg font-semibold text-slate-900">Weak Responses Detected</h2>
            </div>
            <AiLoadingSkeleton v-if="coachingAction.loading.value" />
            <div class="space-y-3">
              <div
                v-for="item in liveWeakResponses"
                :key="item.issue"
                class="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p class="text-sm font-medium text-slate-900">{{ item.issue }}</p>
                <p class="mt-2 text-xs text-slate-600">
                  <span class="font-semibold">Original:</span> {{ item.original }}
                </p>
                <p class="mt-2 text-xs text-indigo-700">
                  <span class="font-semibold">Improved:</span> {{ item.improved }}
                </p>
              </div>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <div class="mb-3 flex items-center gap-2">
                  <ChartBarIcon class="size-5 text-cyan-600" />
                  <h3 class="text-base font-semibold text-slate-900">Conversation Metrics</h3>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div
                    v-for="metric in liveConversationMetrics"
                    :key="metric.label"
                    class="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p class="text-[11px] uppercase tracking-wide text-slate-500">{{ metric.label }}</p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">{{ metric.value }}</p>
                  </div>
                </div>
              </div>

              <div>
                <div class="mb-3 flex items-center gap-2">
                  <LightBulbIcon class="size-5 text-indigo-600" />
                  <h3 class="text-base font-semibold text-slate-900">Coaching Strategies</h3>
                </div>
                <ul class="space-y-2">
                  <li
                    v-for="tip in liveCoachingStrategies"
                    :key="tip"
                    class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {{ tip }}
                  </li>
                </ul>
              </div>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-3 flex items-center gap-2">
              <SparklesIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">Next Practice Plan</h2>
            </div>
            <div class="space-y-2">
              <div
                v-for="item in livePracticePlan"
                :key="item.step"
                class="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <span
                  class="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700"
                >
                  {{ item.step }}
                </span>
                <p class="text-sm text-slate-700">{{ item.task }}</p>
              </div>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-3 flex items-center gap-2">
              <ChatBubbleLeftRightIcon class="size-5 text-rose-600" />
              <h2 class="text-lg font-semibold text-slate-900">AI Coach Summary</h2>
            </div>
            <p class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {{ coachSummary }}
            </p>
            <div class="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <CheckBadgeIcon class="size-4 text-emerald-600" />
              <p class="text-xs text-slate-700">
                Estimated uplift shown for demo purposes (real or mock AI generated).
              </p>
            </div>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>
