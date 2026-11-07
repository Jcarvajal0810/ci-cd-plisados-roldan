# Data Model: Plisados Roldán Informational Website

**Feature**: `001-business-info-site` | **Date**: 2026-11-07 | **Plan**: [plan.md](./plan.md)

Database: PostgreSQL. All schema changes through Flyway migrations. Integrity is enforced in the
database (Constitution VI): every rule marked **[DB]** is a constraint, not only app validation.
Rules marked **[App]** are validated in the application layer (and the web DTO where noted).

Common columns on content tables: `created_at timestamptz NOT NULL DEFAULT now()`,
`updated_at timestamptz NOT NULL DEFAULT now()` (set by the application on update).

## Entity overview

```text
business_profile (1 row)

offering ──< offering_image >── image
   │
   └──< success_case_offering >── success_case ──< success_case_image >── image

testimonial ──(0..1)── image   (photo)

admin_user
```

## offering ("Servicio")

| Field | Type | Rules |
|---|---|---|
| id | bigint identity PK | |
| slug | varchar(100) | NOT NULL, UNIQUE **[DB]**; generated once from name, immutable **[App]** (research R11) |
| name | varchar(80) | NOT NULL, non-blank **[DB: CHECK]** |
| summary | varchar(200) | NOT NULL; used in cards and meta description |
| description | text | NOT NULL, ≤ 5000 chars **[DB: CHECK]**; plain text with line breaks |
| reference_price_cop | bigint | NULL = no price shown; CHECK > 0 **[DB]** (FR-004) |
| display_order | integer | NOT NULL, CHECK ≥ 1 **[DB]** |
| published | boolean | NOT NULL DEFAULT false |

Notes: no `featured` flag — the home page shows published offerings in display order (spec FR-003
lists "featured services"; with ~6 offerings, all are shown; the cap is a UI constant).

## success_case ("Caso de éxito")

| Field | Type | Rules |
|---|---|---|
| id | bigint identity PK | |
| slug | varchar(100) | NOT NULL, UNIQUE **[DB]**; immutable **[App]** |
| title | varchar(120) | NOT NULL, non-blank **[DB]** |
| client_name | varchar(120) | NOT NULL, non-blank **[DB]** (client or brand) |
| description | text | NOT NULL, ≤ 5000 chars **[DB]** |
| event_label | varchar(120) | NULL (e.g., "Pasarela Colombiamoda") |
| event_date | date | NULL |
| display_order | integer | NOT NULL, CHECK ≥ 1 |
| featured | boolean | NOT NULL DEFAULT false |
| published | boolean | NOT NULL DEFAULT false |

### success_case_offering (optional related services)

| Field | Type | Rules |
|---|---|---|
| success_case_id | bigint | FK → success_case ON DELETE CASCADE |
| offering_id | bigint | FK → offering ON DELETE CASCADE |
| | | PK (success_case_id, offering_id) |

Public views show only related offerings that are published **[App]**.

## testimonial ("Testimonio")

| Field | Type | Rules |
|---|---|---|
| id | bigint identity PK | |
| client_name | varchar(120) | NOT NULL, non-blank **[DB]** |
| company | varchar(120) | NULL |
| quote | varchar(600) | NOT NULL, non-blank **[DB]** |
| photo_image_id | bigint | NULL, FK → image ON DELETE SET NULL, UNIQUE **[DB]** |
| display_order | integer | NOT NULL, CHECK ≥ 1 |
| featured | boolean | NOT NULL DEFAULT false |
| published | boolean | NOT NULL DEFAULT false |

## image

| Field | Type | Rules |
|---|---|---|
| id | bigint identity PK | |
| storage_key | uuid | NOT NULL, UNIQUE **[DB]**; files at `{key}-{480,960,1600}.jpg` (research R8) |
| original_filename | varchar(255) | NOT NULL |
| width | integer | NOT NULL, CHECK > 0 (largest stored variant) |
| height | integer | NOT NULL, CHECK > 0 |
| alt_text | varchar(150) | NULL; public falls back to the owner item's name/title **[App]** (FR-012) |
| created_at | timestamptz | NOT NULL |

Upload rules **[App]**: content decodes as JPEG/PNG/WebP; size ≤ 10 MB; otherwise 400 (format)
or 413 (size). Variants never upscale. Consistency between rows and files: research R9.

### offering_image / success_case_image (ordered galleries)

| Field | Type | Rules |
|---|---|---|
| offering_id / success_case_id | bigint | FK ON DELETE CASCADE |
| image_id | bigint | FK → image ON DELETE CASCADE, UNIQUE **[DB]** (an image belongs to one gallery) |
| position | integer | NOT NULL, CHECK ≥ 1 |
| | | PK (owner_id, image_id); UNIQUE (owner_id, position) DEFERRABLE INITIALLY DEFERRED **[DB]** |

The deferrable unique constraint lets a reorder rewrite all positions in one transaction.
When an offering or case is deleted, its `image` rows are deleted in the same transaction and its
files after commit **[App]** (R9). Limit: 12 images per gallery **[App]**.

## business_profile (single row)

| Field | Type | Rules |
|---|---|---|
| id | smallint PK | CHECK (id = 1) **[DB]** — enforces a single row |
| business_name | varchar(80) | NOT NULL |
| slogan | varchar(120) | NOT NULL |
| about_text | text | NOT NULL, ≤ 8000 chars |
| whatsapp_number | varchar(15) | NOT NULL, CHECK `~ '^[0-9]{10,15}$'` **[DB]** (digits with country code) |
| location_text | varchar(200) | NOT NULL |
| schedule_text | varchar(300) | NOT NULL |
| updated_at | timestamptz | NOT NULL |

## admin_user

| Field | Type | Rules |
|---|---|---|
| id | bigint identity PK | |
| email | varchar(254) | NOT NULL; UNIQUE on `lower(email)` **[DB]** |
| password_hash | varchar(100) | NOT NULL (BCrypt) |
| created_at | timestamptz | NOT NULL |
| last_login_at | timestamptz | NULL |

Created at startup from `ADMIN_EMAIL`/`ADMIN_PASSWORD` only if the table is empty (research R6).
Login throttling state is in memory, not in this table (R7).

## State transitions (offering, success_case, testimonial)

```text
            create                publish
  (none) ─────────▶ DRAFT ─────────────────▶ PUBLISHED
                      ▲  ◀───────────────────     │
                      │        unpublish          │
                      └── delete (confirmed) ─────┴──▶ (removed: rows + files)
```

- New items start as DRAFT (`published = false`) and get `display_order = max + 1`.
- Only PUBLISHED items are returned by public endpoints (FR-009); drafts are visible in admin and
  in admin preview (FR-022).
- Publishing an offering or success case without images is allowed; the admin UI warns first
  (spec edge case); the public UI shows a placeholder.
- `featured` matters only while PUBLISHED.

## Seed data (Flyway migration, exploratory)

- `business_profile`: name "Plisados Roldán", slogan "Creando ando, soñando alto", about text from
  the owner's description, WhatsApp `573116254705`, location "Itagüí, Antioquia, Colombia",
  schedule placeholder "Lunes a viernes, 8:00 a. m. – 5:00 p. m." (owner edits it).
- Six published offerings without prices or images: Plisado, Trillado, Craquelado, Corte láser,
  Grabado láser, Línea Plissee (faldas plisadas a la medida).
- No seeded success cases or testimonials (those sections stay hidden until created — spec US3-5).
