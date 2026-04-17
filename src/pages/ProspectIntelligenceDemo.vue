<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BoltIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LinkIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'
import AiErrorBanner from '../components/AiErrorBanner.vue'
import AiLoadingSkeleton from '../components/AiLoadingSkeleton.vue'
import AiModeBadge from '../components/AiModeBadge.vue'
import { useAiAction } from '../composables/useAiAction'
import { aiService } from '../services/aiService'

const prospectSamples = [
  {
    label: 'SaaS VP Sales',
    name: 'Jordan Lee',
    company: 'NexaOps',
    linkedinUrl: 'https://www.linkedin.com/in/jordan-lee-sales',
    xUrl: 'https://x.com/jordanleegtm',
    additionalContext: 'Team is scaling from 8 to 20 reps this year.',
  },
  {
    label: 'Head of RevOps',
    name: 'Avery Patel',
    company: 'FluxRetail',
    linkedinUrl: 'https://www.linkedin.com/in/avery-patel-revops',
    xUrl: 'https://x.com/averyrevops',
    additionalContext: 'Recently hiring for sales operations and enablement.',
  },
  {
    label: 'Founder-Led Sales',
    name: 'Morgan Chen',
    company: 'CloudHarbor',
    linkedinUrl: 'https://www.linkedin.com/in/morgan-chen-founder',
    xUrl: 'https://x.com/morganbuilds',
    additionalContext: 'Founder still runs most enterprise sales calls.',
  },
]

const selectedSample = ref(prospectSamples[0].label)
const nameInput = ref(prospectSamples[0].name)
const companyInput = ref(prospectSamples[0].company)
const linkedinUrlInput = ref(prospectSamples[0].linkedinUrl)
const xUrlInput = ref(prospectSamples[0].xUrl)
const contextInput = ref(prospectSamples[0].additionalContext)
const localError = ref('')

const reportData = ref(null)
const reportMeta = ref(null)

const researchAction = useAiAction(aiService.prospectIntelligence)

const applySample = () => {
  const sample = prospectSamples.find((item) => item.label === selectedSample.value)
  if (!sample) return

  nameInput.value = sample.name
  companyInput.value = sample.company
  linkedinUrlInput.value = sample.linkedinUrl
  xUrlInput.value = sample.xUrl
  contextInput.value = sample.additionalContext
  localError.value = ''
}

const normalizeReport = (data = {}) => ({
  personOverview: {
    name: data.personOverview?.name || 'Unknown',
    role: data.personOverview?.role || 'Unknown role',
    company: data.personOverview?.company || companyInput.value || 'Unknown company',
    summary: data.personOverview?.summary || 'No summary generated.',
  },
  recentPublicActivity: Array.isArray(data.recentPublicActivity)
    ? data.recentPublicActivity
        .filter((item) => item?.title && item?.summary)
        .map((item) => ({
          platform: item.platform || 'Web',
          title: item.title,
          summary: item.summary,
          url: item.url || '',
        }))
    : [],
  recentThemes: Array.isArray(data.recentThemes)
    ? data.recentThemes.filter((item) => typeof item === 'string' && item.trim())
    : [],
  buyingSignals: Array.isArray(data.buyingSignals)
    ? data.buyingSignals.filter((item) => typeof item === 'string' && item.trim())
    : [],
  risks: Array.isArray(data.risks)
    ? data.risks.filter((item) => typeof item === 'string' && item.trim())
    : [],
  suggestedAngle:
    typeof data.suggestedAngle === 'string' && data.suggestedAngle.trim()
      ? data.suggestedAngle
      : 'No suggested angle generated.',
  outreach: {
    coldEmail: {
      subject: data.outreach?.coldEmail?.subject || 'Follow-up idea',
      body: data.outreach?.coldEmail?.body || 'No cold email generated.',
    },
    linkedinDm: data.outreach?.linkedinDm || 'No LinkedIn DM generated.',
    callOpener: data.outreach?.callOpener || 'No call opener generated.',
  },
  sourceHighlights: Array.isArray(data.sourceHighlights)
    ? data.sourceHighlights
        .filter((item) => item?.title && item?.url)
        .map((item) => ({ title: item.title, url: item.url, insight: item.insight || '' }))
    : [],
})

const mergedSources = computed(() => {
  const fromMeta = Array.isArray(reportMeta.value?.sources)
    ? reportMeta.value.sources.map((item) => ({
        title: item.url,
        url: item.url,
        insight: 'Referenced by web search tool.',
      }))
    : []

  const fromReport = Array.isArray(reportData.value?.sourceHighlights)
    ? reportData.value.sourceHighlights
    : []

  const deduped = new Map()
  ;[...fromReport, ...fromMeta].forEach((source) => {
    if (!source?.url) return
    if (!deduped.has(source.url)) {
      deduped.set(source.url, source)
    }
  })

  return Array.from(deduped.values())
})

