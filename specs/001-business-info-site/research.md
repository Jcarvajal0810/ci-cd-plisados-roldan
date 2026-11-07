# Research: Plisados Roldán Informational Website

**Feature**: `001-business-info-site` | **Date**: 2026-11-07 | **Plan**: [plan.md](./plan.md)

Each entry: Decision / Rationale / Alternatives considered.

## R1. Runtime versions and build tools

- **Decision**: Java 21 (LTS) + Spring Boot 4.0.x, built with Maven through the Maven Wrapper
  (`mvnw`). Angular (current stable at scaffolding time) with `@angular/ssr`, TypeScript strict,
  Node 24 LTS, npm. PostgreSQL 17.
- **Rationale**: LTS runtimes and the newest stable framework lines at the start of the project;
  the wrapper removes the need to install Maven. Node 24 is already on the dev machine.
- **Alternatives considered**: Gradle (equivalent; Maven is more common in Spring courses and
  examples); Spring Boot 3.5 (fine fallback if a library is not yet Boot 4 compatible).
- **Environment finding**: the dev machine has Node 24 and Docker but **no JDK**; JDK 21 must be
  installed (see quickstart).

## R2. Persistence approach under Clean Architecture

- **Decision**: Plain domain classes (no framework annotations) + repository **ports** in the
  domain layer, implemented in infrastructure with Spring's `JdbcClient` and hand-written SQL.
  Flyway for migrations.
- **Rationale**: Constitution VI forbids persistence framework dependencies in the domain. With
  JPA that means duplicating every entity (JPA entity + domain model + mapper). With `JdbcClient`
  the adapter maps rows straight to domain objects: less code, explicit SQL, no lazy-loading
  surprises, and transactions work the same (`@Transactional` in application services).
- **Alternatives considered**: Spring Data JPA with annotated domain classes (simplest, but
  violates VI); JPA with separate entities and mappers (compliant but doubles the model for a
  CRUD app); jOOQ (needs code generation, extra tooling).

## R3. Naming the "service" entity

- **Decision**: The business's "servicio" is called **`Offering`** in code (`Offering`,
  `OfferingUseCases`, `/offerings` in the API). Spanish UI text still says "Servicios" and the
  public route is `/servicios`.
- **Rationale**: A class named `Service` collides with Spring's `@Service` and with the word
  "service" for application services (`ServiceService`), which hurts readability (Clean Code).
- **Alternatives considered**: `Service` (ambiguous), `TextileService` (long, still ambiguous),
  Spanish identifiers (mixes languages in code). The constitution's example name `Service` is
  only an example; a PATCH amendment can align it later.

## R4. SSR strategy (FR-010, Principle V)

- **Decision**: Angular SSR with per-route render modes: public routes `RenderMode.Server`
  (rendered on each request, so admin edits appear immediately); `/admin/**` `RenderMode.Client`
  (no SEO value, avoids rendering authenticated pages on the server). HTTP transfer cache enabled
  so data fetched on the server is not fetched again in the browser.
- **Rationale**: Content changes at runtime from the admin, so build-time prerendering would go
  stale. Server rendering keeps pages indexable and gives link previews (Open Graph tags).
