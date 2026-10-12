import type { FlattenedCommand } from "#shared/types/discord";
import { describe, expect, it } from "vitest";
import { commandPermissionChip, hasCommandChips, isGuildOnlyCommand } from "~/utils/command-chips";

function createCommand(overrides: Partial<FlattenedCommand> = {}): FlattenedCommand {
	return {
		category: "General",
		description: "A command",
		extendedHelp: {},
		guarded: false,
		name: "ping",
		permissionLevel: 0,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
		...overrides,
	};
}

function withPrecondition(name: string): FlattenedCommand["preconditions"] {
	return {
		entries: [{ entries: [{ context: {}, name }], mode: 0, runCondition: 0 }],
		mode: 0,
		runCondition: 0,
	} as unknown as FlattenedCommand["preconditions"];
}

describe("command chips", () => {
	it("names the three permission levels that have a chip", () => {
		expect(commandPermissionChip(createCommand({ permissionLevel: 4 }))).toBe("staff");
		expect(commandPermissionChip(createCommand({ permissionLevel: 5 }))).toBe("moderator");
		expect(commandPermissionChip(createCommand({ permissionLevel: 6 }))).toBe("administrator");
	});

	// A level outside that range renders no chip, so it is not a detail: the
	// panel would otherwise be left with neither a chip nor its fallback note.
	it("has no chip for any other permission level", () => {
		for (const permissionLevel of [0, 1, 3, 7, 10]) {
			const command = createCommand({ permissionLevel });
			expect(commandPermissionChip(command)).toBeNull();
			expect(hasCommandChips(command)).toBe(false);
		}
	});

	it("reads a server-only command from its preconditions", () => {
		const command = createCommand({ preconditions: withPrecondition("GuildOnly") });
		expect(isGuildOnlyCommand(command)).toBe(true);
		expect(hasCommandChips(command)).toBe(true);
		expect(
			isGuildOnlyCommand(createCommand({ preconditions: withPrecondition("Cooldown") })),
		).toBe(false);
	});

	it("counts the guarded chip", () => {
		expect(hasCommandChips(createCommand({ guarded: true }))).toBe(true);
	});
});
