# Root2Rise Backend

Express-based backend providing skill analysis, recommendations, and roadmap endpoints for Healthcare, Agriculture, and Urban sectors.

## Quick Start
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
- Open docs at `http://localhost:8080/docs` (OpenAPI)
- Health: `GET /health`

## Environment
- `PORT` (default 8080)
- `SUPABASE_URL` (optional)
- `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` (optional)
  - If provided, `PUT /profiles/me` persists to Supabase `profiles` table.
  - Otherwise, profiles are stored in-memory for demo.

## Endpoints
- `GET /frameworks` — canonical skill targets per sector
- `PUT /profiles/me` — upsert `{ sector, skills }` for current user
- `GET /profiles/me` — fetch profile for current user
- `POST /analysis/gap` — compute gaps and progress
- `POST /recommendations` — fetch external resources via OpenAlex
- `POST /roadmap` — generate roadmap steps and pathway tips

## Data Model (Supabase)
- `profiles`:
  - `id: uuid (PK)` — user id
  - `sector: text`
  - `skills: jsonb`

## Integration Notes
- Frontend can pass Supabase access token as `Authorization: Bearer <token>` to identify the user.
- Without Supabase, demo flows work using in-memory storage.

## License
Prototype for hackathon demo.
