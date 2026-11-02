# syntax=docker/dockerfile:1

# Build the static app with Node, serve it with unprivileged nginx.
#
#   docker build -t reactjs-template .
#   docker run -p 8080:8080 reactjs-template
#
# With a real API:
#   docker build -t reactjs-template --build-arg VITE_API_URL=https://api.example.com .
#   docker run -p 8080:8080 -e API_ORIGIN=https://api.example.com reactjs-template

# ── build ────────────────────────────────────────────────────────────────────
FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
# --ignore-scripts skips the husky `prepare` hook, which needs a git checkout.
RUN npm ci --include=dev --ignore-scripts --no-audit --no-fund

COPY . .

# VITE_* values are inlined into the bundle at build time, so they are build
# arguments, not runtime settings. Everything in them is public.
ARG VITE_API_URL=
ARG VITE_ENABLE_MOCKS=
ARG VITE_APP_NAME="Acme Admin"
ENV VITE_API_URL=$VITE_API_URL \
    VITE_ENABLE_MOCKS=$VITE_ENABLE_MOCKS \
    VITE_APP_NAME=$VITE_APP_NAME

RUN npm run build

# ── runtime ──────────────────────────────────────────────────────────────────
# Runs as a non-root user on port 8080.
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

ENV API_ORIGIN=""
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
