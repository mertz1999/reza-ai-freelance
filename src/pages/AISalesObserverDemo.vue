<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  LightBulbIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  TagIcon,
} from '@heroicons/vue/24/outline'
import AiErrorBanner from '../components/AiErrorBanner.vue'
import AiLoadingSkeleton from '../components/AiLoadingSkeleton.vue'
import AiModeBadge from '../components/AiModeBadge.vue'
import { useAiAction } from '../composables/useAiAction'
import { aiService } from '../services/aiService'

const allowedTags = [
  'follow-up',
  'needs-data',
  'cancel-meeting',
  'reschedule',
  'pricing',
  'objection-risk',
  'contract-review',
  'decision-ready',
]

const allowedTagsSet = new Set(allowedTags)

const purposeTagLabels = {
  'follow-up': 'Follow Up',
  'needs-data': 'Needs Data',
  'cancel-meeting': 'Cancel Meeting',
  reschedule: 'Reschedule',
  pricing: 'Pricing',
  'objection-risk': 'Objection Risk',
  'contract-review': 'Contract Review',
  'decision-ready': 'Decision Ready',
}

const normalizeAnalysis = (data = {}) => {
  const urgency = ['low', 'medium', 'high'].includes(data.urgencyLevel) ? data.urgencyLevel : 'medium'
  const tags = Array.isArray(data.purposeTags)
    ? data.purposeTags.filter((tag) => allowedTagsSet.has(tag)).slice(0, 4)
    : []

  return {
    summary: typeof data.summary === 'string' && data.summary.trim() ? data.summary.trim() : 'No summary generated.',
    purposeTags: tags,
    urgencyLevel: urgency,
    urgencyReason:
      typeof data.urgencyReason === 'string' && data.urgencyReason.trim()
        ? data.urgencyReason.trim()
        : 'Urgency reason was not provided.',
    keySignals: Array.isArray(data.keySignals)
      ? data.keySignals.filter((item) => typeof item === 'string' && item.trim())
      : [],
    recommendedActions: Array.isArray(data.recommendedActions)
      ? data.recommendedActions.filter((item) => typeof item === 'string' && item.trim())
      : [],
    nextEmail: {
      subject:
        typeof data.nextEmail?.subject === 'string' && data.nextEmail.subject.trim()
          ? data.nextEmail.subject.trim()
          : 'Re: Quick follow-up on next steps',
      body:
        typeof data.nextEmail?.body === 'string' && data.nextEmail.body.trim()
          ? data.nextEmail.body.trim()
          : 'Hi there,\n\nI wanted to follow up on our previous conversation. Let me know if there is anything else you need from my side.\n\nBest,',
    },
  }
}

