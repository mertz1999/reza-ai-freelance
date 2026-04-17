<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChartBarIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  MicrophoneIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import AiErrorBanner from '../components/AiErrorBanner.vue'
import AiLoadingSkeleton from '../components/AiLoadingSkeleton.vue'
import AiModeBadge from '../components/AiModeBadge.vue'
import { useAiAction } from '../composables/useAiAction'
import { aiService } from '../services/aiService'

const makePreview = (text = '') => (text.length > 110 ? `${text.slice(0, 110)}...` : text)

const normalizeCoaching = (data = {}) => ({
  weakResponses: Array.isArray(data.weakResponses)
    ? data.weakResponses
        .filter((item) => item?.issue && item?.original && item?.improved)
        .map((item) => ({ issue: item.issue, original: item.original, improved: item.improved }))
    : [],
  coachingStrategies: Array.isArray(data.coachingStrategies)
    ? data.coachingStrategies.filter((item) => typeof item === 'string' && item.trim())
    : [],
  conversationMetrics: Array.isArray(data.conversationMetrics)
    ? data.conversationMetrics
        .filter((item) => item?.label && item?.value)
        .map((item) => ({ label: item.label, value: item.value }))
    : [],
  practicePlan: Array.isArray(data.practicePlan)
    ? data.practicePlan
        .filter((item) => item?.step && item?.task)
        .map((item) => ({ step: item.step, task: item.task }))
    : [],
  coachSummary:
    typeof data.coachSummary === 'string' && data.coachSummary.trim()
      ? data.coachSummary
      : 'No coaching summary was generated.',
})

const predefinedRecords = [
  {
    id: 'coach-sara',
    source: 'predefined',
    rep: 'Sara',
    duration: '26m',
    status: 'Analyzed',
    transcriptFull: `Rep opened with broad positioning and said, "we are better than other options," without giving evidence. Client immediately asked what proof exists that onboarding can be completed in less than a month. Rep gave a general reassurance but did not provide measurable examples or a prior case.\n\nLater, when pricing came up, the client asked why this solution costs more than alternatives. Rep responded with confidence language but did not tie value to conversion lift or reduced manual workload. Call ended with positive tone, but no date-bound next step was confirmed.`,
    preview:
      'Generic value statements, weak proof handling, and no concrete close date in final call segment.',
    mode: 'mock',
    coaching: normalizeCoaching({
      weakResponses: [
        {
          issue: 'Generic value statement',
          original: 'We are better than other options.',
          improved:
            'Teams choose us because onboarding is usually completed in under 30 days with clear milestones and manager visibility.',
        },
        {
          issue: 'No proof on pricing objection',
          original: 'It is more expensive because it is better.',
          improved:
            'Teams typically recover the difference within one quarter by cutting manual follow-up time and improving response speed.',
        },
      ],
      coachingStrategies: [
        'Replace generic claims with quantifiable outcomes and timeline evidence.',
        'Use one concrete case study when pricing objections appear.',
        'Always end with one date-based next step and owner.',
      ],
      conversationMetrics: [
        { label: 'Confidence Score', value: '76%' },
        { label: 'Objection Handling', value: '69%' },
        { label: 'Clarity Score', value: '82%' },
        { label: 'Next-Step Quality', value: '63%' },
      ],
      practicePlan: [
        { step: '1', task: 'Practice proof-based value statements for first 3 minutes.' },
        { step: '2', task: 'Prepare one ROI objection response with measurable outcome.' },
        { step: '3', task: 'Close every call with a confirmed date and owner.' },
      ],
      coachSummary:
        'Discovery quality is strong, but objection responses need more measurable proof. Closing discipline should improve with explicit date-based commitments.',
    }),
  },
  {
    id: 'coach-amir',
    source: 'predefined',
    rep: 'Amir',
    duration: '31m',
    status: 'Analyzed',
    transcriptFull: `Client asked direct questions about migration risk and team training load. Rep addressed concerns but shifted quickly back to product features instead of validating the risk with a structured plan. Mid-call, the buyer requested one implementation example from a similar team, but rep gave a broad narrative instead of a concrete metric.\n\nToward the end, buyer asked for next-step structure. Rep suggested "we can follow up soon" without a fixed calendar commitment.`,
    preview:
      'Handled concerns politely but lacked structure in risk response and next-step confirmation.',
    mode: 'mock',
    coaching: normalizeCoaching({
      weakResponses: [
        {
          issue: 'Risk concerns not structured',
          original: 'We can handle migration issues.',
          improved:
            'We use a phased migration plan with rollback checkpoints, so risk is controlled at each stage.',
        },
        {
          issue: 'Weak close',
          original: 'We can follow up soon.',
          improved: 'I will send the phased plan today and confirm a technical review tomorrow at 11:00 AM.',
        },
      ],
      coachingStrategies: [
        'Mirror the buyer concern before giving the solution.',
        'Pair each feature statement with a risk-control example.',
        'Convert soft closes into specific calendar actions.',
      ],
      conversationMetrics: [
        { label: 'Confidence Score', value: '81%' },
        { label: 'Objection Handling', value: '72%' },
        { label: 'Clarity Score', value: '79%' },
        { label: 'Next-Step Quality', value: '66%' },
      ],
      practicePlan: [
        { step: '1', task: 'Practice concern acknowledgment sentence for migration objections.' },
        { step: '2', task: 'Prepare two implementation proof points with numbers.' },
        { step: '3', task: 'Use fixed-time close in last 2 minutes of calls.' },
      ],
      coachSummary:
        'Call control and tone are solid. The biggest lift will come from stronger proof framing and tighter, calendar-based closes.',
    }),
  },
  {
    id: 'coach-mina',
    source: 'predefined',
    rep: 'Mina',
    duration: '23m',
    status: 'Processing',
    transcriptFull: `Rep presented the proposal summary clearly, and the client acknowledged strong interest. When asked about internal adoption support, rep gave a short answer but did not explain enablement process in detail. Buyer asked for examples of implementation outcomes from similar organizations.\n\nCall ended with a request for follow-up assets, but no ownership and due date were explicitly set.`,
    preview:
      'Strong proposal delivery but limited adoption explanation and weak next-step ownership.',
    mode: 'mock',
    coaching: normalizeCoaching({
      weakResponses: [
        {
          issue: 'Adoption support too vague',
          original: 'We help teams adopt quickly.',
          improved:
            'We run a two-week enablement sequence with manager checkpoints and rep-level coaching tasks.',
        },
      ],
      coachingStrategies: [
        'Expand adoption responses with process, owners, and timeline.',
        'Use peer-industry examples to reinforce confidence.',
        'Close each call with due date plus responsible stakeholder.',
      ],
      conversationMetrics: [
        { label: 'Confidence Score', value: '83%' },
        { label: 'Objection Handling', value: '74%' },
        { label: 'Clarity Score', value: '85%' },
        { label: 'Next-Step Quality', value: '68%' },
      ],
      practicePlan: [
        { step: '1', task: 'Write a 30-second adoption enablement explanation.' },
        { step: '2', task: 'Practice one retail-specific implementation example.' },
        { step: '3', task: 'Use owner + deadline close template.' },
      ],
      coachSummary:
        'Messaging is clear and confident. Conversion can improve by detailing adoption support and tightening next-step ownership.',
    }),
  },
]