- **Alternatives considered**: Prerender at build (stale after every edit; requires rebuilds);
  plain SPA (rejected by the user's choice and FR-010).

## R5. Topology, same-origin and CORS

- **Decision**: The browser talks only to the Node SSR server. It serves the Angular app and
  reverse-proxies `/api/**`, `/media/**`, `/sitemap.xml` to Spring Boot. During SSR, Angular calls
  the backend directly on its internal URL (`API_INTERNAL_URL`) via a server-only interceptor.
  In development, `ng serve` uses a proxy config to the same paths.
- **Rationale**: One origin means session cookies and CSRF work with no CORS configuration.
- **Alternatives considered**: Separate origins with CORS + JWT (more configuration, token
  storage concerns); nginx in front (an extra component; YAGNI for an exploratory project).

## R6. Admin authentication and CSRF (FR-013, FR-014, FR-021)

- **Decision**: Spring Security with a server-side **session** (HttpOnly, SameSite=Lax cookie)
  created by a JSON login endpoint; passwords hashed with BCrypt. CSRF protection on with
  `CookieCsrfTokenRepository` (`XSRF-TOKEN` cookie, `X-XSRF-TOKEN` header), which Angular's
  `HttpClient` supports out of the box. The first admin is created at startup from environment
  variables `ADMIN_EMAIL` / `ADMIN_PASSWORD` only when no admin exists; there is no sign-up.
- **Rationale**: One user and one origin: sessions are the simplest secure option. No token
  storage in the browser.
- **Alternatives considered**: JWT (needs refresh/revocation logic, more code); HTTP Basic (no
  logout, poor UX).
- **Gotcha recorded**: Spring Security 6+ defers CSRF token loading; a small filter or
  `CsrfTokenRequestAttributeHandler` setup is needed so the cookie is issued on the first GET
  (`/api/auth/me`). Cover with an integration test.

## R7. Login throttling (FR-021)

- **Decision**: In-memory counter keyed by email + client IP: after 5 consecutive failures,
  reject logins for that key for 15 minutes with HTTP 429. Reset on success.
- **Rationale**: Single backend instance, single admin; no shared cache needed.
- **Alternatives considered**: Database-backed counter or Redis (needed only with several
  instances; YAGNI); Bucket4j (a library for what is ~30 lines of tested code).

## R8. Image upload, processing and storage (FR-017, FR-018, SC-003)

- **Decision**: Accept JPEG, PNG and WebP up to 10 MB (checked by size and by decoding the file,
  not by extension). Decode with ImageIO plus TwelveMonkeys (WebP reader), resize with
  Thumbnailator to widths 480, 960 and 1600 px (never upscaling), and store as JPEG (quality
  0.82). Files live on the local file system under `MEDIA_ROOT` behind an `ImageStorage` port;
  served at `/media/{key}-{width}.jpg` with long-lived immutable cache headers (keys are random
  UUIDs, so a changed image gets a new key). The frontend uses `srcset`/`sizes` and lazy loading.
- **Rationale**: Owner uploads phone photos; resizing is the biggest LCP win. JPEG output avoids
  shaky WebP *writers* in Java. A storage port keeps a later move to object storage cheap.
- **Alternatives considered**: WebP/AVIF output (better compression, poor Java encoder support);
  storing images in PostgreSQL `bytea` (bloats backups, slower serving); a CDN/object store
  (out of scope for exploratory).
- **Trade-off**: PNG transparency is lost on conversion (acceptable for product photos).

## R9. Keeping database and files consistent (Constitution VI – ACID)

- **Decision**: Upload: write the variants to disk first, then insert rows in one transaction; if
  the transaction rolls back, a `TransactionSynchronization.afterCompletion` hook deletes the
  written files. Delete: remove rows in the transaction and delete files only **after commit**.
  A failed post-commit file deletion is logged (a stray file is harmless; a row pointing to a
  missing file is not).
- **Rationale**: The file system is not transactional, so order the steps so the database never
  references a missing file.
- **Alternatives considered**: Storing files only after commit (the request then succeeds before
  the file exists); a periodic orphan sweeper (YAGNI unless logs show leaks).

## R10. Ordering items (FR-015)

- **Decision**: Integer `display_order` per item. Reordering sends the full ordered list of IDs
  for that collection; the server rewrites positions 1..n in one transaction and rejects lists
  that do not contain exactly the existing IDs.
- **Rationale**: Simple, atomic, and the UI (up/down buttons) always has the full list (<50 items).
- **Alternatives considered**: Fractional/lexicographic ranks (for large or concurrent lists;
  not needed).

## R11. Slugs and URLs

- **Decision**: Slug generated on create from the name/title: lower-case, accents removed
  (`Plisado láser` → `plisado-laser`), non-alphanumerics → `-`, suffix `-2`, `-3` on collision.
  The slug does not change when the name is edited (shared links keep working).
- **Rationale**: Readable URLs help SEO and sharing; stable slugs avoid broken links.
- **Alternatives considered**: IDs in URLs (bad SEO); regenerating slugs on rename (breaks links;
  redirect table is YAGNI).

## R12. WhatsApp click-to-chat (FR-006)

- **Decision**: Links built in the frontend by one `WhatsAppLinkBuilder` as
  `https://wa.me/{digits}?text={urlencoded}`, using the number from the business profile
  (digits only, with country code, e.g. `573116254705`). Message templates are listed in
  [contracts/ui-routes.md](./contracts/ui-routes.md).
- **Rationale**: One source of truth (DRY); `wa.me` handles app vs WhatsApp Web automatically.
- **Alternatives considered**: `api.whatsapp.com/send` (equivalent, longer); building links in
  the backend (couples API to presentation text).

## R13. Sitemap and robots (FR-011)

- **Decision**: Backend endpoint `GET /sitemap.xml` built from published offerings and success
  cases plus the static public routes, using `PUBLIC_BASE_URL`; proxied by the SSR server.
  `robots.txt` is a static frontend asset that disallows `/admin` and points to the sitemap.
- **Rationale**: The backend owns the published-content query; no duplication in Node.
- **Alternatives considered**: Generating the sitemap in the Node server (needs a second data
  query path).

## R14. API errors

- **Decision**: RFC 9457 Problem Details (`application/problem+json`, Spring `ProblemDetail`) for
  all errors, with an `errors` map for field validation failures. Bean Validation on request
  DTOs in the web layer; business rules in the application layer.
- **Rationale**: Built into Spring; one error shape for the Angular client to handle (DRY).

## R15. Testing toolchain (Constitution VII)

- **Decision**:
  - Backend: JUnit 5, AssertJ, Mockito for unit tests of domain/application; Spring Boot Test +
    MockMvc + **Testcontainers PostgreSQL** for endpoint integration tests (written before the
    controller).
  - Frontend: the Angular CLI's default unit test runner (Vitest in current Angular) with
    Angular TestBed for services and logic-bearing components.
  - End-to-end: Playwright against the full stack (docker compose), with `@axe-core/playwright`
    for the WCAG checks in SC-007.
  - Performance: Lighthouse (mobile profile) run manually against the demo stack for SC-003.
  - Formatting/linting: Spotless (google-java-format) for Java; ESLint + Prettier for Angular;
    all run in the build.
- **Rationale**: Mainstream, well-documented tools; Testcontainers satisfies "real PostgreSQL".
- **Alternatives considered**: H2 for tests (behaves differently from PostgreSQL; forbidden by
  the constitution); Cypress (Playwright is faster and has first-class axe integration).

## R17. Two repositories with duplicated specs (owner decision, 2026-11-07) — superseded by R18

- **Decision**: Backend and frontend live in **separate git repositories**, cloned side by side:
  `pisadosroldan-backend/` (Spring Boot) and `pisadosroldan-frontend/` (Angular SSR + `e2e/`).
  Each repo carries its own copy of `.specify/` (constitution), `.claude/` (Spec Kit skills) and
  `specs/001-business-info-site/`. The current `pisadosroldan/` folder is the staging place where
  the specs were written; it is copied into both repos at setup (T001) and is not a repo itself.
- **Contract sync**: `specs/001-business-info-site/contracts/openapi.yaml` is the contract in each
  repo, and the two copies MUST be identical. Any contract change is made in both repos in the
  same work session. Guards:
  - Backend: every endpoint integration test validates requests and responses against its copy
    of `openapi.yaml` (Atlassian `swagger-request-validator-mockmvc`), so code drifting from the
    contract fails the build.
  - Frontend: TypeScript API models are **generated** from its copy (`openapi-typescript`);
    `npm run contract:check` regenerates them and fails on any diff, and also fails if
    `../pisadosroldan-backend/specs/001-business-info-site/contracts/openapi.yaml` exists and
    differs from the local copy.
- **Other consequences**: The backend repo has a dev `docker-compose.yml` (PostgreSQL only) and
  its own `.env.example`. The frontend repo owns the full demo stack: its `docker-compose.yml`
  builds the backend from `../pisadosroldan-backend` and runs db + backend + web; Playwright
  e2e tests live in the frontend repo. Runtime topology (R5) is unchanged: browser → SSR server
  → proxy → backend.
- **Rationale**: The owner wants independent repositories; duplicating the specs keeps each repo
  self-contained (Spec Kit works in either). Automated contract checks make the duplication safe.
- **Alternatives considered**: A third "platform" repo for specs/compose/e2e (single source of
  truth, but one more repo); specs only in the backend repo (frontend not self-contained);
  backend-owned contract with copy-on-sync (rejected by the owner in favor of the specs copy).
- **Trade-off**: Constitution and spec amendments must also be applied in both repos.
- **Implementation note (2026-11-07)**: the owner chose to create both repos *inside* the staging
  folder (`pisadosroldan/pisadosroldan-backend`, `pisadosroldan/pisadosroldan-frontend`); they
  are still siblings, so every `../pisadosroldan-backend` path above works unchanged.
- **Contract version (2026-11-07)**: the contract is **OpenAPI 3.0.3**, not 3.1. The backend
  validator mis-handles 3.1 path parameters and `null` type unions. Nullable scalars use
  `nullable: true`; optional images (`coverImage`, `photo`) are omitted from the JSON when absent
  rather than sent as `null`. The validator's `additionalProperties` rule is ignored because it
  gives false positives on `allOf` schemas; all other checks are enforced.

## R18. One repository, three independent components (owner decision, 2026-11-07) — supersedes R17

- **Decision**: The project lives in **one git repository** (`ci-cd-plisados-roldan`) with three
  separately built and deployed components that only talk over the network:
  - `frontend/` — Angular SSR (container `web`, the only public entry point);
  - `backend/` — Spring Boot REST API (container `backend`);
  - `database/` — PostgreSQL 17 (container `db`) plus the versioned schema and seed in
    `database/migrations`, applied by its own Flyway 11 image (container `db-migrate`) before the
    backend starts.
- **Schema ownership moved from the backend to the database component.** Flyway is now a
  *test-only* dependency of the backend: its integration tests apply the same
  `../database/migrations` to a Testcontainers PostgreSQL, so tests and deployment share one
  schema. The production backend never creates or alters tables.
- **One copy of the specs and contract** at the repository root (`specs/`, `.specify/`). The
  backend tests validate against `../specs/.../openapi.yaml`; the frontend generates its types
  from the same file. The R17 duplication and cross-repo diff check are removed.
- **One `docker-compose.yml`** at the root orchestrates the three components; `.env.example` at
  the root lists every variable.
- **Rationale**: The owner wants a single repository for CI/CD but an architecture that is not a
  monolith: each component has its own image, configuration and lifecycle.
- **Alternatives considered**: keep two repositories (R17); keep the schema in the backend
  (database would not be an independent component); split the backend into microservices
  (rejected — no requirement needs it, and it would multiply operational cost; see constitution
  Principle III).

## R16. Exploratory deployment

- **Decision**: `docker compose` with three services: `db` (PostgreSQL 17, named volume),
  `backend` (Spring Boot jar), `web` (Angular SSR Node server, the only port published), plus a
  named volume for `MEDIA_ROOT`. Configuration through environment variables; an `.env.example`
  documents them; real `.env` is git-ignored.
- **Rationale**: One command to run the whole demo; nothing to host or pay for.
- **Alternatives considered**: A PaaS deploy (out of scope; design keeps it possible).
