# Quickstart & Validation Guide: Plisados Roldán Informational Website

**Feature**: `001-business-info-site` | **Plan**: [plan.md](./plan.md)

This guide proves the feature works end to end. It does not contain implementation code.

## Prerequisites

| Tool | Version |
|---|---|
| Docker Desktop | current — runs the components and Testcontainers |
| JDK | 21 (e.g., Eclipse Temurin), for backend development |
| Node.js | 24 LTS, for frontend development |
| Maven | not needed — `backend/mvnw` |

One repository with three components (research R18): `frontend/`, `backend/`, `database/`.
Copy `.env.example` to `.env` at the root and set at least `DB_PASSWORD`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`.

## Run locally (development)

1. Root: `docker compose up -d db db-migrate` — PostgreSQL on `localhost:5432` with the schema and
   seed applied by the database component.
2. `cd backend` → `cp .env.example .env` (same credentials) → `./mvnw spring-boot:run` — API on
   `http://localhost:8080`; the admin user is created from `.env` on first start.
3. `cd frontend` → `npm install` → `npm start` — app on `http://localhost:4200` with the dev proxy
   for `/api`, `/media`, `/sitemap.xml`.

## Run the full demo stack

Root: `docker compose up --build` → `db`, `db-migrate`, `backend`, `web` → open
`http://localhost:4000` (SSR server; the only published application port).

## Automated checks

| Command | Proves |
|---|---|
| `cd backend && ./mvnw verify` | Spotless format, unit tests, endpoint integration tests on real PostgreSQL (Testcontainers) using `database/migrations`, validated against `openapi.yaml` |
| `cd frontend && npm run lint && npm test` | ESLint/Prettier, `contract:check` (generated models current with the contract), unit tests |
| `cd frontend/e2e && E2E_ADMIN_PASSWORD=… npx playwright test` (stack running) | Main customer flow, admin flows, SEO, axe accessibility audit |

All must pass before merge (constitution: Quality Gates).

## Manual validation scenarios

Map to spec user stories (US) and success criteria (SC).

1. **Visitor → WhatsApp (US1, SC-001)**: On a phone-sized viewport open `/`, tap a service,
   tap "Cotizar por WhatsApp". Expected: ≤ 3 taps; `wa.me/573116254705` opens with
   "Hola, quiero cotizar el servicio de {name}."
2. **Price display (US1-AS2/AS4)**: In admin, set a price of 120000 on Plisado. Expected: public
   detail shows "Desde $ 120.000 COP"; an offering without price shows no price element.
3. **Admin access control (US2-AS1/AS2, SC-006)**: Without logging in, open `/admin/servicios`
   → redirected to login. Call any `POST/PUT/DELETE /api/admin/**` without a session → 401/403.
   Enter a wrong password 5 times → 6th attempt gets "Demasiados intentos".
4. **Create and publish (US2-AS3/AS4, SC-004)**: Time yourself: create "Plisado acordeón" with 3
   phone photos (one ≥ 8 MB), publish. Expected: < 5 minutes; appears on `/servicios` in the last
   position; photos load as resized variants. Unpublish → disappears publicly, stays in admin.
5. **Profile edits propagate (US2-AS5/AS6)**: Change the WhatsApp number and about text.
   Expected: all WhatsApp buttons and `/nosotros` show the new values after refresh.
6. **Social proof (US3, US4)**: With no cases/testimonials, the sections and nav links are hidden.
   Create one featured, published case and testimonial → both appear on `/`; delete the
   testimonial (confirm dialog) → gone everywhere.
7. **Upload errors (edge cases)**: Upload a 15 MB file → "El archivo supera 10 MB"; upload a PDF
   renamed to `.jpg` → "Formato no soportado". No new rows or files remain afterwards.
8. **Expired session (edge case)**: Log in, delete the session cookie in dev tools, edit a
   testimonial and save. Expected: login dialog, text preserved, save succeeds after login.
9. **SEO (US5, SC-005)**: `curl -s http://localhost:4000/servicios/plisado` → HTML contains the
   offering name, description, a page-specific `<title>`, meta description and `og:image`.
   `curl -s http://localhost:4000/sitemap.xml` → lists every published page. A draft or unknown
   slug returns HTTP 404.
10. **Performance (SC-003)**: Lighthouse, mobile profile, against the demo stack on `/` and an
    offering detail. Expected: LCP ≤ 2.5 s.
11. **Accessibility (SC-007)**: The Playwright axe run reports no critical issues; tab through
    `/` and reach the WhatsApp button with the keyboard.
12. **Comprehension test (SC-002)**: Show `/` for 30 seconds to 5 people unfamiliar with the
    business. Expected: ≥ 4 can say what it does and name 3 services.

## Configuration reference

| Variable | Used by | Purpose |
|---|---|---|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | backend | PostgreSQL connection |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | backend | First admin, created only if none exists |
| `MEDIA_ROOT` | backend | Image directory (Docker volume in the demo stack) |
| `PUBLIC_BASE_URL` | backend | Absolute URLs in sitemap and Open Graph tags |
| `API_INTERNAL_URL` | frontend SSR server | Backend URL for server-side rendering and the proxy |
