# backend — componente API

API REST del sitio Plisados Roldán: contenido público (servicios, casos de éxito, testimonios,
perfil del negocio, imágenes, sitemap) y la API de administración con sesión y CSRF.

Spring Boot 4 · Java 21 · SQL explícito con `JdbcClient`. Ver el [README principal](../README.md)
para la arquitectura completa.

- **No es dueño del esquema**: las tablas y los datos iniciales los aplica el componente
  [`database/`](../database/). El backend solo se conecta a PostgreSQL.
- Código por funcionalidad en `src/main/java/co/plisadosroldan/` (`offering`, `successcase`,
  `testimonial`, `profile`, `media`, `auth`, `seo`, `shared`), cada una con capas
  `api → application → domain ← infrastructure`.

## Ejecutar

```bash
docker compose up -d db db-migrate   # desde la raíz: base de datos con el esquema aplicado
cp .env.example .env                 # mismas credenciales que el .env raíz
./mvnw spring-boot:run               # http://localhost:8080
```

La cuenta de administración se crea al arrancar desde `ADMIN_EMAIL` / `ADMIN_PASSWORD`, solo si
no existe ninguna.

## Pruebas

```bash
./mvnw verify
```

Formato (Spotless), pruebas unitarias e integración contra un PostgreSQL desechable
(Testcontainers, requiere Docker). Las pruebas aplican **las mismas migraciones** de
`../database/migrations` y validan cada petición y respuesta contra el contrato
`../specs/001-business-info-site/contracts/openapi.yaml`.

## Imagen

`Dockerfile` multi-etapa: compila con el Maven Wrapper sobre un JDK y ejecuta en un JRE 21 con
usuario sin privilegios. Las imágenes subidas se guardan en `MEDIA_ROOT` (volumen `media`).
