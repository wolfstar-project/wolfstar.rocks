import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD = "100000000000000009";

// vi.hoisted() ensures globals are present before the route module is evaluated.
const { mocks } = vi.hoisted(() => {
	const mocks = {
		audit: vi.fn(),
		botApiFetch: vi.fn(),
		setResponseStatus: vi.fn(),
		body: {} as unknown,
	};

	const globals = globalThis as Record<string, unknown>;
	globals.defineWrappedResponseHandler = (fn: unknown) => fn;
	globals.readBody = () => Promise.resolve(mocks.body);
	globals.setResponseStatus = mocks.setResponseStatus;
	globals.getCurrentUser = () =>
		Promise.resolve({ user: { id: "300000000000000003", username: "member" } });
	globals.minutes = (n: number) => n;

	return { mocks };
});

vi.mock("h3", async (importOriginal) => ({
	...(await importOriginal<typeof import("h3")>()),
	getRouterParam: (_event: unknown, name: string) =>
		name === "guild" ? "100000000000000009" : "builtin",
}));

vi.mock("#server/utils/bot-api/session", () => ({ botApiFetch: mocks.botApiFetch }));

vi.mock("evlog", async (importOriginal) => ({
	...(await importOriginal<typeof import("evlog")>()),
	useLogger: vi.fn().mockReturnValue({ set: vi.fn(), error: vi.fn() }),
	withAuditMethods: (log: object) => ({ ...log, audit: mocks.audit }),
}));

import type { H3Event } from "h3";
import postHandler from "#server/api/users/appeals/[guild]/[form].post";

const callHandler = postHandler as unknown as (event: H3Event) => Promise<unknown>;

function botRefusal(status: number, error: string) {
	return Object.assign(new Error("refused"), { status, data: { error } });
}

async function refusal(): Promise<{ statusCode: number; data: { code: string } }> {
	try {
		await callHandler({} as H3Event);
	} catch (error) {
		return error as { statusCode: number; data: { code: string } };
	}
	throw new Error("expected the appeal to be refused");
}

describe("POST /api/users/appeals/:guild/:form", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.body = { caseId: 12, answers: { why: "I am sorry." } };
		mocks.botApiFetch.mockResolvedValue({ id: "a1" });
	});

	it("sends the appeal through the bot, answers 201, and audits it on the server", async () => {
		expect(await callHandler({} as H3Event)).toStrictEqual({ id: "a1" });

		expect(mocks.setResponseStatus).toHaveBeenCalledWith(expect.anything(), 201);
		expect(mocks.audit).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({
				action: "guild.settings.update",
				outcome: "success",
				actor: expect.objectContaining({ id: "300000000000000003" }),
				target: { type: "guild", id: GUILD },
			}),
		);
	});

	it.each(["disabled", "blocked", "locked"])(
		"audits a member the bot keeps from appealing (%s) as denied",
		async (code) => {
			mocks.botApiFetch.mockRejectedValue(botRefusal(403, code));

			const error = await refusal();

			expect(error.statusCode).toBe(403);
			expect(error.data.code).toBe(code);
			expect(mocks.audit).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({
					action: "guild.settings.access-denied",
					outcome: "denied",
				}),
			);
		},
	);

	it("audits nothing for an appeal that is refused but not denied", async () => {
		mocks.botApiFetch.mockRejectedValue(botRefusal(409, "appealed"));

		expect((await refusal()).statusCode).toBe(409);
		expect(mocks.audit).not.toHaveBeenCalled();
	});
});
