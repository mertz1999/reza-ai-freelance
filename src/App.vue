<script setup>
import { onMounted, ref } from 'vue'
import {
  ChatBubbleBottomCenterTextIcon,
  CircleStackIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  GlobeAltIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  ServerStackIcon,
  Squares2X2Icon,
} from '@heroicons/vue/24/outline'
import {
  siDocker,
  siFastapi,
  siJavascript,
  siKubernetes,
  siLangchain,
  siLanggraph,
  siN8n,
  siNumpy,
  siOpencv,
  siPandas,
  siPython,
  siPytorch,
  siTypescript,
  siZapier,
} from 'simple-icons'
import Navbar from './components/Navbar.vue'
import HeroSection from './components/HeroSection.vue'
import DemoCard from './components/DemoCard.vue'
import DemoModal from './components/DemoModal.vue'

const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'demos', label: 'Demos' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'why-work-with-me', label: 'Why Me' },
  { id: 'contact', label: 'Contact' },
]

const skillGroups = [
  {
    title: 'Languages',
    items: ['Python', 'JavaScript', 'TypeScript'],
  },
  {
    title: 'Important Python Packages',
    items: ['LangChain', 'LangGraph', 'FastAPI', 'PyTorch', 'Pandas', 'NumPy', 'OpenCV'],
  },
  {
    title: 'Deployment & Infrastructure',
    items: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    title: 'AI Systems',
    items: ['RAG', 'Vector Databases', 'AI Agents', 'Training AI Models', 'LLM Fine-Tuning'],
  },
  {
    title: 'Automation & Integrations',
    items: ['n8n', 'Zapier', 'Salesforce API', 'Slack API'],
  },
  {
    title: 'What I Build',
    items: ['Web apps', 'Mobile-ready workflows', 'Automation APIs', 'AI sales systems'],
  },
]

const skillIconMap = {
  Python: { path: siPython.path, color: `#${siPython.hex}` },
  JavaScript: { path: siJavascript.path, color: `#${siJavascript.hex}` },
  TypeScript: { path: siTypescript.path, color: `#${siTypescript.hex}` },
  FastAPI: { path: siFastapi.path, color: `#${siFastapi.hex}` },
  LangChain: { path: siLangchain.path, color: `#${siLangchain.hex}` },
  LangGraph: { path: siLanggraph.path, color: `#${siLanggraph.hex}` },
  PyTorch: { path: siPytorch.path, color: `#${siPytorch.hex}` },
  Pandas: { path: siPandas.path, color: `#${siPandas.hex}` },
  NumPy: { path: siNumpy.path, color: `#${siNumpy.hex}` },
  OpenCV: { path: siOpencv.path, color: `#${siOpencv.hex}` },
  n8n: { path: siN8n.path, color: `#${siN8n.hex}` },
  Zapier: { path: siZapier.path, color: `#${siZapier.hex}` },
  Docker: { path: siDocker.path, color: `#${siDocker.hex}` },
  Kubernetes: { path: siKubernetes.path, color: `#${siKubernetes.hex}` },
}

const fallbackSkillIconMap = {
  AWS: CloudIcon,
  Azure: CloudIcon,
  'CI/CD': ServerStackIcon,
  RAG: ChatBubbleBottomCenterTextIcon,
  'Vector Databases': CircleStackIcon,
  'AI Agents': Squares2X2Icon,
  'Training AI Models': CircleStackIcon,
  'LLM Fine-Tuning': ChatBubbleBottomCenterTextIcon,
  'Salesforce API': CircleStackIcon,
  'Slack API': ChatBubbleBottomCenterTextIcon,
  'Web apps': GlobeAltIcon,
  'Mobile-ready workflows': DevicePhoneMobileIcon,
  'Automation APIs': ServerStackIcon,
  'AI sales systems': Squares2X2Icon,
}

