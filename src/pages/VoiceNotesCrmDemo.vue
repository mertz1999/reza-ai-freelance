<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CloudArrowUpIcon,
  MicrophoneIcon,
  QueueListIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'
import AiActionPanel from '../components/AiActionPanel.vue'
import AiErrorBanner from '../components/AiErrorBanner.vue'
import AiLoadingSkeleton from '../components/AiLoadingSkeleton.vue'
import AiModeBadge from '../components/AiModeBadge.vue'
import { useAiAction } from '../composables/useAiAction'
import { aiService } from '../services/aiService'

const voiceNotesQueue = [
  {
    rep: 'Sara',
    duration: '01:12',
    note: 'Client likes the annual plan, budget around 40k, wants onboarding timeline.',
    status: 'Processing',
  },
  {
    rep: 'Amir',
    duration: '00:54',
    note: 'Decision maker asked for security details and next call this Thursday.',
    status: 'Ready',
  },
  {
    rep: 'Mina',
    duration: '01:33',
    note: 'Deal moved to proposal stage, asked for revised pricing with add-ons.',
    status: 'Synced',
  },
]

const extractedFields = [
  { label: 'Client', value: 'Nova Retail' },
  { label: 'Deal Stage', value: 'Proposal Sent' },
  { label: 'Estimated Value', value: '$45,000' },
  { label: 'Next Step', value: 'Send onboarding plan by Tuesday' },
  { label: 'Decision Maker', value: 'COO - Linda Hosseini' },
  { label: 'Priority', value: 'High' },
]

const crmRecordPreview = {
  account: 'Nova Retail',
  owner: 'Sara',
  stage: 'Proposal Sent',
  value: '$45,000',
  nextAction: 'Send onboarding plan + schedule technical review',
  lastUpdated: 'Today, 3:25 PM',
}

const integrationLog = [
  'Voice note transcribed successfully',
  'Deal information extracted with 94% confidence',
  'CRM fields mapped to Salesforce object format',
  'Record update pushed to mocked CRM API',
]

const qualityChecks = [
  'Missing field check passed',
  'Duplicate record check passed',
  'Owner mapping check passed',
]

const transcriptInput = ref(
  'Client confirmed budget around 45K and asked for onboarding details plus a technical review next Tuesday.'
)
const voiceSamples = [
  {
    label: 'Onboarding Request',
    value:
      'Client confirmed budget around 45K and asked for onboarding details plus a technical review next Tuesday.',
  },
  {
    label: 'Security Objection',
    value:
      'Decision maker wants a security checklist before signing. Deal value is around 60K and next step is a compliance review call on Thursday.',
  },
  {
    label: 'Expansion Opportunity',
    value:
      'Existing customer wants to expand from 12 to 30 seats next quarter. They requested updated pricing and onboarding timeline for the expanded team.',
  },
]
const selectedVoiceSample = ref(voiceSamples[0].value)
const recordedAudioUrl = ref('')
const recordedBlob = ref(null)
const isRecording = ref(false)

const liveExtractedFields = ref(extractedFields)
const liveCrmRecordPreview = ref(crmRecordPreview)
const liveIntegrationLog = ref(integrationLog)
const liveQualityChecks = ref(qualityChecks)

const transcribeAction = useAiAction((blob) => aiService.transcribe(blob))
const crmAction = useAiAction(aiService.voiceToCrm)

let mediaRecorder = null
let mediaStream = null
let audioChunks = []

const modeLabel = computed(() =>
  crmAction.data.value ? crmAction.mode.value : transcribeAction.mode.value
)

const startRecording = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    alert('Audio recording is not supported in this browser.')
    return
  }

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
}

const stopRecording = () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') return
  mediaRecorder.stop()
  isRecording.value = false
}

const runTranscription = async () => {
  if (!recordedBlob.value) return
  const response = await transcribeAction.run(recordedBlob.value)
  transcriptInput.value = response.data?.transcript || transcriptInput.value
}

const runCrmExtraction = async () => {
  const response = await crmAction.run(transcriptInput.value)
  liveExtractedFields.value = response.data?.extractedFields || extractedFields
  liveCrmRecordPreview.value = response.data?.crmRecordPreview || crmRecordPreview
  liveIntegrationLog.value = response.data?.integrationLog || integrationLog
  liveQualityChecks.value = response.data?.qualityChecks || qualityChecks
}

const applyVoiceSample = () => {
  transcriptInput.value = selectedVoiceSample.value
}

