# Reza AI Freelance Portfolio

Interactive Vue 3 portfolio with five AI sales demos.

## Architecture

- Frontend-only app (no backend service).
- AI calls run directly from browser to OpenAI via `src/services/aiService.js`.
- Users enter their own OpenAI API key in the in-app popup.
- API key is saved only in `sessionStorage` and cleared on reload/close.

## Project structure

- `src/pages/` demo pages + landing page
- `src/services/aiService.js` AI integrations
- `src/components/ApiKeyModal.vue` API key popup
- `src/composables/useAiAction.js` loading/error/mode helper

## Setup

1. Install dependencies:

```bash
npm install
```

2. Optional: copy env template and tune models/cost assumptions:

```bash
cp .env.example .env
```

## Run

```bash
npm run dev
```

Or with Make:

```bash
make run
```

Frontend: `http://localhost:5173`

## Notes

- This project does not store OpenAI keys on a backend.
- GitHub Pages deployment is automated via `.github/workflows/deploy-pages.yml`.
- For this repository, the build uses `VITE_BASE_PATH=/reza-ai-freelance/`.
- For the Prospect Intelligence demo, cost estimate values are based on `.env` assumptions:

```env
VITE_OPENAI_WEB_SEARCH_PRICE_PER_CALL_USD=0.01
VITE_OPENAI_INPUT_PRICE_PER_1M_USD=0
VITE_OPENAI_OUTPUT_PRICE_PER_1M_USD=0
```

## GitHub Pages

1. Push to `main` to trigger deployment.
2. In GitHub repo settings, set Pages source to `GitHub Actions` (once).
3. Site URL will be: `https://mertz1999.github.io/reza-ai-freelance/`.