const coachingSamples = [
  {
    label: 'Weak Value Statement',
    value:
      'Rep said: We are better than others. Client asked for proof of onboarding speed. Rep replied generally and did not include measurable evidence. Call ended without confirming a next meeting time.',
  },
  {
    label: 'Pricing Objection',
    value:
      'Client asked why pricing is higher than alternatives. Rep said quality is better but gave no quantified business impact. Buyer requested one ROI example and follow-up timeline.',
  },
  {
    label: 'Call Close Quality',
    value:
      'Client showed interest and requested follow-up materials. Rep agreed to send them but did not confirm exact delivery time, owner, or decision checkpoint date.',
  },
]

const records = ref(predefinedRecords)
const selectedRecordId = ref(predefinedRecords[0].id)
const transcriptInput = ref(coachingSamples[0].value)
const selectedCoachingSample = ref(coachingSamples[0].value)
const recordedAudioUrl = ref('')
const recordedBlob = ref(null)
const isRecording = ref(false)
const localInputError = ref('')

const transcribeAction = useAiAction((blob) => aiService.transcribe(blob))
const coachingAction = useAiAction(aiService.coaching)

let mediaRecorder = null
let mediaStream = null
let audioChunks = []

const selectedRecord = computed(() => {
  return records.value.find((record) => record.id === selectedRecordId.value) || null
})

const selectedCoaching = computed(() => selectedRecord.value?.coaching || null)

const modeLabel = computed(() => selectedRecord.value?.mode || 'mock')

