<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BellAlertIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  PlayCircleIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import AiActionPanel from '../components/AiActionPanel.vue'
import AiErrorBanner from '../components/AiErrorBanner.vue'
import AiLoadingSkeleton from '../components/AiLoadingSkeleton.vue'
import AiModeBadge from '../components/AiModeBadge.vue'
import { useAiAction } from '../composables/useAiAction'
import { aiService } from '../services/aiService'

const activeSequences = [
  { name: 'Post-Discovery Follow-Up', trigger: '2 hours after call', channel: 'Email + SMS', status: 'Running' },
  { name: 'Proposal Reminder', trigger: '48 hours after proposal sent', channel: 'Email', status: 'Running' },
  { name: 'No Response Reactivation', trigger: 'After 5 silent days', channel: 'Email + LinkedIn', status: 'Paused' },
]

const queuedMessages = [
  {
    lead: 'Lina - Bright Systems',
    subject: 'Quick follow-up on implementation timeline',
    sendAt: 'Today, 2:10 PM',
    confidence: 'High',
  },
  {
    lead: 'Arman - UrbanFleet',
    subject: 'Checking in on your internal review',
    sendAt: 'Today, 3:00 PM',
    confidence: 'High',
  },
  {
    lead: 'Nima - Nova Retail',
    subject: 'Can we lock next steps for next week?',
    sendAt: 'Tomorrow, 9:30 AM',
    confidence: 'Medium',
  },
]

const responseTracking = [
  { account: 'Bright Systems', response: 'Positive', action: 'Schedule pricing review' },
  { account: 'UrbanFleet', response: 'Neutral', action: 'Share onboarding case study' },
  { account: 'Nova Retail', response: 'No reply yet', action: 'Send reminder tomorrow' },
]

const nextSteps = [
  { time: 'Today 4:30 PM', task: 'Call Bright Systems (decision maker confirmed)' },
  { time: 'Tomorrow 10:00 AM', task: 'Send revised quote to UrbanFleet' },
  { time: 'Tomorrow 2:00 PM', task: 'Follow-up with Nova Retail on pilot date' },
]

const activityFeed = [
  '14 follow-up messages scheduled automatically',
  '5 replies received in the last 24h',
  '3 next-step tasks created for the sales team',
  '1 low-performing message template flagged for update',
]

const contextInput = ref(
  'Lead asked for pricing update after proposal. Another lead has been silent for 5 days. Need automated reminders and next-step scheduling.'
)
const automationSamples = [
  {
    label: 'Proposal Follow-Up Scenario',
    value:
      'Lead asked for pricing update after proposal. Another lead has been silent for 5 days. Need automated reminders and next-step scheduling.',
  },
  {
    label: 'Post-Meeting Nurture Scenario',
    value:
      'Three leads finished discovery calls today. One asked for ROI details, one asked for onboarding date, and one requested a short executive summary.',
  },
  {
    label: 'Reactivation Scenario',
    value:
      'A set of leads has gone cold for 7 days. Reps need short reactivation messages with a clear next action and follow-up sequence timing.',
  },
]
const selectedAutomationSample = ref(automationSamples[0].value)

const liveQueuedMessages = ref(queuedMessages)
const liveResponseTracking = ref(responseTracking)
const liveNextSteps = ref(nextSteps)
const liveActivityFeed = ref(activityFeed)

const automationAction = useAiAction(aiService.followUpAutomation)

const runAutomation = async () => {
  const response = await automationAction.run(contextInput.value)
  liveQueuedMessages.value = response.data?.queuedMessages || queuedMessages
  liveResponseTracking.value = response.data?.responseTracking || responseTracking
  liveNextSteps.value = response.data?.nextSteps || nextSteps
  liveActivityFeed.value = response.data?.activityFeed || activityFeed
}

