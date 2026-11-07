# Feature Specification: Plisados Roldán Informational Website

**Feature Branch**: `001-business-info-site`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "Informational website for Plisados Roldán, a textile-process
microbusiness in Itagüí, Antioquia, Colombia. Exploratory project. Public site in Spanish,
mobile-first: Home, Nosotros, services catalog (plisado, trillado, craquelado, corte y grabado
láser, línea Plissee), success cases, testimonials, contact. WhatsApp-only contact with
pre-filled messages per service, optional reference prices. Authenticated admin area to manage
all content and images. Pages indexable by search engines. No Instagram, no forms, no
e-commerce."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prospective client learns what the business does and contacts it (Priority: P1)

A fashion designer, brand or garment maker (or a woman interested in a Plissee skirt) arrives
at the site, usually on a phone. In under a minute they understand what Plisados Roldán does,
see the services offered with photos, and tap a WhatsApp button that opens a chat with a
message already naming the service they were looking at.

**Why this priority**: This is the entire reason the site exists: turning a visitor into a
WhatsApp conversation.

**Independent Test**: With services loaded as seed content, open the site on a phone-sized
screen, browse to a service, tap its WhatsApp button and confirm the chat opens to the
business number with the service name in the message.

**Acceptance Scenarios**:

1. **Given** a visitor on the home page, **When** the page loads, **Then** they see the
   business name, the slogan "Creando ando, soñando alto", a short value statement, featured
   services, and a visible WhatsApp button.
2. **Given** a visitor on the services catalog, **When** they open a service (e.g., Plisado),
   **Then** they see its name, description, photos, and, if the owner set one, a reference
   price shown as "Desde $X COP".
3. **Given** a visitor viewing a service, **When** they tap "Cotizar por WhatsApp", **Then**
   WhatsApp opens to +57 311 625 4705 with a pre-filled message such as "Hola, quiero cotizar
   el servicio de Plisado".
4. **Given** a service without a reference price, **When** it is displayed, **Then** no price
   is shown and the call to action reads as a quote request.
5. **Given** any public page, **When** the visitor scrolls, **Then** a WhatsApp contact option
   is always reachable without navigating away.

---

### User Story 2 - Owner manages services and business information (Priority: P1)

The owner logs into a private admin area and creates, edits, reorders, publishes or
unpublishes services, uploads their photos, and edits the "Nosotros" text and contact details
(WhatsApp number, address/location, schedule), without asking a developer.

**Why this priority**: Without it, the public content is hard-coded and the site becomes stale
immediately; owner control is a constitution principle.

**Independent Test**: Log in as admin, create a new service with photos and no price, publish
it, and confirm it appears on the public catalog; unpublish it and confirm it disappears.

**Acceptance Scenarios**:

1. **Given** the login page, **When** the owner enters valid credentials, **Then** they reach
   the admin area; **When** credentials are invalid, **Then** access is denied with a generic
   error message.
2. **Given** an unauthenticated visitor, **When** they try to open any admin page or perform
   any content change, **Then** they are refused and redirected to login.
3. **Given** the admin area, **When** the owner creates a service with name, description, at
   least one photo, optional reference price and display order, and publishes it, **Then** it
   appears on the public site in that order.
4. **Given** a published service, **When** the owner unpublishes it, **Then** it no longer
   appears publicly but remains in the admin list for later reuse.
5. **Given** the admin area, **When** the owner edits the WhatsApp number, address or
   schedule, **Then** every public WhatsApp button and the contact section use the new values.
6. **Given** the admin area, **When** the owner edits the "Nosotros" text, **Then** the public
   About page shows the updated text.

---

### User Story 3 - Visitor builds trust through success cases and testimonials (Priority: P2)

A visitor who is not yet convinced browses success cases (runway work, brand collections) with
photos and descriptions, and reads testimonials from clients, then contacts the business.

**Why this priority**: Social proof is what converts B2B clients, but the site still delivers
value without it.

**Independent Test**: With seed success cases and testimonials, open the success cases page and
the home page and confirm published items appear with their photos, in the configured order.

**Acceptance Scenarios**:

1. **Given** published success cases, **When** a visitor opens the success cases section,
   **Then** each case shows title, client or brand name, description and at least one photo.
