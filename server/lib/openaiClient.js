import OpenAI from 'openai'

const chatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini'
const transcriptionModel = process.env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe'
const requestTimeout = Number(process.env.OPENAI_TIMEOUT_MS || 30000)

let client = null

export const hasOpenAIKey = () => Boolean(process.env.OPENAI_API_KEY)

export const getOpenAIClient = () => {
  if (!hasOpenAIKey()) {
    return null
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: requestTimeout,
    })
  }

  return client
}

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

export const generateStructuredJson = async ({ systemPrompt, userPrompt }) => {
  const openai = getOpenAIClient()
  if (!openai) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

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

  return parsed
}

export const transcribeAudioBuffer = async ({ buffer, filename = 'recording.webm' }) => {
  const openai = getOpenAIClient()
  if (!openai) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const file = await OpenAI.toFile(buffer, filename)
  const transcription = await openai.audio.transcriptions.create({
    model: transcriptionModel,
    file,
    response_format: 'text',
  })

  return transcription
}