const demos = [
  {
    id: 1,
    title: 'AI Sales Observer',
    description: 'Get a daily snapshot of where deals are at risk and where to focus first.',
    points: [
      'Detects missed follow-ups',
      'Identifies hot leads',
      'Suggests replies',
      'Provides daily sales briefing',
    ],
    icon: EyeIcon,
    exampleOutput:
      'Daily Sales Briefing\n\n- 6 leads need follow-up today\n- 2 hot leads likely to close this week\n- 4 conversations stalled for over 5 days\n\nRecommended first action: Follow up with Acme Corp before 2:00 PM.',
  },
  {
    id: 2,
    title: 'AI Follow-Up Automation',
    description:
      'Keep deal momentum without manual reminders by automating follow-ups and next steps.',
    points: ['Automatically sends follow-ups', 'Tracks responses', 'Schedules next steps'],
    icon: PaperAirplaneIcon,
    exampleOutput:
      'Follow-up Status\n\n- Email sent to Sarah (Enterprise Lead)\n- Response received: "Can we talk Friday?"\n- Next action auto-scheduled: Friday 10:30 AM reminder',
  },
  {
    id: 3,
    title: 'Voice Notes → CRM Automation',
    description:
      'Turn short voice updates into structured CRM entries that your team can actually use.',
    points: [
      'Converts voice notes into structured CRM updates',
      'Extracts deal information',
      'Extracts next steps and client details',
      'Simulates CRM integration (Salesforce-style)',
    ],
    icon: MicrophoneIcon,
    exampleOutput:
      'CRM Update Created\n\nClient: Nova Retail\nDeal Stage: Proposal Sent\nBudget: $45,000\nNext Step: Send revised pricing by Tuesday\nDecision Maker: COO',
  },
  {
    id: 4,
    title: 'AI Call / Meeting Intelligence',
    description:
      'Get clear summaries from calls, including objections and practical next actions for reps.',
    points: ['Summarizes meetings', 'Extracts objections', 'Suggests next actions'],
    icon: PhoneIcon,
    exampleOutput:
      'Meeting Summary\n\nMain Objection: Concern about onboarding timeline\nBuying Signal: Team asked for implementation examples\nSuggested Next Action: Share onboarding plan and book technical review.',
  },
  {
    id: 5,
    title: 'Meeting Transcription → Improvement Coach',
    description:
      'Improve sales conversations with feedback on weak responses and better phrasing options.',
    points: [
      'Analyzes sales conversations',
      'Detects weak responses',
      'Suggests improved phrasing and strategies',
    ],
    icon: ChatBubbleBottomCenterTextIcon,
    exampleOutput:
      'Conversation Coaching\n\nWeak response detected: "We are better than others."\nSuggested phrasing: "Teams choose us because setup is fast and managers get full visibility in one dashboard."\nStrategy tip: Tie value directly to revenue impact.',
  },
]

const selectedDemo = ref(null)

const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  const sections = document.querySelectorAll('.section-fade')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show')
        }
      })
    },
    { threshold: 0.15 }
  )

  sections.forEach((section) => observer.observe(section))
})
</script>

