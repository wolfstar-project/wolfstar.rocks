import type { GuildData } from "#server/database";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";

// Mock useRouteParams to provide a controllable guild ID
const mockGuildId = ref<string | null>("test-guild-id");
mockNuxtImport("useRouteParams", () => () => mockGuildId);

describe("useGuildSettingsChanges", () => {
	// oxlint-disable-next-line typescript/consistent-type-imports
	let useGuildSettingsChanges: typeof import("../../../app/composables/useGuildSettingsChanges").useGuildSettingsChanges;

	beforeAll(async () => {
		// Import composables after Nuxt environment is set up
		const settingsModule = await import("../../../app/composables/useGuildSettingsChanges");
		useGuildSettingsChanges = settingsModule.useGuildSettingsChanges;
	});

	beforeEach(() => {
		// Clear any state between tests
		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("properly scopes changes by guild ID", () => {
		const mockGuild1 = createMockOauthFlattenedGuild({ id: "guild1", name: "Test Guild 1" });
		const mockGuild2 = createMockOauthFlattenedGuild({ id: "guild2", name: "Test Guild 2" });

		// Set changes for guild 1
		mockGuildId.value = mockGuild1.id;
		const changes1a = useGuildSettingsChanges();
		changes1a.setGuildSettingsChanges({ prefix: "!" });

		// Set changes for guild 2
		mockGuildId.value = mockGuild2.id;
		const changes2 = useGuildSettingsChanges();
		changes2.setGuildSettingsChanges({ prefix: "?" });

		// Switch back to guild 1
		mockGuildId.value = mockGuild1.id;
		const changes1b = useGuildSettingsChanges();

		// Should have guild1's changes, not guild2's
		expect(changes1b.guildSettingsChanges.value?.prefix).toBe("!");
	});

	it("clears changes completely (not merge with {})", () => {
		const { guildSettingsChanges, setGuildSettingsChanges } = useGuildSettingsChanges();

		// Set some changes
		setGuildSettingsChanges({ prefix: "!" });

		// Clear changes
		setGuildSettingsChanges(undefined);

		// Should be undefined, not {}
		expect(guildSettingsChanges.value).toBeUndefined();
	});

	it("removes specific keys when changes are reverted", () => {
		const { guildSettingsChanges, setGuildSettingsChanges, removeChange } =
			useGuildSettingsChanges();

		// Set multiple changes
		setGuildSettingsChanges({
			commandAutoDelete: [] as GuildData["commandAutoDelete"],
			prefix: "!",
		});

		// Remove one key using removeChange
		removeChange("prefix");
		// Prefix should be gone, commandAutoDelete should remain
		expect(guildSettingsChanges.value).toBeDefined();
		expect(guildSettingsChanges.value).not.toHaveProperty("prefix");
		expect(guildSettingsChanges.value).toHaveProperty("commandAutoDelete");
	});

	it("handles partial updates correctly", () => {
		const { guildSettingsChanges, mergeGuildSettings } = useGuildSettingsChanges();

		// Set initial changes
		mergeGuildSettings({ prefix: "!" });

		// Merge additional changes
		mergeGuildSettings({ commandAutoDelete: [] as GuildData["commandAutoDelete"] });

		// Should have both changes
		expect(guildSettingsChanges.value?.prefix).toBe("!");
		expect(guildSettingsChanges.value?.commandAutoDelete).toStrictEqual([]);
	});

	it("returns Partial<GuildData> type", () => {
		const { guildSettingsChanges, setGuildSettingsChanges } = useGuildSettingsChanges();

		// Should accept partial data
		setGuildSettingsChanges({ prefix: "!" }); // Not full GuildData

		// Should work with partial data
		expect(guildSettingsChanges.value?.prefix).toBe("!");
	});

	it("does not persist changes across different guilds", () => {
		const mockGuild1 = createMockOauthFlattenedGuild({ id: "guild1", name: "Test Guild 1" });
		const mockGuild2 = createMockOauthFlattenedGuild({ id: "guild2", name: "Test Guild 2" });

		// Set changes for guild 1
		mockGuildId.value = mockGuild1.id;
		const changes1 = useGuildSettingsChanges();
		changes1.setGuildSettingsChanges({ prefix: "!" });

		// Switch to guild 2 - should have no changes
		mockGuildId.value = mockGuild2.id;
		const changes2 = useGuildSettingsChanges();

		// Guild 2 should have no changes
		expect(changes2.guildSettingsChanges.value).toBeUndefined();
	});
});