2. **Given** a success case, **When** the visitor opens it, **Then** they see all its photos
   and a WhatsApp call to action.
3. **Given** published testimonials, **When** a visitor views the testimonials section,
   **Then** each shows the client's name, optional company, the quote and optional photo.
4. **Given** success cases or testimonials marked as featured, **When** the home page loads,
   **Then** the featured ones are shown there.
5. **Given** no published success cases or testimonials, **When** the related section would
   render, **Then** it is hidden rather than shown empty.

---

### User Story 4 - Owner manages success cases and testimonials (Priority: P2)

The owner creates, edits, orders, features, publishes/unpublishes and deletes success cases and
testimonials, including their photos.

**Why this priority**: Required for Story 3 to be maintainable; depends on the admin area from
Story 2.

**Independent Test**: Create a testimonial, feature it, and confirm it appears on the home
page; delete it and confirm it disappears everywhere.

**Acceptance Scenarios**:

1. **Given** the admin area, **When** the owner creates a success case with title, client or
   brand, description and photos, **Then** it can be saved as draft or published.
2. **Given** the admin area, **When** the owner creates a testimonial with name, quote and
   optionally company and photo, **Then** it can be saved as draft or published.
3. **Given** any content item, **When** the owner deletes it, **Then** they must confirm first,
   and afterwards it disappears from the public site and the admin list.

---

### User Story 5 - The business can be found through search engines (Priority: P3)

Someone searching for terms like "plisado Itagüí" or "grabado láser telas Medellín" can find
the business's pages, and links shared on WhatsApp show a title, description and image preview.

**Why this priority**: Valuable for reach, but the site works for visitors arriving by direct
link without it.

**Independent Test**: Request each public page as a crawler (without running scripts) and
confirm the full content, a page-specific title and description are present; share a service
link in a chat and confirm a preview with image appears.

**Acceptance Scenarios**:

1. **Given** any public page, **When** it is retrieved without executing client-side scripts,
   **Then** its main text content, title and description are present.
2. **Given** a service or success case page, **When** its link is shared, **Then** the preview
   shows the item's name, a summary and its main photo.
3. **Given** the public site, **When** a search engine requests the site map, **Then** it lists
   all published public pages.

---

### Edge Cases

- A service, case or testimonial with no photo: public view shows a neutral placeholder and
  admin warns before publishing a service or case without a photo.
- Very large photo uploads (e.g., 15 MB straight from a phone): accepted up to a limit, resized
  and compressed automatically; files over the limit or of an unsupported type are rejected
  with a clear message.
- Unpublished or deleted item reached through an old shared link: a friendly "not found" page
  with links to the services catalog and WhatsApp.
- WhatsApp not installed on the device: the link opens WhatsApp Web or the WhatsApp download
  page (standard click-to-chat behavior).
- Owner session expires while editing: on save, the owner is asked to log in again without
  silently losing the unsaved text.
- Repeated failed login attempts: login is temporarily slowed or blocked after several
  consecutive failures.
- Two items with the same display order: ties are broken by most recently updated.

## Requirements *(mandatory)*

### Functional Requirements

**Public site**

- **FR-001**: The site MUST provide these public sections: Home, Nosotros (About), Servicios
  (catalog and per-service detail), Casos de éxito (list and detail), Testimonios, and Contacto.
- **FR-002**: All public text MUST be in Spanish (Colombia), and layouts MUST be designed for
  phones first and remain usable on tablets and desktops.
- **FR-003**: Home MUST show the slogan, a short value statement, featured services, featured
  success cases and testimonials (when any are published and featured), and a WhatsApp call to
  action.
- **FR-004**: Each service MUST display name, description, one or more photos, and, only if
  set, a reference price formatted as "Desde $X COP".
- **FR-005**: The catalog MUST include, as initial content, the services Plisado, Trillado,
  Craquelado, Corte láser, Grabado láser and the Línea Plissee (made-to-measure pleated
  skirts); the owner can change or extend this list.
- **FR-006**: Every service and success case MUST offer a WhatsApp button whose pre-filled
  message names that item; a generic WhatsApp contact MUST be reachable from every public page.
- **FR-007**: The contact section MUST show the WhatsApp number, location (Itagüí, Antioquia),
  and business schedule as configured by the owner.
