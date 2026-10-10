# JKY-Folder: one container serving the web app and API, with private data on a volume.
FROM node:22-bookworm-slim AS build
WORKDIR /app
# Native modules (better-sqlite3, sharp, canvas) use prebuilt binaries; tools cover a fallback build.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
  HOST=0.0.0.0 \
  PORT=3001 \
  DATA_DIR=/data
RUN useradd --system --uid 10001 --home /app jky \
  && mkdir -p /data && chown jky /data
COPY --from=build --chown=jky /app /app
USER jky
VOLUME ["/data"]
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--import", "tsx", "server/index.ts"]
