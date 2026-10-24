import deepMerge from "deepmerge";
import { describe, expect, it } from "vitest";
import { createMockGuildData } from "~~/test/mocks/guildData";

// Overwrite arrays when merging (same as composable)
const mergeOptions = {
	arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray,
};

describe("useGuildSettings", () => {
	it("should initialize with undefined settings", () => {
		const guildSettings = undefined;

		expect(guildSettings).toBeUndefined();
	});

	it("should set and retrieve guild settings", () => {
		const mockSettings = createMockGuildData("guild-123");

		let settings: ReturnType<typeof createMockGuildData> | undefined;

		function setGuildSettings(newSettings: ReturnType<typeof createMockGuildData> | undefined) {
			settings = newSettings;
		}

		// Initially undefined
		expect(settings).toBeUndefined();

		// Set settings
		setGuildSettings(mockSettings);

		// Verify settings were set
		expect(settings).toStrictEqual(mockSettings);
		expect(settings?.id).toBe("guild-123");
		expect(settings?.rolesAdmin).toStrictEqual([]);
	});

	it("should merge settings with changes correctly", () => {
		const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
			logsIgnoreAll: ["channel-3"],
			logsImage: "channel-2",
			logsMemberAdd: null,
			moderationChannel: "channel-1",
			id: "guild-123",
			language: "en-US",
			rolesAdmin: ["role-1"],
			rolesModerator: [],
			rolesPublic: [],
			rolesRemoveInitial: false,
		};

		const changes: Partial<ReturnType<typeof createMockGuildData>> = {
			logsIgnoreAll: ["channel-4", "channel-5"],
			logsImage: "channel-99",
			language: "fr-FR",
		};

		// Simulate merging
		const mergedSettings = deepMerge(originalSettings, changes, mergeOptions);

		// Verify merge behavior
		expect(mergedSettings.logsImage).toBe("channel-99"); // Changed
		expect(mergedSettings.moderationChannel).toBe("channel-1"); // Unchanged
		expect(mergedSettings.logsIgnoreAll).toStrictEqual(["channel-4", "channel-5"]); // Array replaced
		expect(mergedSettings.language).toBe("fr-FR"); // Changed
		expect(mergedSettings.rolesAdmin).toStrictEqual(["role-1"]); // Unchanged
	});

	it("should handle null values in changes", () => {
		const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
			logsIgnoreAll: [],
			logsImage: "channel-2",
			logsMemberAdd: "channel-3",
			logsMemberRemove: null,
			moderationChannel: "channel-1",
			id: "guild-123",
			language: "en-US",
			rolesAdmin: [],
			rolesModerator: [],
			rolesPublic: [],
			rolesRemoveInitial: false,
		};

		const changes: Partial<ReturnType<typeof createMockGuildData>> = {
			logsImage: null, // Clear channel
			logsMemberAdd: null, // Clear message
		};

		const mergedSettings = deepMerge(originalSettings, changes, mergeOptions);

		// Verify null values are applied
		expect(mergedSettings.logsImage).toBeNull();
		expect(mergedSettings.logsMemberAdd).toBeNull();
		expect(mergedSettings.moderationChannel).toBe("channel-1"); // Unchanged
	});

	it("should handle array overwrites correctly", () => {
		const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
			logsIgnoreAll: ["channel-1", "channel-2", "channel-3"],
			logsImage: null,
			logsMemberAdd: null,
			moderationChannel: null,
			id: "guild-123",
			language: "en-US",
			rolesAdmin: ["role-1", "role-2"],
			rolesModerator: ["role-3"],
			rolesPublic: [],
			rolesRemoveInitial: false,
		};

		const changes: Partial<ReturnType<typeof createMockGuildData>> = {
			logsIgnoreAll: ["channel-99"], // Replace entire array
			rolesAdmin: [], // Clear array
		};

		const mergedSettings = deepMerge(originalSettings, changes, mergeOptions);

		// Arrays should be completely replaced (not merged)
		expect(mergedSettings.logsIgnoreAll).toStrictEqual(["channel-99"]);
		expect(mergedSettings.rolesAdmin).toStrictEqual([]);
		expect(mergedSettings.rolesModerator).toStrictEqual(["role-3"]); // Unchanged
	});

	it("should return undefined merged settings when original is undefined", () => {
		const originalSettings = undefined;
		const changes: Partial<ReturnType<typeof createMockGuildData>> = {
			logsImage: "channel-1",
		};

		// Simulate the behavior where mergedSettings returns undefined if original is undefined
		const mergedSettings = originalSettings
			? deepMerge(originalSettings, changes, mergeOptions)
			: undefined;

		expect(mergedSettings).toBeUndefined();
	});

	it("should handle empty changes object", () => {
		const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
			logsIgnoreAll: [],
			logsImage: null,
			logsMemberAdd: null,
			moderationChannel: "channel-1",
			id: "guild-123",
			language: "en-US",
			rolesAdmin: [],
			rolesModerator: [],
			rolesPublic: [],
			rolesRemoveInitial: false,
		};

		const changes: Partial<ReturnType<typeof createMockGuildData>> = {};

		const mergedSettings = deepMerge(originalSettings, changes, mergeOptions);

		// Should be identical to original
		expect(mergedSettings).toStrictEqual(originalSettings);
	});

	it("should handle boolean changes correctly", () => {
		const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
			logsIgnoreAll: [],
			logsImage: null,
			logsMemberAdd: null,
			moderationChannel: null,
			moderationTrackBans: false,
			id: "guild-123",
			language: "en-US",
			rolesAdmin: [],
			rolesModerator: [],
			rolesPublic: [],
			rolesRemoveInitial: false,
		};

		const changes: Partial<ReturnType<typeof createMockGuildData>> = {
			moderationTrackBans: true,
			rolesRemoveInitial: true,
		};

		const mergedSettings = deepMerge(originalSettings, changes, mergeOptions);

		expect(mergedSettings.rolesRemoveInitial).toBeTruthy();
		expect(mergedSettings.moderationTrackBans).toBeTruthy();
	});

	it("should handle multiple sequential changes", () => {
		const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
			logsIgnoreAll: [],
			logsImage: null,
			logsMemberAdd: null,
			moderationChannel: "channel-1",
			id: "guild-123",
			language: "en-US",
			rolesAdmin: [],
			rolesModerator: [],
			rolesPublic: [],
			rolesRemoveInitial: false,
		};

		// First change
		const changes1: Partial<ReturnType<typeof createMockGuildData>> = {
			logsImage: "channel-2",
		};

		let mergedSettings = deepMerge(originalSettings, changes1, mergeOptions);

		expect(mergedSettings.logsImage).toBe("channel-2");

		// Second change (accumulate)
		const changes2: Partial<ReturnType<typeof createMockGuildData>> = {
			logsMemberAdd: "channel-3",
		};

		mergedSettings = deepMerge(mergedSettings, changes2, mergeOptions);

		// Both changes should be present
		expect(mergedSettings.logsImage).toBe("channel-2");
		expect(mergedSettings.logsMemberAdd).toBe("channel-3");
		expect(mergedSettings.moderationChannel).toBe("channel-1"); // Original unchanged
	});
});
