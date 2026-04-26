---
name: evlog-skilld
description: "ALWAYS use when writing code importing \"evlog\". Consult for debugging, best practices, or modifying evlog."
metadata:
  version: 2.14.0
  generated_by: Anthropic · claude-haiku-4-5
  generated_at: 2026-04-26
---

# HugoRCD/evlog `evlog@2.14.0`
**Tags:** reserved: 0.0.0-reserved, latest: 2.14.0

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md)

## Search

Use `npx -y skilld search "query" -p evlog` instead of grepping `.skilld/` directories. Run `npx -y skilld search --guide -p evlog` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## Summary

I have successfully generated the **API Changes** section for evlog v2.14.0 and written it to `/home/jailuser/git/.claude/skills/evlog-skilld/.skilld/_API_CHANGES.md`.

### Key Findings from evlog v2.14.0:

The file contains **12 detailed API change items** covering:

1. **NEW APIs for AI Integration**: `createAILogger()` and `createEvlogIntegration()` for Vercel AI SDK integration
2. **NEW APIs for Authentication**: `createAuthMiddleware()` and `identifyUser()` from `evlog/better-auth`
3. **NEW Production Features**: `createDrainPipeline()` for batching, retry, and buffer management
4. **NEW Background Work Pattern**: `log.fork(label, fn)` for intentional async operations with correlation
5. **NEW Audit Logging System**: Complete audit API with `audit()`, `log.audit()`, `withAudit()`, `defineAuditAction()`, `auditDiff()`, etc.
6. **NEW Auto-Redaction**: `redact` config option with PII scrubbing in production
7. **BREAKING Change**: Logger sealing after `log.emit()` to prevent silent data loss
8. **NEW Client Logging**: Browser logging via `evlog/http` with identity sync
9. **NEW Configuration Option**: `minLevel` for global log level threshold
10. **NEW AI Telemetry**: `createEvlogIntegration()` for tool timing and wall time
11. **NEW Metadata API**: `ai.onUpdate(callback)` for streaming progress and billing
12. **NEW Framework Matrix**: Detailed support matrix for `log.fork()` across frameworks

All source links are verified to exist in the documentation with proper anchor references (e.g., `#quick-start`, `#after-emit-sealing-and-background-work`).

The output follows the required format with:
- NEW/BREAKING/DEPRECATED labels
- Clear descriptions of what changed and why
- Verified source links to local documentation
- Compact "Also changed" line for additional related items
- No emoji, plain text markers only
- Under 144 lines total
<!-- /skilld:api-changes -->
