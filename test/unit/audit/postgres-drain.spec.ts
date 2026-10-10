import type { DrainContext } from "evlog";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockTx {
	execute: ReturnType<typeof vi.fn>;
	orm: {
		public: {
			AuditChainHead: { first: ReturnType<typeof vi.fn>; upsert: ReturnType<typeof vi.fn> };
			AuditEvent: { first: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
		};
	};
}

// Mock the ORM 8 client before the module under test is imported
vi.mock("#server/database/prisma", () => ({
	db: {
		transaction: vi.fn(),
		raw: {
			// The drain only builds one raw plan: the advisory lock.
			sql: (strings: TemplateStringsArray, ...params: unknown[]) => ({
				affectedCount: () => ({ build: () => ({ sql: strings.join("?"), params }) }),
			}),
		},
	},
}));

import { db } from "#server/database/prisma";
import { createPostgresAuditDrain } from "#server/utils/audit/postgres-drain";
import { hashEnvelope } from "#shared/audit/envelope";
import { envelopeFromPersistedRow } from "#shared/audit/persisted";

const transaction = vi.mocked(db.transaction) as unknown as ReturnType<typeof vi.fn>;

function createMockTx(): MockTx {
	return {
		execute: vi.fn().mockResolvedValue(0),
		orm: {
			public: {
				AuditChainHead: {
					first: vi.fn().mockResolvedValue(null),
					upsert: vi.fn().mockResolvedValue({}),
				},
				AuditEvent: {
					first: vi.fn().mockResolvedValue(null),
					create: vi.fn().mockResolvedValue({}),
				},
			},
		},
	};
}

const ACTOR_ID = "111111111111111111";
const GUILD_ID = "222222222222222222";

function makeCtx(auditOverrides: object = {}): DrainContext {
	return {
		event: {
			timestamp: "2026-01-01T00:00:00.000Z",
			level: "info",
			audit: {
				action: "guild.settings.update",
				actor: { type: "user", id: ACTOR_ID },
				target: { type: "guild", id: GUILD_ID },
				outcome: "success",
				context: { requestId: "req-1", traceId: "trace-1", userAgent: "TestAgent" },
				...auditOverrides,
			},
		},
	} as DrainContext;
}

describe("createPostgresAuditDrain", () => {
	let drain: ReturnType<typeof createPostgresAuditDrain>;
	let tx: MockTx;

	function createdRow(): Record<string, unknown> {
		const row = tx.orm.public.AuditEvent.create.mock.calls[0]?.[0] as
			| Record<string, unknown>
			| undefined;
		expect(row).toBeDefined();
		return row!;
	}

	beforeEach(() => {
		vi.clearAllMocks();
		drain = createPostgresAuditDrain();
		tx = createMockTx();
		transaction.mockImplementation(async (fn: (tx: MockTx) => Promise<void>) => fn(tx));
	});

	it("returns immediately when ctx.event.audit is absent", async () => {
		const ctx = {
			event: { timestamp: "2026-01-01T00:00:00.000Z", level: "info" },
		} as DrainContext;
		await drain(ctx);
		expect(transaction).not.toHaveBeenCalled();
	});

	it("appends inside one transaction, under the chain lock", async () => {
		await drain(makeCtx());

		expect(transaction).toHaveBeenCalledOnce();
		// The lock the bot's AuditLogManager takes too: 0x4155444C, ASCII "AUDL".
		expect(tx.execute).toHaveBeenCalledOnce();
		expect(tx.execute.mock.calls[0]?.[0]).toMatchObject({
			sql: expect.stringContaining("pg_advisory_xact_lock"),
			params: [1_096_107_084],
		});
		// The lock is taken before the head is read, or two writers could chain
		// from the same previous hash.
		const lockOrder = tx.execute.mock.invocationCallOrder[0]!;
		const headOrder = tx.orm.public.AuditChainHead.first.mock.invocationCallOrder[0]!;
		expect(lockOrder).toBeLessThan(headOrder);
	});

	it("never includes email, ip, or cookie in the create payload", async () => {
		await drain(
			makeCtx({
				context: {
					requestId: "req-1",
					email: "user@example.com",
					ip: "127.0.0.1",
					cookie: "session=abc",
				},
			}),
		);

		const serialized = JSON.stringify(createdRow(), (_key, value: unknown) =>
			typeof value === "bigint" ? value.toString() : value,
		);
		// Value-level checks
		expect(serialized).not.toContain("user@example.com");
		expect(serialized).not.toContain("127.0.0.1");
		expect(serialized).not.toContain("session=abc");
		// Key-level checks — ensure the property names themselves are not leaked
		expect(serialized).not.toContain('"email"');
		expect(serialized).not.toContain('"ip"');
		expect(serialized).not.toContain('"cookie"');
	});

	it("stores ids as BIGINT and hashes them as the strings the envelope carries", async () => {
		await drain(
			makeCtx({
				context: {
					requestId: "req-1",
					traceId: "trace-1",
					userAgent: "TestAgent",
					tenantId: GUILD_ID,
				},
			}),
		);

		const row = createdRow();
		expect(row.actorId).toBe(BigInt(ACTOR_ID));
		expect(row.targetId).toBe(BigInt(GUILD_ID));
		expect(row.tenantId).toBe(BigInt(GUILD_ID));
		expect(row.hash).toBe(
			hashEnvelope({
				action: "guild.settings.update",
				outcome: "success",
				actor: { type: "user", id: ACTOR_ID },
				target: { type: "guild", id: GUILD_ID },
				tenantId: GUILD_ID,
				reason: undefined,
				changes: null,
				timestamp: "2026-01-01T00:00:00.000Z",
				context: { requestId: "req-1", traceId: "trace-1", userAgent: "TestAgent" },
				prevHash: null,
			}),
		);
	});

	it("chains from the stored head and advances it", async () => {
		tx.orm.public.AuditChainHead.first.mockResolvedValue({
			id: "default",
			hash: "a".repeat(64),
		});

		await drain(makeCtx());

		const row = createdRow();
		expect(row.prevHash).toBe("a".repeat(64));
		expect(tx.orm.public.AuditChainHead.upsert).toHaveBeenCalledWith({
			create: { id: "default", hash: row.hash, updatedAt: "2026-01-01T00:00:00.000Z" },
			update: { hash: row.hash, updatedAt: "2026-01-01T00:00:00.000Z" },
		});
	});

	it("does not store the same event twice", async () => {
		tx.orm.public.AuditEvent.first.mockResolvedValue({ hash: "already-there" });

		await expect(drain(makeCtx())).resolves.toBeUndefined();

		expect(tx.orm.public.AuditEvent.create).not.toHaveBeenCalled();
		expect(tx.orm.public.AuditChainHead.upsert).not.toHaveBeenCalled();
	});

	it("refuses an id the BIGINT columns cannot hold, before opening a transaction", async () => {
		await expect(
			drain(makeCtx({ actor: { type: "system", id: "oauth-flow" } })),
		).rejects.toThrow(/not a snowflake/);
		expect(transaction).not.toHaveBeenCalled();
	});

	it("writes rows that the persisted-row mapper rehashes to the same digest (writer/verifier anti-drift)", async () => {
		await drain(
			makeCtx({
				actor: { type: "user", id: ACTOR_ID, displayName: "Tester" },
				reason: "settings edit",
				changes: { before: { language: "en-US" }, after: { language: "fr-FR" } },
			}),
		);

		const row = createdRow();
		const snowflake = (value: unknown) => (value === null ? null : String(value));

		// What `scripts/audit-verify.ts` rebuilds from the stored columns.
		const recomputed = hashEnvelope(
			envelopeFromPersistedRow({
				action: row.action as string,
				actorType: row.actorType as string,
				actorId: String(row.actorId),
				actorName: row.actorName as string | null,
				targetType: row.targetType as string | null,
				targetId: snowflake(row.targetId),
				outcome: row.outcome as string,
				tenantId: snowflake(row.tenantId),
				reason: row.reason as string | null,
				timestamp: new Date(row.timestamp as string),
				changes: row.changes,
				context: row.context,
				prevHash: row.prevHash as string | null,
				hash: row.hash as string,
			}),
		);

		expect(recomputed).toBe(row.hash);
	});

	it("propagates a failed transaction instead of swallowing it", async () => {
		transaction.mockRejectedValue(new Error("connection reset"));

		await expect(drain(makeCtx())).rejects.toThrow("connection reset");
	});
});
