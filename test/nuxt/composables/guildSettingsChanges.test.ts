import type { GuildData } from "#server/database";
import { beforeEach, describe, expect, it } from "vitest";
import { createMockOauthFlattenedGuild } from "../../mocks/discord";

describe("useGuildSettingsChanges", () => {
	beforeEach(() => {
		// Clear any state between tests
		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("properly scopes changes by guild ID", async () => {
		const mockGuild1 = createMockOauthFlattenedGuild({ id: "guild1", name: "Test Guild 1" });
		const mockGuild2 = createMockOauthFlattenedGuild({ id: "guild2", name: "Test Guild 2" });

		const { useGuildSettingsChanges } = await import("../../../app/composables/useGuildSettingsChanges");
		const { useGuildData } = await import("../../../app/composables/useGuildData");
		const { setGuildData } = useGuildData();
		const { guildSettingsChanges, setGuildSettingsChanges } = useGuildSettingsChanges();

		// Set changes for guild 1
		setGuildData(mockGuild1);
		setGuildSettingsChanges({ prefix: "!" });

		// Set changes for guild 2
		setGuildData(mockGuild2);
		setGuildSettingsChanges({ prefix: "?" });

		// Switch back to guild 1
		setGuildData(mockGuild1);

		// Should have guild1's changes, not guild2's
		expect(guildSettingsChanges.value?.prefix).toBe("!");
	});

	it("clears changes completely (not merge with {})", async () => {
		const { useGuildSettingsChanges } = await import("../../../app/composables/useGuildSettingsChanges");
		const { guildSettingsChanges, setGuildSettingsChanges } = useGuildSettingsChanges();

		// Set some changes
		setGuildSettingsChanges({ prefix: "!" });

		// Clear changes
		setGuildSettingsChanges(undefined);

		// Should be undefined, not {}
		expect(guildSettingsChanges).toBeUndefined();
	});

	it("removes specific keys when changes are reverted", async () => {
		const { useGuildSettingsChanges } = await import("../../../app/composables/useGuildSettingsChanges");
		const { guildSettingsChanges, setGuildSettingsChanges } = useGuildSettingsChanges();

		// Set multiple changes
		setGuildSettingsChanges({ commandAutoDelete: [] as GuildData["commandAutoDelete"], prefix: "!" });

		// Remove one key
		setGuildSettingsChanges({ prefix: undefined });
		// Prefix should be gone, commandAutoDelete should remain
		expect(guildSettingsChanges).toBeDefined();
		expect(guildSettingsChanges).not.toHaveProperty("prefix");
		expect(guildSettingsChanges).toHaveProperty("commandAutoDelete");
	});

	it("handles partial updates correctly", async () => {
		const { useGuildSettingsChanges } = await import("../../../app/composables/useGuildSettingsChanges");
		const { guildSettingsChanges, mergeGuildSettings } = useGuildSettingsChanges();

		// Set initial changes
		mergeGuildSettings({ prefix: "!" });

		// Merge additional changes
		mergeGuildSettings({ commandAutoDelete: [] as GuildData["commandAutoDelete"] });

		// Should have both changes
		expect(guildSettingsChanges.value?.prefix).toBe("!");
		expect(guildSettingsChanges.value?.commandAutoDelete).toStrictEqual([]);
	});

	it("returns Partial<GuildData> type", async () => {
		const { useGuildSettingsChanges } = await import("../../../app/composables/useGuildSettingsChanges");
		const { guildSettingsChanges, setGuildSettingsChanges } = useGuildSettingsChanges();

		// Should accept partial data
		setGuildSettingsChanges({ prefix: "!" }); // Not full GuildData

		// Should work with partial data
		expect(guildSettingsChanges.value?.prefix).toBe("!");
	});

	it("does not persist changes across different guilds", async () => {
		const mockGuild1 = createMockOauthFlattenedGuild({ id: "guild1", name: "Test Guild 1" });
		const mockGuild2 = createMockOauthFlattenedGuild({ id: "guild2", name: "Test Guild 2" });

		const { useGuildData } = await import("../../../app/composables/useGuildData");
		const { useGuildSettingsChanges } = await import("../../../app/composables/useGuildSettingsChanges");
		const { setGuildData } = useGuildData();
		const { guildSettingsChanges, setGuildSettingsChanges } = useGuildSettingsChanges();

		// Set changes for guild 1
		setGuildData(mockGuild1);
		setGuildSettingsChanges({ prefix: "!" });

		// Switch to guild 2 - should have no changes
		setGuildData(mockGuild2);

		// Guild 2 should have no changes
		expect(guildSettingsChanges.value).toBeUndefined();
	});
});
