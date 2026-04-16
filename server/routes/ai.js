import express from 'express'
import multer from 'multer'
import { generateStructuredJson, hasOpenAIKey, transcribeAudioBuffer } from '../lib/openaiClient.js'
import {
  coachingPrompt,
  followUpAutomationPrompt,
  meetingIntelligencePrompt,
  salesObserverEmailAnalysisPrompt,
  salesObserverPrompt,
  voiceToCrmPrompt,
} from '../lib/prompts.js'
import {
  mockCoaching,
  mockFollowUpAutomation,
  mockMeetingIntelligence,
  mockSalesObserverEmailAnalysis,
  mockSalesObserver,
  mockTranscriptionText,
  mockVoiceToCrm,
} from '../lib/mockResponses.js'

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

const asResponse = ({ mode, data, source }) => ({
  mode,
  data,
  meta: { source, generatedAt: new Date().toISOString() },
})

const runStructured = async ({ promptFactory, input, mockFactory, source }) => {
  if (!hasOpenAIKey() || process.env.FORCE_MOCK_AI === 'true') {
    return asResponse({ mode: 'mock', data: mockFactory(input), source: `${source}:mock` })
  }

  try {
    const { systemPrompt, userPrompt } = promptFactory(input)
    const data = await generateStructuredJson({ systemPrompt, userPrompt })
    return asResponse({ mode: 'real', data, source: `${source}:openai` })
  } catch (error) {
    return asResponse({
      mode: 'mock',
      data: mockFactory(input),
      source: `${source}:fallback`,
      error: error.message,
    })
  }
}

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    mode: hasOpenAIKey() ? 'real-capable' : 'mock-only',
  })
})

router.post('/sales-observer', async (req, res) => {
  const input = req.body?.input || ''
  const result = await runStructured({
    promptFactory: salesObserverPrompt,
    input,
    mockFactory: mockSalesObserver,
    source: 'sales-observer',
  })
  res.json(result)
})

router.post('/sales-observer-email-analysis', async (req, res) => {
  const emailText = req.body?.emailText || ''

  if (!emailText.trim()) {
    res.status(400).json({ error: 'emailText is required' })
    return
  }

  const result = await runStructured({
    promptFactory: salesObserverEmailAnalysisPrompt,
    input: emailText,
    mockFactory: mockSalesObserverEmailAnalysis,
    source: 'sales-observer-email-analysis',
  })
  res.json(result)
})

router.post('/follow-up-automation', async (req, res) => {
  const input = req.body?.input || ''
  const result = await runStructured({
    promptFactory: followUpAutomationPrompt,
    input,
    mockFactory: mockFollowUpAutomation,
    source: 'follow-up-automation',
  })
  res.json(result)
})

router.post('/voice-to-crm', async (req, res) => {
  const transcript = req.body?.transcript || ''
  const result = await runStructured({
    promptFactory: voiceToCrmPrompt,
    input: transcript,
    mockFactory: mockVoiceToCrm,
    source: 'voice-to-crm',
  })
  res.json(result)
})

router.post('/meeting-intelligence', async (req, res) => {
  const input = req.body?.input || ''
  const result = await runStructured({
    promptFactory: meetingIntelligencePrompt,
    input,
    mockFactory: mockMeetingIntelligence,
    source: 'meeting-intelligence',
  })
  res.json(result)
})

router.post('/coaching', async (req, res) => {
  const input = req.body?.input || ''
  const result = await runStructured({
    promptFactory: coachingPrompt,
    input,
    mockFactory: mockCoaching,
    source: 'coaching',
  })
  res.json(result)
})

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file?.buffer) {
    res.status(400).json({ error: 'No audio file uploaded' })
    return
  }

  if (!hasOpenAIKey() || process.env.FORCE_MOCK_AI === 'true') {
    res.json(
      asResponse({
        mode: 'mock',
        data: { transcript: mockTranscriptionText() },
        source: 'transcribe:mock',
      })
    )
    return
  }

  try {
    const transcript = await transcribeAudioBuffer({
      buffer: req.file.buffer,
      filename: req.file.originalname || 'recording.webm',
    })

    res.json(
      asResponse({
        mode: 'real',
        data: { transcript },
        source: 'transcribe:openai',
      })
    )
  } catch {
    res.json(
      asResponse({
        mode: 'mock',
        data: { transcript: mockTranscriptionText() },
        source: 'transcribe:fallback',
      })
    )
  }
})

export default router
