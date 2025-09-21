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
COPY --chown=node:node package.json .

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

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
COPY --chown=node:node server/generated/ server/generated/
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
ENV NODE_OPTIONS=${NODE_OPTIONS}

RUN apk add --no-cache curl

# Install dotenvx
RUN curl -sfS https://dotenvx.sh/install.sh | sh

# Create non-root user
RUN addgroup -S nonroot && \
    adduser -S nonroot -G nonroot

COPY --chown=nonroot:nonroot --from=builder /usr/src/app/.output .output/
COPY --chown=nonroot:nonroot --from=builder /usr/src/app/prisma prisma/
COPY --chown=nonroot:nonroot --from=builder /usr/src/app/patches patches/

# Copy environment files
COPY --chown=nonroot:nonroot .env.example .env

RUN pnpm install --frozen-lockfile --prod

RUN chown -R nonroot:nonroot /usr/src/app

USER nonroot

CMD ["dotenvx", "run", "--", "node", ".output/server/index.mjs"]
