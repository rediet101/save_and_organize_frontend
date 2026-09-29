# Multilingual Save-and-Organize — Frontend

Single-page web frontend (React + Vite + Tailwind CSS v4) for the FastAPI backend in
`../multilingual-save-organize-app/backend`.

## What's on the page

- **Header** — live API status (polls `GET /health` every 15s).
- **Hero** — overview and saved-item counts per category (click one to filter the library).
- **Capture** — send a link, caption text and/or screenshot to `POST /extract`. The source platform is
  detected from the link automatically. Screenshots can be uploaded, dragged in, or pasted into the caption box.
  Link failures (`needs_screenshot`, `private_content`, `unsupported_url`, `fetch_failed`) show a
  friendly message with a one-click "add a screenshot" fallback.
- **Results** — each extracted item as a card: category, confidence, languages detected, verbatim
  location + landmark (with a Maps link), date, price, contact, tags and AI notes. Save one or all.
- **Library** — saved items with category tabs and search.

> The backend has no items/database API yet (Phase 2), so the library is stored in the browser's
> `localStorage`. Swap `src/hooks/useLibrary.js` for API calls once `/items` exists.

## Run it

1. Start the backend (from `../multilingual-save-organize-app/backend`):

   ```bash
   .venv\Scripts\activate
   uvicorn app.main:app --reload
   ```

2. Start the frontend (from this folder):

   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:5173

In dev, requests to `/api/*` are proxied to `http://localhost:8000`. To point elsewhere, copy
`.env.example` to `.env` and set `BACKEND_URL` (dev proxy) or `VITE_API_URL` (direct calls, e.g. production).

## Structure

```text
src/
├── App.jsx                 # page layout + extraction/save state
├── lib/api.js              # /health and /extract client, error parsing
├── lib/categories.js       # category labels, icons, colors (mirrors ItemCategory)
├── hooks/useHealth.js      # API status polling
├── hooks/useLibrary.js     # saved items (localStorage)
└── components/             # Header, Hero, CaptureForm, ResultsPanel, ItemCard, Library
```
