# Plan 006: Make `audit:verify` reproduce and verify the persisted chain

> **Executor instructions**: Audit hashes are compatibility-sensitive. Never alter
> historical rows or silently accept malformed entries. Preserve secret minimization.
>
> **Drift check**: `git diff --stat d9a206c6..HEAD -- scripts/audit-verify.ts shared/audit/envelope.ts server/utils/audit/postgres-drain.ts server/database/schema.prisma test/unit/audit`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: `plans/001-enforce-ci-typecheck.md`
- **Category**: bug
- **Planned at**: commit `d9a206c6`, 2026-07-04

## Why this matters

The verifier hashes a partial, differently shaped envelope, then passes an already
canonicalized string back into `hashEnvelope`. It omits `prevHash` and never calls the
existing chain-link verifier. The advertised tamper-evidence check therefore cannot
validate rows written by the production drain.

## Current state

- `scripts/audit-verify.ts:17-37` orders only by timestamp, hardcodes actor type,
  omits target/reason/changes/prevHash, nests tenant incorrectly, and double-canonicalizes.
- `server/utils/audit/postgres-drain.ts:48-68` is the authoritative envelope constructor.
- `shared/audit/envelope.ts:148-165` already exports `verifyChain`.
- `server/database/schema.prisma:227-255` stores envelope columns plus JSON context and head.
- Unit-test pattern: `test/unit/audit/envelope.spec.ts:118-180`.

## Commands you will need

| Purpose          | Command                       | Expected                                             |
| ---------------- | ----------------------------- | ---------------------------------------------------- |
| Audit unit tests | `pnpm test:unit -- audit`     | all pass                                             |
| Typecheck        | `pnpm typecheck`              | exit 0                                               |
| Offline verifier | `pnpm audit:verify`           | exit 0 only against an available valid test/local DB |
| Full gates       | Commands in `plans/README.md` | all pass                                             |

## Scope

**In scope**: `scripts/audit-verify.ts`, a shared persisted-row-to-envelope mapper if
needed, `server/utils/audit/postgres-drain.ts` only to share pure mapping logic, and tests.

**Out of scope**: migrations, rehashing production data, changing SHA-256/canonicalization,
printing sensitive context, or modifying the audit action registry.

## Git workflow

- Branch: `codex/006-audit-verifier`
- Commit: `fix(audit): verify persisted hash chain correctly`

## Steps

### Step 1: Establish one canonical persisted-row mapper

Create a pure typed mapper that reconstructs exactly the envelope hashed by the drain:
actor type/id/display name, optional target, top-level tenant, reason, changes, ISO timestamp,
allow-listed context, and `prevHash`. Reuse it in writer/verifier where practical to prevent drift.

**Verify**: a fixture written through drain mapping rehashes to the same digest.

### Step 2: Follow chain order and verify links

Do not assume timestamp uniqueness. Reconstruct the chain from `prevHash`/head or use a
deterministic traversal that detects multiple roots, forks, missing predecessors, cycles,
or an unreachable stored head. Pass ordered `AuditChainEntry[]` to `verifyChain`.

**Verify**: tests detect tampered payload, broken link, fork, missing row, cycle, and wrong head.

### Step 3: Make CLI output useful and safe

Report row IDs/hashes and reason categories without dumping `changes`, context, credentials,
or PII. Ensure disconnect runs and exit codes are 0 valid / 1 invalid or fatal.

**Verify**: CLI-level tests assert exit/result behavior with mocked Prisma data.

## Test plan

Add focused script tests for empty chain; one row; multiple valid rows sharing timestamps;
each tamper topology above; optional fields; system actors; and context JSON. Model hash
fixtures on `test/unit/audit/postgres-drain.spec.ts`.

## Done criteria

- [ ] Verifier reconstructs every field used by the production hash.
- [ ] It checks hashes, links, topology, and the persisted head.
- [ ] No double-canonicalization remains.
- [ ] Targeted and shared gates pass.

## STOP conditions

- Existing production rows were written using multiple undocumented envelope formats.
- Required hashed data was never persisted, making exact reconstruction impossible.
- Fix appears to require rewriting historical hashes.

## Maintenance notes

Future changes to `AuditEnvelope` or drain projection must update shared mapping and fixtures
in the same PR. Reviewer should test equal timestamps and chain forks explicitly.
