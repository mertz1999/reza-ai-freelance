const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

const postJson = async (path, body) => {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }

  return response.json()
}

const postFormData = async (path, formData) => {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }

  return response.json()
}

export const aiService = {
  async salesObserver(input) {
    return postJson('/api/ai/sales-observer', { input })
  },
  async salesObserverEmailAnalysis(emailText) {
    return postJson('/api/ai/sales-observer-email-analysis', { emailText })
  },
  async followUpAutomation(input) {
    return postJson('/api/ai/follow-up-automation', { input })
  },
  async voiceToCrm(transcript) {
    return postJson('/api/ai/voice-to-crm', { transcript })
  },
  async meetingIntelligence(input) {
    return postJson('/api/ai/meeting-intelligence', { input })
  },
  async coaching(input) {
    return postJson('/api/ai/coaching', { input })
  },
  async transcribe(audioBlob, filename = 'recording.webm') {
    const formData = new FormData()
    formData.append('audio', audioBlob, filename)
    return postFormData('/api/ai/transcribe', formData)
  },
}
