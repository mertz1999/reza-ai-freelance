<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  MicrophoneIcon,
  QueueListIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import AiErrorBanner from '../components/AiErrorBanner.vue'
import AiLoadingSkeleton from '../components/AiLoadingSkeleton.vue'
import AiModeBadge from '../components/AiModeBadge.vue'
import { useAiAction } from '../composables/useAiAction'
import { aiService } from '../services/aiService'

const nowLabel = () =>
  new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  })

const makePreview = (text = '') => (text.length > 110 ? `${text.slice(0, 110)}...` : text)

const normalizeExtraction = (data = {}) => ({
  extractedFields: Array.isArray(data.extractedFields)
    ? data.extractedFields.filter((item) => item?.label && item?.value)
    : [],
  crmRecordPreview: {
    account: data.crmRecordPreview?.account || 'Unknown Account',
    owner: data.crmRecordPreview?.owner || 'Unassigned',
    stage: data.crmRecordPreview?.stage || 'Discovery',
    value: data.crmRecordPreview?.value || 'N/A',
    nextAction: data.crmRecordPreview?.nextAction || 'No next action provided.',
    lastUpdated: data.crmRecordPreview?.lastUpdated || nowLabel(),
  },
  integrationLog: Array.isArray(data.integrationLog)
    ? data.integrationLog.filter((item) => typeof item === 'string' && item.trim())
    : [],
  qualityChecks: Array.isArray(data.qualityChecks)
    ? data.qualityChecks.filter((item) => typeof item === 'string' && item.trim())
    : [],
})

const predefinedRecords = [
  {
    id: 'voice-sara',
    source: 'predefined',
    rep: 'Sara',
    duration: '01:18',
    status: 'Ready',
    transcriptFull: `Hi team, quick update after the Acme follow-up call. They confirmed budget range at about 45,000 for an annual rollout, and they liked the automation dashboards for missed follow-ups. The blocker is onboarding clarity for the SDR team and timeline confidence from ops. They asked for a week-by-week rollout draft plus exactly which CRM fields will be synced and visible to managers.\n\nDecision makers want this before procurement review tomorrow morning. If we send onboarding milestones and data mapping tonight, they said we can stay in final approval this week. I recommend we send documentation and offer a short Q and A slot today to avoid delay risk.`,
    preview:
      'Acme confirmed 45K budget but needs onboarding timeline and CRM field mapping before procurement review tomorrow.',
    mode: 'mock',
    extraction: normalizeExtraction({
      extractedFields: [
        { label: 'Client', value: 'Acme Logistics' },
        { label: 'Deal Stage', value: 'Final Review' },
        { label: 'Estimated Value', value: '$45,000' },
        { label: 'Next Step', value: 'Send onboarding timeline + CRM field mapping today' },
        { label: 'Decision Maker', value: 'Procurement + Revenue Ops Lead' },
        { label: 'Priority', value: 'High' },
      ],
      crmRecordPreview: {
        account: 'Acme Logistics',
        owner: 'Sara',
        stage: 'Final Review',
        value: '$45,000',
        nextAction: 'Share onboarding milestones and host procurement Q and A call today',
        lastUpdated: nowLabel(),
      },
      integrationLog: [
        'Transcript parsed from predefined call note',
        'Budget, stage, and blocker fields mapped',
        'Next-step action generated for procurement deadline',
        'Record prepared for CRM sync preview',
      ],
      qualityChecks: [
        'Required account fields present',
        'Stage-value consistency check passed',
        'Next action includes clear owner and timing',
      ],
    }),
  },
  {
    id: 'voice-amir',
    source: 'predefined',
    rep: 'Amir',
    duration: '00:59',
    status: 'Synced',
    transcriptFull: `Update from Nova Retail: leadership is interested, but legal and security want a checklist before moving to signature. Deal size is near 60,000 and they want confirmation of data handling and retention policy. They also requested a compliance walkthrough on Thursday with their IT manager and finance lead.\n\nI told them we can provide security docs and implementation controls in one package. If we send the checklist and book the walkthrough this week, they are comfortable keeping this in active approval instead of postponing to next quarter.`,
    preview:
      'Nova asked for security checklist and compliance walkthrough before signing; deal size near 60K.',
    mode: 'mock',
    extraction: normalizeExtraction({
      extractedFields: [
        { label: 'Client', value: 'Nova Retail' },
        { label: 'Deal Stage', value: 'Security Review' },
        { label: 'Estimated Value', value: '$60,000' },
        { label: 'Next Step', value: 'Send security package and schedule Thursday walkthrough' },
        { label: 'Decision Maker', value: 'IT Manager + Finance Lead' },
        { label: 'Priority', value: 'High' },
      ],
      crmRecordPreview: {
        account: 'Nova Retail',
        owner: 'Amir',
        stage: 'Security Review',
        value: '$60,000',
        nextAction: 'Deliver security checklist and confirm Thursday compliance meeting',
        lastUpdated: nowLabel(),
      },
      integrationLog: [
        'Security intent extracted from transcript',
        'Stakeholder roles mapped to decision chain',
        'Compliance follow-up task created',
        'CRM preview status marked as synced',
      ],
      qualityChecks: [
        'Stakeholder mapping check passed',
        'Security request captured with due timing',
        'Duplicate opportunity check passed',
      ],
    }),
  },
  {
    id: 'voice-mina',
    source: 'predefined',
    rep: 'Mina',
    duration: '01:34',
    status: 'Ready',
    transcriptFull: `Peak Interiors moved into proposal stage after internal review. Their CFO requested revised package pricing with add-ons separated by implementation scope. They also need kickoff date confidence because their onboarding window is tied to a quarterly planning cycle.\n\nI explained we can provide tiered pricing and phased onboarding options. They asked us to send a revised commercial summary and suggest a decision call for Thursday. If we align pricing with their rollout window, this can close in the current cycle.`,
    preview:
      'Peak needs revised tiered pricing and kickoff timeline alignment before Thursday decision call.',
    mode: 'mock',
    extraction: normalizeExtraction({
      extractedFields: [
        { label: 'Client', value: 'Peak Interiors' },
        { label: 'Deal Stage', value: 'Proposal Stage' },
        { label: 'Estimated Value', value: '$31,200' },
        { label: 'Next Step', value: 'Send revised tiered pricing and propose Thursday decision call' },
        { label: 'Decision Maker', value: 'CFO + Operations Manager' },
        { label: 'Priority', value: 'Medium' },
      ],
      crmRecordPreview: {
        account: 'Peak Interiors',
        owner: 'Mina',
        stage: 'Proposal Stage',
        value: '$31,200',
        nextAction: 'Issue revised pricing tiers and align kickoff date to quarterly planning window',
        lastUpdated: nowLabel(),
      },
      integrationLog: [
        'Proposal-stage transition captured',
        'Pricing revision requirement extracted',
        'Decision-call recommendation generated',
        'CRM record prepared for manager review',
      ],
      qualityChecks: [
        'Stage transition check passed',
        'Commercial request fields completed',
        'Action plan includes deadline and intent',
      ],
    }),
  },
]

