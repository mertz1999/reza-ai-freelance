const nowLabel = () =>
  new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  })

export const mockSalesObserver = (input = '') => ({
  missedFollowUps: [
    { account: 'Acme Logistics', owner: 'Sara', delay: '4 days', value: '$24,000' },
    { account: 'Nova Retail', owner: 'Amir', delay: '3 days', value: '$18,500' },
    { account: 'Peak Interiors', owner: 'Mina', delay: '5 days', value: '$31,200' },
  ],
  hotLeads: [
    { account: 'Bright Systems', signal: 'Requested implementation timeline', probability: '82%' },
    { account: 'UrbanFleet', signal: 'Asked for onboarding details', probability: '79%' },
    { account: 'Mira Finance', signal: 'Decision maker attended call', probability: '76%' },
  ],
  suggestedReplies: [
    {
      account: 'Bright Systems',
      message:
        'Thanks for the follow-up. I shared the rollout plan and can review milestones with your team tomorrow.',
    },
    {
      account: 'UrbanFleet',
      message:
        'Appreciate your questions. I included onboarding details and a proposed start date for next week.',
    },
  ],
  briefingItems: [
    '7 leads require follow-up today',
    '3 hot leads likely to close this week',
    `Context analyzed from visitor input (${Math.max(10, input.length)} chars)`,
    'Recommended priority: follow up with Bright Systems before 2 PM',
  ],
})

const includesAny = (text, phrases) => phrases.some((phrase) => text.includes(phrase))

export const mockSalesObserverEmailAnalysis = (emailText = '') => {
  const text = emailText.toLowerCase()
  const purposeTags = []

  if (includesAny(text, ['follow up', 'follow-up', 'checking in', 'next step'])) {
    purposeTags.push('follow-up')
  }
  if (includesAny(text, ['data', 'details', 'clarity', 'information', 'breakdown'])) {
    purposeTags.push('needs-data')
  }
  if (includesAny(text, ['cancel', 'call off', 'stop the meeting'])) {
    purposeTags.push('cancel-meeting')
  }
  if (includesAny(text, ['reschedule', 'move the meeting', 'another time'])) {
    purposeTags.push('reschedule')
  }
  if (includesAny(text, ['price', 'pricing', 'cost', 'quote', 'budget'])) {
    purposeTags.push('pricing')
  }
  if (includesAny(text, ['concern', 'risk', 'not sure', 'hesitation', 'objection'])) {
    purposeTags.push('objection-risk')
  }
  if (includesAny(text, ['contract', 'legal', 'procurement', 'terms'])) {
    purposeTags.push('contract-review')
  }
  if (includesAny(text, ['approved', 'approve', 'sign off', 'finalize', 'decision'])) {
    purposeTags.push('decision-ready')
  }

  if (purposeTags.length === 0) {
    purposeTags.push('follow-up')
  }

  const urgencyLevel = includesAny(text, ['today', 'tomorrow', 'asap', 'urgent', 'this week'])
    ? 'high'
    : includesAny(text, ['next week', 'later this month', 'whenever'])
      ? 'low'
      : 'medium'

  const urgencyReason =
    urgencyLevel === 'high'
      ? 'The message includes short deadline language that requires quick response to avoid delay.'
      : urgencyLevel === 'low'
        ? 'The message uses flexible timing language with no immediate deadline pressure.'
        : 'The message signals active engagement but does not set an immediate hard deadline.'

  const keySignals = [
    `Message length indicates meaningful buyer context (${Math.max(20, emailText.length)} characters analyzed).`,
    purposeTags.includes('pricing')
      ? 'Pricing or budget details are part of the buyer request.'
      : 'Primary intent is oriented around next-step coordination.',
    purposeTags.includes('decision-ready')
      ? 'Language suggests stakeholder alignment is close to decision stage.'
      : 'Conversation appears to be in active qualification or evaluation stage.',
  ]

  const recommendedActions = [
    'Send a concise response that directly addresses every explicit request in the email.',
    purposeTags.includes('needs-data')
      ? 'Attach concrete data points, timeline details, or implementation specifics to remove uncertainty.'
      : 'Confirm the next meeting or action with a specific date and owner.',
    purposeTags.includes('contract-review')
      ? 'Prepare procurement/legal supporting notes to reduce approval friction.'
      : 'Close with one clear call-to-action to maintain deal momentum.',
  ]

  return {
    summary:
      'AI analysis indicates the buyer is engaged and expects a practical response with clear ownership, timing, and next steps.',
    purposeTags,
    urgencyLevel,
    urgencyReason,
    keySignals,
    recommendedActions,
    nextEmail: {
      subject: 'Re: Confirming next steps from your email',
      body:
        'Hi there,\n\nThanks for the detailed message. I reviewed your requests and outlined the specific next steps below so your team can move forward without delay.\n\nI also included the most relevant details to support internal review. If useful, I can join a short call to finalize open points.\n\nBest,\nReza',
    },
  }
}

