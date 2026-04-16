<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  MicrophoneIcon,
  PhoneIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import AiErrorBanner from '../components/AiErrorBanner.vue'
import AiLoadingSkeleton from '../components/AiLoadingSkeleton.vue'
import AiModeBadge from '../components/AiModeBadge.vue'
import { useAiAction } from '../composables/useAiAction'
import { aiService } from '../services/aiService'

const makePreview = (text = '') => (text.length > 110 ? `${text.slice(0, 110)}...` : text)

const normalizeIntelligence = (data = {}) => ({
  meetingSummary: Array.isArray(data.meetingSummary)
    ? data.meetingSummary.filter((item) => typeof item === 'string' && item.trim())
    : [],
  objections: Array.isArray(data.objections)
    ? data.objections
        .filter((item) => item?.title && item?.impact && item?.action)
        .map((item) => ({ title: item.title, impact: item.impact, action: item.action }))
    : [],
  aiRecommendations: Array.isArray(data.aiRecommendations)
    ? data.aiRecommendations.filter((item) => typeof item === 'string' && item.trim())
    : [],
  nextActions: Array.isArray(data.nextActions)
    ? data.nextActions
        .filter((item) => item?.due && item?.task)
        .map((item) => ({ due: item.due, task: item.task }))
    : [],
})

const predefinedRecords = [
  {
    id: 'call-bright',
    source: 'predefined',
    account: 'Bright Systems',
    rep: 'Sara',
    duration: '28m',
    status: 'Analyzed',
    transcriptFull: `Client opened by confirming the enterprise rollout budget is approved if onboarding risk is managed. They asked whether implementation can be completed in four weeks and what support is included for manager adoption. Sara explained the process but did not anchor timelines with concrete milestones.\n\nMid-call, the buyer requested examples of similar teams that moved from manual follow-ups to automated sequences. They also asked who signs off after technical review and whether procurement can receive a security checklist this week. Meeting ended with positive intent, but no exact next-step time was locked.`,
    preview:
      'Budget approved with onboarding concerns; buyer asked for rollout proof, security checklist, and clear sign-off path.',
    mode: 'mock',
    analysis: normalizeIntelligence({
      meetingSummary: [
        'Budget is approved if onboarding confidence is established.',
        'Client requested implementation examples and adoption support details.',
        'Security checklist is required before procurement sign-off.',
        'Conversation ended without a date-bound next action.',
      ],
      objections: [
        {
          title: 'Onboarding timeline is unclear',
          impact: 'High',
          action: 'Send a 30-day rollout plan with weekly milestones and ownership.',
        },
        {
          title: 'Buyer requested proof of similar outcomes',
          impact: 'Medium',
          action: 'Share one quantified case study from a comparable sales team.',
        },
      ],
      aiRecommendations: [
        'Lead the follow-up with timeline certainty and rollout checkpoints.',
        'Tie process details to measurable reduction in manual follow-up work.',
        'Confirm procurement owner and final approver in writing.',
      ],
      nextActions: [
        { due: 'Today, 5:00 PM', task: 'Send rollout milestones + security checklist to Bright Systems' },
        { due: 'Tomorrow, 10:30 AM', task: 'Book technical review with implementation lead and procurement' },
      ],
    }),
  },
  {
    id: 'call-urbanfleet',
    source: 'predefined',
    account: 'UrbanFleet',
    rep: 'Amir',
    duration: '34m',
    status: 'Analyzed',
    transcriptFull: `The operations director said migration effort is their biggest concern because previous tooling caused downtime. They asked whether data import can be phased and if training can be split across regional teams. Amir acknowledged the concern, but response remained broad without specific risk controls.\n\nLater in the call, the decision maker joined and asked for a realistic deployment sequence and post-launch support expectations. Team interest remained strong, but they requested a technical walkthrough with their systems lead before moving to final pricing discussion.`,
    preview:
      'UrbanFleet is interested but worried about migration risk, phased rollout, and support expectations.',
    mode: 'mock',
    analysis: normalizeIntelligence({
      meetingSummary: [
        'Primary blocker is migration risk from past tool failures.',
        'Team requested phased import and segmented training plan.',
        'Decision maker requires technical walkthrough before pricing close.',
      ],
      objections: [
        {
          title: 'Migration reliability concern',
          impact: 'High',
          action: 'Provide phased migration plan with rollback safeguards.',
        },
        {
          title: 'Training effort across regions',
          impact: 'Medium',
          action: 'Propose role-based training schedule with owner assignments.',
        },
      ],
      aiRecommendations: [
        'Frame technical walkthrough around risk reduction and continuity.',
        'Share phased implementation architecture before next call.',
        'Present support scope in day-30 and day-60 checkpoints.',
      ],
      nextActions: [
        { due: 'Today, 6:00 PM', task: 'Send phased migration and support plan to UrbanFleet stakeholders' },
        { due: 'Tomorrow, 2:00 PM', task: 'Confirm technical walkthrough with systems lead and decision maker' },
      ],
    }),
  },
  {
    id: 'call-nova',
    source: 'predefined',
    account: 'Nova Retail',
    rep: 'Mina',
    duration: '22m',
    status: 'Processing',
    transcriptFull: `Nova Retail requested practical implementation examples from similar retail teams and asked if a pilot can start before quarter close. They also raised concerns about internal adoption and asked who from our side will own change management enablement.\n\nThe buyer signaled urgency because leadership wants a recommendation this week. Mina captured most questions well but did not close with a fixed date for pilot scope review.`,
    preview:
      'Nova requested implementation examples and pilot timing, with leadership expecting recommendation this week.',
    mode: 'mock',
    analysis: normalizeIntelligence({
      meetingSummary: [
        'Buyer asked for implementation proof tied to retail use cases.',
        'Pilot timing and change-management ownership are open questions.',
        'Leadership expects a recommendation this week.',
      ],
      objections: [
        {
          title: 'Adoption ownership not defined',
          impact: 'Medium',
          action: 'Assign enablement owner and include adoption plan in follow-up.',
        },
      ],
      aiRecommendations: [
        'Provide one retail-specific implementation example with timeline.',
        'Define pilot scope with measurable success criteria.',
        'Close next conversation with a date-based decision checkpoint.',
      ],
      nextActions: [
        { due: 'Today, 4:30 PM', task: 'Send retail implementation example and pilot scope draft' },
      ],
    }),
  },
]

