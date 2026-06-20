import { beforeEach, describe, expect, it, vi } from "vitest";

const { PrismaClient, PrismaPg } = vi.hoisted(() => {
	const PrismaClient = vi.fn(function PrismaClientMock(this: { label: string }) {
		this.label = "client";
	});
	const PrismaPg = vi.fn(function PrismaPgMock() {
		return { adapter: true };
	});
	return { PrismaClient, PrismaPg };
});

vi.mock("#server/database/generated/client", () => ({
	PrismaClient,
}));

vi.mock("@prisma/adapter-pg", () => ({
	PrismaPg,
}));

describe("server/database/prisma", () => {
	beforeEach(() => {
		vi.resetModules();
		PrismaClient.mockClear();
		PrismaPg.mockClear();
		delete (globalThis as { prisma?: unknown }).prisma;
		process.env.DATABASE_URL = "postgres://example.com/db";
		delete process.env.DATABASE_POOL_MAX;
	});

	it("reuses the same Prisma client from globalThis", async () => {
		const first = await import("#server/database/prisma");
		const second = await import("#server/database/prisma");

		// Access a property so the lazy proxy initializes the client.
		void first.default.guild;
		void second.default.guild;

		expect(first.default).toBe(second.default);
		expect(PrismaClient).toHaveBeenCalledOnce();
	});

	it("limits the pg pool to one connection outside development", async () => {
		vi.doMock("std-env", () => ({ isDevelopment: false }));

		const { default: prismaClient } = await import("#server/database/prisma");
		void prismaClient.guild;

		expect(PrismaPg).toHaveBeenCalledWith({
			connectionString: "postgres://example.com/db",
			max: 1,
			idleTimeoutMillis: 5_000,
			connectionTimeoutMillis: 5_000,
		});
	});

	it("allows DATABASE_POOL_MAX to override the default pool size", async () => {
		vi.doMock("std-env", () => ({ isDevelopment: false }));
		process.env.DATABASE_POOL_MAX = "3";

		const { default: prismaClient } = await import("#server/database/prisma");
		void prismaClient.guild;

		expect(PrismaPg).toHaveBeenCalledWith(
			expect.objectContaining({
				max: 3,
			}),
		);
	});
});
