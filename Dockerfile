# ================ #
#   Base Stage     #
# ================ #

FROM --platform=$BUILDPLATFORM node:24-alpine AS base

WORKDIR /usr/src/app

ENV CI="true"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache dumb-init g++ make python3
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate

COPY --chown=node:node pnpm-lock.yaml .
COPY --chown=node:node pnpm-workspace.yaml .
COPY --chown=node:node package.json .

ENTRYPOINT ["dumb-init", "--"]

# ================ #
#   Builder Stage   #
# ================ #

FROM base AS builder

ENV NODE_ENV="development"
ENV HUSKY="0"
# Nitro auto-detects hosting providers (e.g. Netlify) from CI env vars; force the
# self-contained node-server preset so `.output` runs standalone in the runner stage.
ENV NITRO_PRESET="node-server"

COPY --chown=node:node patches/ patches/
COPY --chown=node:node prisma.config.ts prisma.config.ts
COPY --chown=node:node app/ app/
COPY --chown=node:node config/ config/
COPY --chown=node:node content/ content/
COPY --chown=node:node modules/ modules/
COPY --chown=node:node public/ public/
COPY --chown=node:node server/ server/
COPY --chown=node:node service-worker/ service-worker/
COPY --chown=node:node shared/ shared/
COPY --chown=node:node scripts/next-version.ts scripts/next-version.ts
COPY --chown=node:node content.config.ts .
COPY --chown=node:node nuxt.config.ts .
COPY --chown=node:node sentry.client.config.ts .
COPY --chown=node:node sentry.server.config.ts .
COPY --chown=node:node tsconfig.json .
COPY --chown=node:node vite.config.ts .
COPY --chown=node:node .nuxtrc .

RUN pnpm install --frozen-lockfile \
	&& pnpm run prisma:generate \
	&& pnpm run build

# ================ #
#   Runner Stage   #
# ================ #

FROM base AS runner

ENV NODE_ENV="production"
ENV NODE_OPTIONS="--enable-source-maps --max_old_space_size=4096"
ENV NITRO_HOST="0.0.0.0"
ENV NITRO_PORT="3000"

WORKDIR /usr/src/app

# Nitro's node-server preset traces and inlines every runtime dependency into
# `.output`, so the runner needs nothing from node_modules or the source tree.
COPY --chown=node:node --from=builder /usr/src/app/.output .output

# At runtime Nitro writes fs-backed storage (fetch cache, rate limiter) and the
# tamper-evident audit journal under the working directory. Create those directories
# and hand the working directory to the unprivileged node user so the first cache,
# rate-limit, or audit write doesn't fail with EACCES. Avoid recursively chowning
# `.output` (already node-owned via COPY) to keep the final image layer small.
RUN mkdir -p .cache/fetch .cache/ratelimiter .audit \
	&& chown node:node /usr/src/app \
	&& chown -R node:node .cache .audit

USER node

EXPOSE 3000

CMD [ "node", ".output/server/index.mjs" ]