- **FR-008**: The public site MUST NOT collect or store any visitor personal data (no forms, no
  accounts for visitors).
- **FR-009**: Only published items MUST appear publicly, in the order set by the owner.
- **FR-010**: Each public page MUST have a unique title and description, MUST deliver its main
  content to clients that do not execute scripts, and MUST provide link-preview metadata
  (title, summary, image).
- **FR-011**: The site MUST publish a site map of all published public pages.
- **FR-012**: Every image MUST have descriptive alternative text, entered by the owner or
  defaulting to the item name.

**Administration**

- **FR-013**: The admin area MUST require login with username/email and password; all content
  changes MUST require an authenticated session.
- **FR-014**: The system MUST support at least one admin account (the owner); creating the
  first account is done at setup time, not through a public sign-up.
- **FR-015**: The owner MUST be able to create, edit, publish/unpublish, reorder and delete
  services, success cases and testimonials.
- **FR-016**: The owner MUST be able to mark success cases and testimonials as featured for the
  home page.
- **FR-017**: The owner MUST be able to upload, reorder and remove photos for services and
  success cases, and one optional photo for a testimonial.
- **FR-018**: Uploaded photos MUST be limited to common image formats (JPEG, PNG, WebP) up to
  10 MB each, and MUST be automatically resized and compressed for web delivery.
- **FR-019**: The owner MUST be able to edit the business information: Nosotros text, WhatsApp
  number, location text, and schedule.
- **FR-020**: Deleting any item MUST require explicit confirmation.
- **FR-021**: Login MUST be throttled after 5 consecutive failed attempts.
- **FR-022**: The owner MUST be able to preview a draft item before publishing it.

### Key Entities

- **Service**: An offering (e.g., Plisado). Name, URL-friendly identifier, short summary, full
  description, optional reference price (COP), photos (ordered), display order, published flag.
- **Success Case**: A portfolio piece. Title, client or brand name, description, optional date
  or event (e.g., runway), photos (ordered), optional related service(s), display order,
  featured flag, published flag.
- **Testimonial**: Client quote. Client name, optional company/brand, quote text, optional
  photo, display order, featured flag, published flag.
- **Image**: An uploaded photo. Original reference, web-optimized versions, alternative text,
  owner item.
- **Business Profile**: Single record. Business name, slogan, Nosotros text, WhatsApp number,
  location text, schedule text.
- **Admin User**: Owner account. Login identifier, protected password, last login.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor on a phone can go from landing on the site to an open
  WhatsApp chat about a specific service in 3 taps or fewer.
- **SC-002**: In a hallway test with 5 people unfamiliar with the business, at least 4 can
  correctly state what the business does and name 3 of its services after 30 seconds on the
  home page.
- **SC-003**: Public pages show their main content within 2.5 seconds on a mid-range phone over
  a 4G connection.
- **SC-004**: The owner can create and publish a new service with 3 photos in under 5 minutes
  without developer help, on the first attempt.
- **SC-005**: 100% of published public pages appear in the site map and have a unique title
  and description.
- **SC-006**: 0 content changes are possible without an authenticated admin session (verified
  by attempting every change action unauthenticated).
- **SC-007**: Public pages meet WCAG 2.1 AA for color contrast, keyboard navigation and image
  alternative text in an automated accessibility audit with no critical issues.

## Assumptions

- This is an exploratory project: it runs locally or in a demo environment, not as the
  business's live production site. Production concerns such as a real domain, uptime
  guarantees and backup restore drills are out of scope for this feature, but the design must
  not prevent them later.
- A single owner admin account is enough; roles and multiple admins are out of scope.
- Initial content (Nosotros text, service list, contact data) comes from the owner's business
  description and Instagram profile and is loaded as seed data; photos are placeholders until
  the owner uploads real ones.
- Contact happens only through WhatsApp click-to-chat; no messages are stored by the site.
- Prices, when shown, are reference prices only ("desde"), in Colombian pesos; no checkout.
- Out of scope: e-commerce, payments, orders, bookings, quote or contact forms, visitor
  accounts, multi-language, blog, analytics dashboards, and any Instagram integration (feed,
  embeds or API).
- Visitors use current versions of mobile and desktop browsers.
