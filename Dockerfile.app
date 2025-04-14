# Dockerfile for IKAROS node.js deployment
# Based on work by Viral Ganatra (https://github.com/viralganatra/docker-nodejs-best-practices ) under the MIT license

# Base stage
# ---------------------------------------
FROM node:22.13-alpine3.21 AS base
WORKDIR /app
COPY app/package*.json ./
COPY app/jsconfig.json ./
COPY app/vite.config.js ./
COPY app/index.html ./

RUN echo "# Environmental variables for Ikaros" > .env

# Development stage
# ---------------------------------------
FROM base AS development
ARG VITE_DB_API
ARG VITE_DOMAIN
ARG VITE_TITLE
ARG VITE_MODULES
ARG VITE_ONLINE
ARG VITE_KC_URL
ARG VITE_KC_REALM
ARG VITE_KC_CLIENT
ARG VITE_APP
ARG VITE_DESCRIPTION
ARG VITE_GEONAMES_API
ARG WDS_SOCKET_PORT

WORKDIR /app

RUN echo "VITE_DB_API=${VITE_DB_API}" >> .env
RUN echo "VITE_DOMAIN=${VITE_DOMAIN}" >> .env
RUN echo "VITE_TITLE=${VITE_TITLE}" >> .env
RUN echo "VITE_APP=${VITE_APP}" >> .env
RUN echo "VITE_DESCRIPTION=${VITE_DESCRIPTION}" >> .env
RUN echo "VITE_MODULES=${VITE_MODULES}" >> .env
RUN echo "VITE_ONLINE=${VITE_ONLINE}" >> .env
RUN echo "VITE_KC_URL=${VITE_KC_URL}" >> .env
RUN echo "VITE_KC_REALM=${VITE_KC_REALM}" >> .env
RUN echo "VITE_KC_CLIENT=${VITE_KC_CLIENT}" >> .env
RUN echo "VITE_GEONAMES_API=${VITE_GEONAMES_API}" >> .env
RUN echo "WDS_SOCKET_PORT=${WDS_SOCKET_PORT=$}" >> .env

COPY app/start.sh ./
RUN npm install

# Copy custom health check script
COPY ./scripts/healthcheck_dev.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

EXPOSE 3000

# Source stage
# ---------------------------------------
FROM base AS source
ARG VITE_DB_API
ARG VITE_DOMAIN
ARG VITE_TITLE
ARG VITE_MODULES
ARG VITE_ONLINE
ARG VITE_KC_URL
ARG VITE_KC_REALM
ARG VITE_KC_CLIENT
ARG VITE_APP
ARG VITE_DESCRIPTION
ARG VITE_GEONAMES_API

WORKDIR /app

RUN echo "VITE_DB_API=${VITE_DB_API}" >> .env
RUN echo "VITE_DOMAIN=${VITE_DOMAIN}" >> .env
RUN echo "VITE_TITLE=${VITE_TITLE}" >> .env
RUN echo "VITE_APP=${VITE_APP}" >> .env
RUN echo "VITE_DESCRIPTION=${VITE_DESCRIPTION}" >> .env
RUN echo "VITE_MODULES=${VITE_MODULES}" >> .env
RUN echo "VITE_ONLINE=${VITE_ONLINE}" >> .env
RUN echo "VITE_KC_URL=${VITE_KC_URL}" >> .env
RUN echo "VITE_KC_REALM=${VITE_KC_REALM}" >> .env
RUN echo "VITE_KC_CLIENT=${VITE_KC_CLIENT}" >> .env
RUN echo "VITE_GEONAMES_API=${VITE_GEONAMES_API}" >> .env

COPY ./app/src ./src
COPY ./app/public ./public

RUN npm ci --omit=dev && npm run build

# Test stage
# ---------------------------------------
#FROM source AS test

# COPY --from=development /app/node_modules /app/node_modules
# RUN npm run test && npm run lint

# Production stage
# ---------------------------------------
FROM nginx:1.27-alpine3.20-slim AS production

COPY --from=source /app/dist /usr/share/nginx/html

# Copy in Nginx configuration that redirects to index.html
COPY scripts/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
