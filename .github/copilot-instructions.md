**Repository Overview**
- **What:** Full-stack e-learning app with a Vite + React TypeScript frontend and a Node/Express + PostgreSQL backend in `backend/`.
- **Frontend:** `src/` (React + TypeScript, Tailwind, shadcn-ui, Radix). Entry: `src/main.tsx`, routes defined in `src/App.tsx`.
- **Backend:** `backend/src/` (Express API, Socket.IO, migrations & seeds). Server entry: `backend/src/server.js`.

**How to run (dev)**
- **Frontend (root):** `npm install` then `npm run dev` — Vite serves on port `8080` by default (see `vite.config.ts`).
- **Backend:** `cd backend && npm install` then `npm run dev` (starts `nodemon src/server.js`).
- **Env & API URL:** frontend reads API base from `VITE_API_URL` (see `backend/README.md` and `src/config/api.ts`). Copy `backend/.env.example` to `.env` and set Postgres creds.
- **DB:** Migrations/seeds available: `cd backend && npm run db:migrate` and `npm run db:seed`.

**Key Architectural Patterns (for code edits)**
- **API surface:** All API endpoints are in `backend/src/routes` and implemented in `backend/src/controllers` (use the `controllers` + `routes` pattern).
- **Frontend routing & auth:** Routes live in `src/App.tsx`. Use `AuthContext` (`src/contexts/AuthContext.tsx`) and `ProtectedRoute` (`src/components/auth/ProtectedRoute`) for role-based guards.
- **Data fetching:** Uses `@tanstack/react-query` for async data; create query hooks or use `services/*` for fetch helpers and mutate via React Query patterns.
- **State / utilities:** Lightweight local state via `zustand` and custom hooks in `src/hooks/`. Keep side-effects in `services/` and hooks.
- **Design system:** shadcn-ui + Radix components used throughout `src/components/ui/*`. Follow existing component styling (Tailwind + class-variance-authority patterns).

**Integration points & external deps**
- **Socket.IO:** Backend `socket.io` and frontend `socket.io-client` (see `backend/src/server.js` and `src/services/socket.ts`). Use these for real-time classroom/chat features.
- **Payments:** `react-paystack` integration exists — payments endpoints and verification flow in backend; frontend uses `Checkout` and `PaymentVerify` pages.
- **Auth & JWT:** Backend uses `jsonwebtoken`; protected backend routes rely on middleware in `backend/src/middleware`.

**Common change workflows (examples)**
- **Add a new API endpoint:** Add route in `backend/src/routes`, implement controller in `backend/src/controllers`, add validation with `express-validator`, update any migrations if DB changes, then call from frontend via `src/config/api.ts` and a new `services/*` helper or React Query hook.
- **Update a frontend page:** Create/modify page in `src/pages/`, use `services/*` or `react-query` hooks, reuse UI components from `src/components/*` and register route in `src/App.tsx`.
- **Adjust API base URL for local dev:** Edit `.env` at repo root or set `VITE_API_URL=http://localhost:5000/api` before `npm run dev`.

**Files and paths to inspect first (quick list)**
- **Frontend:** `src/App.tsx`, `src/contexts/AuthContext.tsx`, `src/config/api.ts`, `src/services/`, `src/components/auth/ProtectedRoute.tsx`, `src/pages/`.
- **Backend:** `backend/src/server.js`, `backend/src/routes/`, `backend/src/controllers/`, `backend/src/db/` (migrations & seeders), `backend/.env.example`.

**Repository conventions & gotchas**
- **Alias:** Imports often use `@/` which maps to `./src` from `vite.config.ts` — prefer `@/` for frontend imports.
- **React Query is primary:** Avoid ad-hoc fetch-and-set-state patterns; prefer `useQuery`/`useMutation` and invalidate queries on changes.
- **Role-based UI gating:** Components/pages assume roles `'student'|'teacher'|'admin'|'parent'`; follow `ProtectedRoute` signature when adding guarded routes.
- **No test suite present:** There are no automated tests in the repo. Don’t invent unreferenced test frameworks — suggest tests to the authors.

**When you need to change DB or run infra**
- Run `cd backend && npm run db:migrate` and `npm run db:seed`. The backend README documents local Postgres requirements.

**Small examples to copy/paste**
- API base usage (frontend):
  - `import { API_URL } from '@/config/api'; // check src/config/api.ts`
- Protected route usage (frontend):
  - `<ProtectedRoute allowedRoles={["student"]}><StudentDashboard/></ProtectedRoute>` (see `src/App.tsx`).

**If unsure, prefer non-destructive PRs**
- Keep changes small and isolated: modify a single route/component per PR and include run instructions. Update `README.md` or `backend/README.md` if you introduce new dev tasks.

If anything in this file looks unclear or missing, tell me which area (frontend, backend, auth, sockets, payments, or DB) and I will expand with concrete examples.
