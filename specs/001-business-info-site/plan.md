# Implementation Plan: Plisados Roldán Informational Website

**Branch**: `001-business-info-site` | **Date**: 2026-11-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-business-info-site/spec.md`

## Summary

A mobile-first, Spanish-language informational website for Plisados Roldán that turns visitors
into WhatsApp conversations, plus a private admin area where the owner manages offerings
("servicios"), success cases, testimonials, images and business information.

Technical approach: a Spring Boot modular monolith (REST/JSON, session-authenticated admin) on
PostgreSQL, and an Angular app with server-side rendering for public pages. The Angular SSR Node
server is the single public entry point and proxies API and media requests to the backend, so
everything is same-origin (no CORS, simple cookies). Images are resized on upload and stored on
the file system behind a storage port. The project is **one repository with three independent components** — `frontend/` (Angular SSR), `backend/` (Spring Boot API) and `database/` (PostgreSQL 17 + versioned Flyway migrations applied by their own container) — orchestrated by one `docker-compose.yml` (research R18, superseding the two-repo layout of R17). Details and alternatives: [research.md](./research.md).

## Technical Context

**Language/Version**: Java 21 (LTS); TypeScript (strict) on Node 24 LTS

**Primary Dependencies**: Spring Boot 4.0.x (Web MVC, Security, Validation, JDBC/`JdbcClient`),
Flyway, Thumbnailator + TwelveMonkeys ImageIO; Angular (current stable) with `@angular/ssr`

**Storage**: PostgreSQL 17 (content, admin user); local file system volume for image variants

**Testing**: JUnit 5, AssertJ, Mockito, Spring Boot Test + MockMvc, Testcontainers (PostgreSQL);
Angular CLI unit test runner (Vitest); Playwright + `@axe-core/playwright`; Lighthouse (manual);
contract checks: `swagger-request-validator-mockmvc` (backend), `openapi-typescript` (frontend)

**Target Platform**: Linux containers (docker compose) for demo; current mobile and desktop
browsers for users

**Project Type**: Web application (backend API + SSR frontend)

**Performance Goals**: LCP ≤ 2.5 s on a mid-range phone over 4G for public pages (SC-003)

**Constraints**: WCAG 2.1 AA; pages indexable without client-side scripts; no visitor personal
data stored; images ≤ 10 MB upload, served resized; single backend instance

**Scale/Scope**: 1 admin; ~6–20 offerings, < 50 cases, < 50 testimonials, < 1,000 images;
8 public routes + ~12 admin screens; low traffic (exploratory)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|---|---|---|
| I | Spec Before Code | ✅ Pass | Spec approved with 0 open clarifications; this plan precedes any code |
| II | Fixed, Boring Stack | ✅ Pass (1 justified item) | Java/Spring Boot, PostgreSQL + Flyway, Angular strict. The Node SSR server is a new runtime → Complexity Tracking |
| III | Pragmatic Simplicity | ✅ Pass | One backend deployable + one Angular app; no broker/cache/search engine; in-memory login throttle; essentials kept (validation, errors, backups not required for demo but not blocked) |
| IV | Owner-Controlled Content | ✅ Pass | All content in own DB, editable in admin; no Instagram integration at all (stricter than required); WhatsApp on every public page |
| V | Mobile-First, Fast, Findable | ✅ Pass | SSR + per-page meta/OG + sitemap; resized images with srcset; LCP target; axe audit; `lang="es-CO"` |
| — | Security & Data Protection | ✅ Pass | Session + BCrypt + CSRF; secrets via env/`.env` (git-ignored); no visitor personal data (Ley 1581 not triggered). HTTPS: terminated by the host when deployed; local demo runs HTTP (exploratory) |
| VI | Engineering Quality | ✅ Pass | ACID: multi-row writes in `@Transactional` application services, DB constraints (data-model), file/DB consistency rules (R9). Clean Architecture: feature packages with api/application/domain/infrastructure; domain free of Spring/JDBC; DTOs only in API. SOLID: ports only at real boundaries (repositories, `ImageStorage`, `ImageProcessor`). DRY: shared ordering, publication, slug and gallery logic in `shared` (R10, R11). KISS/YAGNI: no featured flag on offerings, no redirects table, no optimistic locking |
| VII | Test-Driven Development | ✅ Pass | Tests first for domain/application logic, every endpoint (integration test before controller), Angular services/logic components, and the main-flow E2E from acceptance scenarios. `/speckit-tasks` must order test tasks before implementation tasks |

**Post-design re-check (after Phase 1)**: ✅ Still passing. The design added no new runtime
components. `JdbcClient` was chosen specifically to keep the domain free of persistence
annotations (VI). One naming deviation from a constitution *example* (`Service` → `Offering`,
R3) — not a violation; optional PATCH amendment.

## Project Structure

### Documentation (this feature)

```text
specs/001-business-info-site/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R16
├── data-model.md        # Phase 1: tables, constraints, state transitions, seed
├── quickstart.md        # Phase 1: run + validation scenarios
├── contracts/
│   ├── openapi.yaml     # REST API contract
│   └── ui-routes.md     # Routes, SEO meta, WhatsApp messages, UI behaviors
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks) — not created yet
```

### Source Code

> **Current layout (research R18):** one repository with `frontend/`, `backend/` and `database/` (`database/migrations` + `Dockerfile` for the `db-migrate` image), a single `specs/` at the root and a root `docker-compose.yml`. The tree below is the original two-repo design (R17), kept for history; read `backend/` and `frontend/` as the component folders and ignore the per-repo `.specify/`, `specs/` and `docker-compose.yml` entries.

#### Original design (two repositories)

Both repos also contain `.specify/`, `.claude/` and `specs/001-business-info-site/` (copies;
research R17). Below, `backend/` = repo `pisadosroldan-backend`, `frontend/` = repo
`pisadosroldan-frontend`.

```text
backend/                                   # repo pisadosroldan-backend — Spring Boot modular monolith
├── .specify/  .claude/  specs/            # duplicated specs + constitution
├── docker-compose.yml                     # dev only: db
├── .env.example, Dockerfile, README.md
├── mvnw, pom.xml
└── src/
    ├── main/java/co/plisadosroldan/
    │   ├── PlisadosRoldanApplication.java
    │   ├── offering/                      # one package per feature, same 4 layers each
    │   │   ├── api/                       # controllers (public + admin), request/response DTOs
    │   │   ├── application/               # use cases, @Transactional boundaries
    │   │   ├── domain/                    # Offering, rules, OfferingRepository (port)
    │   │   └── infrastructure/            # JdbcOfferingRepository (SQL adapter)
    │   ├── successcase/                   # api / application / domain / infrastructure
    │   ├── testimonial/                   # api / application / domain / infrastructure
    │   ├── profile/                       # business profile + public home aggregate
    │   ├── media/                         # Image, ImageStorage + ImageProcessor ports,
    │   │                                  # file-system + Thumbnailator adapters, /media serving
    │   ├── auth/                          # security config, login/logout/me, throttle, admin seeding
    │   ├── seo/                           # /sitemap.xml
    │   └── shared/                        # Slug, DisplayOrder/reorder, Publication, Gallery,
    │                                      # ProblemDetail handler, clock
    ├── main/resources/
    │   ├── application.yml
    │   └── db/migration/                  # V1__schema.sql, V2__seed.sql
    └── test/java/co/plisadosroldan/
        ├── <feature>/domain|application/  # unit tests (Mockito, AssertJ)
        ├── <feature>/api/                 # endpoint integration tests (MockMvc + Testcontainers)
        └── support/                       # shared Testcontainers base, fixtures