const intelligenceSamples = [
  {
    label: 'Timeline Risk Call',
    value:
      'Client asked if implementation can be completed in four weeks and requested weekly milestones. Rep explained the process at a high level but did not commit to dates. Buyer said procurement can move this week if rollout plan and security checklist are shared today.',
  },
  {
    label: 'Migration Concern Call',
    value:
      'Operations lead said previous migration failed and they need phased rollout details. Decision maker requested a technical walkthrough with systems owner before final pricing discussion. Rep acknowledged concerns but did not confirm timeline for walkthrough.',
  },
  {
    label: 'Pilot Scope Call',
    value:
      'Buyer wants pilot to start this quarter and asked for implementation examples in similar teams. They need clarity on training ownership and expected adoption checkpoints. Leadership expects a recommendation this week.',
  },
]

const records = ref(predefinedRecords)
const selectedRecordId = ref(predefinedRecords[0].id)
const transcriptInput = ref(intelligenceSamples[0].value)
const selectedIntelligenceSample = ref(intelligenceSamples[0].value)
const recordedAudioUrl = ref('')
const recordedBlob = ref(null)
const isRecording = ref(false)
const localInputError = ref('')

const transcribeAction = useAiAction((blob) => aiService.transcribe(blob))
const intelligenceAction = useAiAction(aiService.meetingIntelligence)

let mediaRecorder = null
let mediaStream = null
let audioChunks = []

const selectedRecord = computed(() => {
  return records.value.find((record) => record.id === selectedRecordId.value) || null
})

const selectedAnalysis = computed(() => selectedRecord.value?.analysis || null)

const modeLabel = computed(() => selectedRecord.value?.mode || 'mock')

const panelError = computed(
  () => localInputError.value || transcribeAction.error.value || intelligenceAction.error.value
)

const statusClass = (status) => {
  if (status === 'Analyzed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Processing' || status === 'Analyzing') return 'bg-amber-100 text-amber-700'
  if (status === 'Analysis Failed') return 'bg-rose-100 text-rose-700'
  return 'bg-slate-100 text-slate-700'
}

const selectRecord = (recordId) => {
  selectedRecordId.value = recordId
}

