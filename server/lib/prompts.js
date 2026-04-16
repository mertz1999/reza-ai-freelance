const baseRules = `
You create business-focused outputs for sales teams.
Avoid technical jargon.
Be concise and practical.
Return strictly valid JSON.
`

export const salesObserverPrompt = (input) => ({
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

export const salesObserverEmailAnalysisPrompt = (emailText) => ({
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

export const followUpAutomationPrompt = (input) => ({
  systemPrompt: `${baseRules}
Return:
{
  "queuedMessages":[{"lead":"","subject":"","sendAt":"","confidence":""}],
  "responseTracking":[{"account":"","response":"","action":""}],
  "nextSteps":[{"time":"","task":""}],
  "activityFeed":[""]
}`,
  userPrompt: `Generate follow-up automation outputs based on:\n${input}`,
})

export const voiceToCrmPrompt = (transcript) => ({
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

export const meetingIntelligencePrompt = (input) => ({
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

export const coachingPrompt = (input) => ({
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
