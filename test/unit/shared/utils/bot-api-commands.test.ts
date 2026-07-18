import type { BotApiCommand } from "#shared/types/bot-api";
import { normalizeBotCommand, normalizeBotCommands } from "#shared/utils/bot-api-commands";
import { describe, expect, it } from "vitest";

const sampleBotCommand: BotApiCommand = {
	alias: ["vk", "vkick"],
	category: "Moderation",
	description: "Kick a user from voice",
	extendedHelp: {
		usages: ["User"],
		examples: ["@Pete"],
	},
	guarded: false,
	name: "voicekick",
	permissionLevel: 5,
	preconditions: {
		entries: [],
		mode: 0,
		runCondition: 0,
	},
	subCategory: null,
};

describe("normalizeBotCommand", () => {
	it("maps bot API alias to dashboard aliases and coerces null subCategory", () => {
		expect(normalizeBotCommand(sampleBotCommand)).toStrictEqual({
			aliases: ["vk", "vkick"],
			category: "Moderation",
			description: "Kick a user from voice",
			extendedHelp: {
				usages: ["User"],
				examples: ["@Pete"],
			},
			guarded: false,
			name: "voicekick",
			permissionLevel: 5,
			preconditions: {
				entries: [],
				mode: 0,
				runCondition: 0,
			},
			subCategory: "",
		});
	});

	it("defaults missing alias to an empty array", () => {
		const { alias: _alias, ...withoutAlias } = sampleBotCommand;
		expect(normalizeBotCommand(withoutAlias).aliases).toStrictEqual([]);
	});

	it("falls back to aliases when alias is absent", () => {
		const { alias: _alias, ...withoutAlias } = sampleBotCommand;
		expect(normalizeBotCommand({ ...withoutAlias, aliases: ["legacy"] }).aliases).toStrictEqual(
			["legacy"],
		);
	});

	it("preserves a non-null subCategory", () => {
		expect(normalizeBotCommand({ ...sampleBotCommand, subCategory: "Voice" }).subCategory).toBe(
			"Voice",
		);
	});
});

describe("normalizeBotCommands", () => {
	it("normalizes each command in the list", () => {
		const result = normalizeBotCommands([sampleBotCommand]);
		expect(result).toHaveLength(1);
		expect(result[0]?.aliases).toStrictEqual(["vk", "vkick"]);
		expect(result[0]?.subCategory).toBe("");
	});
});