const applyIntelligenceSample = () => {
  transcriptInput.value = selectedIntelligenceSample.value
  localInputError.value = ''
}

const startRecording = async () => {
  if (isRecording.value) return

  if (!navigator.mediaDevices?.getUserMedia) {
    localInputError.value = 'Audio recording is not supported in this browser.'
    return
  }

  localInputError.value = ''

  if (recordedAudioUrl.value) {
    URL.revokeObjectURL(recordedAudioUrl.value)
    recordedAudioUrl.value = ''
  }

  recordedBlob.value = null

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(mediaStream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      recordedBlob.value = new Blob(audioChunks, { type: 'audio/webm' })
      recordedAudioUrl.value = URL.createObjectURL(recordedBlob.value)
      mediaStream?.getTracks().forEach((track) => track.stop())
      mediaStream = null
    }

    mediaRecorder.start()
    isRecording.value = true
  } catch {
    localInputError.value = 'Could not access microphone. Check browser permissions and try again.'
    mediaStream?.getTracks().forEach((track) => track.stop())
    mediaStream = null
  }
}

const stopRecording = () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') return
  mediaRecorder.stop()
  isRecording.value = false
}

const runTranscription = async () => {
  if (!recordedBlob.value) {
    localInputError.value = 'Record audio first before transcription.'
    return
  }

  localInputError.value = ''
  const response = await transcribeAction.run(recordedBlob.value)
  transcriptInput.value = response.data?.transcript || transcriptInput.value
}

const createRecordId = () => `meeting-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`

const runAnalysis = async () => {
  const transcript = transcriptInput.value.trim()
  if (!transcript) {
    localInputError.value = 'Please paste or transcribe text before analysis.'
    return
  }

  localInputError.value = ''

  const previousRecordId = selectedRecordId.value
  const recordId = createRecordId()

  const newRecord = {
    id: recordId,
    source: 'user',
    account: 'User Submitted Call',
    rep: 'You',
    duration: 'Text Input',
    status: 'Analyzing',
    transcriptFull: transcript,
    preview: makePreview(transcript),
    mode: 'mock',
    analysis: null,
  }

  records.value = [newRecord, ...records.value]
  selectedRecordId.value = recordId

  try {
    const response = await intelligenceAction.run(transcript)
    const normalized = normalizeIntelligence(response.data)

    records.value = records.value.map((record) =>
      record.id === recordId
        ? {
            ...record,
            status: 'Analyzed',
            mode: response.mode || 'mock',
            analysis: normalized,
          }
        : record
    )

    transcriptInput.value = ''
  } catch {
    records.value = records.value.map((record) =>
      record.id === recordId
        ? {
            ...record,
            status: 'Analysis Failed',
          }
        : record
    )

    selectedRecordId.value = previousRecordId
  }
}

