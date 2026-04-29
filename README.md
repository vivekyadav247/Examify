# Examify

Examify is an AI-first learning platform for students preparing for competitive exams. It generates quiz questions instantly, adapts difficulty using IRT, tracks topic-wise ability, and gives Failure DNA feedback after every session.

## Current Project Scope

- Student onboarding by exam target, weak subjects, and plan selection
- Instant AI-generated quiz sessions (no static question-bank dependency for primary flow)
- IRT-based adaptation using topic profile ability scores
- Failure DNA analysis (`conceptual`, `silly`, `time`, `recall`)
- Session analytics, leaderboard, streak, XP, and topic map
- Content-based quiz generation from uploaded files/URLs

## Tech Stack

- Frontend: React + Vite + Tailwind + Recharts
- Backend: Django + Django REST Framework
- AI Generation: OpenRouter-compatible API via `openai` SDK + `httpx`
- Database: SQLite by default (Postgres supported through `DATABASE_URL`)

## Project Structure

- `examify_frontend` - React student/admin frontend
- `examify_backend` - Django API, engines, and domain apps

## Environment Setup

### 1) Backend

```bash
cd examify_backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `examify_backend/.env` with at least:

```env
DEBUG=true
DJANGO_SECRET_KEY=replace-me
DATABASE_URL=sqlite:///db.sqlite3
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=anthropic/claude-3-haiku
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

Run backend:

```bash
python manage.py migrate
python manage.py runserver
```

### 2) Frontend

```bash
cd examify_frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`  
Backend default URL: `http://localhost:8000`

## Key APIs (Student Flow)

- `GET /api/quiz/start/` - starts adaptive quiz session
- `GET /api/quiz/session/<session_id>/next-batch/` - loads next adaptive batch
- `POST /api/quiz/answer/` - evaluates answer and updates profile/IRT/DNA
- `POST /api/quiz/session/<session_id>/complete/` - finalizes session summary
- `GET /api/quiz/session/<session_id>/` - session detail and breakdown
- `GET /api/analytics/dashboard/` - dashboard metrics
- `GET /api/analytics/topic-graph/` - topic map data

## Notes

- Quiz quality depends on `OPENROUTER_API_KEY` availability and model response quality.
- If AI provider is unavailable, quiz generation endpoints can return `503`.
- This repository currently includes both student and admin interfaces.
