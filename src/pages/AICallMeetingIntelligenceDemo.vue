<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  PhoneIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'
import AiActionPanel from '../components/AiActionPanel.vue'
import AiErrorBanner from '../components/AiErrorBanner.vue'
import AiLoadingSkeleton from '../components/AiLoadingSkeleton.vue'
import AiModeBadge from '../components/AiModeBadge.vue'
import { useAiAction } from '../composables/useAiAction'
import { aiService } from '../services/aiService'

const recentCalls = [
  {
    account: 'Bright Systems',
    rep: 'Sara',
    duration: '28m',
    status: 'Analyzed',
    summary: 'Strong interest in enterprise rollout, asked about onboarding speed.',
  },
  {
    account: 'UrbanFleet',
    rep: 'Amir',
    duration: '34m',
    status: 'Analyzed',
    summary: 'Concern about migration effort and required team training.',
  },
  {
    account: 'Nova Retail',
    rep: 'Mina',
    duration: '22m',
    status: 'Processing',
    summary: 'Decision maker requested implementation examples and timeline.',
  },
]

const meetingSummary = [
  'Client wants rollout completed within 4 weeks.',
  'Budget is approved for the annual plan.',
  'Procurement team needs a security checklist.',
  'Next call requested with technical stakeholder.',
]

const objections = [
  {
    title: 'Onboarding timeline feels risky',
    impact: 'High',
    action: 'Share 30-day rollout plan with milestones.',
  },
  {
    title: 'Team adoption concerns',
    impact: 'Medium',
    action: 'Offer training walkthrough and success checklist.',
  },
  {
    title: 'Need more ROI clarity',
    impact: 'Medium',
    action: 'Send case study with before/after conversion metrics.',
  },
]

const aiRecommendations = [
  'Lead with implementation confidence in the next meeting.',
  'Use one quantified example of reduced manual work.',
  'Confirm who signs off before sharing final proposal.',
]

const nextActions = [
  { due: 'Today, 5:00 PM', task: 'Send onboarding plan to Bright Systems' },
  { due: 'Tomorrow, 10:00 AM', task: 'Book technical review with UrbanFleet team' },
  { due: 'Tomorrow, 3:30 PM', task: 'Send security checklist to Nova Retail' },
]

const transcriptInput = ref(
  'Client asked if onboarding can be done in 4 weeks. Rep answered generally and did not confirm a clear next step.'
)
const intelligenceSamples = [
  {
    label: 'Timeline Objection Scenario',
    value:
      'Client asked if onboarding can be done in 4 weeks. Rep answered generally and did not confirm a clear next step.',
  },
  {
    label: 'Budget Pushback Scenario',
    value:
      'Client likes the product but says budget approval is blocked. Rep discussed value but did not share a proof-based ROI example.',
  },
  {
    label: 'Decision Maker Scenario',
    value:
      'Decision maker joined the call late, asked for implementation risk details, and requested a technical follow-up with their ops team.',
  },
]
const selectedIntelligenceSample = ref(intelligenceSamples[0].value)

const liveMeetingSummary = ref(meetingSummary)
const liveObjections = ref(objections)
const liveRecommendations = ref(aiRecommendations)
const liveNextActions = ref(nextActions)

const intelligenceAction = useAiAction(aiService.meetingIntelligence)

const runAnalysis = async () => {
  const response = await intelligenceAction.run(transcriptInput.value)
  liveMeetingSummary.value = response.data?.meetingSummary || meetingSummary
  liveObjections.value = response.data?.objections || objections
  liveRecommendations.value = response.data?.aiRecommendations || aiRecommendations
  liveNextActions.value = response.data?.nextActions || nextActions
}

