# Reza AI Freelance Portfolio

Interactive Vue 3 portfolio with five demo pages for AI sales workflows.

## What is included

- Landing page + five dedicated demo routes
- Secure backend proxy for OpenAI calls (`server/`)
- Real AI + mock fallback mode for reliability
- Visitor-driven interactions (type, analyze, generate, record voice)

## Project structure

- `src/pages/` demo pages + landing page
- `src/services/aiService.js` frontend API client
- `src/composables/useAiAction.js` loading/error/mode state wrapper
- `server/index.js` backend entrypoint
- `server/routes/ai.js` AI endpoints
- `server/lib/` prompts, mocks, OpenAI helpers

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env files:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

3. Add your OpenAI key in `server/.env`:

```env
OPENAI_API_KEY=your_real_key
```

## Run

Start frontend + backend together:

```bash
npm run dev
```

Or with Make:

```bash
make run
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8787`

## Real vs Mock mode

- Default behavior:
  - If `OPENAI_API_KEY` exists, endpoints try real AI first
  - If real call fails, app falls back to mock data
- Force mock mode:

```env
FORCE_MOCK_AI=true
```

This is useful for demos without API usage/cost.

## API endpoints

- `GET /api/health`
- `GET /api/ai/health`
- `POST /api/ai/sales-observer`
- `POST /api/ai/sales-observer-email-analysis`
- `POST /api/ai/follow-up-automation`
- `POST /api/ai/voice-to-crm`
- `POST /api/ai/transcribe` (multipart, `audio`)
- `POST /api/ai/meeting-intelligence`
- `POST /api/ai/coaching`

All AI endpoints return:

```json
{
  "mode": "real | mock",
  "data": {},
  "meta": {
    "source": "endpoint:openai|mock|fallback",
    "generatedAt": "ISO timestamp"
  }
}
```