const predefinedThreads = [
  {
    id: 'thread-acme',
    source: 'predefined',
    account: 'Acme Logistics',
    contact: 'sara@acme.com',
    subject: 'Quick follow-up on your sales automation plan',
    preview:
      'Can we move forward with the team package this week? We need onboarding dates and internal sign-off notes.',
    body: `Hi Reza,\n\nThanks again for the walkthrough last Friday. Our operations lead reviewed the proposal and the team likes the automation flow, especially the follow-up reminders and pipeline risk alerts.\n\nBefore we approve, we need two items:\n1) A clearer timeline for onboarding our SDRs\n2) A short summary of what data fields sync into our CRM\n\nIf you can send those details today, I can bring this to procurement tomorrow morning. We are trying to finalize a vendor this week.\n\nBest,\nSara\nHead of Revenue Operations\nAcme Logistics`,
    status: 'Unread',
    analysis: {
      summary:
        'Acme is close to a decision but is blocked by missing implementation specifics and CRM field clarity. This is a late-stage deal with immediate follow-up pressure.',
      purposeTags: ['follow-up', 'needs-data', 'decision-ready', 'contract-review'],
      urgencyLevel: 'high',
      urgencyReason:
        'Procurement review is tomorrow morning and the buyer asked for missing information required for final sign-off.',
      keySignals: [
        'Buyer confirmed positive internal feedback on workflow value.',
        'Explicit request for onboarding timeline and CRM data mapping.',
        'Decision window is this week with procurement queued for tomorrow.',
      ],
      recommendedActions: [
        'Send a concise onboarding plan with week-by-week milestones today.',
        'Attach CRM field mapping table and implementation ownership details.',
        'Offer a 20-minute procurement prep call to reduce last-minute objections.',
      ],
      nextEmail: {
        subject: 'Re: Onboarding timeline and CRM sync details for Acme',
        body: `Hi Sara,\n\nThanks for the clear feedback. I attached two documents: (1) a step-by-step onboarding timeline for your SDR team and (2) a CRM field sync summary showing exactly what gets captured and where it appears.\n\nTo keep procurement moving, I can also join a short call today to answer implementation or security questions live.\n\nIf helpful, I can hold 4:00 PM or 5:30 PM today.\n\nBest,\nReza`,
      },
    },
  },
  {
    id: 'thread-nova',
    source: 'predefined',
    account: 'Nova Retail',
    contact: 'amir@novaretail.com',
    subject: 'Next steps after Friday call',
    preview:
      'Please send onboarding details for CRM sync and confirm how your team handles custom reporting requests.',
    body: `Hi Reza,\n\nGood meeting on Friday. We are interested, but before we commit, our sales managers want to confirm reporting depth and export flexibility for our weekly pipeline review.\n\nWe also need to know the expected setup effort on our side. If setup is heavy, we may delay this until next quarter.\n\nCan you share a realistic rollout timeline and what input is needed from our ops team?\n\nRegards,\nAmir\nCommercial Director\nNova Retail`,
    status: 'Replied',
    analysis: {
      summary:
        'Nova remains engaged but has delivery-risk concerns around setup effort and reporting requirements. The deal can progress if rollout complexity is addressed quickly.',
      purposeTags: ['needs-data', 'follow-up', 'objection-risk'],
      urgencyLevel: 'medium',
      urgencyReason:
        'No hard deadline was given, but setup concerns could push the project into next quarter if unanswered.',
      keySignals: [
        'Stakeholders asked directly about reporting and export flexibility.',
        'Potential delay risk tied to perceived implementation effort.',
        'Decision maker still engaging through concrete operational questions.',
      ],
      recommendedActions: [
        'Send a sample reporting pack with export examples.',
        'Break onboarding into low-lift steps and owner responsibilities.',
        'Propose a short technical scoping call with their ops lead this week.',
      ],
      nextEmail: {
        subject: 'Re: Reporting examples and rollout effort for Nova Retail',
        body: `Hi Amir,\n\nGreat speaking with your team. I attached reporting examples from similar sales workflows, including export formats for weekly pipeline reviews.\n\nFor rollout, setup is usually split into three focused steps over two weeks, and your ops team only needs to provide CRM access, field mapping confirmation, and one review call.\n\nIf useful, we can run a 25-minute scoping session this week to finalize effort and timeline.\n\nBest,\nReza`,
      },
    },
  },
  {
    id: 'thread-peak',
    source: 'predefined',
    account: 'Peak Interiors',
    contact: 'mina@peakinteriors.com',
    subject: 'Proposal questions',
    preview:
      'We need clarity on implementation timeline, pricing structure, and whether we can reschedule next week\'s meeting.',
    body: `Hi Reza,\n\nI reviewed your proposal with our CEO and finance manager. The direction looks promising, but we still have open questions on package pricing tiers and how quickly your team can start implementation.\n\nAlso, our internal planning meeting moved, so we need to reschedule next Tuesday\'s call to Thursday if possible.\n\nPlease send a revised summary with pricing options and earliest kickoff date.\n\nThanks,\nMina\nOperations Manager\nPeak Interiors`,
    status: 'Needs Follow-Up',
    analysis: {
      summary:
        'Peak is interested but expects a revised commercial package and meeting schedule change before progressing. This is a pricing-and-logistics follow-up opportunity.',
      purposeTags: ['pricing', 'reschedule', 'follow-up'],
      urgencyLevel: 'medium',
      urgencyReason:
        'They requested updated pricing and an alternate meeting date, but did not indicate immediate cancellation risk.',
      keySignals: [
        'CEO and finance are already reviewing proposal details.',
        'Specific request for pricing tiers and kickoff timing.',
        'Meeting change request indicates continued engagement, not churn.',
      ],
      recommendedActions: [
        'Send revised pricing options with clear value differences.',
        'Confirm Thursday meeting slot and agenda for decision readiness.',
        'Include earliest practical kickoff date with dependencies.',
      ],
      nextEmail: {
        subject: 'Re: Revised pricing options and Thursday meeting confirmation',
        body: `Hi Mina,\n\nThanks for the update. I prepared a revised summary with pricing tiers and what each package includes, plus the earliest kickoff timeline based on your current team capacity.\n\nThursday works on my side. If you confirm a time, I will send an updated invite and focused agenda so your CEO and finance team can make a clear decision.\n\nBest,\nReza`,
      },
    },
  },
]

