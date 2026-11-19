# syntax=docker/dockerfile:1
# Multi-stage build: compile with the Maven Wrapper on a JDK, run on a slim JRE as a non-root user.
# Tests are not run here: they need Docker (Testcontainers) and run with `./mvnw verify` instead.

FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src src
RUN ./mvnw -B -q package -DskipTests -Dspotless.check.skip=true

FROM eclipse-temurin:21-jre
RUN useradd --system --uid 10001 --no-create-home app \
    && mkdir -p /data/media \
    && chown app /data/media
WORKDIR /app
COPY --chown=app seed-media/ /data/media/
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
USER app
ENV MEDIA_ROOT=/data/media
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
