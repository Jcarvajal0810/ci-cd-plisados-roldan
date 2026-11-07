<!--
Sync Impact Report
- Version change: 1.1.0 → 1.2.0 (MINOR: new principle added)
- Modified principles: none
- Added principles:
  VII. Test-Driven Development
- Modified sections: Development Workflow & Quality Gates (test bullets aligned with VII;
  TDD review gate added)
- Removed sections: none
- Templates: not modified (scope guard: they read this file at runtime)
- Deferred TODOs: none
-->

# Plisados Roldán Web Constitution

## Core Principles

### I. Spec Before Code

No application code is written until a feature has an approved specification (`/speckit-specify`)
and an implementation plan (`/speckit-plan`). Open questions MUST be resolved or explicitly marked
`NEEDS CLARIFICATION` before planning starts. Code that implements behavior absent from the spec
MUST NOT be merged.

Rationale: the product owner is a small business; rework is the most expensive failure mode.

### II. Fixed, Boring Stack

- Backend: Java (current LTS) with Spring Boot, exposing a REST/JSON API.
- Database: PostgreSQL, with every schema change made through versioned migrations (Flyway).
- Frontend: Angular with TypeScript in strict mode.
- Adding any new runtime component (message broker, cache server, search engine, extra database,
  extra service) MUST be justified in the plan's Complexity Tracking table with the simpler
  alternative that was rejected and why.

Rationale: one team, one stack, nothing to babysit at 2 a.m.

### III. Pragmatic Simplicity

- The system MUST be a single deployable backend (modular monolith) plus a single Angular app.
  Microservices are prohibited unless an amendment approves them.
- Features MUST be built for requirements stated in the spec, not for hypothetical future ones
  (YAGNI). Abstractions need at least two real call sites.
- Equally, essentials MUST NOT be skipped to look simple: input validation, error handling,
  backups, and basic monitoring are part of "done".

Rationale: avoid both over-engineering and the toy that collapses in production. Principle VI
defines the code-level rules (KISS, DRY, YAGNI and the rest) that apply this principle.

### IV. Owner-Controlled Content

- Business content (services, catalog, prices if shown, photos, contact data) MUST live in the
  application's own database and be editable by the business owner through an admin interface,
  without a developer.
- Instagram is a reference and a promotion channel, not a data source. Integration MUST use only
  official, permitted mechanisms (links, official embeds, or the Meta Graph API for an account the
  business owns). Scraping Instagram is prohibited.
- The primary customer conversion path is contact via WhatsApp; it MUST be reachable from every
  public page.

Rationale: scraping breaks Meta's terms and breaks silently; the owner must own her content.

### V. Mobile-First, Fast, Findable

- Public pages MUST be designed for mobile first; most visitors arrive from Instagram or WhatsApp
  on a phone.
- Public pages MUST be indexable by search engines (real titles, meta descriptions, and content
  that crawlers can render).
- Performance target for public pages on a mid-range phone over 4G: Largest Contentful Paint
  ≤ 2.5 s. Images MUST be resized and compressed on upload or delivery.
- Public UI MUST meet WCAG 2.1 AA for contrast, keyboard use, and image alt text.
- Spanish (Colombia) is the default language for all user-facing text.

Rationale: a business site nobody can find or load is a cost, not an asset.

### VI. Engineering Quality

All code, backend and frontend, MUST follow these principles. When two of them conflict, the
simpler option wins (KISS) and the trade-off is noted in the plan or the pull request.

- **ACID (database)**: Every business operation that writes more than one row or table MUST run
  in a single database transaction, opened at the application-service layer, never in
  controllers or the UI. Data integrity MUST be enforced in the database itself (primary and
  foreign keys, NOT NULL, UNIQUE and CHECK constraints), not only in application code.
  Operations that touch the database and the file system (e.g., image upload) MUST NOT leave
  orphaned rows or files when one step fails.
- **Clean Architecture**: Code MUST be organized by feature, with layers inside each feature:
  web/API → application (use cases) → domain → infrastructure (persistence, storage).
  Dependencies point inward: domain code MUST NOT depend on web or persistence frameworks, and
  controllers MUST NOT call repositories directly. API responses MUST use dedicated DTOs, never
  persistence entities. In the frontend, components handle presentation and delegate HTTP and
  state logic to services.
