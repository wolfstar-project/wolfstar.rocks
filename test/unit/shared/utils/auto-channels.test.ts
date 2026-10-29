import { describe, expect, it } from "vitest";
import {
	AUTO_DELETE_DELAY,
	AUTO_MESSAGE_INTERVAL,
	AUTO_PURGE_INTERVAL,
	MAXIMUM_AUTO_MESSAGE_LENGTH,
	parseAutoDeleteData,
	parseAutoMessageData,
	parseAutoPurgeData,
} from "../../../../shared/utils/auto-channels";

describe("auto-channel limits", () => {
	// The bot's limits, in its milliseconds, as whole seconds.
	it("keeps the bot's ranges", () => {
		expect(AUTO_DELETE_DELAY).toStrictEqual({ maximum: 86_400, minimum: 0 });
		expect(AUTO_PURGE_INTERVAL).toStrictEqual({ maximum: 1_209_600, minimum: 300 });
		expect(AUTO_MESSAGE_INTERVAL).toStrictEqual({ maximum: 1_209_600, minimum: 600 });
	});
});

describe("parseAutoDeleteData", () => {
	it("takes a delay in seconds and the kinds it keeps, in the bot's order, once each", () => {
		expect(
			parseAutoDeleteData({ allow: ["text", "links", "text"], bots: true, delay: 60 }),
		).toStrictEqual({ data: { allow: ["links", "text"], bots: true, delay: 60 } });
	});

	it.each([
		["a delay past a day", { allow: [], bots: false, delay: 86_401 }],
		["a fraction of a second", { allow: [], bots: false, delay: 1.5 }],
		["a kind the bot does not keep", { allow: ["stickers"], bots: false, delay: 0 }],
		["no bots switch", { allow: [], delay: 0 }],
	])("refuses %s", (_case, body) => {
		expect(parseAutoDeleteData(body).errors).toHaveLength(1);
	});
});

describe("parseAutoPurgeData", () => {
	it("takes no value for a filter that needs none", () => {
		expect(parseAutoPurgeData({ filter: "bots", interval: 86_400 })).toStrictEqual({
			data: { filter: "bots", interval: 86_400, value: null },
		});
	});

	it("reads a user from a mention, as the bot's command does", () => {
		expect(
			parseAutoPurgeData({ filter: "user", interval: 300, value: "<@!123456789012345678>" })
				.data?.value,
		).toBe("123456789012345678");
	});

	it("trims the text a filter looks for", () => {
		expect(
			parseAutoPurgeData({ filter: "contains", interval: 300, value: "  discord.gg/  " }).data
				?.value,
		).toBe("discord.gg/");
	});

	it.each([
		["an interval under 5 minutes", { filter: "any", interval: 299 }],
		["an interval past 14 days", { filter: "any", interval: 1_209_601 }],
		["a filter the bot does not know", { filter: "everything", interval: 300 }],
		["a value for a filter that takes none", { filter: "any", interval: 300, value: "x" }],
		["a text filter with no text", { filter: "startsWith", interval: 300, value: "  " }],
		[
			"a text past 100 characters",
			{ filter: "endsWith", interval: 300, value: "x".repeat(101) },
		],
		["a user that is no ID", { filter: "user", interval: 300, value: "@somebody" }],
	])("refuses %s", (_case, body) => {
		expect(parseAutoPurgeData(body).errors).toHaveLength(1);
	});
});

describe("parseAutoMessageData", () => {
	it("takes the message, its interval and whether its mentions ping", () => {
		expect(
			parseAutoMessageData({ content: "Read #rules", interval: 3600, mentions: false }),
		).toStrictEqual({ data: { content: "Read #rules", interval: 3600, mentions: false } });
	});

	it.each([
		["a blank message", { content: "   ", interval: 3600, mentions: false }],
		[
			"a message past Discord's length",
			{
				content: "x".repeat(MAXIMUM_AUTO_MESSAGE_LENGTH + 1),
				interval: 3600,
				mentions: false,
			},
		],
		["an interval under 10 minutes", { content: "Hi", interval: 599, mentions: false }],
		["no mentions switch", { content: "Hi", interval: 3600 }],
	])("refuses %s", (_case, body) => {
		expect(parseAutoMessageData(body).errors).toHaveLength(1);
	});
});
