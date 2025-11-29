# syntax=docker/dockerfile:1.7

# ================ #
#    Base Stage    #
# ================ #

FROM node:22-alpine AS base

WORKDIR /usr/src/app
ARG NODE_OPTIONS

ENV CI="true"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache dumb-init g++ make python3
RUN corepack enable && corepack prepare pnpm@latest --activate

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
COPY --chown=node:node package.json .
COPY --chown=node:node prisma/ prisma/
COPY --chown=node:node app/ app/
COPY --chown=node:node server/ server/
COPY --chown=node:node server/database/generated/ server/database/generated/
COPY --chown=node:node shared/ shared/
COPY --chown=node:node config/ config/
COPY --chown=node:node modules/ modules/
COPY --chown=node:node public/ public/

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

COPY --chown=node:node --from=builder /usr/src/app/.output .output/
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules

RUN pnpm install --prod --frozen-lockfile --offline

USER node

CMD [ "pnpm", "run", "start" ]
