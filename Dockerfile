# syntax=docker/dockerfile:1.7

# ================ #
#    Base Stage    #
# ================ #

FROM node:22-alpine AS base

WORKDIR /usr/src/app
ARG NODE_OPTIONS

ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN set -ex && \
    apk add --no-cache \
    jq \
    libc6-compat \
    curl \
    build-base \
    dumb-init

RUN corepack enable

COPY --chown=node:node pnpm-lock.yaml .
COPY --chown=node:node pnpm-workspace.yaml .
COPY --chown=node:node package.json .
COPY --chown=node:node .npmrc .

ENTRYPOINT ["dumb-init", "--"]

# ================ #
#   Builder Stage  #
# ================ #

FROM base AS builder

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.json tsconfig.json
COPY --chown=node:node nuxt.config.ts nuxt.config.ts
COPY --chown=node:node prisma/ prisma/
COPY --chown=node:node app/ app/
COPY --chown=node:node server/ server/
COPY --chown=node:node server/database/generated/ server/database/generated/
COPY --chown=node:node shared/ shared/
COPY --chown=node:node config/ config/
COPY --chown=node:node modules/ modules/

RUN pnpm install --frozen-lockfile \
 && pnpm run prisma:generate \
 && pnpm run build

# ================ #
#   Runner Stage   #
# ================ #

FROM base AS runner

ENV NODE_ENV="production"
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV PORT=${PORT:-3000}
COPY --chown=node:node --from=builder /usr/src/app/package.json .
COPY --chown=node:node --from=builder /usr/src/app/pnpm-lock.yaml .
COPY --chown=node:node --from=builder /usr/src/app/.output .output/

RUN pnpm install --frozen-lockfile --prod

RUN chown -R nonroot:nonroot /usr/src/app

CMD ["pnpm", "run", "start"]