const panelError = computed(
  () => localInputError.value || transcribeAction.error.value || coachingAction.error.value
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

const applyCoachingSample = () => {
  transcriptInput.value = selectedCoachingSample.value
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

const createRecordId = () => `coach-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`

const runCoaching = async () => {
  const transcript = transcriptInput.value.trim()
  if (!transcript) {
    localInputError.value = 'Please paste or transcribe text before coaching analysis.'
    return
  }

  localInputError.value = ''

  const previousRecordId = selectedRecordId.value
  const recordId = createRecordId()

  const newRecord = {
    id: recordId,
    source: 'user',
    rep: 'You',
    duration: 'Text Input',
    status: 'Analyzing',
    transcriptFull: transcript,
    preview: makePreview(transcript),
    mode: 'mock',
    coaching: null,
  }

  records.value = [newRecord, ...records.value]
  selectedRecordId.value = recordId

  try {
    const response = await coachingAction.run(transcript)
    const normalized = normalizeCoaching(response.data)

    records.value = records.value.map((record) =>
      record.id === recordId
        ? {
            ...record,
            status: 'Analyzed',
            mode: response.mode || 'mock',
            coaching: normalized,
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
        <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">Demo 5</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Meeting Transcription -> Improvement Coach
        </h1>
        <p class="mt-2 max-w-3xl text-sm text-slate-600">
          Select a coaching record on the left to view full transcript and improvement insights on the right.
          You can also record, transcribe, or paste text and generate new coaching analysis.
        </p>
      </section>

      <section class="grid gap-6 lg:grid-cols-12">
        <aside class="lg:col-span-5">
          <div class="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <DocumentTextIcon class="size-5 text-indigo-600" />
                <h2 class="text-lg font-semibold text-slate-900">Transcription Feed</h2>
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
                    <p class="text-sm font-medium text-slate-900">Rep: {{ record.rep }}</p>
                    <p class="mt-0.5 text-xs text-slate-500">{{ record.duration }}</p>
                  </div>
                  <span class="rounded-full px-2 py-1 text-[11px]" :class="statusClass(record.status)">
                    {{ record.status }}
                  </span>
                </div>
                <p class="mt-2 text-xs leading-relaxed text-slate-600">{{ record.preview }}</p>
              </button>
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-900">Record or Paste Transcript</p>
              <p class="mt-1 text-xs text-slate-600">
                Use sample text, record audio then transcribe, or paste transcript before analysis.
              </p>

              <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Sample Scenario
              </label>
              <select
                v-model="selectedCoachingSample"
                class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                @change="applyCoachingSample"
              >
                <option v-for="sample in coachingSamples" :key="sample.label" :value="sample.value">
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
                placeholder="Paste meeting transcript text here..."
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
                  :disabled="coachingAction.loading.value"
                  @click="runCoaching"
                >
                  {{ coachingAction.loading.value ? 'Analyzing...' : 'Analyze & Coach' }}
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
                <h2 class="text-lg font-semibold text-slate-900">Improvement Coach Dashboard</h2>
              </div>
              <AiModeBadge :mode="modeLabel" />
            </div>

            <AiLoadingSkeleton v-if="coachingAction.loading.value && selectedRecord?.status === 'Analyzing'" />

            <div v-else-if="selectedRecord" class="space-y-5">
              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Transcript</p>
                <p class="mt-2 text-sm font-medium text-slate-900">Rep: {{ selectedRecord.rep }} • {{ selectedRecord.duration }}</p>
                <div
                  class="mt-3 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed whitespace-pre-line text-slate-700"
                >
                  {{ selectedRecord.transcriptFull }}
                </div>
              </section>

              <section v-if="selectedCoaching" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon class="size-4 text-amber-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Weak Responses Detected</p>
                </div>
                <div class="space-y-3">
                  <div
                    v-for="item in selectedCoaching.weakResponses"
                    :key="item.issue"
                    class="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <p class="text-sm font-medium text-slate-900">{{ item.issue }}</p>
                    <p class="mt-2 text-xs text-slate-600"><span class="font-semibold">Original:</span> {{ item.original }}</p>
                    <p class="mt-2 text-xs text-indigo-700"><span class="font-semibold">Improved:</span> {{ item.improved }}</p>
                  </div>
                </div>
              </section>

              <section v-if="selectedCoaching" class="grid gap-4 md:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <ChartBarIcon class="size-4 text-cyan-600" />
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Conversation Metrics</p>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div
                      v-for="metric in selectedCoaching.conversationMetrics"
                      :key="metric.label"
                      class="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <p class="text-[11px] uppercase tracking-wide text-slate-500">{{ metric.label }}</p>
                      <p class="mt-1 text-lg font-semibold text-slate-900">{{ metric.value }}</p>
                    </div>
                  </div>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <LightBulbIcon class="size-4 text-indigo-600" />
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Coaching Strategies</p>
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="tip in selectedCoaching.coachingStrategies"
                      :key="tip"
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {{ tip }}
                    </li>
                  </ul>
                </div>
              </section>

              <section v-if="selectedCoaching" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon class="size-4 text-indigo-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Next Practice Plan</p>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="item in selectedCoaching.practicePlan"
                    :key="item.step"
                    class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <span
                      class="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700"
                    >
                      {{ item.step }}
                    </span>
                    <p class="text-sm text-slate-700">{{ item.task }}</p>
                  </div>
                </div>
              </section>

              <section v-if="selectedCoaching" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <CheckBadgeIcon class="size-4 text-emerald-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Coach Summary</p>
                </div>
                <p class="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  {{ selectedCoaching.coachSummary }}
                </p>
              </section>

              <section
                v-if="!selectedCoaching"
                class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600"
              >
                Coaching output is not available for this record yet. Select another record or run analysis.
              </section>
            </div>

            <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p class="text-sm text-slate-600">Select a transcription record to view coaching analysis.</p>
            </div>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>
