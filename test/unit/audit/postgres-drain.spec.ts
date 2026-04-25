import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database modules before any module under test is imported
vi.mock("#server/database/prisma", () => {
	const mockTx = {
		auditChainHead: {
			upsert: vi
				.fn<() => Promise<{ id: string; hash: string | null }>>()
				.mockResolvedValue({ id: "default", hash: null }),
			update: vi.fn<() => Promise<object>>().mockResolvedValue({}),
		},
		auditEvent: {
			create: vi.fn<() => Promise<object>>().mockResolvedValue({}),
		},
	};
	return {
		default: {
			$transaction: vi
				.fn<(fn: (tx: typeof mockTx) => Promise<void>) => Promise<void>>()
				.mockImplementation(async (fn) => fn(mockTx)),
			_mockTx: mockTx,
		},
	};
});

vi.mock("#server/database/generated/client", () => ({
	Prisma: {
		TransactionIsolationLevel: { Serializable: "Serializable" },
		PrismaClientKnownRequestError: class extends Error {
			code: string;
			constructor(message: string, { code }: { code: string }) {
				super(message);
				this.code = code;
			}
		},
	},
}));

import type { DrainContext } from "evlog";
import { Prisma } from "#server/database/generated/client";
import prismaDefault from "#server/database/prisma";
import { createPostgresAuditDrain } from "#server/utils/audit/postgres-drain";
import { hashEnvelope } from "#shared/audit/envelope";

const prisma = prismaDefault as typeof prismaDefault & { _mockTx: ReturnType<typeof getMockTx> };

function getMockTx() {
	return {
		auditChainHead: {
			upsert: vi
				.fn<() => Promise<{ id: string; hash: string | null }>>()
				.mockResolvedValue({ id: "default", hash: null }),
			update: vi.fn<() => Promise<object>>().mockResolvedValue({}),
		},
		auditEvent: {
			create: vi
				.fn<(args: { data: Record<string, unknown> }) => Promise<object>>()
				.mockResolvedValue({}),
		},
	};
}

function makeCtx(auditOverrides: object = {}): DrainContext {
	return {
		event: {
			timestamp: "2026-01-01T00:00:00.000Z",
			level: "info",
			audit: {
				action: "guild.settings.update",
				actor: { type: "user", id: "111" },
				target: { type: "guild", id: "222" },
				outcome: "success",
				context: { requestId: "req-1", traceId: "trace-1", userAgent: "TestAgent" },
				...auditOverrides,
			},
		},
	} as DrainContext;
}

describe("createPostgresAuditDrain", () => {
	let drain: ReturnType<typeof createPostgresAuditDrain>;
	let mockTx: ReturnType<typeof getMockTx>;

	beforeEach(() => {
		drain = createPostgresAuditDrain();
		mockTx = getMockTx();
		vi.mocked(prisma.$transaction).mockImplementation(
			async (fn: (tx: typeof mockTx) => Promise<void>) => fn(mockTx),
		);
	});

	it("returns immediately when ctx.event.audit is absent", async () => {
		const ctx = {
			event: { timestamp: "2026-01-01T00:00:00.000Z", level: "info" },
		} as DrainContext;
		await drain(ctx);
		expect(prisma.$transaction).not.toHaveBeenCalled();
	});

	it("calls prisma.$transaction when audit is present", async () => {
		await drain(makeCtx());
		expect(prisma.$transaction).toHaveBeenCalledOnce();
	});

	it("never includes email, ip, or cookie in the create payload", async () => {
		const ctx = makeCtx({
			context: {
				requestId: "req-1",
				email: "user@example.com",
				ip: "127.0.0.1",
				cookie: "session=abc",
			},
		});
		await drain(ctx);
		const createCall = mockTx.auditEvent.create.mock.calls[0]?.[0]?.data;
		expect(createCall).toBeDefined();
		const serialized = JSON.stringify(createCall);
		expect(serialized).not.toContain("user@example.com");
		expect(serialized).not.toContain("127.0.0.1");
		expect(serialized).not.toContain("session=abc");
	});

	it("the written hash matches hashEnvelope output for the same input", async () => {
		const ctx = makeCtx();
		const capturedData: Record<string, unknown>[] = [];
		mockTx.auditEvent.create.mockImplementation(
			({ data }: { data: Record<string, unknown> }) => {
				capturedData.push(data);
				return Promise.resolve({});
			},
		);

		await drain(ctx);

		expect(capturedData).toHaveLength(1);
		const data = capturedData[0]!;
		expect(typeof data.hash).toBe("string");
		expect(data.hash as string).toHaveLength(64);
		// Verify the hash matches the recomputed value
		const envelope = {
			action: "guild.settings.update",
			outcome: "success",
			actor: { type: "user", id: "111" },
			target: { type: "guild", id: "222" },
			tenantId: undefined,
			reason: undefined,
			changes: null,
			timestamp: "2026-01-01T00:00:00.000Z",
			context: { requestId: "req-1", traceId: "trace-1", userAgent: "TestAgent" },
			prevHash: null,
		};
		expect(data.hash).toBe(hashEnvelope(envelope as Parameters<typeof hashEnvelope>[0]));
	});

	it("swallows P2002 unique constraint errors (idempotent retry)", async () => {
		const p2002 = new Prisma.PrismaClientKnownRequestError("Unique constraint", {
			code: "P2002",
		});
		mockTx.auditEvent.create.mockRejectedValue(p2002);

		await expect(drain(makeCtx())).resolves.not.toThrow();
		expect(mockTx.auditEvent.create).toHaveBeenCalled();
	});

	it("retries on P2034 serialization failure and eventually throws after exhaustion", async () => {
		const p2034 = new Prisma.PrismaClientKnownRequestError("Serialization failure", {
			code: "P2034",
		});
		vi.mocked(prisma.$transaction).mockRejectedValue(p2034);

		await expect(drain(makeCtx())).rejects.toThrow();
		// Drain documents 5 attempts (MAX_RETRIES). Adjust if the constant changes.
		expect(prisma.$transaction).toHaveBeenCalledTimes(5);
	}, 10_000);
});