onBeforeUnmount(() => {
  if (recordedAudioUrl.value) {
    URL.revokeObjectURL(recordedAudioUrl.value)
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
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">Demo 3</p>
            <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              Voice Notes → CRM Automation
            </h1>
            <p class="mt-2 max-w-3xl text-sm text-slate-600">
              Product preview showing how voice updates are turned into structured CRM records with
              clean fields and action-ready next steps.
            </p>
          </div>
          <AiModeBadge :mode="modeLabel" />
        </div>
        <AiActionPanel
          class="mt-5"
          title="Try It Yourself"
          description="Record a short voice note or type/paste transcript text, then extract CRM fields."
        >
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Sample Scenario
          </label>
          <select
            v-model="selectedVoiceSample"
            class="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
            @change="applyVoiceSample"
          >
            <option v-for="sample in voiceSamples" :key="sample.label" :value="sample.value">
              {{ sample.label }}
            </option>
          </select>
          <textarea
            v-model="transcriptInput"
            rows="4"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
          ></textarea>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400"
              @click="startRecording"
            >
              {{ isRecording ? 'Recording...' : 'Start Recording' }}
            </button>
            <button
              type="button"
              class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400"
              @click="stopRecording"
            >
              Stop
            </button>
            <button
              type="button"
              class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400"
              :disabled="!recordedBlob"
              @click="runTranscription"
            >
              Transcribe Audio
            </button>
            <button
              type="button"
              class="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              @click="runCrmExtraction"
            >
              Extract CRM Fields
            </button>
            <AiModeBadge :mode="modeLabel" />
          </div>
          <audio v-if="recordedAudioUrl" :src="recordedAudioUrl" controls class="mt-3 w-full"></audio>
          <AiErrorBanner class="mt-3" :message="transcribeAction.error.value || crmAction.error.value" />
        </AiActionPanel>
      </section>

      <section class="grid min-h-[calc(100vh-220px)] gap-6 lg:grid-cols-12">
        <aside class="lg:col-span-5">
          <div class="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <MicrophoneIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">Voice Note Intake</h2>
            </div>

            <div class="space-y-3">
              <div
                v-for="note in voiceNotesQueue"
                :key="`${note.rep}-${note.duration}`"
                class="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <p class="text-sm font-medium text-slate-900">{{ note.rep }} • {{ note.duration }}</p>
                  <span
                    class="rounded-full px-2 py-1 text-[11px]"
                    :class="
                      note.status === 'Synced'
                        ? 'bg-emerald-100 text-emerald-700'
                        : note.status === 'Ready'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-amber-100 text-amber-700'
                    "
                  >
                    {{ note.status }}
                  </span>
                </div>
                <p class="mt-2 text-xs leading-relaxed text-slate-600">{{ note.note }}</p>
              </div>
            </div>

            <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Transcript Preview
              </p>
              <div class="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">
                {{ transcriptInput }}
              </div>
              <button
                type="button"
                class="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                @click="runCrmExtraction"
              >
                <CloudArrowUpIcon class="size-4" />
                Push to CRM Preview
              </button>
            </div>
          </div>
        </aside>

        <section class="space-y-6 lg:col-span-7">
          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <SparklesIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">Extracted CRM Fields</h2>
            </div>
            <AiLoadingSkeleton v-if="crmAction.loading.value || transcribeAction.loading.value" />
            <div class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="field in liveExtractedFields"
                :key="field.label"
                class="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p class="text-xs uppercase tracking-wide text-slate-500">{{ field.label }}</p>
                <p class="mt-1 text-sm font-medium text-slate-900">{{ field.value }}</p>
              </div>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <ClipboardDocumentListIcon class="size-5 text-cyan-600" />
              <h2 class="text-lg font-semibold text-slate-900">CRM Record Preview</h2>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p><span class="font-medium text-slate-900">Account:</span> {{ liveCrmRecordPreview.account }}</p>
              <p class="mt-1"><span class="font-medium text-slate-900">Owner:</span> {{ liveCrmRecordPreview.owner }}</p>
              <p class="mt-1"><span class="font-medium text-slate-900">Stage:</span> {{ liveCrmRecordPreview.stage }}</p>
              <p class="mt-1"><span class="font-medium text-slate-900">Value:</span> {{ liveCrmRecordPreview.value }}</p>
              <p class="mt-1">
                <span class="font-medium text-slate-900">Next Action:</span>
                {{ liveCrmRecordPreview.nextAction }}
              </p>
              <p class="mt-2 text-xs text-indigo-700">Updated: {{ liveCrmRecordPreview.lastUpdated }}</p>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <div class="mb-3 flex items-center gap-2">
                  <QueueListIcon class="size-5 text-rose-600" />
                  <h3 class="text-base font-semibold text-slate-900">Integration Log</h3>
                </div>
                <ul class="space-y-2">
                  <li
                    v-for="item in liveIntegrationLog"
                    :key="item"
                    class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div>
                <div class="mb-3 flex items-center gap-2">
                  <CheckCircleIcon class="size-5 text-emerald-600" />
                  <h3 class="text-base font-semibold text-slate-900">Quality Checks</h3>
                </div>
                <ul class="space-y-2">
                  <li
                    v-for="check in liveQualityChecks"
                    :key="check"
                    class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {{ check }}
                  </li>
                </ul>
              </div>
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-3 flex items-center gap-2">
              <UserGroupIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">Team Impact</h2>
            </div>
            <p class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              Sales reps can speak naturally after calls, while managers still get clean CRM data,
              consistent pipeline updates, and clear next steps without extra admin work.
            </p>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>
