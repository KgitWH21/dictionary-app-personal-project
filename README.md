# Hayden's Personal Dictionary

An authenticated web app where each user builds a private dictionary: look a word up,
keep the definition, add your own example sentence and usage note, file it into a
collection, and generate an audio pronunciation.

## Feature checklist

| Requirement | Where it lives |
| --- | --- |
| JWT register / login / logout / confirmation | `backend/accounts/`, `frontend/src/context/AuthContext.jsx` |
| Google sign-in (OpenID Connect) | `backend/accounts/services.py`, `frontend/src/components/GoogleSignInButton.jsx` |
| CRUD resource #1 — Collections | `Collection` model, `/api/collections/` |
| CRUD resource #2 — Entries | `Entry` model, `/api/entries/` |
| Client-side third-party API | Free Dictionary API — `frontend/src/api/freeDictionary.js` |
| Server-side third-party API (auth required) | ElevenLabs TTS — `backend/dictionary/services.py` |
| Dynamic UI | React Router, live search, inline edit forms |
| Error handling | DRF 400/401/404/503 responses + `readError()` banners |

## Tech stack

React 18 + Vite + React Router + Axios · Django 6 + DRF + SimpleJWT · PostgreSQL 16 +
psycopg3 · Tailwind CSS · Gunicorn + Nginx · Docker Compose · Cypress + Django TestCase ·
GitHub Actions