const defaultAssumptions = {
  webSearchPricePerCallUsd: 0.01,
  inputPricePer1MUsd: 0,
  outputPricePer1MUsd: 0,
}

const costEstimate = computed(() => {
  const usage = reportMeta.value?.usage || { input_tokens: 0, output_tokens: 0, total_tokens: 0 }
  const assumptions = reportMeta.value?.costEstimate?.assumptions || defaultAssumptions
  const webSearchCalls = Number(reportMeta.value?.webSearchCalls || 0)
  const inputTokens = Number(usage.input_tokens || 0)
  const outputTokens = Number(usage.output_tokens || 0)

  const tokenCostUsd =
    (inputTokens / 1_000_000) * Number(assumptions.inputPricePer1MUsd || 0) +
    (outputTokens / 1_000_000) * Number(assumptions.outputPricePer1MUsd || 0)
  const webSearchCostUsd = webSearchCalls * Number(assumptions.webSearchPricePerCallUsd || 0)
  const totalCostUsd = tokenCostUsd + webSearchCostUsd

  return {
    webSearchCalls,
    inputTokens,
    outputTokens,
    totalTokens: Number(usage.total_tokens || 0),
    assumptions,
    tokenCostUsd,
    webSearchCostUsd,
    totalCostUsd,
  }
})

const currency = (value) => `$${Number(value || 0).toFixed(4)}`