frontend/                                  # repo pisadosroldan-frontend — Angular + SSR
├── .specify/  .claude/  specs/            # duplicated specs + constitution
├── docker-compose.yml                     # full demo stack: db + backend (built from ../pisadosroldan-backend) + web
├── .env.example, Dockerfile, README.md
├── angular.json, package.json, proxy.conf.json
├── server.ts                              # SSR server: renders app, proxies /api /media /sitemap.xml
└── src/
    ├── app/
    │   ├── app.routes.ts, app.routes.server.ts   # render modes per route
    │   ├── core/                          # API clients, server URL interceptor, auth guard,
    │   │                                  # WhatsAppLinkBuilder, SeoService, price format
    │   ├── shared/ui/                     # whatsapp-button, gallery, responsive-image,
    │   │                                  # confirm-dialog, placeholder
    │   ├── public/                        # home, about, offerings (list/detail),
    │   │                                  # success-cases (list/detail), testimonials,
    │   │                                  # contact, not-found
    │   └── admin/                         # login, dashboard, offerings, success-cases,
    │                                      # testimonials, profile, preview
    ├── public/robots.txt
    └── styles/
    # unit tests live next to the code as *.spec.ts
└── e2e/                                   # Playwright: customer flow, admin flows, axe audit
    ├── playwright.config.ts
    └── tests/
