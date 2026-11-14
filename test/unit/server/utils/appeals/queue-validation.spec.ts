import { describe, expect, it, vi } from "vitest";

// The helpers read the request, not the database: what they import is not needed.
vi.mock("#server/utils/guilds/manager", () => ({ useManagedGuild: vi.fn() }));

import { AppealQueueError } from "#server/utils/appeals/queue-error";
import {
	parseAppealDecisionBody,
	parseAppealQueueQuery,
	throwAppealQueueError,
} from "#server/utils/appeals/queue-route";
import { MaximumAppealQueueOffset } from "#shared/schemas/appeal-queue";
import {
	AppealQueuePageSize,
	MaximumAppealDecisionReasonLength,
	MaximumAppealQueueLimit,
	parseAppealFailure,
} from "#shared/utils/appeal-queue";

function dataOf(run: () => unknown) {
	try {
		run();
	} catch (error) {
		return error as { statusCode: number; data: { code: string; errors?: string[] } };
	}
	throw new Error("expected the call to throw");
}

describe("parseAppealQueueQuery", () => {
	it("asks for the first page of every appeal when the query is empty", () => {
		expect(parseAppealQueueQuery({})).toStrictEqual({
			status: "all",
			limit: AppealQueuePageSize,
			offset: 0,
		});
	});

	it("reads a status and a page, whatever the query makes of the numbers", () => {
		expect(
			parseAppealQueueQuery({ status: "pending", limit: "10", offset: "20" }),
		).toStrictEqual({
			status: "pending",
			limit: 10,
			offset: 20,
		});
	});

	it("reads the furthest page it allows", () => {
		expect(parseAppealQueueQuery({ offset: String(MaximumAppealQueueOffset) }).offset).toBe(
			MaximumAppealQueueOffset,
		);
	});

	it("refuses an unknown status, and a page that is too large or negative, with the field", () => {
		for (const query of [
			{ status: "open" },
			{ limit: String(MaximumAppealQueueLimit + 1) },
			{ limit: "0" },
			{ offset: "-1" },
			{ offset: String(MaximumAppealQueueOffset + 1) },
			{ limit: "many" },
		]) {
			const error = dataOf(() => parseAppealQueueQuery(query));

			expect(error.statusCode).toBe(400);
			expect(error.data.code).toBe("invalid");
			expect(error.data.errors).toHaveLength(1);
		}
		expect(dataOf(() => parseAppealQueueQuery({ status: "open" })).data.errors?.[0]).toMatch(
			/^status: /u,
		);
	});
});

describe("parseAppealDecisionBody", () => {
	it("reads a decision, with the reason trimmed or none", () => {
		expect(parseAppealDecisionBody({ decision: "Approve", reason: "  Fair.  " })).toStrictEqual(
			{
				data: { decision: "Approve", reason: "Fair." },
			},
		);
		expect(parseAppealDecisionBody({ decision: "Deny" })).toStrictEqual({
			data: { decision: "Deny", reason: null },
		});
		expect(parseAppealDecisionBody({ decision: "Deny", reason: "   " })).toStrictEqual({
			data: { decision: "Deny", reason: null },
		});
		expect(parseAppealDecisionBody({ decision: "Deny", reason: null })).toStrictEqual({
			data: { decision: "Deny", reason: null },
		});
	});

	it("refuses a decision that is neither", () => {
		for (const decision of ["approve", "Block", undefined, 1]) {
			expect(parseAppealDecisionBody({ decision }).errors).toStrictEqual([
				"decision: Expected Approve or Deny.",
			]);
		}
	});

	it("refuses a reason that is not a text or is too long", () => {
		const message = `reason: Expected a text of at most ${MaximumAppealDecisionReasonLength} characters.`;

		expect(parseAppealDecisionBody({ decision: "Deny", reason: 4 }).errors).toStrictEqual([
			message,
		]);
		expect(
			parseAppealDecisionBody({
				decision: "Deny",
				reason: "x".repeat(MaximumAppealDecisionReasonLength + 1),
			}).errors,
		).toStrictEqual([message]);
		expect(
			parseAppealDecisionBody({
				decision: "Deny",
				reason: "x".repeat(MaximumAppealDecisionReasonLength),
			}).errors,
		).toBeUndefined();
	});

	it("reports every field that is wrong, and a body that is no object", () => {
		expect(parseAppealDecisionBody({ decision: "no", reason: 1 }).errors).toHaveLength(2);
		expect(parseAppealDecisionBody("nope").errors).toStrictEqual(["Invalid body."]);
	});
});

describe("throwAppealQueueError", () => {
	it("answers each code with its status and the code in the body", () => {
		const expected = { decided: 409, invalid: 400, noAccess: 403, unknown: 404 } as const;

		for (const [code, status] of Object.entries(expected)) {
			const error = dataOf(() =>
				throwAppealQueueError(new AppealQueueError(code as keyof typeof expected)),
			);

			expect(error.statusCode).toBe(status);
			expect(error.data.code).toBe(code);
		}
	});

	it("throws anything else as it is", () => {
		expect(() => throwAppealQueueError(new Error("boom"))).toThrow("boom");
	});
});

describe("parseAppealFailure", () => {
	it("splits the code from the sentence the bot wrote", () => {
		expect(parseAppealFailure("decided: This appeal was already decided.")).toStrictEqual({
			code: "decided",
			detail: "This appeal was already decided.",
		});
	});

	it("keeps a colon inside the sentence", () => {
		expect(parseAppealFailure("undoFailed: Could not: undo.")).toStrictEqual({
			code: "undoFailed",
			detail: "Could not: undo.",
		});
	});

	it("reads a code it does not know as a failure, with the whole text as the detail", () => {
		expect(parseAppealFailure("blocked: This user is already blocked.")).toStrictEqual({
			code: "failed",
			detail: "blocked: This user is already blocked.",
		});
	});

	it("reads a text without a code as a failure", () => {
		expect(parseAppealFailure("it broke")).toStrictEqual({
			code: "failed",
			detail: "it broke",
		});
	});

	it("reads a bare known code, with no detail", () => {
		expect(parseAppealFailure("noAccess")).toStrictEqual({ code: "noAccess", detail: "" });
	});
});