- **Clean Code**: Names MUST reveal intent (domain terms such as `Service`, `SuccessCase` and
  `Testimonial`, used consistently). Functions do one thing; no dead code, commented-out code or
  unexplained magic values. Formatting and linting are automated and MUST pass in the build.
- **SOLID**: Each class has one reason to change. Dependencies are injected through
  constructors. Interfaces are introduced at architectural boundaries (e.g., image storage,
  repositories) or when a second implementation exists, not one per class by default.
- **KISS**: Prefer the most direct solution that meets the spec. Clever code, unnecessary
  patterns and premature optimization MUST be rejected in review.
- **DRY**: Each piece of knowledge (business rule, validation, constant) has one source of
  truth. Duplicated logic MUST be extracted once it appears a third time (rule of three);
  similar-looking code that changes for different reasons MUST NOT be merged.
- **YAGNI**: No code, configuration or abstraction for requirements that are not in the
  current spec.

Rationale: these rules keep a small codebase readable, safe to change, and free of the
corruption bugs that partial writes cause.

### VII. Test-Driven Development

All new production code MUST be written test-first, following Red → Green → Refactor:

1. **Red**: write a test that describes one behavior from the spec and run it to see it fail
   for the expected reason.
2. **Green**: write the minimum production code that makes it pass.
3. **Refactor**: clean up code and tests (Principle VI) with all tests passing.

- Scope: backend domain and application logic (unit tests), every REST endpoint (integration
  test written before the controller), and frontend services and components that contain
  logic (unit tests). The main customer flow's end-to-end test is written from the spec's
  acceptance scenarios before the flow is wired together.
- Every bug fix MUST start with a failing test that reproduces the bug.
- Test-first is not required for code with no logic of its own: configuration, database
  migrations (covered by the integration tests that use them), purely presentational
  templates and styles, and generated code.
- Tests MUST check behavior through public interfaces, not private implementation details,
  so refactoring does not break them.
- `tasks.md` MUST list each test task before the implementation task it drives, and a test
  and the code it drives MUST land in the same change.

Rationale: tests written first are executable specifications; tests written after tend to
confirm whatever the code already does.

## Security & Data Protection

- Admin features MUST require authentication; public pages MUST NOT expose any write endpoint
  without it. Passwords MUST be stored with a modern adaptive hash (e.g., bcrypt).
- Secrets (database credentials, API tokens) MUST come from environment configuration and MUST
  NOT be committed to the repository.
- All traffic MUST use HTTPS.
- Any personal data collected from customers (e.g., contact or quote forms) MUST comply with
  Colombian personal data law (Ley 1581 de 2012): explicit consent, a published privacy notice,
  and collection limited to what the feature needs.
- The database MUST have automated backups with a tested restore procedure.

## Development Workflow & Quality Gates

- Every feature follows: specify → (clarify) → plan → tasks → implement.
- Tests are written first, as defined in Principle VII.
- Backend business logic MUST have unit tests; every REST endpoint MUST have at least one
  integration test against a real PostgreSQL instance (e.g., Testcontainers).
- Frontend components that hold logic MUST have unit tests; the main customer flow
  (view business info → contact via WhatsApp) MUST have one end-to-end test.
- Every review MUST confirm that new logic arrives with its tests and that `tasks.md` ordered
  each test before its implementation.
- A change is mergeable only when the build, tests, and linters pass.
- Every review MUST check the change against Principle VI (Engineering Quality); violations are
  fixed before merge or justified in Complexity Tracking.
- API contracts are defined in the plan before implementation; breaking changes to a contract
  MUST be called out in the plan.

## Governance

- This constitution overrides conflicting practices, templates, and habits in this repository.
- Amendments are made through `/speckit-constitution`, must state their rationale, and must
  update the version and the Last Amended date.
- Versioning: MAJOR for removing or redefining a principle; MINOR for adding a principle or
  section or materially expanding guidance; PATCH for clarifications and wording.
- Every plan MUST include a Constitution Check; any violation MUST be recorded in Complexity
  Tracking with its justification, or the plan is rejected.

**Version**: 1.2.0 | **Ratified**: 2026-11-07 | **Last Amended**: 2026-11-07
