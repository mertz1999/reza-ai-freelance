import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AISalesObserverDemo from '../pages/AISalesObserverDemo.vue'
import AIFollowUpAutomationDemo from '../pages/AIFollowUpAutomationDemo.vue'
import VoiceNotesCrmDemo from '../pages/VoiceNotesCrmDemo.vue'
import AICallMeetingIntelligenceDemo from '../pages/AICallMeetingIntelligenceDemo.vue'
import MeetingTranscriptionCoachDemo from '../pages/MeetingTranscriptionCoachDemo.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return { top: 0, left: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/demos/ai-sales-observer',
      name: 'ai-sales-observer-demo',
      component: AISalesObserverDemo,
    },
    {
      path: '/demos/ai-follow-up-automation',
      name: 'ai-follow-up-automation-demo',
      component: AIFollowUpAutomationDemo,
    },
    {
      path: '/demos/voice-notes-crm-automation',
      name: 'voice-notes-crm-automation-demo',
      component: VoiceNotesCrmDemo,
    },
    {
      path: '/demos/ai-call-meeting-intelligence',
      name: 'ai-call-meeting-intelligence-demo',
      component: AICallMeetingIntelligenceDemo,
    },
    {
      path: '/demos/meeting-transcription-improvement-coach',
      name: 'meeting-transcription-improvement-coach-demo',
      component: MeetingTranscriptionCoachDemo,
    },
  ],
})

export default router