const runResearch = async () => {
  if (!nameInput.value.trim()) {
    localError.value = 'Please enter a prospect name before generating intelligence.'
    return
  }

  localError.value = ''

  const payload = {
    name: nameInput.value.trim(),
    company: companyInput.value.trim(),
    linkedinUrl: linkedinUrlInput.value.trim(),
    xUrl: xUrlInput.value.trim(),
    additionalContext: contextInput.value.trim(),
  }

  const response = await researchAction.run(payload)
  reportData.value = normalizeReport(response.data)
  reportMeta.value = response.meta || null
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
        <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">Demo 5</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Prospect Intelligence Agent</h1>
        <p class="mt-2 max-w-3xl text-sm text-slate-600">
          AI agent that searches public web sources to build a prospect research brief, buying signals,
          and personalized outreach messaging.
        </p>
      </section>

      <section class="grid gap-6 lg:grid-cols-12">
        <aside class="lg:col-span-5">
          <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <GlobeAltIcon class="size-5 text-indigo-600" />
                <h2 class="text-lg font-semibold text-slate-900">Prospect Input</h2>
              </div>
              <AiModeBadge :mode="researchAction.mode.value" />
            </div>

            <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">Sample Prospect</label>
            <select
              v-model="selectedSample"
              class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
              @change="applySample"
            >
              <option v-for="sample in prospectSamples" :key="sample.label" :value="sample.label">
                {{ sample.label }}
              </option>
            </select>

            <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">Name</label>
            <input
              v-model="nameInput"
              type="text"
              class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
              placeholder="Prospect full name"
            />

            <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">Company</label>
            <input
              v-model="companyInput"
              type="text"
              class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
              placeholder="Company name"
            />

            <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">LinkedIn URL (Optional)</label>
            <input
              v-model="linkedinUrlInput"
              type="text"
              class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
              placeholder="https://www.linkedin.com/in/..."
            />

            <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">X URL (Optional)</label>
            <input
              v-model="xUrlInput"
              type="text"
              class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
              placeholder="https://x.com/..."
            />

            <label class="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">Additional Context</label>
            <textarea
              v-model="contextInput"
              rows="4"
              class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
              placeholder="Any context you already know about this prospect..."
            ></textarea>

            <button
              type="button"
              class="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
              :disabled="researchAction.loading.value"
              @click="runResearch"
            >
              {{ researchAction.loading.value ? 'Researching...' : 'Generate Prospect Report' }}
            </button>

            <AiErrorBanner class="mt-3" :message="localError || researchAction.error.value" />
          </div>
        </aside>

        <section class="lg:col-span-7">
          <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5 flex items-center gap-2">
              <UserCircleIcon class="size-5 text-indigo-600" />
              <h2 class="text-lg font-semibold text-slate-900">Prospect Intelligence Report</h2>
            </div>

            <AiLoadingSkeleton v-if="researchAction.loading.value" />

            <div v-else-if="reportData" class="space-y-5">
              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-2 flex items-center gap-2">
                  <UserCircleIcon class="size-4 text-indigo-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Person Overview</p>
                </div>
                <p class="text-sm font-semibold text-slate-900">
                  {{ reportData.personOverview.name }} • {{ reportData.personOverview.role }}
                </p>
                <p class="mt-0.5 text-xs text-slate-500">{{ reportData.personOverview.company }}</p>
                <p class="mt-2 text-sm leading-relaxed text-slate-700">{{ reportData.personOverview.summary }}</p>
              </section>

              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-2 flex items-center gap-2">
                  <DocumentTextIcon class="size-4 text-cyan-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Recent Public Activity</p>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="item in reportData.recentPublicActivity"
                    :key="`${item.platform}-${item.title}`"
                    class="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <p class="text-xs font-medium uppercase tracking-wide text-indigo-700">{{ item.platform }}</p>
                    <p class="mt-1 text-sm font-medium text-slate-900">{{ item.title }}</p>
                    <p class="mt-1 text-sm text-slate-700">{{ item.summary }}</p>
                    <a
                      v-if="item.url"
                      :href="item.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="mt-2 inline-flex items-center gap-1 text-xs text-indigo-700 hover:underline"
                    >
                      <LinkIcon class="size-3.5" />
                      Source
                    </a>
                  </div>
                </div>
              </section>

              <section class="grid gap-4 md:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-2 flex items-center gap-2">
                    <BoltIcon class="size-4 text-emerald-600" />
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Buying Signals</p>
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="signal in reportData.buyingSignals"
                      :key="signal"
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {{ signal }}
                    </li>
                  </ul>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-2 flex items-center gap-2">
                    <ChartBarIcon class="size-4 text-amber-600" />
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Risks / Blockers</p>
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="risk in reportData.risks"
                      :key="risk"
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {{ risk }}
                    </li>
                  </ul>
                </div>
              </section>

              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Best Outreach Angle</p>
                <p class="mt-2 text-sm text-slate-700">{{ reportData.suggestedAngle }}</p>
              </section>

              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-2 flex items-center gap-2">
                  <SparklesIcon class="size-4 text-indigo-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Outreach Assets</p>
                </div>
                <div class="space-y-3">
                  <div class="rounded-xl border border-slate-200 bg-white p-3">
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Cold Email</p>
                    <p class="mt-1 text-sm font-semibold text-slate-900">Subject: {{ reportData.outreach.coldEmail.subject }}</p>
                    <p class="mt-2 whitespace-pre-line text-sm text-slate-700">{{ reportData.outreach.coldEmail.body }}</p>
                  </div>
                  <div class="rounded-xl border border-slate-200 bg-white p-3">
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">LinkedIn DM</p>
                    <p class="mt-1 text-sm text-slate-700">{{ reportData.outreach.linkedinDm }}</p>
                  </div>
                  <div class="rounded-xl border border-slate-200 bg-white p-3">
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Call Opener</p>
                    <p class="mt-1 text-sm text-slate-700">{{ reportData.outreach.callOpener }}</p>
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-2 flex items-center gap-2">
                  <LinkIcon class="size-4 text-indigo-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Sources</p>
                </div>
                <ul class="space-y-2">
                  <li
                    v-for="source in mergedSources"
                    :key="source.url"
                    class="rounded-xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <a
                      :href="source.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-sm font-medium text-indigo-700 hover:underline"
                    >
                      {{ source.title }}
                    </a>
                    <p v-if="source.insight" class="mt-1 text-xs text-slate-600">{{ source.insight }}</p>
                  </li>
                </ul>
              </section>

              <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="mb-2 flex items-center gap-2">
                  <CurrencyDollarIcon class="size-4 text-emerald-600" />
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Cost Estimator</p>
                </div>
                <div class="grid gap-3 sm:grid-cols-3">
                  <div class="rounded-xl border border-slate-200 bg-white p-3">
                    <p class="text-[11px] uppercase tracking-wide text-slate-500">Web Search Calls</p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">{{ costEstimate.webSearchCalls }}</p>
                    <p class="mt-1 text-xs text-slate-600">{{ currency(costEstimate.webSearchCostUsd) }}</p>
                  </div>
                  <div class="rounded-xl border border-slate-200 bg-white p-3">
                    <p class="text-[11px] uppercase tracking-wide text-slate-500">Token Cost</p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">{{ currency(costEstimate.tokenCostUsd) }}</p>
                    <p class="mt-1 text-xs text-slate-600">
                      In: {{ costEstimate.inputTokens }} | Out: {{ costEstimate.outputTokens }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-slate-200 bg-white p-3">
                    <p class="text-[11px] uppercase tracking-wide text-slate-500">Estimated Total</p>
                    <p class="mt-1 text-lg font-semibold text-slate-900">{{ currency(costEstimate.totalCostUsd) }}</p>
                    <p class="mt-1 text-xs text-slate-600">{{ costEstimate.totalTokens }} total tokens</p>
                  </div>
                </div>
                <p class="mt-3 text-xs text-slate-600">
                  Assumptions: search {{ currency(costEstimate.assumptions.webSearchPricePerCallUsd) }}/call,
                  input {{ costEstimate.assumptions.inputPricePer1MUsd }}/1M tokens,
                  output {{ costEstimate.assumptions.outputPricePer1MUsd }}/1M tokens.
                </p>
              </section>
            </div>

            <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p class="text-sm text-slate-600">
                Fill in a prospect and click "Generate Prospect Report" to run web intelligence.
              </p>
            </div>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>
