# Plisados Roldán — sitio web informativo

Sitio web de **Plisados Roldán**, microempresa de procesos textiles en Itagüí, Antioquia
(plisado, trillado, craquelado, corte y grabado láser, y la línea Plissee de faldas plisadas a la
medida). Su objetivo es que diseñadores, marcas, confeccionistas y clientas entiendan en segundos
qué hace el taller y **escriban por WhatsApp** sobre el servicio que les interesa.

Incluye un **panel de administración** donde la dueña gestiona, sin ayuda técnica, los servicios
(con fotos y precio de referencia opcional), los casos de éxito, los testimonios y la información
del negocio.

> Proyecto exploratorio construido con *Spec-Driven Development* (GitHub Spec Kit): primero la
> especificación, luego el plan, luego las tareas y después el código, con TDD.

---

## Arquitectura: 3 componentes independientes

El sistema **no es un monolito**: frontend, backend y base de datos son componentes separados, cada
uno con su propia carpeta, su propia imagen Docker y su propia responsabilidad. Solo se comunican
por la red.

```text
                    ┌──────────────────────────────┐
  Navegador ──────▶ │  frontend   (web :4000)      │  Angular 22 con SSR (Node)
  (HTTPS)           │  páginas públicas + admin    │  única entrada pública
                    └──────────────┬───────────────┘
                                   │ HTTP/JSON  (/api, /media, /sitemap.xml)
                    ┌──────────────▼───────────────┐
                    │  backend    (API :8080)      │  Spring Boot 4 · Java 21
                    │  reglas de negocio, sesión,  │  sin estado de esquema
                    │  imágenes, sitemap           │
                    └──────────────┬───────────────┘
                                   │ JDBC
                    ┌──────────────▼───────────────┐
                    │  database   (db :5432)       │  PostgreSQL 17
                    │  + db-migrate (Flyway)       │  dueño del esquema y datos iniciales
                    └──────────────────────────────┘
```

| Componente | Carpeta | Tecnología | Responsabilidad |
|---|---|---|---|
| **Frontend** | [`frontend/`](frontend/) | Angular 22 (SSR), TypeScript estricto | Páginas públicas renderizadas en el servidor (visibles para Google y para las vistas previas de WhatsApp), panel de administración, proxy hacia el backend |
| **Backend** | [`backend/`](backend/) | Spring Boot 4, Java 21, `JdbcClient` | API REST, validación, sesión de administración con CSRF, procesamiento y almacenamiento de imágenes, sitemap |
| **Base de datos** | [`database/`](database/) | PostgreSQL 17 + Flyway 11 | Esquema versionado, restricciones de integridad, contenido inicial; se aplica con su propio contenedor (`db-migrate`) antes de que arranque el backend |

El contrato entre frontend y backend está definido en
[`specs/001-business-info-site/contracts/openapi.yaml`](specs/001-business-info-site/contracts/openapi.yaml):
las pruebas del backend validan cada respuesta contra ese archivo y el frontend genera sus tipos
TypeScript desde él.

Dentro del backend el código está organizado por funcionalidad (servicios, casos de éxito,
testimonios, perfil, imágenes, autenticación, SEO) con capas `api → application → domain ←
infrastructure` (Clean Architecture).

## Funcionalidades

**Para visitantes** (en español, pensado primero para el celular)

- Inicio, Nosotros, Servicios (lista y detalle), Casos de éxito, Testimonios y Contacto.
- Botón de WhatsApp en todas las páginas, con un mensaje distinto por servicio o caso
  ("Hola, quiero cotizar el servicio de Plisado.").
- Precio "Desde $ X COP" solo si la dueña lo define.
- Las secciones vacías se ocultan; páginas inexistentes devuelven un 404 real.
- SEO: título, descripción, URL canónica e imagen de vista previa por página, `sitemap.xml` y
  `robots.txt`.

**Para la dueña** (`/admin`)

- Crear, editar, ordenar, publicar/despublicar y eliminar (con confirmación) servicios, casos de
  éxito y testimonios; vista previa de borradores.
