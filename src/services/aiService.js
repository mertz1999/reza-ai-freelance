import OpenAI from 'openai'
import { getUserApiKey } from '../utils/userApiKey'

const chatModel = import.meta.env.VITE_OPENAI_CHAT_MODEL || 'gpt-4o-mini'
const webModel = import.meta.env.VITE_OPENAI_WEB_MODEL || chatModel
const transcriptionModel = import.meta.env.VITE_OPENAI_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe'

const webSearchPricePerCallUsd = Number(import.meta.env.VITE_OPENAI_WEB_SEARCH_PRICE_PER_CALL_USD || 0.01)
const inputPricePer1MUsd = Number(import.meta.env.VITE_OPENAI_INPUT_PRICE_PER_1M_USD || 0)
const outputPricePer1MUsd = Number(import.meta.env.VITE_OPENAI_OUTPUT_PRICE_PER_1M_USD || 0)

const baseRules = `
You create business-focused outputs for sales teams.
Avoid technical jargon.
Be concise and practical.
Return strictly valid JSON.
`

const tryParseJson = (content) => {
  if (!content) return null

  try {
    return JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

const createServiceResponse = ({ source, data, metaExtras = {} }) => ({
  mode: 'real',
  data,
  meta: {
    source,
    generatedAt: new Date().toISOString(),
    ...metaExtras,
  },
})

const getClient = () => {
  const apiKey = getUserApiKey().trim()
  if (!apiKey) {
    window.dispatchEvent(new Event('openai-key-required'))
    throw new Error('OpenAI API key is required. Please add your key to continue.')
  }

  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
}

const runStructuredChat = async ({ systemPrompt, userPrompt }) => {
  const openai = getClient()

  const completion = await openai.chat.completions.create({
    model: chatModel,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  const content = completion.choices?.[0]?.message?.content || ''
  const parsed = tryParseJson(content)
  if (!parsed) {
    throw new Error('Could not parse model JSON response')
  }

  return {
    data: parsed,
    usage: completion.usage || null,
  }
}

const salesObserverPrompt = (input) => ({
  systemPrompt: `${baseRules}
Return:
{
  "missedFollowUps":[{"account":"","owner":"","delay":"","value":""}],
  "hotLeads":[{"account":"","signal":"","probability":""}],
  "suggestedReplies":[{"account":"","message":""}],
  "briefingItems":[""]
}`,
  userPrompt: `Generate a realistic sales observer report from this user context:\n${input}`,
})

const salesObserverEmailAnalysisPrompt = (emailText) => ({
  systemPrompt: `${baseRules}
Analyze a single customer email and classify intent tags.
Purpose tags must be selected only from this list:
["follow-up","needs-data","cancel-meeting","reschedule","pricing","objection-risk","contract-review","decision-ready"]
Urgency level must be one of: "low", "medium", "high".
Return:
{
  "summary":"",
  "purposeTags":["follow-up"],
  "urgencyLevel":"medium",
  "urgencyReason":"",
  "keySignals":[""],
  "recommendedActions":[""],
  "nextEmail":{"subject":"","body":""}
}`,
  userPrompt: `Analyze this email and produce a practical sales response strategy:\n${emailText}`,
})

const voiceToCrmPrompt = (transcript) => ({
  systemPrompt: `${baseRules}
Return:
{
  "extractedFields":[{"label":"","value":""}],
  "crmRecordPreview":{"account":"","owner":"","stage":"","value":"","nextAction":"","lastUpdated":""},
  "integrationLog":[""],
  "qualityChecks":[""]
}`,
  userPrompt: `Extract CRM structured fields from this transcript:\n${transcript}`,
})

const meetingIntelligencePrompt = (input) => ({
  systemPrompt: `${baseRules}
Return:
{
  "meetingSummary":[""],
  "objections":[{"title":"","impact":"","action":""}],
  "aiRecommendations":[""],
  "nextActions":[{"due":"","task":""}]
}`,
  userPrompt: `Analyze this call/meeting content and produce insights:\n${input}`,
})

const coachingPrompt = (input) => ({
  systemPrompt: `${baseRules}
Return:
{
  "weakResponses":[{"issue":"","original":"","improved":""}],
  "coachingStrategies":[""],
  "conversationMetrics":[{"label":"","value":""}],
  "practicePlan":[{"step":"","task":""}],
  "coachSummary":""
}`,
  userPrompt: `Analyze this sales transcript and coach the rep:\n${input}`,
})

const prospectIntelligencePrompt = (input = {}) => ({
  systemPrompt: `${baseRules}
You are a sales research agent.
Use public web information only.
Find profile and activity signals from sources like LinkedIn, X, company websites, podcasts, blogs, and news pages.
Do not invent private data.
Return:
{
  "personOverview":{"name":"","role":"","company":"","summary":""},
  "recentPublicActivity":[{"platform":"","title":"","summary":"","url":""}],
  "recentThemes":[""],
  "buyingSignals":[""],
  "risks":[""],
  "suggestedAngle":"",
  "outreach":{
    "coldEmail":{"subject":"","body":""},
    "linkedinDm":"",
    "callOpener":""
  },
  "sourceHighlights":[{"title":"","url":"","insight":""}]
}`,
  userPrompt: `Research this prospect and generate a practical sales intelligence report.

Prospect Name: ${input.name || 'Unknown prospect'}
Company: ${input.company || 'Unknown company'}
LinkedIn URL (optional): ${input.linkedinUrl || ''}
X URL (optional): ${input.xUrl || ''}
Additional Context: ${input.additionalContext || ''}

Focus on: recent posts/content themes, current priorities, potential buying signals, and strongest outreach angle.`,
})

export const aiService = {
  async salesObserver(input) {
    const { systemPrompt, userPrompt } = salesObserverPrompt(input || '')
    const result = await runStructuredChat({ systemPrompt, userPrompt })
    return createServiceResponse({
      source: 'sales-observer:openai',
      data: result.data,
      metaExtras: { usage: result.usage },
    })
  },

  async salesObserverEmailAnalysis(emailText) {
    const { systemPrompt, userPrompt } = salesObserverEmailAnalysisPrompt(emailText || '')
    const result = await runStructuredChat({ systemPrompt, userPrompt })
    return createServiceResponse({
      source: 'sales-observer-email-analysis:openai',
      data: result.data,
      metaExtras: { usage: result.usage },
    })
  },

  async prospectIntelligence(payload) {
    const openai = getClient()
    const { systemPrompt, userPrompt } = prospectIntelligencePrompt(payload || {})

    const response = await openai.responses.create({
      model: webModel,
      instructions: systemPrompt,
      input: userPrompt,
      tools: [{ type: 'web_search_preview', search_context_size: 'medium' }],
      include: ['web_search_call.action.sources'],
    })

    const content = response.output_text || ''
    const parsed = tryParseJson(content)
    if (!parsed) {
      throw new Error('Could not parse model JSON response')
    }

    const outputItems = Array.isArray(response.output) ? response.output : []
    const webSearchItems = outputItems.filter((item) => item?.type === 'web_search_call')

    const sourceMap = new Map()
    webSearchItems.forEach((item) => {
      const sources = Array.isArray(item?.action?.sources) ? item.action.sources : []
      sources.forEach((source) => {
        if (!source?.url) return
        sourceMap.set(source.url, { type: source.type || 'url', url: source.url })
      })
    })

    const usage = response.usage || { input_tokens: 0, output_tokens: 0, total_tokens: 0 }
    const webSearchCalls = webSearchItems.length
    const inputTokens = Number(usage.input_tokens || 0)
    const outputTokens = Number(usage.output_tokens || 0)

    const tokenCostUsd =
      (inputTokens / 1_000_000) * inputPricePer1MUsd + (outputTokens / 1_000_000) * outputPricePer1MUsd
    const webSearchCostUsd = webSearchCalls * webSearchPricePerCallUsd

    return createServiceResponse({
      source: 'prospect-intelligence:openai',
      data: parsed,
      metaExtras: {
        usage,
        webSearchCalls,
        sources: Array.from(sourceMap.values()),
        costEstimate: {
          currency: 'USD',
          assumptions: {
            webSearchPricePerCallUsd,
            inputPricePer1MUsd,
            outputPricePer1MUsd,
          },
          webSearchCostUsd: Number(webSearchCostUsd.toFixed(6)),
          tokenCostUsd: Number(tokenCostUsd.toFixed(6)),
          totalCostUsd: Number((webSearchCostUsd + tokenCostUsd).toFixed(6)),
        },
      },
    })
  },

  async followUpAutomation(input) {
    const systemPrompt = `${baseRules}
Return:
{
  "queuedMessages":[{"lead":"","subject":"","sendAt":"","confidence":""}],
  "responseTracking":[{"account":"","response":"","action":""}],
  "nextSteps":[{"time":"","task":""}],
  "activityFeed":[""]
}`
    const userPrompt = `Generate follow-up automation outputs based on:\n${input || ''}`
    const result = await runStructuredChat({ systemPrompt, userPrompt })
    return createServiceResponse({
      source: 'follow-up-automation:openai',
      data: result.data,
      metaExtras: { usage: result.usage },
    })
  },

  async voiceToCrm(transcript) {
    const { systemPrompt, userPrompt } = voiceToCrmPrompt(transcript || '')
    const result = await runStructuredChat({ systemPrompt, userPrompt })
    return createServiceResponse({
      source: 'voice-to-crm:openai',
      data: result.data,
      metaExtras: { usage: result.usage },
    })
  },

  async meetingIntelligence(input) {
    const { systemPrompt, userPrompt } = meetingIntelligencePrompt(input || '')
    const result = await runStructuredChat({ systemPrompt, userPrompt })
    return createServiceResponse({
      source: 'meeting-intelligence:openai',
      data: result.data,
      metaExtras: { usage: result.usage },
    })
  },

  async coaching(input) {
    const { systemPrompt, userPrompt } = coachingPrompt(input || '')
    const result = await runStructuredChat({ systemPrompt, userPrompt })
    return createServiceResponse({
      source: 'coaching:openai',
      data: result.data,
      metaExtras: { usage: result.usage },
    })
  },

  async transcribe(audioBlob, filename = 'recording.webm') {
    const openai = getClient()
    const file = new File([audioBlob], filename, { type: audioBlob.type || 'audio/webm' })
    const transcript = await openai.audio.transcriptions.create({
      model: transcriptionModel,
      file,
      response_format: 'text',
    })

    return createServiceResponse({
      source: 'transcribe:openai',
      data: { transcript },
    })
  },
}
