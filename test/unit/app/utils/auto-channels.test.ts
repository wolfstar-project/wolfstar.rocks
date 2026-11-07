import { describe, expect, it } from "vitest";
import {
	autoChannelBody,
	autoChannelDraftProblem,
	compactSeconds,
	emptyAutoChannelDraft,
	formatNextRun,
	spellSeconds,
} from "~/utils/auto-channels";

const CHANNEL = "234567890123456789";

describe("spellSeconds", () => {
	it("spells a duration in the largest unit that holds it whole", () => {
		expect(spellSeconds(86_400, "en-US")).toBe("1 day");
		expect(spellSeconds(43_200, "en-US")).toBe("12 hours");
		expect(spellSeconds(90, "en-US")).toBe("90 seconds");
	});
});

describe("compactSeconds", () => {
	it("writes the short form the tables show", () => {
		expect(compactSeconds(604_800, "en-US")).toBe("7d");
		expect(compactSeconds(60, "en-US")).toBe("1m");
	});
});

describe("formatNextRun", () => {
	const now = new Date("2026-10-22T12:00:00Z");

	it("tells how long until the next run", () => {
		expect(formatNextRun("2026-10-22T15:00:00Z", now, "en-US")).toBe("in 3 hours");
		expect(formatNextRun("2026-10-23T12:00:00Z", now, "en-US")).toBe("tomorrow");
	});

	it("says now for a run that is due", () => {
		expect(formatNextRun("2026-10-22T11:59:50Z", now, "en-US")).toBe("now");
	});
});

describe("autoChannelDraftProblem", () => {
	it("asks for a channel first, and one no other row has", () => {
		const draft = emptyAutoChannelDraft();
		expect(autoChannelDraftProblem("autodelete", draft, [])?.key).toBe(
			"guild_settings.auto.errors.channel",
		);
		draft.channelId = CHANNEL;
		expect(autoChannelDraftProblem("autodelete", draft, [CHANNEL])?.key).toBe(
			"guild_settings.auto.errors.channel_taken",
		);
		expect(autoChannelDraftProblem("autodelete", draft, [])).toBeNull();
	});

	it("asks a purge filter for the value it needs", () => {
		const draft = { ...emptyAutoChannelDraft(), channelId: CHANNEL, filter: "user" as const };
		expect(autoChannelDraftProblem("autopurge", draft, [])?.key).toBe(
			"guild_settings.auto.errors.needs_user",
		);
	});

	it("keeps a message from every 10 minutes to every 14 days", () => {
		const draft = {
			...emptyAutoChannelDraft(),
			channelId: CHANNEL,
			content: "Hi",
			interval: 300,
		};
		expect(autoChannelDraftProblem("automessage", draft, [])?.key).toBe(
			"guild_settings.auto.errors.message_interval",
		);
	});
});

describe("autoChannelBody", () => {
	it("sends a purge no value for a filter that needs none", () => {
		const draft = { ...emptyAutoChannelDraft(), filter: "bots" as const, value: "left over" };
		expect(autoChannelBody("autopurge", draft)).toStrictEqual({
			filter: "bots",
			interval: 86_400,
			value: null,
		});
	});
});