- Galerías de fotos (JPEG, PNG o WebP de hasta 10 MB, redimensionadas automáticamente).
- Editar Nosotros, número de WhatsApp, ubicación y horario.
- Sesión segura: contraseña con BCrypt, protección CSRF y bloqueo de 15 minutos tras 5 intentos
  fallidos.

## Cómo ejecutarlo

Requisitos: **Docker**. Para desarrollar: JDK 21 y Node.js 24.

```bash
cp .env.example .env          # elige tus propias contraseñas
docker compose up --build     # base de datos + migraciones + backend + frontend
```

- Sitio: http://localhost:4000
- Administración: http://localhost:4000/admin (usuario y contraseña de `ADMIN_EMAIL` /
  `ADMIN_PASSWORD` en tu `.env`; la cuenta se crea la primera vez)

### Desarrollo por componente

```bash
docker compose up -d db db-migrate            # solo la base de datos, con el esquema aplicado

cd backend  && cp .env.example .env           # mismas credenciales que el .env raíz
./mvnw spring-boot:run                        # API en http://localhost:8080

cd frontend && npm install && npm start       # http://localhost:4200 (proxy al backend)
```

## Pruebas

| Componente | Comando | Qué cubre |
|---|---|---|
| Backend | `cd backend && ./mvnw verify` | Formato (Spotless), unitarias e integración contra PostgreSQL real (Testcontainers) usando las migraciones de `database/`, y validación contra el contrato OpenAPI |
| Frontend | `cd frontend && npm run lint && npm test` | ESLint, tipos generados al día con el contrato, pruebas unitarias |
| Extremo a extremo | `cd frontend/e2e && npx playwright test` | Flujos completos en móvil y escritorio, SEO sin JavaScript y auditoría de accesibilidad WCAG 2.1 AA (requiere el sitio corriendo y `E2E_ADMIN_PASSWORD`) |

Resultados de la última validación (pruebas, Lighthouse, accesibilidad, revisión de arquitectura):
[`specs/001-business-info-site/validation-report.md`](specs/001-business-info-site/validation-report.md).

## Estructura del repositorio

```text
.
├── frontend/            componente web (Angular SSR) + pruebas e2e (Playwright)
├── backend/             componente API (Spring Boot)
├── database/            componente de datos (migraciones Flyway + imagen db-migrate)
├── specs/               especificación, plan, decisiones, contrato API, tareas y validación
├── .specify/  .claude/  configuración de Spec Kit (constitución del proyecto y comandos)
├── docker-compose.yml   orquesta los 3 componentes
└── .env.example         variables de entorno (copiar a .env)
```

## Seguridad

- **Ningún secreto está en el repositorio.** Contraseñas y datos de conexión se leen de variables
  de entorno; `.env` está en `.gitignore` y solo se versiona `.env.example` con valores de ejemplo.
- La cuenta de administración se crea a partir de `ADMIN_EMAIL` / `ADMIN_PASSWORD` solo si no
  existe ninguna; no hay registro público.
- La base de datos solo se publica en `127.0.0.1` para desarrollo; el backend no es accesible
  desde fuera, todo pasa por el frontend.
- El sitio no guarda datos personales de visitantes (el contacto es solo por WhatsApp).

## Documentación del proyecto

| Documento | Contenido |
|---|---|
| [`spec.md`](specs/001-business-info-site/spec.md) | Requisitos (PRD): historias de usuario, requisitos funcionales, criterios de éxito |
| [`plan.md`](specs/001-business-info-site/plan.md) | Plan técnico y verificación contra la constitución |
| [`research.md`](specs/001-business-info-site/research.md) | Decisiones técnicas con alternativas consideradas |
| [`data-model.md`](specs/001-business-info-site/data-model.md) | Modelo de datos y reglas de integridad |
| [`contracts/`](specs/001-business-info-site/contracts/) | Contrato OpenAPI y contrato de rutas/SEO |
| [`tasks.md`](specs/001-business-info-site/tasks.md) | 154 tareas ejecutadas con TDD |
| [`.specify/memory/constitution.md`](.specify/memory/constitution.md) | Principios del proyecto |
