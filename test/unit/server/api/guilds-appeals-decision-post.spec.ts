import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD = "100000000000000009";

// vi.hoisted() ensures globals are present before the route module is evaluated.
const { mocks } = vi.hoisted(() => {
	const mocks = {
		audit: vi.fn(),
		requestAppealDecision: vi.fn(),
		setResponseStatus: vi.fn(),
		body: {} as unknown,
	};

	const globals = globalThis as Record<string, unknown>;
	globals.defineWrappedResponseHandler = (fn: unknown) => fn;
	globals.getRouterParam = () => "appeal-1";
	globals.readBody = () => Promise.resolve(mocks.body);
	globals.setResponseStatus = mocks.setResponseStatus;
	globals.seconds = (n: number) => n;

	return { mocks };
});

vi.mock("#server/utils/appeals/route", () => ({
	authorizeAppealFormManager: vi.fn(),
}));
vi.mock("#server/utils/guilds/manager", () => ({
	useManagedGuild: () => ({
		guild: { id: "100000000000000009" },
		member: { user: { id: "user-1", username: "alice" } },
	}),
}));

vi.mock("#server/utils/appeals/queue", () => ({
	requestAppealDecision: mocks.requestAppealDecision,
}));

vi.mock("evlog", async (importOriginal) => ({
	...(await importOriginal<typeof import("evlog")>()),
	useLogger: vi.fn().mockReturnValue({ set: vi.fn(), error: vi.fn() }),
	withAuditMethods: (log: object) => ({ ...log, audit: mocks.audit }),
}));

import type { H3Event } from "h3";
import postHandler from "#server/api/guilds/[guild]/appeals/[appeal]/decision.post";
import { AppealQueueError } from "#server/utils/appeals/queue-error";

const callHandler = postHandler as unknown as (event: H3Event) => Promise<unknown>;

async function refusal(): Promise<{ statusCode: number; data: { code: string } }> {
	try {
		await callHandler({} as H3Event);
	} catch (error) {
		return error as { statusCode: number; data: { code: string } };
	}
	throw new Error("expected the request to be refused");
}

describe("POST /api/guilds/:guild/appeals/:appeal/decision", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.body = { decision: "Approve", reason: "Fair." };
		mocks.requestAppealDecision.mockResolvedValue({ requestId: "9", caseId: 42 });
	});

	it("asks the bot, answers 202 with the request, and audits that it was asked", async () => {
		expect(await callHandler({} as H3Event)).toStrictEqual({ requestId: "9" });

		expect(mocks.setResponseStatus).toHaveBeenCalledWith(expect.anything(), 202);
		expect(mocks.audit).toHaveBeenCalledOnce();
		expect(mocks.audit).toHaveBeenCalledWith(
			expect.objectContaining({ action: "guild.settings.update", outcome: "success" }),
		);
	});

	it("audits a manager who does not review the appeals as denied, and answers 403", async () => {
		mocks.requestAppealDecision.mockRejectedValue(new AppealQueueError("noAccess"));

		const error = await refusal();

		expect(error.statusCode).toBe(403);
		expect(error.data.code).toBe("noAccess");
		expect(mocks.audit).toHaveBeenCalledOnce();
		expect(mocks.audit).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "guild.settings.access-denied",
				actor: expect.objectContaining({ id: "user-1" }),
				target: { type: "guild", id: GUILD },
				outcome: "denied",
			}),
		);
	});

	it("audits nothing for an appeal that was decided already, or is not the guild's", async () => {
		for (const [code, status] of [
			["decided", 409],
			["unknown", 404],
		] as const) {
			mocks.requestAppealDecision.mockRejectedValueOnce(new AppealQueueError(code));

			expect((await refusal()).statusCode).toBe(status);
		}
		expect(mocks.audit).not.toHaveBeenCalled();
	});
});