const voiceSamples = [
  {
    label: 'Onboarding Timeline Risk',
    value:
      'Client confirmed annual budget near 52K but asked for a week-by-week onboarding rollout and clear ownership. They want this before procurement review tomorrow morning. If we send timeline and CRM field mapping tonight, they can keep approval in this quarter.',
  },
  {
    label: 'Security + Legal Review',
    value:
      'Decision maker said legal and security need a checklist before signature. Opportunity is around 68K and they requested a compliance walkthrough this Thursday with IT and finance stakeholders. We should send security docs and lock the review call to avoid delay.',
  },
  {
    label: 'Expansion Opportunity',
    value:
      'Existing customer wants to expand from 12 to 30 seats next quarter. They requested revised pricing for expansion tiers, onboarding timeline for the larger team, and confirmation of the technical owner from our side before final approval.',
  },
]

const records = ref(predefinedRecords)
const selectedRecordId = ref(predefinedRecords[0].id)
const transcriptInput = ref(voiceSamples[0].value)
const selectedVoiceSample = ref(voiceSamples[0].value)
const recordedAudioUrl = ref('')
const recordedBlob = ref(null)
const isRecording = ref(false)
const localInputError = ref('')

const transcribeAction = useAiAction((blob) => aiService.transcribe(blob))
const crmAction = useAiAction(aiService.voiceToCrm)

let mediaRecorder = null
let mediaStream = null
let audioChunks = []

const selectedRecord = computed(() => {
  return records.value.find((record) => record.id === selectedRecordId.value) || null
})

const selectedExtraction = computed(() => selectedRecord.value?.extraction || null)

const modeLabel = computed(() => selectedRecord.value?.mode || 'mock')

const panelError = computed(
  () => localInputError.value || transcribeAction.error.value || crmAction.error.value
)

const selectRecord = (recordId) => {
  selectedRecordId.value = recordId
}

const statusClass = (status) => {
  if (status === 'Synced' || status === 'Extracted') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Ready') return 'bg-indigo-100 text-indigo-700'
  if (status === 'Extraction Failed') return 'bg-rose-100 text-rose-700'
  return 'bg-amber-100 text-amber-700'
}

