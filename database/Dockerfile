# Database component: ships the versioned schema and seed data as an image and applies them with
# Flyway. It runs once before the backend starts and exits (docker compose service "db-migrate").
# Connection settings come from FLYWAY_URL / FLYWAY_USER / FLYWAY_PASSWORD.
FROM flyway/flyway:11-alpine
COPY migrations /flyway/sql
CMD ["migrate"]