onBeforeUnmount(() => {
  if (recordedAudioUrl.value) {
    URL.revokeObjectURL(recordedAudioUrl.value)
  }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  mediaStream?.getTracks().forEach((track) => track.stop())
})
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
        <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">Demo 4</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          AI Call / Meeting Intelligence
        </h1>
        <p class="mt-2 max-w-3xl text-sm text-slate-600">
          Select a call record on the left to view the full transcript and intelligence output on the right.
          You can also record, transcribe, or paste a transcript and generate new analysis.
        </p>
      </section>

      <section class="grid gap-6 lg:grid-cols-12">
        <aside class="lg:col-span-5">
          <div class="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <PhoneIcon class="size-5 text-indigo-600" />
                <h2 class="text-lg font-semibold text-slate-900">Call Feed</h2>
              </div>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                {{ records.length }} records
              </span>
            </div>

            <div class="mb-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              <button
                v-for="record in records"
                :key="record.id"
                type="button"
                class="w-full rounded-xl border p-3 text-left transition"
                :class="
                  selectedRecordId === record.id
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                "
                @click="selectRecord(record.id)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-medium text-slate-900">{{ record.account }}</p>
                    <p class="mt-0.5 text-xs text-slate-500">Rep: {{ record.rep }} • {{ record.duration }}</p>
                  </div>
                  <span class="rounded-full px-2 py-1 text-[11px]" :class="statusClass(record.status)">
                    {{ record.status }}
                  </span>
                </div>
                <p class="mt-2 text-xs leading-relaxed text-slate-600">{{ record.preview }}</p>
              </button>
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-900">Record or Paste Meeting Transcript</p>
              <p class="mt-1 text-xs text-slate-600">
                Use a sample, record audio then transcribe, or paste transcript text before analysis.
              </p>

              <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Sample Scenario
              </label>
              <select
                v-model="selectedIntelligenceSample"
                class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                @change="applyIntelligenceSample"
              >
                <option v-for="sample in intelligenceSamples" :key="sample.label" :value="sample.value">
                  {{ sample.label }}
                </option>
              </select>

              <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Transcript Text
              </label>
              <textarea
                v-model="transcriptInput"
                rows="6"
                class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                placeholder="Paste call transcript or meeting notes here..."
              ></textarea>

              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isRecording"
                  @click="startRecording"
                >
                  {{ isRecording ? 'Recording...' : 'Start Recording' }}
                </button>
                <button
                  type="button"
                  class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="!isRecording"
                  @click="stopRecording"
                >
                  Stop
                </button>
                <button
                  type="button"
                  class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="!recordedBlob || transcribeAction.loading.value"
                  @click="runTranscription"
                >
                  {{ transcribeAction.loading.value ? 'Transcribing...' : 'Transcribe Audio' }}
                </button>
                <button
                  type="button"
                  class="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
                  :disabled="intelligenceAction.loading.value"
                  @click="runAnalysis"
                >
                  {{ intelligenceAction.loading.value ? 'Analyzing...' : 'Analyze Meeting' }}
                </button>
              </div>

              <audio v-if="recordedAudioUrl" :src="recordedAudioUrl" controls class="mt-3 w-full"></audio>
              <AiErrorBanner class="mt-3" :message="panelError" />
            </div>
          </div>
        </aside>

        <section class="lg:col-span-7">
          <article class="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <SparklesIcon class="size-5 text-indigo-600" />
                <h2 class="text-lg font-semibold text-slate-900">Meeting Intelligence Dashboard</h2>
              </div>
              <AiModeBadge :mode="modeLabel" />
            </div>

            <AiLoadingSkeleton v-if="intelligenceAction.loading.value && selectedRecord?.status === 'Analyzing'" />

            <div v-else-if="selectedRecord" class="space-y-5">
              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Transcript</p>
                <p class="mt-2 text-sm font-medium text-slate-900">
                  {{ selectedRecord.account }} • Rep: {{ selectedRecord.rep }} • {{ selectedRecord.duration }}
                </p>
                <div
                  class="mt-3 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed whitespace-pre-line text-slate-700"
                >
                  {{ selectedRecord.transcriptFull }}
                </div>
              </section>

              <section v-if="selectedAnalysis" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon class="size-4 text-cyan-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Meeting Summary</p>
                </div>
                <ul class="space-y-2">
                  <li
                    v-for="item in selectedAnalysis.meetingSummary"
                    :key="item"
                    class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    {{ item }}
                  </li>
                </ul>
              </section>

              <section v-if="selectedAnalysis" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon class="size-4 text-amber-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Extracted Objections</p>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div
                    v-for="item in selectedAnalysis.objections"
                    :key="item.title"
                    class="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
                    <p class="mt-1 text-xs text-slate-600">Impact: {{ item.impact }}</p>
                    <p class="mt-2 text-xs font-medium text-indigo-700">{{ item.action }}</p>
                  </div>
                </div>
              </section>

              <section v-if="selectedAnalysis" class="grid gap-4 md:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <LightBulbIcon class="size-4 text-indigo-600" />
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Recommendations</p>
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="tip in selectedAnalysis.aiRecommendations"
                      :key="tip"
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {{ tip }}
                    </li>
                  </ul>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <ClockIcon class="size-4 text-rose-600" />
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Next Actions</p>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="step in selectedAnalysis.nextActions"
                      :key="`${step.due}-${step.task}`"
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <p class="text-xs font-medium text-indigo-700">{{ step.due }}</p>
                      <p class="mt-1 text-sm text-slate-700">{{ step.task }}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section
                v-if="!selectedAnalysis"
                class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600"
              >
                Intelligence output is not available for this record yet. Select another record or run analysis.
              </section>
            </div>

            <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p class="text-sm text-slate-600">Select a call record to view full transcript and intelligence output.</p>
            </div>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>
