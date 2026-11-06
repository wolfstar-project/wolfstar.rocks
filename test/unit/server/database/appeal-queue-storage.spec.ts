import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
	sql: vi.fn((_strings: TemplateStringsArray, ...values: unknown[]) => ({
		affectedCount: () => ({ build: () => ({ values }) }),
	})),
}));
vi.mock("#server/database/prisma", () => ({ db: { raw: { sql: database.sql } } }));

import {
	APPEAL_REQUEST_CHANNEL,
	fetchAppealRequest,
	flattenAppealAnswers,
	insertAppealRequest,
	notifyAppealRequest,
} from "#server/database/settings/appeals/queue";

describe("flattenAppealAnswers", () => {
	it("writes each kind of answer as a text to read", () => {
		expect(
			flattenAppealAnswers([
				{ questionId: "why", kind: "text", label: "Why?", value: "My brother." },
				{
					questionId: "rule",
					kind: "choice",
					label: "Which rule?",
					value: ["Spam", "Insults"],
				},
				{
					questionId: "proof",
					kind: "attachment",
					label: "Proof",
					value: [
						{ key: "a", name: "one.png", size: 1, contentType: "image/png" },
						{ key: "b", name: "two.png", size: 2, contentType: "image/png" },
					],
				},
			]),
		).toStrictEqual([
			{ questionId: "why", label: "Why?", value: "My brother." },
			{ questionId: "rule", label: "Which rule?", value: "Spam, Insults" },
			{ questionId: "proof", label: "Proof", value: "one.png, two.png" },
		]);
	});
});

describe("notifyAppealRequest", () => {
	beforeEach(() => vi.clearAllMocks());

	it("announces the ID of the request, alone, on the channel the bot listens on", async () => {
		const execute = vi.fn();

		await notifyAppealRequest({ execute }, "55");

		expect(database.sql).toHaveBeenCalledOnce();
		expect(execute).toHaveBeenCalledExactlyOnceWith({ values: [APPEAL_REQUEST_CHANNEL, "55"] });
		expect(APPEAL_REQUEST_CHANNEL).toBe("appeal_request");
	});
});

describe("the requests", () => {
	it("is written for the bot to run, as the ID of its row", async () => {
		const create = vi.fn().mockResolvedValue({ id: 55n });
		const orm = { public: { AppealRequest: { create } } };

		const id = await insertAppealRequest(orm as never, {
			guildId: "100000000000000000",
			kind: "Deny",
			appealId: "1",
			moderatorId: "100000000000000002",
			reason: null,
		});

		expect(id).toBe("55");
		expect(create).toHaveBeenCalledExactlyOnceWith({
			guildId: 100000000000000000n,
			kind: "Deny",
			appealId: 1n,
			moderatorId: 100000000000000002n,
			reason: null,
		});
	});

	it("is read by its ID, and none for a text that is not one", async () => {
		const first = vi.fn().mockResolvedValue({
			id: 55n,
			guildId: 100000000000000000n,
			processedAt: "2026-11-04 10:03:00.123",
			error: "decided: This appeal was already decided.",
		});
		const orm = { public: { AppealRequest: { first } } };

		expect(await fetchAppealRequest(orm as never, "55")).toStrictEqual({
			id: "55",
			guildId: "100000000000000000",
			processedAt: "2026-11-04T10:03:00.123Z",
			error: "decided: This appeal was already decided.",
		});
		expect(await fetchAppealRequest(orm as never, "abc")).toBeNull();
		expect(first).toHaveBeenCalledOnce();
	});
});
