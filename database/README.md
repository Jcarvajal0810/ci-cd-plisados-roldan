# database — componente de base de datos

PostgreSQL 17 y el esquema versionado del sitio. Este componente es el **único dueño del esquema**:
el backend solo se conecta y lee/escribe datos; nunca crea ni modifica tablas.

| Pieza | Qué es |
|---|---|
| `migrations/V1__schema.sql` | Tablas, llaves, `CHECK` y `UNIQUE` (toda regla de integridad marcada [DB] en `specs/001-business-info-site/data-model.md`) |
| `migrations/V2__seed.sql` | Contenido inicial: perfil del negocio y los 6 servicios |
| `migrations/V3__seed_service_photos.sql` | Fotos iniciales de los servicios (los archivos están en `backend/seed-media` y los copia el servicio `media-seed`) |
| `Dockerfile` | Imagen de migraciones (Flyway 11) que aplica `migrations/` y termina |

En `docker-compose.yml` (raíz) el componente son dos servicios:

- `db` — PostgreSQL 17 con un volumen persistente (`pgdata`).
- `db-migrate` — esta imagen; corre `flyway migrate` contra `db` y sale. El backend arranca solo
  cuando terminó con éxito.

## Cambiar el esquema

1. Crea un archivo nuevo `migrations/V3__descripcion.sql` (nunca edites uno ya aplicado).
2. Corre las pruebas del backend (`cd backend && ./mvnw verify`): usan estas mismas migraciones
   contra un PostgreSQL desechable (Testcontainers).
3. `docker compose up -d --build db-migrate` aplica la migración a la base local.