const threads = ref(predefinedThreads)
const selectedThreadId = ref(predefinedThreads[0].id)
const customEmailSubject = ref('')
const customEmailText = ref('')
const localInputError = ref('')

const analysisAction = useAiAction(aiService.salesObserverEmailAnalysis)

const selectedThread = computed(() => {
  return threads.value.find((thread) => thread.id === selectedThreadId.value) || null
})

const selectedAnalysis = computed(() => selectedThread.value?.analysis || null)

const dashboardMode = computed(() => {
  return selectedThread.value?.source === 'user' ? analysisAction.mode.value : 'mock'
})

const workspaceError = computed(() => localInputError.value || analysisAction.error.value)

const selectThread = (threadId) => {
  selectedThreadId.value = threadId
}

const urgencyClass = (level) => {
  if (level === 'high') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (level === 'low') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

const createThreadId = () => `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`

const formatSentAt = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const sendGeneratedEmail = () => {
  if (!selectedThread.value || !selectedAnalysis.value) {
    return
  }

  const threadId = selectedThread.value.id
  const sentAt = new Date().toISOString()

  threads.value = threads.value.map((thread) =>
    thread.id === threadId
      ? {
          ...thread,
          status: 'Reply Sent',
          lastSentAt: sentAt,
        }
      : thread
  )
}

const analyzeCustomEmail = async () => {
  const trimmedEmail = customEmailText.value.trim()
  if (!trimmedEmail) {
    localInputError.value = 'Please paste an email before running analysis.'
    return
  }

  localInputError.value = ''
  const previousThreadId = selectedThreadId.value
  const subject = customEmailSubject.value.trim() || 'User Email Analysis Request'
  const preview = trimmedEmail.length > 120 ? `${trimmedEmail.slice(0, 120)}...` : trimmedEmail
  const threadId = createThreadId()

  const newThread = {
    id: threadId,
    source: 'user',
    account: 'User Workspace',
    contact: 'manual-input@local',
    subject,
    preview,
    body: trimmedEmail,
    status: 'Analyzing',
    analysis: null,
    lastSentAt: null,
  }

  threads.value = [newThread, ...threads.value]
  selectedThreadId.value = threadId

  try {
    const response = await analysisAction.run(trimmedEmail)
    const normalized = normalizeAnalysis(response.data)

    threads.value = threads.value.map((thread) =>
      thread.id === threadId
        ? {
            ...thread,
            status: 'Analyzed',
            analysis: normalized,
          }
        : thread
    )

    customEmailSubject.value = ''
    customEmailText.value = ''
  } catch {
    threads.value = threads.value.map((thread) =>
      thread.id === threadId
        ? {
            ...thread,
            status: 'Analysis Failed',
          }
        : thread
    )
    selectedThreadId.value = previousThreadId
  }
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
        <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">Demo 1</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">AI Sales Observer</h1>
        <p class="mt-2 max-w-3xl text-sm text-slate-600">
          Realistic product-style workspace: select an email, inspect full context, and view centralized
          AI analysis with next-step messaging.
        </p>
      </section>

      <section class="grid gap-6 lg:grid-cols-12">
        <aside class="lg:col-span-5">
          <div class="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <EnvelopeIcon class="size-5 text-indigo-600" />
                <h2 class="text-lg font-semibold text-slate-900">Email Workspace</h2>
              </div>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                {{ threads.length }} threads
              </span>
            </div>

            <div class="mb-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              <button
                v-for="thread in threads"
                :key="thread.id"
                type="button"
                class="w-full rounded-xl border p-3 text-left transition"
                :class="
                  selectedThreadId === thread.id
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                "
                @click="selectThread(thread.id)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-medium text-slate-900">{{ thread.subject }}</p>
                    <p class="mt-0.5 text-xs text-slate-500">{{ thread.account }} • {{ thread.contact }}</p>
                  </div>
                  <span class="rounded-full bg-white px-2 py-1 text-[11px] text-slate-600">
                    {{ thread.status }}
                  </span>
                </div>
                <p class="mt-2 text-xs leading-relaxed text-slate-600">{{ thread.preview }}</p>
              </button>
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-900">Analyze Your Email</p>
              <p class="mt-1 text-xs text-slate-600">
                Paste an email below to create a new thread and run AI analysis in the dashboard.
              </p>

              <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Subject (Optional)
              </label>
              <input
                v-model="customEmailSubject"
                type="text"
                class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                placeholder="Example: Re: Next steps after pricing review"
              />

              <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Email Text
              </label>
              <textarea
                v-model="customEmailText"
                rows="5"
                class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                placeholder="Paste customer email text here..."
              ></textarea>

              <button
                type="button"
                class="mt-3 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
                :disabled="analysisAction.loading.value"
                @click="analyzeCustomEmail"
              >
                {{ analysisAction.loading.value ? 'Analyzing...' : 'Analyze with AI' }}
              </button>

              <AiErrorBanner class="mt-3" :message="workspaceError" />
            </div>
          </div>
        </aside>

        <section class="lg:col-span-7">
          <article class="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <ChartBarIcon class="size-5 text-indigo-600" />
                <h2 class="text-lg font-semibold text-slate-900">Email Analysis Dashboard</h2>
              </div>
              <AiModeBadge :mode="dashboardMode" />
            </div>

            <AiLoadingSkeleton
              v-if="analysisAction.loading.value && selectedThread?.source === 'user' && !selectedAnalysis"
            />

            <div v-else-if="selectedAnalysis" class="space-y-5">
              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-2 flex items-center gap-2">
                  <DocumentTextIcon class="size-4 text-indigo-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Full Selected Email
                  </p>
                </div>
                <p class="text-sm font-medium text-slate-900">{{ selectedThread.subject }}</p>
                <p class="mt-0.5 text-xs text-slate-500">
                  {{ selectedThread.account }} • {{ selectedThread.contact }}
                </p>
                <div
                  class="mt-3 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed whitespace-pre-line text-slate-700"
                >
                  {{ selectedThread.body }}
                </div>
              </section>

              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Summary</p>
                <p class="mt-2 text-sm leading-relaxed text-slate-700">{{ selectedAnalysis.summary }}</p>
              </section>

              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <TagIcon class="size-4 text-indigo-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Purpose Tags</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in selectedAnalysis.purposeTags"
                    :key="tag"
                    class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {{ purposeTagLabels[tag] || tag }}
                  </span>
                  <span
                    v-if="selectedAnalysis.purposeTags.length === 0"
                    class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500"
                  >
                    No tags detected
                  </span>
                </div>
              </section>

              <section class="rounded-2xl border p-4" :class="urgencyClass(selectedAnalysis.urgencyLevel)">
                <div class="mb-2 flex items-center gap-2">
                  <ClockIcon class="size-4" />
                  <p class="text-xs font-semibold uppercase tracking-wider">Urgency</p>
                </div>
                <p class="text-sm font-semibold capitalize">{{ selectedAnalysis.urgencyLevel }}</p>
                <p class="mt-1 text-sm leading-relaxed">{{ selectedAnalysis.urgencyReason }}</p>
              </section>

              <section class="grid gap-4 md:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <SparklesIcon class="size-4 text-indigo-600" />
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Key Signals</p>
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="signal in selectedAnalysis.keySignals"
                      :key="signal"
                      class="text-sm leading-relaxed text-slate-700"
                    >
                      • {{ signal }}
                    </li>
                    <li v-if="selectedAnalysis.keySignals.length === 0" class="text-sm text-slate-500">
                      No key signals available.
                    </li>
                  </ul>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <LightBulbIcon class="size-4 text-indigo-600" />
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Recommended Actions
                    </p>
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="action in selectedAnalysis.recommendedActions"
                      :key="action"
                      class="text-sm leading-relaxed text-slate-700"
                    >
                      • {{ action }}
                    </li>
                    <li
                      v-if="selectedAnalysis.recommendedActions.length === 0"
                      class="text-sm text-slate-500"
                    >
                      No recommended actions available.
                    </li>
                  </ul>
                </div>
              </section>

              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Next Generated Email</p>
                <div class="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <p class="text-sm font-semibold text-slate-900">
                    Subject: {{ selectedAnalysis.nextEmail.subject }}
                  </p>
                  <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                    {{ selectedAnalysis.nextEmail.body }}
                  </p>
                </div>
                <div class="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    @click="sendGeneratedEmail"
                  >
                    <PaperAirplaneIcon class="size-4" />
                    {{ selectedThread?.lastSentAt ? 'Resend Email' : 'Send Email' }}
                  </button>
                  <p v-if="selectedThread?.lastSentAt" class="text-xs text-emerald-700">
                    Reply sent to {{ selectedThread.contact }} at {{ formatSentAt(selectedThread.lastSentAt) }}
                  </p>
                </div>
              </section>
            </div>

            <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p class="text-sm text-slate-600">
                Select an email thread or submit your own email text to view AI analysis.
              </p>
            </div>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>