const applyVoiceSample = () => {
  transcriptInput.value = selectedVoiceSample.value
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

const createRecordId = () => `voice-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`

const runCrmExtraction = async () => {
  const transcript = transcriptInput.value.trim()
  if (!transcript) {
    localInputError.value = 'Please paste or transcribe text before extracting CRM fields.'
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
    status: 'Extracting',
    transcriptFull: transcript,
    preview: makePreview(transcript),
    mode: 'mock',
    extraction: null,
  }

  records.value = [newRecord, ...records.value]
  selectedRecordId.value = recordId

  try {
    const response = await crmAction.run(transcript)
    const normalized = normalizeExtraction(response.data)

    records.value = records.value.map((record) =>
      record.id === recordId
        ? {
            ...record,
            status: 'Extracted',
            mode: response.mode || 'mock',
            extraction: normalized,
          }
        : record
    )

    transcriptInput.value = ''
  } catch {
    records.value = records.value.map((record) =>
      record.id === recordId
        ? {
            ...record,
            status: 'Extraction Failed',
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
        <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">Demo 3</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Voice Notes -> CRM Automation
        </h1>
        <p class="mt-2 max-w-3xl text-sm text-slate-600">
          Select any voice note record on the left to inspect the full transcript and CRM extraction on the right.
          You can also record audio, transcribe it, or paste text and extract new CRM records.
        </p>
      </section>

      <section class="grid gap-6 lg:grid-cols-12">
        <aside class="lg:col-span-5">
          <div class="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <MicrophoneIcon class="size-5 text-indigo-600" />
                <h2 class="text-lg font-semibold text-slate-900">Voice Note Intake</h2>
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
                    <p class="text-sm font-medium text-slate-900">{{ record.rep }} • {{ record.duration }}</p>
                    <p class="mt-0.5 text-xs text-slate-500">
                      {{ record.source === 'user' ? 'Manual/Recorded input' : 'Predefined sample' }}
                    </p>
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
                Select a sample, record audio and transcribe, or paste text directly before extraction.
              </p>

              <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Sample Scenario
              </label>
              <select
                v-model="selectedVoiceSample"
                class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                @change="applyVoiceSample"
              >
                <option v-for="sample in voiceSamples" :key="sample.label" :value="sample.value">
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
                placeholder="Paste call transcript or transcribed voice text here..."
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
                  :disabled="crmAction.loading.value"
                  @click="runCrmExtraction"
                >
                  {{ crmAction.loading.value ? 'Extracting...' : 'Extract CRM Fields' }}
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
                <h2 class="text-lg font-semibold text-slate-900">CRM Extraction Dashboard</h2>
              </div>
              <AiModeBadge :mode="modeLabel" />
            </div>

            <AiLoadingSkeleton v-if="crmAction.loading.value && selectedRecord?.status === 'Extracting'" />

            <div v-else-if="selectedRecord" class="space-y-5">
              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Transcript</p>
                <p class="mt-2 text-sm font-medium text-slate-900">{{ selectedRecord.rep }} • {{ selectedRecord.duration }}</p>
                <div
                  class="mt-3 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed whitespace-pre-line text-slate-700"
                >
                  {{ selectedRecord.transcriptFull }}
                </div>
              </section>

              <section v-if="selectedExtraction" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <SparklesIcon class="size-4 text-indigo-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Extracted CRM Fields</p>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div
                    v-for="field in selectedExtraction.extractedFields"
                    :key="field.label"
                    class="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <p class="text-xs uppercase tracking-wide text-slate-500">{{ field.label }}</p>
                    <p class="mt-1 text-sm font-medium text-slate-900">{{ field.value }}</p>
                  </div>
                </div>
              </section>

              <section v-if="selectedExtraction" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <ClipboardDocumentListIcon class="size-4 text-cyan-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">CRM Record Preview</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <p><span class="font-medium text-slate-900">Account:</span> {{ selectedExtraction.crmRecordPreview.account }}</p>
                  <p class="mt-1"><span class="font-medium text-slate-900">Owner:</span> {{ selectedExtraction.crmRecordPreview.owner }}</p>
                  <p class="mt-1"><span class="font-medium text-slate-900">Stage:</span> {{ selectedExtraction.crmRecordPreview.stage }}</p>
                  <p class="mt-1"><span class="font-medium text-slate-900">Value:</span> {{ selectedExtraction.crmRecordPreview.value }}</p>
                  <p class="mt-1">
                    <span class="font-medium text-slate-900">Next Action:</span>
                    {{ selectedExtraction.crmRecordPreview.nextAction }}
                  </p>
                  <p class="mt-2 text-xs text-indigo-700">Updated: {{ selectedExtraction.crmRecordPreview.lastUpdated }}</p>
                </div>
              </section>

              <section v-if="selectedExtraction" class="grid gap-4 md:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <QueueListIcon class="size-4 text-rose-600" />
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Integration Log</p>
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="item in selectedExtraction.integrationLog"
                      :key="item"
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <CheckCircleIcon class="size-4 text-emerald-600" />
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Quality Checks</p>
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="check in selectedExtraction.qualityChecks"
                      :key="check"
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {{ check }}
                    </li>
                  </ul>
                </div>
              </section>

              <section
                v-if="!selectedExtraction"
                class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600"
              >
                Extraction data is not available for this record yet. Select another record or run extraction.
              </section>
            </div>

            <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p class="text-sm text-slate-600">Select a voice note record to view transcript and CRM extraction.</p>
            </div>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>
