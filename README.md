# Hayden's Personal Dictionary

An authenticated web app where each user builds a private dictionary: look a word up,
keep the definition, add your own example sentence and usage note, file it into a
collection, and generate an audio pronunciation.

**Live:** http://52.45.30.74

## Tech stack

React 19 + Vite 8 + React Router 7 + Axios · Django 6.1 + DRF + SimpleJWT · PostgreSQL 16 +
psycopg3 · Tailwind CSS 3 · Gunicorn + Nginx · Docker Compose · Cypress + Django TestCase ·
GitHub Actions · Deployed on AWS EC2

## Features

- **JWT authentication over httpOnly cookies** — register, login, logout, and session
  confirmation. Tokens never touch JavaScript, so an XSS bug can't steal them.
- **Refresh token rotation** with blacklisting, plus a single-flight refresh interceptor so
  concurrent requests can't invalidate each other's tokens.
- **Two CRUD resources** — collections and entries, both scoped to their owner.
- **Free Dictionary API (client side)** — look up a word and prefill phonetic, part of
  speech, definition, and example sentence, then edit before saving.
- **ElevenLabs text-to-speech (server side, authenticated)** — generate an mp3
  pronunciation of a word or its example sentence, stored and served from the media volume.

## Architecture

```
Browser ──► Nginx :80 ──┬── /            React SPA (static build)
                        ├── /api/        proxy ──► Gunicorn ──► Django ──► PostgreSQL
                        ├── /admin/      proxy ──► Gunicorn
                        ├── /static/     collected static files (shared volume)
                        └── /media/      generated audio (shared volume)
```

Nginx is the only exposed port, so the frontend and API are same-origin in production and
the auth cookies work without CORS.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register/` | Create an account, set auth cookies |
| POST | `/api/auth/login/` | Authenticate, set auth cookies |
| POST | `/api/auth/logout/` | Blacklist the refresh token, clear cookies |
| POST | `/api/auth/refresh/` | Rotate the access token |
| GET | `/api/auth/me/` | Confirm the current user |
| GET/POST | `/api/collections/` | List or create collections |
| GET/PUT/DELETE | `/api/collections/<id>/` | Retrieve, update, delete a collection |
| GET/POST | `/api/entries/` | List or create entries (`?collection=<id>`, `?search=`) |
| GET/PUT/DELETE | `/api/entries/<id>/` | Retrieve, update, delete an entry |
| POST | `/api/entries/<id>/pronounce/` | Generate audio via ElevenLabs |

## Running it

### With Docker (matches production)

```bash
cp backend/.env.example backend/.env   # then fill in the values
docker compose up --build
```

Open http://localhost. Create an admin user with:

```bash
docker compose exec backend python manage.py createsuperuser
```

### Locally, without Docker

Backend — needs PostgreSQL running on the host:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` and `/media` to Django on port 8000.

## Environment variables

`backend/.env` (gitignored):

| Variable | Notes |
| --- | --- |
| `DEBUG` | `False` in production |
| `DJANGO_SECRET_KEY` | Required — Django won't start without it |
| `DJANGO_ALLOWED_HOSTS` | Comma separated; include the server's public IP |
| `CSRF_TRUSTED_ORIGINS` | Comma separated, scheme included (`http://…`) |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Database credentials |
| `POSTGRES_HOST` / `POSTGRES_PORT` | Compose overrides these to `db:5432` |
| `ELEVENLABS_API_KEY` | Pronunciation returns 503 without it |
| `ELEVENLABS_VOICE_ID` | Defaults to a preset voice |
| `AUTH_COOKIE_SECURE` | `False` over plain HTTP, `True` once TLS is added |
| `AUTH_COOKIE_SAMESITE` | `Lax` |

## Tests

Backend (Django TestCase — auth cookie flow, owner scoping, entry creation, mocked
pronunciation):

```bash
cd backend && python manage.py test
```

Frontend (Cypress E2E — anonymous redirect, registration flow):

```bash
cd frontend && npx cypress run     # or: npx cypress open
```

Cypress expects Django on `:8000` and Vite on `:5173`. To run against the Docker stack
instead: `npx cypress run --config baseUrl=http://localhost`.

## CI

GitHub Actions runs on every push to `main` and on every pull request:

1. **Django tests** — against a real PostgreSQL service container, with a check for
   missing migrations.
2. **Lint and build** — oxlint plus a production Vite build.
3. **Cypress E2E** — full stack, gated on the first two jobs passing.

## Notes and known limits

- Served over plain HTTP; TLS and the HTTPS redirect are the next step.
- Errors surface through `alert()` rather than inline field messages.
- Collections and entries are edited by delete-and-recreate in the UI; the API supports
  `PUT` but no edit form is wired up yet.
- General jank in the styling