<template>
  <div class="min-h-screen">
    <Navbar :links="navLinks" />

    <main>
      <HeroSection @view-demos="scrollToSection('demos')" @contact="scrollToSection('contact')" />

      <section id="about" class="section-fade mx-auto max-w-6xl px-6 py-16">
        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">About</p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            A freelance partner focused on sales results
          </h2>
          <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
            I am Reza Tanakizadeh, a freelance AI developer specializing in building AI systems
            that help sales teams automate follow-ups, update CRM systems using voice notes, and
            identify missed opportunities. I work directly with your team to create focused
            solutions that save time and increase revenue.
          </p>
          <div class="mt-7 grid gap-4 md:grid-cols-2">
            <article
              v-for="group in skillGroups"
              :key="group.title"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <h3 class="text-sm font-semibold text-slate-900">{{ group.title }}</h3>
              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="item in group.items"
                  :key="item"
                  class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  <svg
                    v-if="skillIconMap[item]"
                    viewBox="0 0 24 24"
                    class="size-3.5"
                    aria-hidden="true"
                  >
                    <path :d="skillIconMap[item].path" :fill="skillIconMap[item].color" />
                  </svg>
                  <component
                    :is="fallbackSkillIconMap[item]"
                    v-else-if="fallbackSkillIconMap[item]"
                    class="size-3.5 text-indigo-600"
                  />
                  {{ item }}
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="demos" class="section-fade mx-auto max-w-6xl px-6 py-16">
        <div class="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">
              Demo Projects
            </p>
            <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Practical AI demos built for sales workflows
            </h2>
          </div>
          <p class="max-w-xl text-sm text-slate-600">
            Each demo focuses on business outcomes: less manual work, better follow-through, and
            stronger deal momentum.
          </p>
        </div>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <DemoCard
            v-for="demo in demos"
            :key="demo.id"
            :demo="demo"
            @open="selectedDemo = demo"
          />
        </div>
      </section>

      <section id="how-it-works" class="section-fade mx-auto max-w-6xl px-6 py-16">
        <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">How It Works</p>
        <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Simple process, clear outcomes
        </h2>
        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-indigo-700">Step 1</p>
            <h3 class="mt-2 text-lg font-semibold text-slate-900">Connect your tools</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">
              Connect email, CRM, and call tools so your data is in one place.
            </p>
          </article>
          <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-indigo-700">Step 2</p>
            <h3 class="mt-2 text-lg font-semibold text-slate-900">AI analyzes your data</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">
              AI detects follow-up gaps, lead signals, and tasks your team should prioritize.
            </p>
          </article>
          <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-indigo-700">Step 3</p>
            <h3 class="mt-2 text-lg font-semibold text-slate-900">Get actions and insights</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">
              Your team receives clear next steps and automation that keeps deals moving.
            </p>
          </article>
        </div>
      </section>

      <section id="why-work-with-me" class="section-fade mx-auto max-w-6xl px-6 py-16">
        <div class="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-slate-100 md:p-10">
          <p class="text-sm font-semibold uppercase tracking-wider text-indigo-300">
            Why Work With Me
          </p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight">Focused freelance support</h2>
          <div class="mt-7 grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
              Freelance developer, not an agency
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/5 p-4">Fast delivery</div>
            <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
              Focused solutions for sales teams
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
              Clear business value from each build
            </div>
          </div>
        </div>
      </section>

      <section id="contact" class="section-fade mx-auto max-w-6xl px-6 pb-20 pt-16">
        <div class="grid gap-8 md:grid-cols-2">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wider text-indigo-700">Contact</p>
            <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Book a strategy call
            </h2>
            <p class="mt-4 text-base leading-relaxed text-slate-600">
              Choose a time that works for you and we can discuss your current sales workflow and
              where AI automation can create immediate impact.
            </p>
            <div class="mt-6 space-y-3 text-sm text-slate-700">
              <a
                href="https://www.linkedin.com/in/rezatz"
                target="_blank"
                rel="noreferrer"
                class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <span
                  class="inline-flex size-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4 fill-current">
                    <path
                      d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19ZM8.34 10.89H5.66V18.5H8.34V10.89ZM7 6.6A1.56 1.56 0 0 0 5.44 8.16C5.44 9 6.09 9.69 6.96 9.69H6.98A1.56 1.56 0 1 0 7 6.6ZM18.5 14.31C18.5 11.96 17.24 10.87 15.56 10.87C14.2 10.87 13.59 11.62 13.25 12.14V10.89H10.57C10.6 11.72 10.57 18.5 10.57 18.5H13.25V14.25C13.25 14.03 13.27 13.81 13.33 13.65C13.51 13.22 13.92 12.77 14.61 12.77C15.52 12.77 15.88 13.46 15.88 14.47V18.5H18.56V14.31H18.5Z"
                    />
                  </svg>
                </span>
                <span>
                  <span class="block text-xs uppercase tracking-wide text-slate-500">LinkedIn</span>
                  <span class="font-medium text-slate-800">linkedin.com/in/rezatz</span>
                </span>
              </a>
              <a
                href="https://github.com/mertz1999"
                target="_blank"
                rel="noreferrer"
                class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <span
                  class="inline-flex size-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4 fill-current">
                    <path
                      d="M12 2C6.48 2 2 6.59 2 12.24C2 16.76 4.87 20.59 8.84 21.94C9.34 22.04 9.52 21.72 9.52 21.45C9.52 21.2 9.51 20.37 9.5 19.48C6.73 20.1 6.14 18.27 6.14 18.27C5.68 17.05 5.03 16.73 5.03 16.73C4.12 16.09 5.1 16.1 5.1 16.1C6.1 16.17 6.63 17.16 6.63 17.16C7.53 18.73 8.97 18.28 9.54 18.02C9.63 17.35 9.89 16.9 10.18 16.64C7.97 16.38 5.65 15.5 5.65 11.53C5.65 10.4 6.04 9.47 6.68 8.73C6.58 8.47 6.23 7.43 6.78 6.03C6.78 6.03 7.62 5.75 9.5 7.06C10.29 6.84 11.14 6.73 12 6.72C12.86 6.73 13.71 6.84 14.5 7.06C16.38 5.75 17.22 6.03 17.22 6.03C17.77 7.43 17.42 8.47 17.32 8.73C17.96 9.47 18.35 10.4 18.35 11.53C18.35 15.51 16.02 16.37 13.81 16.63C14.17 16.95 14.5 17.57 14.5 18.52C14.5 19.89 14.49 21 14.49 21.45C14.49 21.72 14.67 22.05 15.18 21.94C19.15 20.59 22 16.76 22 12.24C22 6.59 17.52 2 12 2Z"
                    />
                  </svg>
                </span>
                <span>
                  <span class="block text-xs uppercase tracking-wide text-slate-500">GitHub</span>
                  <span class="font-medium text-slate-800">github.com/mertz1999</span>
                </span>
              </a>
            </div>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <a
              href="https://calendly.com/ensa-ai/optimization-ensa"
              target="_blank"
              rel="noreferrer"
              class="mb-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Open Calendly in New Tab
            </a>
            <iframe
              title="Calendly Booking"
              src="https://calendly.com/ensa-ai/optimization-ensa"
              class="h-[680px] w-full rounded-2xl border border-slate-200"
            ></iframe>
          </div>
        </div>
      </section>
    </main>

    <DemoModal :demo="selectedDemo" @close="selectedDemo = null" />
  </div>
</template>