export const mockFollowUpAutomation = () => ({
  queuedMessages: [
    {
      lead: 'Lina - Bright Systems',
      subject: 'Quick follow-up on implementation timeline',
      sendAt: 'Today, 2:10 PM',
      confidence: 'High',
    },
    {
      lead: 'Arman - UrbanFleet',
      subject: 'Checking in on your internal review',
      sendAt: 'Today, 3:00 PM',
      confidence: 'High',
    },
    {
      lead: 'Nima - Nova Retail',
      subject: 'Can we lock next steps for next week?',
      sendAt: 'Tomorrow, 9:30 AM',
      confidence: 'Medium',
    },
  ],
  responseTracking: [
    { account: 'Bright Systems', response: 'Positive', action: 'Schedule pricing review' },
    { account: 'UrbanFleet', response: 'Neutral', action: 'Share onboarding case study' },
    { account: 'Nova Retail', response: 'No reply yet', action: 'Send reminder tomorrow' },
  ],
  nextSteps: [
    { time: 'Today 4:30 PM', task: 'Call Bright Systems (decision maker confirmed)' },
    { time: 'Tomorrow 10:00 AM', task: 'Send revised quote to UrbanFleet' },
    { time: 'Tomorrow 2:00 PM', task: 'Follow-up with Nova Retail on pilot date' },
  ],
  activityFeed: [
    '14 follow-up messages scheduled automatically',
    '5 replies received in the last 24h',
    '3 next-step tasks created for the sales team',
    '1 low-performing message template flagged for update',
  ],
})

export const mockVoiceToCrm = () => ({
  extractedFields: [
    { label: 'Client', value: 'Nova Retail' },
    { label: 'Deal Stage', value: 'Proposal Sent' },
    { label: 'Estimated Value', value: '$45,000' },
    { label: 'Next Step', value: 'Send onboarding plan by Tuesday' },
    { label: 'Decision Maker', value: 'COO - Linda Hosseini' },
    { label: 'Priority', value: 'High' },
  ],
  crmRecordPreview: {
    account: 'Nova Retail',
    owner: 'Sara',
    stage: 'Proposal Sent',
    value: '$45,000',
    nextAction: 'Send onboarding plan + schedule technical review',
    lastUpdated: nowLabel(),
  },
  integrationLog: [
    'Voice note transcribed successfully',
    'Deal information extracted with 94% confidence',
    'CRM fields mapped to Salesforce object format',
    'Record update pushed to mocked CRM API',
  ],
  qualityChecks: [
    'Missing field check passed',
    'Duplicate record check passed',
    'Owner mapping check passed',
  ],
})

export const mockMeetingIntelligence = () => ({
  meetingSummary: [
    'Client wants rollout completed within 4 weeks.',
    'Budget approved for annual plan.',
    'Security checklist requested before procurement.',
    'Technical review requested next week.',
  ],
  objections: [
    {
      title: 'Onboarding timeline feels risky',
      impact: 'High',
      action: 'Share 30-day rollout plan with milestones.',
    },
    {
      title: 'Team adoption concerns',
      impact: 'Medium',
      action: 'Offer training walkthrough and success checklist.',
    },
    {
      title: 'Need clearer ROI proof',
      impact: 'Medium',
      action: 'Send case study with measurable impact.',
    },
  ],
  aiRecommendations: [
    'Lead with implementation confidence early in the next call.',
    'Use one quantified customer outcome to address risk concerns.',
    'Confirm who signs off before sharing final proposal.',
  ],
  nextActions: [
    { due: 'Today, 5:00 PM', task: 'Send onboarding plan to Bright Systems' },
    { due: 'Tomorrow, 10:00 AM', task: 'Book technical review with UrbanFleet team' },
    { due: 'Tomorrow, 3:30 PM', task: 'Send security checklist to Nova Retail' },
  ],
})

export const mockCoaching = () => ({
  weakResponses: [
    {
      issue: 'Generic value statement',
      original: 'We are better than others.',
      improved:
        'Teams choose us because onboarding is typically completed in under 30 days with clear milestones.',
    },
    {
      issue: 'No direct next step',
      original: 'I can send something later.',
      improved: 'I will send the rollout plan by 5 PM and propose a review tomorrow at 11 AM.',
    },
  ],
  coachingStrategies: [
    'Anchor responses to measurable outcomes.',
    'Use one concrete example after each objection.',
    'End each call with one date-based action.',
  ],
  conversationMetrics: [
    { label: 'Confidence Score', value: '78%' },
    { label: 'Objection Handling', value: '71%' },
    { label: 'Clarity Score', value: '84%' },
    { label: 'Next-Step Quality', value: '67%' },
  ],
  practicePlan: [
    { step: '1', task: 'Replace generic claims with proof-based statements.' },
    { step: '2', task: 'Use one ROI example in first 10 minutes.' },
    { step: '3', task: 'Close each call with specific next-step timing.' },
  ],
  coachSummary:
    'Your calls build interest well. Focus on stronger objection handling and explicit next steps to improve conversion.',
})

export const mockTranscriptionText = () =>
  'Client confirmed budget around 45K, requested onboarding details, and asked to schedule a technical review next Tuesday.'
