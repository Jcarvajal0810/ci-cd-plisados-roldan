# syntax=docker/dockerfile:1
# Multi-stage build: compile the SSR bundle, then run it on a slim Node image as the non-root
# "node" user. The SSR server is the only public entry point (research R5).

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx ng build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=build /app/dist/pisadosroldan-frontend ./dist/pisadosroldan-frontend
USER node
EXPOSE 4000
CMD ["node", "dist/pisadosroldan-frontend/server/server.mjs"]
