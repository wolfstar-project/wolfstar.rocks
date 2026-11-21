import type { WolfCommand } from "#shared/types/discord";
import { matchAny } from "#server/database/settings/utils/matchers/command";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function entry(name: string, overrides: Partial<WolfCommand> = {}): WolfCommand {
	return {
		alias: [],
		category: "Moderation",
		description: "",
		extendedHelp: {},
		guarded: false,
		name,
		permissionLevel: 5,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
		subCategory: "General",
		...overrides,
	};
}

describe("matchAny", () => {
	beforeEach(() => {
		// The bot lists each subcommand as an entry of its own, naming its command.
		vi.stubGlobal(
			"fetchCommands",
			vi.fn(async () => [
				entry("ban add", { command: "ban" }),
				entry("ban remove", { command: "ban" }),
				entry("warn-thresholds list", {
					category: "Management",
					command: "warnThresholds",
				}),
				entry("ping", { category: "General", subCategory: "Misc" }),
				entry("settings", { category: "Management", subCategory: "General" }),
			]),
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("matches a node naming the command the subcommands belong to", async () => {
		await expect(matchAny(["ban"], "ban")).resolves.toBe(true);
		await expect(matchAny(["warnThresholds"], "warnThresholds")).resolves.toBe(true);
	});

	it("reads a node on the old conf command as one on settings", async () => {
		await expect(matchAny(["conf"], "settings")).resolves.toBe(true);
		await expect(matchAny(["conf"], "ban")).resolves.toBe(false);
	});

	it("does not match a node naming another command", async () => {
		await expect(matchAny(["kick"], "ban")).resolves.toBe(false);
	});

	it("matches by category and sub-category", async () => {
		await expect(matchAny(["Management.*"], "warnThresholds")).resolves.toBe(true);
		await expect(matchAny(["Moderation.General.ban"], "ban")).resolves.toBe(true);
		await expect(matchAny(["Moderation.*"], "warnThresholds")).resolves.toBe(false);
	});

	it("falls back to the entry's name when an older bot sends no command", async () => {
		await expect(matchAny(["ping"], "ping")).resolves.toBe(true);
		await expect(matchAny(["General.Misc.*"], "ping")).resolves.toBe(true);
	});

	it("matches everything with *", async () => {
		await expect(matchAny(["*"], "anything")).resolves.toBe(true);
	});
});