const applyIntelligenceSample = () => {
  transcriptInput.value = selectedIntelligenceSample.value
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
            <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">Demo 4</p>
            <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              AI Call / Meeting Intelligence
            </h1>
            <p class="mt-2 max-w-3xl text-sm text-slate-600">
              Dashboard showing automatic meeting summaries, objection extraction, and
              practical next actions for sales teams.
            </p>
          </div>
          <AiModeBadge :mode="intelligenceAction.mode.value" />
        </div>
        <AiActionPanel
          class="mt-5"
          title="Try It Yourself"
          description="Paste a call transcript or meeting notes and generate AI summary + objections."
        >
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Sample Scenario
          </label>
          <select
            v-model="selectedIntelligenceSample"
            class="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
            @change="applyIntelligenceSample"
          >
            <option
              v-for="sample in intelligenceSamples"
              :key="sample.label"
              :value="sample.value"
            >
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
              @click="runAnalysis"
            >
              Analyze Meeting
            </button>
            <AiModeBadge :mode="intelligenceAction.mode.value" />
          </div>
          <AiErrorBanner class="mt-3" :message="intelligenceAction.error.value" />
        </AiActionPanel>
      </section>

      <section class="grid min-h-[calc(100vh-220px)] gap-6 lg:grid-cols-12">
        <aside class="lg:col-span-5">
          <div class="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <PhoneIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">Call Feed</h2>
            </div>

            <div class="space-y-3">
              <div
                v-for="call in recentCalls"
                :key="`${call.account}-${call.rep}`"
                class="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <p class="text-sm font-medium text-slate-900">{{ call.account }}</p>
                  <span
                    class="rounded-full px-2 py-1 text-[11px]"
                    :class="
                      call.status === 'Analyzed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    "
                  >
                    {{ call.status }}
                  </span>
                </div>
                <p class="mt-1 text-xs text-slate-600">Rep: {{ call.rep }} | Duration: {{ call.duration }}</p>
                <p class="mt-2 text-xs leading-relaxed text-slate-600">{{ call.summary }}</p>
              </div>
            </div>
          </div>
        </aside>

        <section class="space-y-6 lg:col-span-7">
          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <ChatBubbleLeftRightIcon class="size-5 text-cyan-600" />
              <h2 class="text-lg font-semibold text-slate-900">Meeting Summary</h2>
            </div>
            <AiLoadingSkeleton v-if="intelligenceAction.loading.value" />
            <ul class="space-y-2">
              <li
                v-for="item in liveMeetingSummary"
                :key="item"
                class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {{ item }}
              </li>
            </ul>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon class="size-5 text-amber-600" />
              <h2 class="text-lg font-semibold text-slate-900">Extracted Objections</h2>
            </div>
            <div class="grid gap-3 sm:grid-cols-3">
              <div
                v-for="item in liveObjections"
                :key="item.title"
                class="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
                <p class="mt-1 text-xs text-slate-600">Impact: {{ item.impact }}</p>
                <p class="mt-2 text-xs font-medium text-indigo-700">{{ item.action }}</p>
              </div>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <div class="mb-3 flex items-center gap-2">
                  <SparklesIcon class="size-5 text-indigo-600" />
                  <h3 class="text-base font-semibold text-slate-900">AI Recommendations</h3>
                </div>
                <ul class="space-y-2">
                  <li
                    v-for="tip in liveRecommendations"
                    :key="tip"
                    class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {{ tip }}
                  </li>
                </ul>
              </div>
              <div>
                <div class="mb-3 flex items-center gap-2">
                  <ClockIcon class="size-5 text-rose-600" />
                  <h3 class="text-base font-semibold text-slate-900">Next Actions</h3>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="step in liveNextActions"
                    :key="`${step.due}-${step.task}`"
                    class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <p class="text-xs font-medium text-indigo-700">{{ step.due }}</p>
                    <p class="mt-1 text-sm text-slate-700">{{ step.task }}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-3 flex items-center gap-2">
              <LightBulbIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">Manager View</h2>
            </div>
            <p class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              Managers get one clear view of objections, confidence signals, and priority actions
              instead of manually reviewing every call recording.
            </p>
            <div class="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <UserGroupIcon class="size-4 text-indigo-600" />
              <p class="text-xs text-slate-700">3 meetings analyzed today • 8 action items generated</p>
            </div>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>
