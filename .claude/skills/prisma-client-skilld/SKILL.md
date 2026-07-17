---
name: prisma-client-skilld
description: "ALWAYS use when editing or working with *.prisma files or code importing \"@prisma/client\". Consult for debugging, best practices, or modifying @prisma/client, prisma/client, prisma client, prisma."
metadata:
  version: 7.8.0
  generated_by: Anthropic · Haiku 4.5
  generated_at: 2026-07-16
---

# prisma/prisma `@prisma/client@7.8.0`
**Tags:** turso: 5.4.0-dev.61, early-access: 5.12.0-dev.21, typed-sql: 5.19.0-integration-feat-typed-sql.14

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p @prisma/client` instead of grepping `.skilld/` directories. Run `skilld search --guide -p @prisma/client` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes in @prisma/client v7.x — prioritize recent major/minor releases.

### Major Breaking Changes in v7.0.0

- BREAKING: Generator provider changed from `prisma-client-js` to `prisma-client` — ESM is now the default [source](./.skilld/releases/v7.0.0.md#esm-prisma-client-as-the-default)

- BREAKING: `new PrismaClient()` with no arguments no longer allowed — must pass `{ adapter }` or `{ accelerateUrl }` [source](./.skilld/releases/v7.0.0.md#prisma-client-changes)

- BREAKING: Output path now required in schema.prisma generator block — `output = "../src/generated/prisma"` [source](./.skilld/releases/v7.0.0.md#generated-client-and-types-move-out-of-node_modules)

- BREAKING: Removed `new PrismaClient({ datasources: .. })` and `new PrismaClient({ datasourceUrl: .. })` — use adapter pattern [source](./.skilld/releases/v7.0.0.md#prisma-client-changes)

- BREAKING: Driver adapter naming standardized — `PrismaBetterSQLite3` → `PrismaBetterSqlite3`, `PrismaLibSQL` → `PrismaLibSql`, `PrismaNeonHTTP` → `PrismaNeonHttp`, `PrismaD1HTTP` → `PrismaD1Http` [source](./.skilld/releases/v7.0.0.md#driver-adapter-naming-updates)

- BREAKING: MongoDB support removed — stay on v6 for MongoDB databases [source](./.skilld/releases/v7.0.0.md#mongodb-support-in-prisma-7)

- BREAKING: Implicit `prisma generate` and `prisma seed` commands removed — must be run explicitly [source](./.skilld/releases/v7.0.0.md#removal-of-implicit-prisma-commands)

- BREAKING: `prisma generate` CLI flags removed: `--data-proxy`, `--accelerate`, `--no-engine`, `--allow-no-models` [source](./.skilld/releases/v7.0.0.md#removal-of-prisma-generate-flags)

### Major Changes from v7.0 → v7.x

- NEW: `comments` option on `new PrismaClient({ comments: [...] })` — adds SQL commenter plugins for observability [source](./.skilld/releases/v7.1.0.md#sql-comments)

- NEW: `@prisma/sqlcommenter-query-tags` package with `queryTags()` and `withQueryTags()` — wrap queries to add metadata tags [source](./.skilld/releases/v7.1.0.md#query-tags)

- NEW: `@prisma/sqlcommenter-trace-context` package with `traceContext()` — adds W3C Trace Context for distributed tracing [source](./.skilld/releases/v7.1.0.md#trace-context)

- NEW: `compilerBuild` option in schema.prisma generator — `compilerBuild = "fast" | "small"` to trade speed vs bundle size [source](./.skilld/releases/v7.3.0.md:L16)

- NEW: Raw queries `$executeRaw` and `$queryRaw` can now bypass query compiler — reduces overhead [source](./.skilld/releases/v7.3.0.md:L29)

- NEW: Query plan caching in Prisma Client — normalized query shapes cache compiled plans to reduce compilation overhead [source](./.skilld/releases/v7.4.0.md#caching-in-prisma-client)

- NEW: Partial indexes (filtered indexes) via preview feature `partialIndexes` — `@@index([email], where: { published: true })` or `raw()` syntax [source](./.skilld/releases/v7.4.0.md#partial-indexes-filtered-indexes-support)

- NEW: Nested transaction rollback support via savepoints — inner transactions rollback when outer transaction fails [source](./.skilld/releases/v7.5.0.md:L20)

- NEW: `prisma postgres link` command — connects local project to Prisma Postgres database [source](./.skilld/releases/v7.6.0.md:L21)

- NEW: `statementNameGenerator` option for `@prisma/adapter-pg` — custom prepared statement name generator [source](./.skilld/releases/v7.6.0.md:L25)

- NEW: Connection string support in adapter constructors — `new PrismaPg({ connectionString })` for adapter-pg [source](./.skilld/releases/v7.6.0.md:L26)

- NEW: `useTextProtocol` option for `@prisma/adapter-mariadb` — toggle text vs binary protocol [source](./.skilld/releases/v7.6.0.md:L27)

- NEW: `prisma bootstrap` command — interactive setup wizard for Prisma Postgres projects [source](./.skilld/releases/v7.7.0.md#prisma-bootstrap-command)

### Mapped Enums and Enum Changes

- NEW: `@map` attribute for enum members in v7.0.0 — `MixplatSMS @map("mixplat/sms")` sets runtime value [source](./.skilld/releases/v7.0.0.md#mapped-enums)

- REVERTED: `@map` enum behavior reverted in v7.3.0 — back to v6.19.0 behavior due to community concerns [source](./.skilld/releases/v7.3.0.md:L38)

### Environment Variables Removed in v7.0.0

The following Prisma-specific environment variables are no longer supported:
- `PRISMA_CLI_QUERY_ENGINE_TYPE`
- `PRISMA_CLIENT_ENGINE_TYPE`
- `PRISMA_QUERY_ENGINE_BINARY`
- `PRISMA_QUERY_ENGINE_LIBRARY`
- `PRISMA_GENERATE_SKIP_AUTOINSTALL`
- `PRISMA_SKIP_POSTINSTALL_GENERATE`
- `PRISMA_GENERATE_IN_POSTINSTALL`
- `PRISMA_GENERATE_DATAPROXY`
- `PRISMA_GENERATE_NO_ENGINE`
- `PRISMA_CLIENT_NO_RETRY`
- `PRISMA_MIGRATE_SKIP_GENERATE`
- `PRISMA_MIGRATE_SKIP_SEED`

[source](./.skilld/releases/v7.0.0.md#miscellaneous)

**Also changed:** `prisma.config.ts` now required for introspection/migration · Data mapper errors surface as user-facing errors · Caching disabled for `createMany` to avoid Node.js crashes in bulk operations · `NowGenerator` lazy evaluation fixes Next.js dynamic usage errors · `Get<Model>GroupByPayload` export added for adapter-pg users
<!-- /skilld:api-changes -->