```

**Structure Decision**: Two repositories (owner decision, research R17): `pisadosroldan-backend`
and `pisadosroldan-frontend`, each self-contained with its own copy of the specs and
constitution. The frontend repo also owns the Playwright e2e suite and the full-stack compose
file, because those need both sides running. The backend is organized by feature with the four Clean Architecture layers
inside each feature (Constitution VI); cross-feature logic that would otherwise be repeated
three times (ordering, publication, slugs, galleries, error handling) lives in `shared/`.
The frontend separates `public/` (SSR, SEO) from `admin/` (client-rendered), with HTTP and
state in `core/` services and presentational pieces in `shared/ui/`.

## Delivery Order (input for `/speckit-tasks`)

Each phase ends with a demo-able increment, mapped to the spec's user stories. Within every
phase, tests are written first (Constitution VII).

1. **Foundation** — repo skeleton, docker compose (db), Flyway V1 schema + V2 seed, Testcontainers
   base, Spotless/ESLint, Angular SSR app with proxy, layout shell, `ProblemDetail` handler.
2. **US1 (P1) – Visitor → WhatsApp**: public profile/offerings/home endpoints, `WhatsAppLinkBuilder`,
   home, servicios list/detail, contacto, nosotros, floating WhatsApp button, price format,
   placeholder images, 404. E2E for the main customer flow. → *MVP demo with seed content.*
3. **US2 (P1) – Owner manages offerings & profile**: auth (session, CSRF, throttle, admin seeding),
   admin offerings CRUD, publication, ordering, image upload/processing/storage with R9
   consistency, profile editing, preview, expired-session handling.
4. **US3 + US4 (P2) – Social proof**: success cases and testimonials (public + admin), featured on
   home, related offerings, hide empty sections. Reuses `shared` ordering/publication/gallery.
5. **US5 (P3) – Findability**: per-route title/meta/OG/canonical, sitemap, robots, HTTP 404 on
   SSR, Lighthouse and axe passes.
6. **Polish** — `docker compose up --build` full stack, `.env.example`, quickstart validation run.

## Risks

| Risk | Mitigation |
|---|---|
| No JDK on the dev machine | Install Temurin 21 before Foundation (quickstart) |
| Spring Boot 4 library compatibility (TwelveMonkeys, Testcontainers) | Verify in Foundation; fall back to Boot 3.5 (R1) |
| SSR pitfalls (browser-only APIs, double data fetch, absolute URLs on server) | Server URL interceptor + HTTP transfer cache (R4, R5); E2E checks rendered HTML |
| CSRF cookie not issued until first request (Spring Security 6+ deferred tokens) | Explicit handling + integration test (R6) |
| Duplicated specs/contract drift between the two repos | Backend ITs validate against `openapi.yaml`; frontend `contract:check` regenerates models and diffs against the sibling backend copy (R17); constitution/spec amendments applied to both repos |
| Windows Application Control blocking binaries (seen with `specify.exe`) | Run tooling through `mvnw`/`npx` and Docker; report if blocked |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Additional runtime: Node.js SSR server for the Angular app (Principle II) | FR-010 requires public pages to deliver content without client-side scripts, and the owner chose SSR; content changes at runtime, so it must render on request | Plain SPA fails FR-010; build-time prerendering goes stale after every admin edit and needs rebuilds; rendering HTML in Spring (Thymeleaf) would mean a second frontend stack outside the fixed Angular choice |