const applyAutomationSample = () => {
  contextInput.value = selectedAutomationSample.value
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
            <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">Demo 2</p>
            <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              AI Follow-Up Automation
            </h1>
            <p class="mt-2 max-w-3xl text-sm text-slate-600">
              Full-page product preview showing how follow-ups are sent automatically,
              responses are tracked, and next steps are scheduled.
            </p>
          </div>
          <AiModeBadge :mode="automationAction.mode.value" />
        </div>
        <AiActionPanel
          class="mt-5"
          title="Try It Yourself"
          description="Add your follow-up situation and generate sequence timing, response labels, and next steps."
        >
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Sample Scenario
          </label>
          <select
            v-model="selectedAutomationSample"
            class="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
            @change="applyAutomationSample"
          >
            <option
              v-for="sample in automationSamples"
              :key="sample.label"
              :value="sample.value"
            >
              {{ sample.label }}
            </option>
          </select>
          <textarea
            v-model="contextInput"
            rows="4"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
          ></textarea>
          <div class="mt-3 flex items-center gap-2">
            <button
              type="button"
              class="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              @click="runAutomation"
            >
              Generate Automation Plan
            </button>
            <AiModeBadge :mode="automationAction.mode.value" />
          </div>
          <AiErrorBanner class="mt-3" :message="automationAction.error.value" />
        </AiActionPanel>
      </section>

      <section class="grid min-h-[calc(100vh-220px)] gap-6 lg:grid-cols-12">
        <aside class="lg:col-span-5">
          <div class="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <PlayCircleIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">Automation Engine</h2>
            </div>

            <div class="space-y-3">
              <div
                v-for="sequence in activeSequences"
                :key="sequence.name"
                class="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p class="text-sm font-medium text-slate-900">{{ sequence.name }}</p>
                <p class="mt-1 text-xs text-slate-600">
                  Trigger: {{ sequence.trigger }} | Channel: {{ sequence.channel }}
                </p>
                <span
                  class="mt-2 inline-flex rounded-full px-2 py-1 text-[11px]"
                  :class="
                    sequence.status === 'Running'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  "
                >
                  {{ sequence.status }}
                </span>
              </div>
            </div>

            <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="mb-3 flex items-center gap-2">
                <EnvelopeIcon class="size-4 text-indigo-600" />
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Mock Message Builder
                </p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">
                Subject: Quick check-in on your proposal
                <br />
                <br />
                Hi Lina, just checking in. Would you like to review the final rollout plan tomorrow at
                11:00 AM?
              </div>
              <button
                type="button"
                class="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                @click="runAutomation"
              >
                <PaperAirplaneIcon class="size-4" />
                Queue AI Follow-Up
              </button>
            </div>
          </div>
        </aside>

        <section class="space-y-6 lg:col-span-7">
          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <ClockIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">Queued Follow-Ups</h2>
            </div>
            <AiLoadingSkeleton v-if="automationAction.loading.value" />
            <div class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="item in liveQueuedMessages"
                :key="`${item.lead}-${item.subject}`"
                class="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p class="text-sm font-medium text-slate-900">{{ item.lead }}</p>
                <p class="mt-1 text-xs text-slate-600">{{ item.subject }}</p>
                <p class="mt-2 text-[11px] text-indigo-700">Send at: {{ item.sendAt }}</p>
                <p class="mt-1 text-[11px] text-slate-600">AI confidence: {{ item.confidence }}</p>
              </div>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <ChatBubbleLeftRightIcon class="size-5 text-cyan-600" />
              <h2 class="text-lg font-semibold text-slate-900">Response Tracking</h2>
            </div>
            <div class="grid gap-3 sm:grid-cols-3">
              <div
                v-for="item in liveResponseTracking"
                :key="item.account"
                class="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p class="text-sm font-medium text-slate-900">{{ item.account }}</p>
                <p class="mt-1 text-xs text-slate-600">Response: {{ item.response }}</p>
                <p class="mt-2 text-xs font-medium text-indigo-700">{{ item.action }}</p>
              </div>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <CalendarDaysIcon class="size-5 text-rose-600" />
              <h2 class="text-lg font-semibold text-slate-900">Scheduled Next Steps</h2>
            </div>
            <div class="space-y-2">
              <div
                v-for="step in liveNextSteps"
                :key="`${step.time}-${step.task}`"
                class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
              >
                <p class="text-xs font-medium text-indigo-700">{{ step.time }}</p>
                <p class="mt-1 text-sm text-slate-700">{{ step.task }}</p>
              </div>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <BellAlertIcon class="size-5 text-amber-600" />
              <h2 class="text-lg font-semibold text-slate-900">Daily Activity Feed</h2>
            </div>
            <ul class="space-y-2">
              <li
                v-for="item in liveActivityFeed"
                :key="item"
                class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {{ item }}
              </li>
            </ul>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-3 flex items-center gap-2">
              <SparklesIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">AI Suggestion</h2>
            </div>
            <p class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              "UrbanFleet responds better to short reminders with one clear next step. Use a single
              CTA: ‘Can we confirm onboarding call for Thursday?’"
            </p>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>
