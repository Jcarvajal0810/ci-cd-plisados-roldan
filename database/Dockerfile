# Database component: ships the versioned schema and seed data as an image and applies them with
# Flyway. It runs once before the backend starts and exits (docker compose service "db-migrate").
# Connection settings come from FLYWAY_URL / FLYWAY_USER / FLYWAY_PASSWORD.
FROM flyway/flyway:11-alpine
# - apk upgrade: parches de seguridad del Alpine base (openssl, gnutls) que la imagen oficial aun no trae.
# - Solo usamos PostgreSQL: se quitan el driver de Couchbase y Netty, que no se usan y traen CVE criticas.
RUN apk upgrade --no-cache \
  && rm -rf /flyway/drivers/couchbase /flyway/lib/netty
COPY migrations /flyway/sql
CMD ["migrate"]
