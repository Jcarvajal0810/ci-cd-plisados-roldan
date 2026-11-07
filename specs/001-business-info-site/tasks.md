---

description: "Task list for the Plisados Roldán informational website"
---

# Tasks: Plisados Roldán Informational Website

**Input**: Design documents from `specs/001-business-info-site/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml,
contracts/ui-routes.md, quickstart.md

**Tests**: REQUIRED. Constitution Principle VII (TDD) applies: every test task comes before the
implementation task it drives, must be run and seen failing (Red) before that implementation,
and lands in the same change. Exempt from test-first: configuration, migrations (covered by
integration tests), purely presentational templates/styles, generated code.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested and
demoed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: User story from spec.md (US1–US5)

## Path Conventions

> **Layout update (research R18):** after implementation the two repositories were merged into one repository with three components: `frontend/`, `backend/` and `database/` (the migrations moved from `backend/src/main/resources/db/migration` to `database/migrations`), with a single `specs/` at the root. Paths below reflect the original two-repo plan.

- **Two git repositories** cloned side by side (research R17): `pisadosroldan-backend` and
  `pisadosroldan-frontend`. In this file `backend/` means the backend repo root and `frontend/`
  means the frontend repo root. E2E tests live in the frontend repo (`frontend/e2e/`).
- Each repo has its own copy of `.specify/`, `.claude/` and `specs/001-business-info-site/`;
  check off tasks in the copy of the repo where the work happens.
- Backend Java root: `backend/src/main/java/co/plisadosroldan/` (abbreviated below as `BE/`)
- Backend test root: `backend/src/test/java/co/plisadosroldan/` (abbreviated as `BT/`)
- Frontend app root: `frontend/src/app/` (abbreviated as `FE/`)
- End-to-end tests: `frontend/e2e/tests/`
- Feature packages follow plan.md: `<feature>/{api,application,domain,infrastructure}`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling

- [X] T001 Create the two sibling repositories `pisadosroldan-backend` and `pisadosroldan-frontend` (each `git init` + branch `001-business-info-site`); copy `.specify/`, `.claude/` and `specs/` from the staging folder `pisadosroldan/` into both; add `backend/.gitignore` (`.env`, `target/`, `media/`) and `frontend/.gitignore` (`.env`, `node_modules/`, `dist/`, `.angular/`, `e2e/node_modules/`, `e2e/test-results/`, `media/`)
- [X] T002 Generate the Spring Boot 4.0.x Maven project (Java 21, group `co.plisadosroldan`, artifact `backend`) with Maven Wrapper and dependencies: spring-boot-starter-web, -security, -validation, -jdbc, flyway-core + flyway-database-postgresql, postgresql driver, thumbnailator, twelvemonkeys imageio-webp, and test deps spring-boot-starter-test, spring-security-test, testcontainers postgresql + junit-jupiter, in `backend/pom.xml` and `BE/PlisadosRoldanApplication.java`; run `./mvnw verify` once to confirm the libraries resolve on Boot 4 (fall back to Boot 3.5 per research R1 if they do not)
- [X] T003 Add the Spotless Maven plugin with google-java-format, bound to the `verify` phase so formatting violations fail the build, in `backend/pom.xml`
- [X] T004 [P] Create the Angular app with SSR (`ng new frontend --ssr --routing --style=scss --strict`), register the `es-CO` locale and set `LOCALE_ID` to `es-CO` in `FE/app.config.ts`, and set `<html lang="es-CO">` in `frontend/src/index.html`
- [X] T005 [P] Configure ESLint (angular-eslint) and Prettier with npm scripts `lint`, `format`, `test` in `frontend/eslint.config.js`, `frontend/.prettierrc` and `frontend/package.json`
- [X] T006 [P] Create the backend dev `backend/docker-compose.yml` with service `db` (image `postgres:17`, named volume `pgdata`, env from `.env`, port 5432) and `backend/.env.example` listing `DB_URL`, `DB_USER`, `DB_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MEDIA_ROOT`, `PUBLIC_BASE_URL` (quickstart Configuration reference)
- [X] T007 [P] Create the Playwright project with `@axe-core/playwright`, `baseURL` from env `E2E_BASE_URL` (default `http://localhost:4200`) and a mobile project (Pixel 7 viewport) in `frontend/e2e/package.json` and `frontend/e2e/playwright.config.ts`
- [X] T008 Configure the dev proxy for `/api`, `/media`, `/sitemap.xml` → `http://localhost:8080` in `frontend/proxy.conf.json` and reference it from the `serve` target in `frontend/angular.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, shared kernel, security baseline and frontend plumbing that every story needs

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend configuration and schema

- [X] T009 Configure `backend/src/main/resources/application.yml`: datasource from `DB_URL`/`DB_USER`/`DB_PASSWORD`, Flyway enabled, `spring.servlet.multipart.max-file-size: 10MB` and `max-request-size: 11MB`, `spring.mvc.problemdetails.enabled: true`, custom properties `app.media-root` (`MEDIA_ROOT`) and `app.public-base-url` (`PUBLIC_BASE_URL`), and a typed `BE/shared/infrastructure/AppProperties.java` (`@ConfigurationProperties`)
- [X] T010 Create the Testcontainers integration-test base (PostgreSQL 17 container with `@ServiceConnection`, `@SpringBootTest` + `@AutoConfigureMockMvc`, a helper that truncates content tables between tests, a temp `app.media-root`, and an `OpenApiValidationFilter` from `swagger-request-validator-mockmvc` loaded with `specs/001-business-info-site/contracts/openapi.yaml` so every MockMvc request/response in endpoint ITs is validated against the contract — research R17) in `BT/support/IntegrationTest.java`; add the validator test dependency to `backend/pom.xml`
- [X] T011 Write the failing schema constraint test in `BT/support/SchemaConstraintsIT.java`: inserts must fail for a second `business_profile` row (`CHECK (id = 1)`), `whatsapp_number` not matching `'^[0-9]{10,15}$'`, `reference_price_cop` of 0 (`CHECK > 0`), duplicate `offering.slug` (UNIQUE), blank `offering.name` (non-blank CHECK), `display_order` 0 (`CHECK ≥ 1`), duplicate `lower(email)` in `admin_user`, the same `image_id` in two galleries (UNIQUE); and must succeed for a two-step position swap inside one transaction (deferrable `UNIQUE (owner_id, position)`)
- [X] T012 Create `backend/src/main/resources/db/migration/V1__schema.sql` with every table, column, type and constraint in data-model.md: `offering`, `success_case`, `success_case_offering`, `testimonial` (`photo_image_id` FK → image ON DELETE SET NULL, UNIQUE), `image` (`storage_key uuid NOT NULL UNIQUE`), `offering_image` and `success_case_image` (PK (owner_id, image_id), `image_id` UNIQUE, `UNIQUE (owner_id, position) DEFERRABLE INITIALLY DEFERRED`, FKs ON DELETE CASCADE), `business_profile` (`CHECK (id = 1)`, `whatsapp_number varchar(15) CHECK ~ '^[0-9]{10,15}$'`), `admin_user` (UNIQUE index on `lower(email)`); text length CHECKs: offering/success_case `description` ≤ 5000, `about_text` ≤ 8000; make T011 pass
- [X] T013 Create `backend/src/main/resources/db/migration/V2__seed.sql` with the business profile (name "Plisados Roldán", slogan "Creando ando, soñando alto", the owner's about text from the spec conversation, WhatsApp `573116254705`, location "Itagüí, Antioquia, Colombia", schedule "Lunes a viernes, 8:00 a. m. – 5:00 p. m.") and six published offerings in this order, without price or images: Plisado, Trillado, Craquelado, Corte láser, Grabado láser, Línea Plissee (summary and description in Spanish, slugs `plisado`, `trillado`, `craquelado`, `corte-laser`, `grabado-laser`, `linea-plissee`)

### Backend shared kernel (test first)

- [X] T014 [P] Write failing unit tests in `BT/shared/domain/SlugTest.java`: lower-cases, strips accents (`"Grabado láser"` → `grabado-laser`), replaces runs of non-alphanumerics with one `-`, trims leading/trailing `-`, truncates to 100 chars, and appends `-2`, `-3`… when a supplied "is taken" predicate returns true
- [X] T015 [P] Implement `BE/shared/domain/Slug.java` to make T014 pass
- [X] T016 [P] Write failing unit tests in `BT/shared/domain/ReorderTest.java`: given existing IDs and a requested ordered list, returns positions 1..n in the requested order; throws `ReorderMismatchException` when the list has missing, extra or duplicate IDs
- [X] T017 [P] Implement `BE/shared/domain/Reorder.java` and `BE/shared/domain/ReorderMismatchException.java` to make T016 pass
- [X] T018 [P] Write failing unit tests in `BT/media/domain/ImageTest.java`: for storage key K and original width 2000 the view exposes `url` `/media/K-960.jpg`, `srcset` `/media/K-480.jpg 480w, /media/K-960.jpg 960w, /media/K-1600.jpg 1600w`; for original width 700 the srcset descriptors use the real widths (`480w, 700w, 700w` collapsed to `480w, 700w`, never upscaled); `alt` falls back to the owner item name when `alt_text` is null
- [X] T019 [P] Implement `BE/media/domain/Image.java` (domain record) and `BE/media/api/ImageResponse.java` (DTO: id, url, srcset, width, height, alt) to make T018 pass
- [X] T020 Write a failing MockMvc test in `BT/shared/api/GlobalExceptionHandlerIT.java` using a test-only controller: `NotFoundException` → 404, Bean Validation failure → 400 `application/problem+json` with an `errors` map of field → message, `ReorderMismatchException` → 409, `MaxUploadSizeExceededException` → 413, `UnsupportedImageException` → 400, `GalleryFullException` → 409; responses never leak stack traces
- [X] T021 Implement `BE/shared/api/GlobalExceptionHandler.java` plus exceptions `BE/shared/domain/NotFoundException.java`, `BE/media/domain/UnsupportedImageException.java`, `BE/media/domain/GalleryFullException.java` to make T020 pass
- [X] T022 Write a failing test in `BT/auth/SecurityRulesIT.java`: unauthenticated `GET /api/public/**`, `/media/**`, `/sitemap.xml` are not blocked by security; any `/api/admin/**` request returns 401 with a Problem Details body
- [X] T023 Implement the baseline `BE/auth/infrastructure/SecurityConfig.java` (stateless rules for now: permit public paths, deny `/api/admin/**` with a JSON 401 entry point) to make T022 pass

### Frontend plumbing (test first)

- [X] T024 [P] Generate the TypeScript API types from `frontend/specs/001-business-info-site/contracts/openapi.yaml` with `openapi-typescript` into `FE/core/api/generated/openapi.ts` (generated code, TDD-exempt), re-export friendly aliases (Image, BusinessProfile, OfferingSummary, ...) in `FE/core/api/models.ts`, and add npm scripts `contract:generate` and `contract:check` (regenerate and fail on git diff; also fail when `../pisadosroldan-backend/specs/001-business-info-site/contracts/openapi.yaml` exists and differs from the local copy) in `frontend/package.json`, with `contract:check` run as part of `npm run lint`
- [X] T025 [P] Write a failing spec in `FE/core/http/api-base-url.interceptor.spec.ts`: on the server platform, relative `/api/...` and `/sitemap.xml` URLs are prefixed with the `API_INTERNAL_URL` injection token value; in the browser they are left unchanged
- [X] T026 [P] Implement `FE/core/http/api-base-url.interceptor.ts` and the `API_INTERNAL_URL` token (read from `process.env['API_INTERNAL_URL']` in `frontend/src/app/app.config.server.ts`) to make T025 pass
- [X] T027 Configure `FE/app.config.ts`: `provideHttpClient(withFetch(), withInterceptors([...]), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }))` and `provideClientHydration(withHttpTransferCacheOptions({ includePostRequests: false }))`
- [X] T028 Configure render modes in `FE/app.routes.server.ts`: `admin/**` → `RenderMode.Client`, everything else → `RenderMode.Server` (research R4)
- [X] T029 Add reverse-proxy middleware (http-proxy-middleware) for `/api`, `/media`, `/sitemap.xml` → `API_INTERNAL_URL` before the Angular handler in `frontend/src/server.ts` (research R5)
- [X] T030 [P] Create global design tokens and base styles (mobile-first breakpoints, brand palette with text/background pairs meeting WCAG AA 4.5:1, visible focus outline, `prefers-reduced-motion`) in `frontend/src/styles.scss`

**Checkpoint**: `./mvnw verify` and `npm run lint && npm test` pass; schema and seed load; frontend
proxies to the backend.

---

## Phase 3: User Story 1 - Prospective client learns what the business does and contacts it (Priority: P1) 🎯 MVP

**Goal**: Public Home, Nosotros, Servicios (list + detail), Contacto and 404, with WhatsApp
buttons carrying per-service messages, on seed content.

**Independent Test**: With seed data, on a phone viewport open `/`, open a service, tap
"Cotizar por WhatsApp" → `wa.me/573116254705` opens with "Hola, quiero cotizar el servicio de
{name}." in ≤ 3 taps (quickstart scenarios 1–2).

### Tests for User Story 1 ⚠️ (write first, see them fail)

- [X] T031 [P] [US1] Write the failing end-to-end customer flow from US1 acceptance scenarios 1–5 in `frontend/e2e/tests/customer-flow.spec.ts` (mobile project): home shows business name, slogan "Creando ando, soñando alto", six services and a WhatsApp button; open Plisado → name, description, placeholder image, no price; WhatsApp link href equals `https://wa.me/573116254705?text=` + encoded `Hola, quiero cotizar el servicio de Plisado.`; floating WhatsApp button visible after scrolling on every public route; unknown route shows the "Página no encontrada" page
- [X] T032 [P] [US1] Write failing integration tests in `BT/offering/api/PublicOfferingApiIT.java`: `GET /api/public/offerings` returns only published offerings ordered by `display_order` with `referencePriceCop` null when unset and `coverImage` = first gallery image by `position` (or null); `GET /api/public/offerings/{slug}` returns detail with ordered `images`; draft slug and unknown slug → 404 Problem Details
- [X] T033 [P] [US1] Write failing integration tests in `BT/profile/api/PublicProfileApiIT.java`: `GET /api/public/profile` returns the seeded profile fields (businessName, slogan, aboutText, whatsappNumber `573116254705`, locationText, scheduleText)
- [X] T034 [P] [US1] Write failing unit tests in `BT/profile/application/HomeQueryTest.java` (mocked ports): home view contains the profile, at most 6 published offerings in display order, and empty `featuredSuccessCases`/`featuredTestimonials` lists
- [X] T035 [P] [US1] Write failing integration test in `BT/profile/api/PublicHomeApiIT.java`: `GET /api/public/home` returns the HomeView shape from `contracts/openapi.yaml` with seed data
- [X] T036 [P] [US1] Write failing specs in `FE/core/whatsapp/whatsapp-link.builder.spec.ts`: builds `https://wa.me/{digits}?text={encodeURIComponent(msg)}` for the three templates in `contracts/ui-routes.md` verbatim — generic `Hola, Plisados Roldán. Quiero más información sobre sus servicios.`, offering `Hola, quiero cotizar el servicio de {name}.`, success case `Hola, vi el caso "{title}" y quiero algo similar.`
- [X] T037 [P] [US1] Write failing specs in `FE/shared/format/reference-price.pipe.spec.ts`: `120000` → `Desde $ 120.000 COP` (es-CO, no decimals; normalize non-breaking spaces in the assertion); `null`/`undefined` → empty string
- [X] T038 [P] [US1] Write failing specs in `FE/core/api/public-api.client.spec.ts` (HttpTestingController): `home()`, `profile()`, `offerings()`, `offering(slug)` call the public endpoints and map 404 to a `null` result
- [X] T039 [P] [US1] Write failing component specs in `FE/public/offerings/offering-detail.page.spec.ts`: renders price element only when `referencePriceCop` is set; WhatsApp button href uses the offering message; shows placeholder when `images` is empty; navigates to not-found when the client returns `null`

### Implementation for User Story 1 — backend

- [X] T040 [P] [US1] Create the `Offering` domain model (id, slug, name, summary, description, referencePriceCop, displayOrder, published, images) and the `OfferingRepository` port with `findPublishedOrdered()` and `findPublishedBySlug(slug)` in `BE/offering/domain/Offering.java` and `BE/offering/domain/OfferingRepository.java`
- [X] T041 [P] [US1] Implement the shared gallery read adapter (ordered images for an owner in `offering_image` or `success_case_image`, plus cover image lookup) in `BE/media/infrastructure/JdbcGalleryReader.java`
- [X] T042 [US1] Implement `BE/offering/infrastructure/JdbcOfferingRepository.java` (JdbcClient, explicit SQL, uses JdbcGalleryReader)
- [X] T043 [US1] Implement `BE/offering/application/OfferingQueries.java` and `BE/offering/api/PublicOfferingController.java` with DTOs `BE/offering/api/OfferingSummaryResponse.java` and `BE/offering/api/OfferingDetailResponse.java` to make T032 pass
- [X] T044 [P] [US1] Create the `BusinessProfile` domain model and `BusinessProfileRepository` port, and implement `BE/profile/infrastructure/JdbcBusinessProfileRepository.java` in `BE/profile/domain/BusinessProfile.java` and `BE/profile/domain/BusinessProfileRepository.java`
- [X] T045 [US1] Implement `BE/profile/application/ProfileQueries.java` and `BE/profile/api/PublicProfileController.java` with `BE/profile/api/BusinessProfileResponse.java` to make T033 pass
- [X] T046 [US1] Implement `BE/profile/application/HomeQuery.java` (cap of 6 offerings as a named constant) and `BE/profile/api/PublicHomeController.java` with `BE/profile/api/HomeResponse.java` to make T034 and T035 pass

### Implementation for User Story 1 — frontend

- [X] T047 [P] [US1] Implement `FE/core/whatsapp/whatsapp-link.builder.ts` to make T036 pass
- [X] T048 [P] [US1] Implement `FE/shared/format/reference-price.pipe.ts` to make T037 pass
- [X] T049 [P] [US1] Implement `FE/core/api/public-api.client.ts` to make T038 pass
- [X] T050 [P] [US1] Create presentational components `FE/shared/ui/responsive-image.component.ts` (srcset, sizes, width/height, `loading="lazy"` unless `priority` input → `fetchpriority="high"`), `FE/shared/ui/image-placeholder.component.ts` (neutral placeholder, item name as alt) and `FE/shared/ui/whatsapp-button.component.ts` (label input, `target="_blank" rel="noopener"`)
- [X] T051 [US1] Create the public layout with header navigation (Inicio, Nosotros, Servicios, Casos de éxito, Testimonios, Contacto), footer with WhatsApp/location/schedule from the profile, and a floating generic WhatsApp button in `FE/public/layout/public-layout.component.ts`
- [X] T052 [P] [US1] Create the home page (hero with business name, slogan, value statement, offering cards, generic WhatsApp CTA; first image `priority`) in `FE/public/home/home.page.ts`
- [X] T053 [P] [US1] Create the offerings list page (cards with cover image, name, summary, optional price) in `FE/public/offerings/offerings-list.page.ts`
- [X] T054 [US1] Implement the offering detail page (gallery, description, price via pipe, "Cotizar por WhatsApp") to make T039 pass in `FE/public/offerings/offering-detail.page.ts`
- [X] T055 [P] [US1] Create the about page (about text with line breaks, location) in `FE/public/about/about.page.ts` and the contact page (WhatsApp button, location, schedule) in `FE/public/contact/contact.page.ts`
- [X] T056 [P] [US1] Create the not-found page (message "Página no encontrada", links to `/servicios` and generic WhatsApp) in `FE/public/not-found/not-found.page.ts`
- [X] T057 [US1] Wire public routes `/`, `/nosotros`, `/servicios`, `/servicios/:slug`, `/contacto`, `**` under the public layout in `FE/app.routes.ts`; run T031 until it passes

**Checkpoint**: MVP — the public site works on seed content and every service leads to WhatsApp.

---

## Phase 4: User Story 2 - Owner manages services and business information (Priority: P1)

**Goal**: Authenticated admin area to create, edit, order, publish/unpublish, preview and delete
offerings with photo galleries, and edit the business profile.

**Independent Test**: Log in, create a service with photos and no price, publish → appears on
`/servicios`; unpublish → disappears publicly but stays in admin (quickstart scenarios 3–5, 7, 8).

### Tests for User Story 2 ⚠️ (write first, see them fail)

- [X] T058 [P] [US2] Write the failing end-to-end admin flow in `frontend/e2e/tests/admin-offerings.spec.ts`: `/admin/servicios` unauthenticated redirects to `/admin/login?returnUrl=...`; 5 wrong passwords then the 6th shows "Demasiados intentos, intenta en 15 minutos"; login; create "Plisado acordeón" with 3 photos, publish (it appears last on `/servicios`); unpublish (gone publicly, still in admin list); edit the WhatsApp number and about text in `/admin/perfil` and see them on `/nosotros` and in WhatsApp hrefs
- [X] T059 [P] [US2] Write failing unit tests in `BT/auth/application/LoginThrottleTest.java` (injected `Clock`): key = lower-cased email + client IP; after 5 consecutive failures `isBlocked` is true for 15 minutes and reports remaining seconds; success resets the counter; the block expires after 15 minutes
- [X] T060 [P] [US2] Write failing integration tests in `BT/auth/application/AdminSeederIT.java`: with an empty `admin_user` table and `ADMIN_EMAIL`/`ADMIN_PASSWORD` set, startup creates one admin with a BCrypt hash; when an admin exists, nothing changes; when the variables are missing and the table is empty, startup logs a warning and creates nothing
- [X] T061 [US2] Write failing integration tests in `BT/auth/api/AuthApiIT.java`: `POST /api/auth/login` valid → 204 + session cookie (HttpOnly, SameSite=Lax) and `last_login_at` updated; wrong password or unknown email → identical generic 401; 6th consecutive failure → 429 with `Retry-After`; `GET /api/auth/me` → 200 `{email}` when logged in, 401 otherwise, and issues the `XSRF-TOKEN` cookie; admin `POST/PUT/DELETE` without `X-XSRF-TOKEN` → 403; `POST /api/auth/logout` → 204 and the session no longer works
- [X] T062 [P] [US2] Write failing unit tests in `BT/offering/domain/OfferingTest.java`: `name` required, non-blank, ≤ 80 chars; `summary` required, ≤ 200; `description` required, ≤ 5000; `referencePriceCop` null or ≥ 1; new offering is a draft; `publish()`/`unpublish()` toggle state; renaming never changes the slug
- [X] T063 [P] [US2] Write failing unit tests in `BT/offering/application/OfferingCommandsTest.java` (mocked ports): create generates a unique slug via `Slug` (suffix `-2` on collision) and `display_order = max + 1`; update keeps the slug; delete removes the offering and its gallery images and requests file deletion after commit; reorder delegates to `Reorder` and rejects mismatches
- [X] T064 [US2] Write failing integration tests in `BT/offering/api/AdminOfferingApiIT.java` (authenticated with CSRF): list includes drafts in order; create → 201 + `Location`; invalid input → 400 with `errors` map; get/update/delete with 404 for unknown IDs; `PUT /{id}/publication`; `PUT /order` → 204, or 409 on ID mismatch; all endpoints 401 when unauthenticated
- [X] T065 [P] [US2] Write failing unit tests in `BT/media/infrastructure/ThumbnailatorImageProcessorTest.java` with fixtures in `backend/src/test/resources/images/` (sample.jpg 2000px, sample.png, sample.webp, small.jpg 700px, fake.jpg = PDF bytes): JPEG/PNG/WebP decode by content; fake.jpg → `UnsupportedImageException`; outputs JPEG variants for widths 480, 960, 1600 at quality 0.82 without upscaling; reports final width/height
- [X] T066 [P] [US2] Write failing unit tests in `BT/media/infrastructure/FileSystemImageStorageTest.java` (temp dir): writes `{key}-{width}.jpg`, deletes all variants of a key, ignores missing files on delete, rejects path traversal in keys
- [X] T067 [US2] Write failing integration tests in `BT/media/application/GalleryConsistencyIT.java`: adding an image inserts `image` + gallery rows and the files; when the transaction fails after files were written, no rows remain and the files are deleted; removing an image deletes rows in the transaction and files only after commit; a 13th image → `GalleryFullException` (limit 12)
- [X] T068 [US2] Write failing integration tests in `BT/offering/api/AdminOfferingImageApiIT.java`: `POST /{id}/images` multipart → 201 Image; file > 10 MB → 413; PDF renamed `.jpg` → 400 "Formato no soportado"; 13th → 409; `PUT /{id}/images/order`; `PATCH /{id}/images/{imageId}` alt text `maxLength 150`; `DELETE` → 204
- [X] T069 [P] [US2] Write failing integration tests in `BT/media/api/MediaControllerIT.java`: `GET /media/{uuid}-960.jpg` → 200 `image/jpeg` with `Cache-Control: public, max-age=31536000, immutable`; names not matching `^[0-9a-f-]{36}-(480|960|1600)\.jpg$` → 404; missing file → 404
- [X] T070 [P] [US2] Write failing unit tests in `BT/profile/domain/BusinessProfileTest.java`: `businessName` required ≤ 80, `slogan` ≤ 120, `aboutText` ≤ 8000, `whatsappNumber` matches `^[0-9]{10,15}$`, `locationText` ≤ 200, `scheduleText` ≤ 300
- [X] T071 [US2] Write failing integration tests in `BT/profile/api/AdminProfileApiIT.java`: `GET`/`PUT /api/admin/profile`; invalid WhatsApp number → 400 with `errors.whatsappNumber`; the update is visible on `GET /api/public/profile`
- [X] T072 [P] [US2] Write failing specs in `FE/core/auth/auth.service.spec.ts` (login, logout, `me()` caching, 429 → throttled state with the Spanish message) and `FE/core/auth/admin.guard.spec.ts` (redirects to `/admin/login` with `returnUrl` when `me()` fails)
- [X] T073 [P] [US2] Write failing specs in `FE/core/auth/session-expired.interceptor.spec.ts`: a 401 from `/api/admin/**` (not from `/api/auth/login`) opens the login dialog and retries the original request once after successful login; cancelling the dialog surfaces the error without clearing the form
- [X] T074 [P] [US2] Write failing specs in `FE/core/api/admin-api.client.spec.ts` for offerings CRUD, publication, order, image upload (multipart with `altText`), image order/alt/delete, and profile get/put
- [X] T075 [P] [US2] Write failing component specs in `FE/admin/offerings/offering-form.component.spec.ts`: required and max-length messages (name 80, summary 200, description 5000); price optional, integer ≥ 1; publishing with zero images opens a warning dialog first
- [X] T076 [P] [US2] Write failing component specs in `FE/admin/media/gallery-manager.component.spec.ts`: rejects files > 10 MB client-side with "El archivo supera 10 MB" and non-JPEG/PNG/WebP with "Formato no soportado"; up/down buttons send the full new ID order; alt text edit calls PATCH; delete asks for confirmation
- [X] T077 [P] [US2] Write failing component specs in `FE/admin/offerings/offerings-list.page.spec.ts`: delete opens a confirm dialog naming the item and calls DELETE only on confirm; publish toggle calls the publication endpoint; reorder buttons send the full ID list

### Implementation for User Story 2 — backend

- [X] T078 [P] [US2] Implement `BE/auth/domain/AdminUser.java`, `BE/auth/domain/AdminUserRepository.java` and `BE/auth/infrastructure/JdbcAdminUserRepository.java`
- [X] T079 [P] [US2] Implement `BE/auth/application/LoginThrottle.java` to make T059 pass
- [X] T080 [US2] Implement `BE/auth/application/AdminSeeder.java` (ApplicationRunner, BCrypt) to make T060 pass
- [X] T081 [US2] Extend `BE/auth/infrastructure/SecurityConfig.java` (session-based auth, `CookieCsrfTokenRepository.withHttpOnlyFalse()` with a request handler that loads the token on every request per research R6, JSON 401/403 handlers) and implement `BE/auth/infrastructure/AdminUserDetailsService.java` and `BE/auth/api/AuthController.java` (`/api/auth/login`, `/logout`, `/me`) to make T061 pass; update T022 expectations only if behavior intentionally changed
- [X] T082 [US2] Extend `BE/offering/domain/Offering.java` with validation and publication behavior to make T062 pass
- [X] T083 [US2] Add write methods (insert, update, delete, `maxDisplayOrder`, `slugExists`, `updatePositions`) to `BE/offering/domain/OfferingRepository.java` and `BE/offering/infrastructure/JdbcOfferingRepository.java`
- [X] T084 [US2] Implement `BE/offering/application/OfferingCommands.java` (`@Transactional` methods) to make T063 pass
- [X] T085 [US2] Implement `BE/offering/api/AdminOfferingController.java` with `BE/offering/api/OfferingInputRequest.java` (Bean Validation matching data-model limits) and `BE/offering/api/AdminOfferingResponse.java` to make T064 pass
- [X] T086 [P] [US2] Implement the `ImageProcessor` port and `BE/media/infrastructure/ThumbnailatorImageProcessor.java` to make T065 pass (port in `BE/media/domain/ImageProcessor.java`)
- [X] T087 [P] [US2] Implement the `ImageStorage` port and `BE/media/infrastructure/FileSystemImageStorage.java` to make T066 pass (port in `BE/media/domain/ImageStorage.java`)
- [X] T088 [US2] Implement `BE/media/application/GalleryService.java` (owner type OFFERING or SUCCESS_CASE mapped to its gallery table; files written before the transaction; `TransactionSynchronization` deletes files on rollback and after commit on removal; limit 12 as a named constant) and `BE/media/infrastructure/JdbcGalleryRepository.java` to make T067 pass
- [X] T089 [US2] Implement `BE/offering/api/AdminOfferingImageController.java` (delegates to GalleryService) to make T068 pass
- [X] T090 [US2] Implement `BE/media/api/MediaController.java` serving files from `app.media-root` to make T069 pass
- [X] T091 [US2] Add validation to `BE/profile/domain/BusinessProfile.java` and implement `BE/profile/application/ProfileCommands.java` and `BE/profile/api/AdminProfileController.java` with `BE/profile/api/BusinessProfileRequest.java` to make T070 and T071 pass

### Implementation for User Story 2 — frontend

- [X] T092 [P] [US2] Implement `FE/core/auth/auth.service.ts` and `FE/core/auth/admin.guard.ts` to make T072 pass
- [X] T093 [US2] Implement `FE/core/auth/session-expired.interceptor.ts` and the login dialog `FE/admin/login/login-dialog.component.ts` to make T073 pass
- [X] T094 [P] [US2] Implement `FE/core/api/admin-api.client.ts` to make T074 pass
- [X] T095 [P] [US2] Create the shared confirm dialog `FE/shared/ui/confirm-dialog.component.ts` (accessible: focus trap, Escape closes, names the item)
- [X] T096 [US2] Create the login page (email, password, generic error, throttled message, redirects to `returnUrl`) in `FE/admin/login/login.page.ts` and the admin layout + dashboard (links and counts) in `FE/admin/layout/admin-layout.component.ts` and `FE/admin/dashboard/dashboard.page.ts`
- [X] T097 [US2] Implement `FE/admin/offerings/offering-form.component.ts` to make T075 pass
- [X] T098 [US2] Implement `FE/admin/media/gallery-manager.component.ts` to make T076 pass
- [X] T099 [US2] Implement `FE/admin/offerings/offerings-list.page.ts` and `FE/admin/offerings/offering-edit.page.ts` (create + edit + gallery) to make T077 pass
- [X] T100 [P] [US2] Create the profile form page in `FE/admin/profile/profile.page.ts` (fields and limits from data-model `business_profile`)
- [X] T101 [US2] Create the offering draft preview page reusing the public offering detail view with data from `GET /api/admin/offerings/{id}` in `FE/admin/preview/offering-preview.page.ts`
- [X] T102 [US2] Wire admin routes `/admin/login`, `/admin`, `/admin/servicios`, `/admin/servicios/nuevo`, `/admin/servicios/:id`, `/admin/perfil`, `/admin/vista-previa/servicios/:id` with `adminGuard` and a `noindex` robots meta in `FE/admin/admin.routes.ts` and `FE/app.routes.ts`; run T058 until it passes

**Checkpoint**: The owner manages offerings, photos and profile without a developer; US1 still passes.

---

## Phase 5: User Story 3 - Visitor builds trust through success cases and testimonials (Priority: P2)

**Goal**: Public success cases (list + detail) and testimonials, featured items on the home page,
sections hidden when empty.

**Independent Test**: With success cases and testimonials inserted as test fixtures, published
items appear in order with photos; featured ones appear on `/`; with none, the sections and nav
links are hidden.

### Tests for User Story 3 ⚠️ (write first, see them fail)

- [X] T103 [P] [US3] Write failing integration tests in `BT/successcase/api/PublicSuccessCaseApiIT.java` (SQL fixtures): list returns only published cases in order with `coverImage`; detail returns ordered `images` and `relatedOfferings` containing only published offerings; draft or unknown slug → 404
- [X] T104 [P] [US3] Write failing integration tests in `BT/testimonial/api/PublicTestimonialApiIT.java`: only published testimonials in order; `company` and `photo` nullable
- [X] T105 [US3] Extend `BT/profile/application/HomeQueryTest.java` and `BT/profile/api/PublicHomeApiIT.java` (failing): `featuredSuccessCases` and `featuredTestimonials` contain only items that are both featured and published, in display order
- [X] T106 [P] [US3] Write failing specs in `FE/public/layout/public-navigation.spec.ts`: nav links "Casos de éxito" and "Testimonios" are hidden when the corresponding lists are empty, and home sections are not rendered when empty
- [X] T107 [P] [US3] Write failing component specs in `FE/public/success-cases/success-case-detail.page.spec.ts`: shows title, client name, optional event label/date, gallery, related offering links, and a WhatsApp button with `Hola, vi el caso "{title}" y quiero algo similar.`

### Implementation for User Story 3

- [X] T108 [P] [US3] Create the `SuccessCase` domain model and `SuccessCaseRepository` port (`findPublishedOrdered`, `findPublishedBySlug`, `findFeaturedPublished`) in `BE/successcase/domain/SuccessCase.java` and `BE/successcase/domain/SuccessCaseRepository.java`, and implement `BE/successcase/infrastructure/JdbcSuccessCaseRepository.java` (reuses JdbcGalleryReader)
- [X] T109 [P] [US3] Create the `Testimonial` domain model and `TestimonialRepository` port (`findPublishedOrdered`, `findFeaturedPublished`) in `BE/testimonial/domain/Testimonial.java` and `BE/testimonial/domain/TestimonialRepository.java`, and implement `BE/testimonial/infrastructure/JdbcTestimonialRepository.java`
- [X] T110 [US3] Implement `BE/successcase/application/SuccessCaseQueries.java` and `BE/successcase/api/PublicSuccessCaseController.java` with summary/detail DTOs in `BE/successcase/api/` to make T103 pass
- [X] T111 [US3] Implement `BE/testimonial/application/TestimonialQueries.java` and `BE/testimonial/api/PublicTestimonialController.java` with `BE/testimonial/api/TestimonialResponse.java` to make T104 pass
- [X] T112 [US3] Extend `BE/profile/application/HomeQuery.java` to include featured published cases and testimonials to make T105 pass
- [X] T113 [US3] Add `successCases()`, `successCase(slug)`, `testimonials()` to `FE/core/api/public-api.client.ts` (with spec cases added to `FE/core/api/public-api.client.spec.ts` first)
- [X] T114 [US3] Update `FE/public/layout/public-layout.component.ts` and `FE/public/home/home.page.ts` (featured cases and testimonials sections) to make T106 pass
- [X] T115 [P] [US3] Create the success cases list page in `FE/public/success-cases/success-cases-list.page.ts`
- [X] T116 [US3] Implement the success case detail page to make T107 pass in `FE/public/success-cases/success-case-detail.page.ts`
- [X] T117 [P] [US3] Create the testimonial card in `FE/shared/ui/testimonial-card.component.ts` and the testimonials page in `FE/public/testimonials/testimonials.page.ts`
- [X] T118 [US3] Wire routes `/casos-de-exito`, `/casos-de-exito/:slug`, `/testimonios` in `FE/app.routes.ts`

**Checkpoint**: Social proof renders from data; US1 and US2 still pass.

---

## Phase 6: User Story 4 - Owner manages success cases and testimonials (Priority: P2)

**Goal**: Admin CRUD, ordering, featuring, publication, galleries (cases) and single photo
(testimonials), with confirmed deletes.

**Independent Test**: Create a testimonial, feature and publish it → it appears on `/`; delete it
with confirmation → it disappears everywhere (quickstart scenario 6).

### Tests for User Story 4 ⚠️ (write first, see them fail)

- [X] T119 [P] [US4] Write the failing end-to-end flow in `frontend/e2e/tests/social-proof.spec.ts`: with no cases/testimonials the sections and nav links are hidden; create a featured, published success case with 2 photos and a featured, published testimonial → both on `/`; the case detail WhatsApp href uses the case message; delete the testimonial via the confirm dialog → gone from `/` and `/testimonios`
- [X] T120 [P] [US4] Write failing unit tests in `BT/successcase/domain/SuccessCaseTest.java`: `title` required, non-blank, ≤ 120; `clientName` required, ≤ 120; `description` required, ≤ 5000; `eventLabel` ≤ 120 nullable; `eventDate` nullable; new case is an unfeatured draft; slug immutable on rename
- [X] T121 [P] [US4] Write failing unit tests in `BT/successcase/application/SuccessCaseCommandsTest.java`: create generates slug and order; `offeringIds` that do not exist → validation error; update replaces related offerings; delete removes gallery images (files after commit); reorder via `Reorder`
- [X] T122 [US4] Write failing integration tests in `BT/successcase/api/AdminSuccessCaseApiIT.java` and `BT/successcase/api/AdminSuccessCaseImageApiIT.java`: CRUD, publication, featured, order (409 on mismatch), image upload/order/alt/delete reusing the 10 MB / format / 12-image rules, 401 unauthenticated
- [X] T123 [P] [US4] Write failing unit tests in `BT/testimonial/domain/TestimonialTest.java`: `clientName` required ≤ 120; `company` ≤ 120 nullable; `quote` required, non-blank, ≤ 600; new testimonial is an unfeatured draft
- [X] T124 [P] [US4] Write failing unit tests in `BT/testimonial/application/TestimonialCommandsTest.java`: setting a photo when one exists replaces it and deletes the old image row in the transaction and its files after commit; deleting a testimonial deletes its photo
- [X] T125 [US4] Write failing integration tests in `BT/testimonial/api/AdminTestimonialApiIT.java`: CRUD, publication, featured, order, `PUT /{id}/photo` (multipart, same upload rules) and `DELETE /{id}/photo`, 401 unauthenticated
- [X] T126 [P] [US4] Write failing specs for the new admin client methods in `FE/core/api/admin-api.client.spec.ts` (success cases incl. images, testimonials incl. photo)
- [X] T127 [P] [US4] Write failing component specs in `FE/admin/success-cases/success-case-form.component.spec.ts` (limits title 120, client 120, description 5000, event label 120; featured toggle; related offerings multi-select) and `FE/admin/testimonials/testimonial-form.component.spec.ts` (limits client 120, company 120, quote 600; single photo upload/replace/remove; featured toggle)

### Implementation for User Story 4

- [X] T128 [US4] Add validation, featuring and publication to `BE/successcase/domain/SuccessCase.java` and write methods (insert, update, delete, related offerings, order) to `BE/successcase/domain/SuccessCaseRepository.java` and `BE/successcase/infrastructure/JdbcSuccessCaseRepository.java` to make T120 pass
- [X] T129 [US4] Implement `BE/successcase/application/SuccessCaseCommands.java` to make T121 pass
- [X] T130 [US4] Implement `BE/successcase/api/AdminSuccessCaseController.java`, `BE/successcase/api/AdminSuccessCaseImageController.java` (GalleryService with owner SUCCESS_CASE), `BE/successcase/api/SuccessCaseInputRequest.java` and `BE/successcase/api/AdminSuccessCaseResponse.java` to make T122 pass
- [X] T131 [US4] Add validation, featuring and publication to `BE/testimonial/domain/Testimonial.java` and write methods to `BE/testimonial/domain/TestimonialRepository.java` and `BE/testimonial/infrastructure/JdbcTestimonialRepository.java` to make T123 pass
- [X] T132 [US4] Implement `BE/testimonial/application/TestimonialCommands.java` (photo via ImageProcessor/ImageStorage with the same commit/rollback file rules as GalleryService) to make T124 pass
- [X] T133 [US4] Implement `BE/testimonial/api/AdminTestimonialController.java`, `BE/testimonial/api/TestimonialInputRequest.java` and `BE/testimonial/api/AdminTestimonialResponse.java` to make T125 pass
- [X] T134 [US4] Add success case and testimonial methods to `FE/core/api/admin-api.client.ts` to make T126 pass
- [X] T135 [US4] Implement `FE/admin/success-cases/success-case-form.component.ts`, `FE/admin/success-cases/success-cases-list.page.ts` and `FE/admin/success-cases/success-case-edit.page.ts` (reusing gallery-manager and confirm dialog) to make the success case part of T127 pass
- [X] T136 [US4] Implement `FE/admin/testimonials/testimonial-form.component.ts`, `FE/admin/testimonials/testimonials-list.page.ts` and `FE/admin/testimonials/testimonial-edit.page.ts` to make the testimonial part of T127 pass
- [X] T137 [US4] Create the success case draft preview in `FE/admin/preview/success-case-preview.page.ts` and wire `/admin/casos`, `/admin/casos/nuevo`, `/admin/casos/:id`, `/admin/testimonios`, `/admin/testimonios/nuevo`, `/admin/testimonios/:id`, `/admin/vista-previa/casos/:id` in `FE/admin/admin.routes.ts`; run T119 until it passes

**Checkpoint**: All content is owner-managed; US1–US3 still pass.

---

## Phase 7: User Story 5 - The business can be found through search engines (Priority: P3)

**Goal**: Per-page title, description, canonical and Open Graph tags in server-rendered HTML,
sitemap, robots, real HTTP 404s.

**Independent Test**: `curl` a public page without running scripts → content, title, meta
description and `og:image` present; sitemap lists every published page; drafts/unknown → 404
(quickstart scenario 9).

### Tests for User Story 5 ⚠️ (write first, see them fail)

- [X] T138 [P] [US5] Write the failing end-to-end SEO test in `frontend/e2e/tests/seo.spec.ts` using Playwright's `request` API (no JavaScript): every public route returns HTML containing its main text, the `<title>` and meta description from `contracts/ui-routes.md`, canonical URL and `og:title`/`og:description`/`og:image`/`og:url`; `/servicios/no-existe` returns HTTP 404; `/sitemap.xml` lists each published page; `/robots.txt` disallows `/admin`
- [X] T139 [P] [US5] Write failing integration tests in `BT/seo/api/SitemapIT.java`: `GET /sitemap.xml` returns `application/xml` with absolute URLs built from `app.public-base-url` for `/`, `/nosotros`, `/servicios`, `/contacto`, every published offering and success case, plus `/casos-de-exito` and `/testimonios` only when they have published items; drafts excluded
- [X] T140 [P] [US5] Write failing specs in `FE/core/seo/seo.service.spec.ts`: sets `<title>`, meta description (truncated to 155 chars on a word boundary), canonical link, `og:*` tags with the 1600 variant or `/og-default.jpg`, and `robots` `noindex` for admin; replaces rather than duplicates tags on navigation
- [X] T141 [P] [US5] Write failing specs in `FE/public/not-found/not-found.page.spec.ts`: on the server platform, sets the response status to 404 via `RESPONSE_INIT`

### Implementation for User Story 5

- [X] T142 [US5] Implement `BE/seo/application/SitemapQuery.java` and `BE/seo/api/SitemapController.java` to make T139 pass
- [X] T143 [US5] Implement `FE/core/seo/seo.service.ts` to make T140 pass and call it from every public page (home, about, offerings list/detail, success cases list/detail, testimonials, contact) with the titles/descriptions in `contracts/ui-routes.md`
- [X] T144 [US5] Set the 404 status in `FE/public/not-found/not-found.page.ts` to make T141 pass, and route unknown/unpublished slugs on detail pages to it
- [X] T145 [P] [US5] Add `frontend/public/robots.txt` (disallow `/admin`, `Sitemap:` line) and the default Open Graph image `frontend/public/og-default.jpg` (1200×630)
- [X] T146 [US5] Run T138 until it passes

**Checkpoint**: Every public page is indexable and shareable with previews.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Full demo stack, accessibility and performance verification, documentation

- [X] T147 [P] Create multi-stage `backend/Dockerfile` (build with mvnw, run on a JRE 21 image as a non-root user)
- [X] T148 [P] Create multi-stage `frontend/Dockerfile` (build SSR bundle, run `node dist/frontend/server/server.mjs` on port 4000)
- [X] T149 Create the full demo stack in `frontend/docker-compose.yml`: `db` (`postgres:17`, volume `pgdata`), `backend` (build context `../pisadosroldan-backend`, env from `.env`, `MEDIA_ROOT` on named volume `media`, depends on healthy `db`) and `web` (build `.`, `API_INTERNAL_URL=http://backend:8080`, only published port 4000), with `frontend/.env.example` listing all variables; verify `docker compose up --build` in the frontend repo serves the site at `http://localhost:4000`
- [X] T150 [P] Write the accessibility suite in `frontend/e2e/tests/a11y.spec.ts`: axe on every public route with zero critical/serious violations (WCAG 2.1 AA tags) and keyboard-only navigation from `/` to the WhatsApp button; fix any violations found in the affected components
- [X] T151 Run Lighthouse (mobile profile) against the demo stack on `/` and `/servicios/plisado`, record LCP and accessibility scores in `frontend/specs/001-business-info-site/validation-report.md`, and fix regressions until LCP ≤ 2.5 s (SC-003)
- [X] T152 [P] Write `backend/README.md` and `frontend/README.md`: what each repo is, that the sibling repo is expected next to it, prerequisites (JDK 21 / Node 24, Docker), how to run dev and demo stacks, the contract-sync rule (change `openapi.yaml` in both repos in the same session; run `contract:check`), and a link to `specs/001-business-info-site/quickstart.md`
- [X] T153 Execute quickstart.md manual scenarios 1–12 and record results (pass/fail, notes) in `frontend/specs/001-business-info-site/validation-report.md`
- [X] T154 Review the codebase against constitution Principles VI and VII (layer dependencies, no entities in API, transactions in application services, tests-first evidence in history) and record findings or fixes in `frontend/specs/001-business-info-site/validation-report.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup; **blocks all user stories**
- **US1 (Phase 3)**: depends on Foundational
- **US2 (Phase 4)**: depends on Foundational; its E2E (T058) and preview (T101) reuse US1 public pages, so do US1 first
- **US3 (Phase 5)**: depends on Foundational; reuses US1 layout and `JdbcGalleryReader` (T041)
- **US4 (Phase 6)**: depends on US2 (auth, GalleryService, gallery manager, confirm dialog) and US3 (domain models, public pages for the E2E)
- **US5 (Phase 7)**: depends on US1; full coverage of cases/testimonials pages needs US3
- **Polish (Phase 8)**: depends on all desired stories

### Story completion order

```text
Setup → Foundational → US1 (MVP) → US2 → US3 → US4 → US5 → Polish
                          └──────────────→ US3 (can run alongside US2)
```

### Within each story

- Test task → run it, see it fail → implementation task that makes it pass (Constitution VII)
- Domain → infrastructure → application → API (backend); client/service → components → routes (frontend)
- The story's E2E is written first and is the last thing to turn green

### Parallel Opportunities

- Setup: T004, T005, T006, T007 in parallel after T002/T003 start
- Foundational: T014–T019 (slug, reorder, image view) in parallel; T024–T026 and T030 in parallel with backend work
- US1: all test tasks T031–T039 in parallel; backend (T040–T046) and frontend (T047–T057) tracks in parallel
- US2: test tasks marked [P] in parallel; media (T086–T090) in parallel with auth (T078–T081) and offerings (T082–T085)
- US3 can run in parallel with US2 once US1 is done (different packages and pages)

---

## Parallel Example: User Story 1

```text
# Tests first, in parallel:
Task: "T032 PublicOfferingApiIT in backend/src/test/java/co/plisadosroldan/offering/api/PublicOfferingApiIT.java"
Task: "T033 PublicProfileApiIT in backend/src/test/java/co/plisadosroldan/profile/api/PublicProfileApiIT.java"
Task: "T036 WhatsApp link builder spec in frontend/src/app/core/whatsapp/whatsapp-link.builder.spec.ts"
Task: "T037 Reference price pipe spec in frontend/src/app/shared/format/reference-price.pipe.spec.ts"

# Then implementations in parallel tracks:
Task: "T040 Offering domain + port"            # backend track
Task: "T047 WhatsAppLinkBuilder"               # frontend track
Task: "T050 responsive-image / placeholder / whatsapp-button components"
```

## Parallel Example: User Story 2

```text
Task: "T059 LoginThrottleTest"
Task: "T062 OfferingTest"
Task: "T065 ThumbnailatorImageProcessorTest"
Task: "T066 FileSystemImageStorageTest"
Task: "T072 auth.service + admin.guard specs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 US1 → **stop and validate**: quickstart scenarios 1–2 on seed content
3. Demo: the public site with WhatsApp contact already delivers the core value

### Incremental Delivery

1. Foundation → US1 (MVP demo)
2. + US2 → the owner edits content (demo: create and publish a service)
3. + US3 + US4 → social proof (demo: featured case and testimonial on home)
4. + US5 → findability (demo: curl HTML, sitemap)
5. Polish → `docker compose up --build`, accessibility, Lighthouse, quickstart run

---

## Notes

- [P] = different files and no dependency on an incomplete task
- Every implementation task names the test task it must turn green
- Commit after each Red→Green→Refactor cycle; a test and the code it drives land together
- Stop at any checkpoint to validate a story independently
