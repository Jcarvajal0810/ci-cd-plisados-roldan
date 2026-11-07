# UI Contract: Routes, SEO and WhatsApp Messages

**Feature**: `001-business-info-site` | **Plan**: [../plan.md](../plan.md)

## Public routes (server-rendered, `RenderMode.Server`)

| Route | Content | `<title>` | Meta description | API |
|---|---|---|---|---|
| `/` | Hero (name, slogan, value statement), offerings, featured cases, featured testimonials, WhatsApp CTA | `Plisados Roldán · Plisado, trillado y corte láser en Itagüí` | Profile slogan + first sentence of about text | `GET /api/public/home` |
| `/nosotros` | About text, location | `Nosotros · Plisados Roldán` | First 155 chars of about text | `GET /api/public/profile` |
| `/servicios` | Offering cards | `Servicios · Plisados Roldán` | Static: list of service names | `GET /api/public/offerings` |
| `/servicios/:slug` | Offering detail, gallery, price if set, WhatsApp CTA | `{name} · Plisados Roldán` | `{summary}` | `GET /api/public/offerings/{slug}` |
| `/casos-de-exito` | Case cards (hidden from nav if none) | `Casos de éxito · Plisados Roldán` | Static | `GET /api/public/success-cases` |
| `/casos-de-exito/:slug` | Case detail, gallery, related offerings, WhatsApp CTA | `{title} · {clientName}` | First 155 chars of description | `GET /api/public/success-cases/{slug}` |
| `/testimonios` | Testimonials (hidden from nav if none) | `Testimonios · Plisados Roldán` | Static | `GET /api/public/testimonials` |
| `/contacto` | WhatsApp, location, schedule | `Contacto · Plisados Roldán` | Location + schedule | `GET /api/public/profile` |
| `**` | Friendly 404 with links to `/servicios` and WhatsApp; HTTP status 404 on the server | `Página no encontrada` | — | — |

Every public page:

- Sets `<html lang="es-CO">`, a canonical URL, and Open Graph tags (`og:title`, `og:description`,
  `og:image` = cover image 1600 variant or a default brand image, `og:url`, `og:type`).
- Shows a floating WhatsApp button (generic message) and footer with contact data (FR-006).
- Unknown or unpublished slugs render the 404 page **with HTTP status 404** (set on the SSR
  response) so search engines drop them.

## Admin routes (client-rendered, `RenderMode.Client`, `noindex`)

| Route | Purpose |
|---|---|
| `/admin/login` | Email + password. Generic error; "Demasiados intentos, intenta en 15 minutos" on 429 |
| `/admin` | Dashboard with links and counts |
| `/admin/servicios`, `/admin/servicios/nuevo`, `/admin/servicios/:id` | List (order, publish toggle, delete), create, edit + gallery |
| `/admin/casos`, `/admin/casos/nuevo`, `/admin/casos/:id` | Same for success cases (+ featured, related offerings) |
| `/admin/testimonios`, `/admin/testimonios/nuevo`, `/admin/testimonios/:id` | Same for testimonials (+ featured, single photo) |
| `/admin/perfil` | Business profile form |
| `/admin/vista-previa/servicios/:id`, `/admin/vista-previa/casos/:id` | Draft preview using the public components (FR-022) |

Guard: all `/admin/**` except login require `GET /api/auth/me` = 200; otherwise redirect to
login with `returnUrl`. On a 401 during save, the form keeps its values, the login opens in a
dialog, and the save is retried after login (spec edge case: expired session).

Delete always opens a confirmation dialog naming the item (FR-020). Publishing an offering or
case with zero images shows a warning dialog first.

## WhatsApp messages (FR-006, research R12)

Link format: `https://wa.me/{whatsappNumber}?text={encodeURIComponent(message)}`.

| Context | Message |
|---|---|
| Generic (floating button, contact, home) | `Hola, Plisados Roldán. Quiero más información sobre sus servicios.` |
| Offering | `Hola, quiero cotizar el servicio de {name}.` |
| Offering "Línea Plissee" | Uses the offering message (no special case) |
| Success case | `Hola, vi el caso "{title}" y quiero algo similar.` |

Button label: "Cotizar por WhatsApp" (offering, case) and "Escríbenos por WhatsApp" (generic).
Links open in a new tab with `rel="noopener"`.

## Price display (FR-004)

`referencePriceCop` set → `Desde $ 120.000 COP` (es-CO formatting, no decimals). Not set → no
price element at all.

## Images

`<img>` with `srcset` from the API, `sizes` per layout, `width`/`height` to avoid layout shift,
`loading="lazy"` except the first image above the fold (`fetchpriority="high"`). Missing image →
neutral placeholder with the item name as alt text.
