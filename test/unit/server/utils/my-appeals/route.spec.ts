import type { H3Event } from "h3";
import {
	MaximumAppealSubmissionAnswers,
	MaximumAppealSubmissionText,
	parseAppealSubmission,
	readAppealFormParam,
	readAppealGuildParam,
	throwBotRefusal,
} from "#server/utils/my-appeals/route";
import { describe, expect, it } from "vitest";

function failureOf(run: () => unknown) {
	try {
		run();
	} catch (error) {
		return error as { statusCode: number; data: { code: string; errors?: string[] } };
	}
	throw new Error("expected the call to throw");
}

function eventWith(params: Record<string, string>) {
	return { context: { params } } as unknown as H3Event;
}

describe("readAppealGuildParam and readAppealFormParam", () => {
	it("read a server ID, and a form ID or builtin", () => {
		const event = eventWith({ guild: "254360814063058944", form: "builtin" });

		expect(readAppealGuildParam(event)).toBe("254360814063058944");
		expect(readAppealFormParam(event)).toBe("builtin");
		expect(readAppealFormParam(eventWith({ form: "12" }))).toBe("12");
	});

	it("refuse anything else as invalid", () => {
		expect(failureOf(() => readAppealGuildParam(eventWith({ guild: "nope" })))).toMatchObject({
			statusCode: 400,
			data: { code: "invalid" },
		});
		expect(failureOf(() => readAppealFormParam(eventWith({ form: "../x" })))).toMatchObject({
			statusCode: 400,
			data: { code: "invalid" },
		});
	});
});

describe("parseAppealSubmission", () => {
	it("keeps a case and answers made of texts and lists of texts", () => {
		const body = { caseId: 4, answers: { reason: "Sorry", picked: ["a", "b"] } };

		expect(parseAppealSubmission(body)).toStrictEqual({ data: body });
	});

	it.each([
		["no body", null],
		["a case that is not a positive integer", { caseId: 0, answers: {} }],
		["a case sent as text", { caseId: "4", answers: {} }],
		["answers that are not an object", { caseId: 4, answers: ["x"] }],
		["an answer that is a number", { caseId: 4, answers: { reason: 4 } }],
		[
			"an answer too long",
			{ caseId: 4, answers: { reason: "x".repeat(MaximumAppealSubmissionText + 1) } },
		],
		[
			"too many answers",
			{
				caseId: 4,
				answers: Object.fromEntries(
					Array.from({ length: MaximumAppealSubmissionAnswers + 1 }, (_, index) => [
						`q${index}`,
						"x",
					]),
				),
			},
		],
	])("refuses %s", (_name, body) => {
		expect(parseAppealSubmission(body).errors?.length).toBeGreaterThan(0);
	});
});

describe("throwBotRefusal", () => {
	it.each([
		[403, "blocked"],
		[403, "locked"],
		[404, "notAppealable"],
		[400, "invalid"],
		[409, "appealed"],
	])("answers %i with the bot's %s", (status, code) => {
		expect(failureOf(() => throwBotRefusal({ status, data: { error: code } }))).toMatchObject({
			statusCode: status,
			data: { code },
		});
	});

	it("reads the refusal off what ofetch throws, an error and not a plain object", async () => {
		const { FetchError } = await import("ofetch");
		const thrown = Object.assign(new FetchError("[POST] /appeals: 409 Conflict"), {
			status: 409,
			data: { error: "appealed" },
		});

		expect(failureOf(() => throwBotRefusal(thrown))).toMatchObject({
			statusCode: 409,
			data: { code: "appealed" },
		});
	});

	it("reads a code it does not know as generic, and a bare 404 as a server the bot does not know", () => {
		expect(
			failureOf(() => throwBotRefusal({ status: 403, data: { error: "explode" } })),
		).toMatchObject({
			statusCode: 403,
			data: { code: "generic" },
		});
		expect(failureOf(() => throwBotRefusal({ status: 404, data: "Not Found" }))).toMatchObject({
			statusCode: 404,
			data: { code: "notFound" },
		});
	});

	it("answers 502 when the bot failed or could not be reached", () => {
		expect(failureOf(() => throwBotRefusal({ status: 500, data: {} }))).toMatchObject({
			statusCode: 502,
			data: { code: "generic" },
		});
		expect(failureOf(() => throwBotRefusal(new TypeError("fetch failed")))).toMatchObject({
			statusCode: 502,
			data: { code: "generic" },
		});
	});
});
