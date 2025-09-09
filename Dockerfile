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
    build-base && \
    # Create minimal directory structure
    mkdir -p /base/bin && \
    # Install dumb-init
    wget -O /base/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_$(uname -m) && \
    chmod 755 /base/bin/dumb-init

RUN corepack enable

COPY --chown=node:node pnpm-lock.yaml .
COPY --chown=node:node package.json .

ENTRYPOINT ["/base/bin/dumb-init", "--"]

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
COPY --chown=node:node shared/ shared/
COPY --chown=node:node config/ config/
COPY --chown=node:node lib/ lib/
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
# RUN curl -sfS https://dotenvx.sh/install.sh | sh

# Create non-root user
RUN addgroup -S nonroot && \
    adduser -S nonroot -G nonroot

COPY --chown=nonroot:nonroot --from=builder /usr/src/app/.output .output/
COPY --chown=nonroot:nonroot --from=builder /usr/src/app/prisma prisma/
COPY --chown=nonroot:nonroot --from=builder /usr/src/app/patches patches/

# Copy package.json and lockfile for production dependencies install
COPY --chown=nonroot:nonroot --from=builder /usr/src/app/package.json package.json
COPY --chown=nonroot:nonroot --from=builder /usr/src/app/pnpm-lock.yaml pnpm-lock.yaml

RUN pnpm install --frozen-lockfile --prod

# Patch .prisma with the built files
COPY --chown=nonroot:nonroot --from=builder /usr/src/app/node_modules/.prisma node_modules/.prisma

RUN chown -R nonroot:nonroot /usr/src/app

USER nonroot

CMD ["node", ".output/server/index.mjs"]
