import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted() ensures globals are present before the route module is evaluated.
const { mockAudit, mockFirst, mockUpsert, mockBody } = vi.hoisted(() => {
	const mockAudit = vi.fn();
	const mockFirst = vi.fn();
	const mockUpsert = vi.fn().mockResolvedValue(undefined);
	const mockBody = { report: false };

	(globalThis as Record<string, unknown>).defineWrappedResponseHandler = (fn: unknown) => fn;
	(globalThis as Record<string, unknown>).readValidatedBody = (
		_event: unknown,
		validate: (body: unknown) => unknown,
	) => Promise.resolve(validate(mockBody));
	(globalThis as Record<string, unknown>).getCurrentUser = vi
		.fn()
		.mockResolvedValue({ user: { id: "123456789012345678", username: "alice" } });
	(globalThis as Record<string, unknown>).seconds = (n: number) => n;

	return { mockAudit, mockFirst, mockUpsert, mockBody };
});

vi.mock("#server/database/prisma", () => ({
	db: { orm: { public: { User: { first: mockFirst, upsert: mockUpsert } } } },
}));

vi.mock("evlog", async (importOriginal) => ({
	...(await importOriginal<typeof import("evlog")>()),
	useLogger: vi.fn().mockReturnValue({ set: vi.fn(), error: vi.fn() }),
	withAuditMethods: (log: object) => ({ ...log, audit: mockAudit }),
}));

import type { H3Event } from "h3";
import settingsPatchHandler from "#server/api/users/settings.patch";

const callHandler = settingsPatchHandler as unknown as (event: H3Event) => Promise<unknown>;

describe("users/settings.patch - audit", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockBody.report = false;
	});

	it("records the change with the value it replaced", async () => {
		mockFirst.mockResolvedValue({ report: true });

		await expect(callHandler({} as H3Event)).resolves.toEqual({ report: false });

		expect(mockUpsert).toHaveBeenCalledOnce();
		expect(mockAudit).toHaveBeenCalledOnce();
		expect(mockAudit).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "user.settings.update",
				actor: { type: "user", id: "123456789012345678", displayName: "alice" },
				target: { type: "user", id: "123456789012345678" },
				outcome: "success",
				changes: {
					v: 2,
					patch: [{ op: "replace", path: "/report", value: false, from: true }],
				},
			}),
		);
	});

	it("reads a user without a row as the default on the first change", async () => {
		mockFirst.mockResolvedValue(null);

		await callHandler({} as H3Event);

		expect(mockAudit).toHaveBeenCalledWith(
			expect.objectContaining({
				changes: {
					v: 2,
					patch: [{ op: "replace", path: "/report", value: false, from: true }],
				},
			}),
		);
	});
});
