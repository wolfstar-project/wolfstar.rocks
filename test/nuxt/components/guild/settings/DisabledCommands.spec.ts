import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DisabledCommands from "~/components/guild/settings/DisabledCommands.vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

// Mock composables at module scope
const mockGuildSettings = createMockGuildData("123456789012345678", {
	disabledCommands: ["ban"],
});
const mockToastAdd = vi.fn();
const mockSetGuildSettingsChanges = vi.fn();
const mockRemoveChange = vi.fn();
const mockMergeGuildSettings = vi.fn();
const mockSetGuildSettings = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: ref(mockGuildSettings),
	originalGuildSettings: ref(mockGuildSettings),
	setGuildSettings: mockSetGuildSettings,
	loading: ref(false),
	error: ref<Error | null>(null),
	refresh: vi.fn(),
}));

mockNuxtImport("useGuildSettingsChanges", () => () => ({
	guildSettingsChanges: ref<GuildData | undefined>(undefined),
	mergeGuildSettings: mockMergeGuildSettings,
	removeChange: mockRemoveChange,
	resetCounter: readonly(ref(0)),
	resetGuildSettingsChanges: vi.fn(),
	setGuildSettingsChanges: mockSetGuildSettingsChanges,
}));

mockNuxtImport("useToast", () => () => ({
	add: mockToastAdd,
}));

// Mock commands data with multiple categories
const mockCommands: FlattenedCommand[] = [
	{
		category: "Moderation",
		description: "Ban a user from the server",
		extendedHelp: {},
		guarded: false,
		name: "ban",
		permissionLevel: 5,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
	},
	{
		category: "Moderation",
		description: "Kick a user from the server",
		extendedHelp: {},
		guarded: false,
		name: "kick",
		permissionLevel: 5,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
	},
	{
		category: "Moderation",
		description: "Mute a user",
		extendedHelp: {},
		guarded: false,
		name: "mute",
		permissionLevel: 5,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
	},
	{
		category: "General",
		description: "Show user avatar",
		extendedHelp: {},
		guarded: false,
		name: "avatar",
		permissionLevel: 0,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
	},
	{
		category: "General",
		description: "Check bot latency",
		extendedHelp: {},
		guarded: false,
		name: "ping",
		permissionLevel: 0,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
	},
	{
		category: "General",
		description: "Show help information",
		extendedHelp: {},
		guarded: false,
		name: "help",
		permissionLevel: 0,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
	},
	{
		category: "Music",
		description: "Play music",
		extendedHelp: {},
		guarded: false,
		name: "play",
		permissionLevel: 0,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
	},
	{
		category: "Music",
		description: "Skip current song",
		extendedHelp: {},
		guarded: false,
		name: "skip",
		permissionLevel: 0,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
	},
];

describe("disabledCommands", () => {
	beforeEach(() => {
		// Clear mocks between tests
		vi.clearAllMocks();

		// Clear state between tests
		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("renders all command categories as collapsible sections", async () => {
		const wrapper = await mountSuspended(DisabledCommands, {
			props: {
				commands: mockCommands,
			},
		});

		// Should render 3 categories: Moderation, General, Music
		const categoryButtons = wrapper.findAll("button");

		// Filter for category trigger buttons (they contain the category names)
		// Exclude action buttons like "Enable all", "Disable all", "Reset"
		const categoryTriggers = categoryButtons.filter((button) => {
			const text = button.text();
			return (
				(text.includes("Moderation") ||
					text.includes("General") ||
					text.includes("Music")) &&
				!text.includes("Enable all") &&
				!text.includes("Disable all") &&
				!text.includes("Reset")
			);
		});

		expect(categoryTriggers).toHaveLength(3);

		// Use set-based assertion instead of assuming order
		const categoryLabels = categoryTriggers.map((trigger) => trigger.text());
		expect(categoryLabels).toStrictEqual(
			expect.arrayContaining([
				expect.stringContaining("General"),
				expect.stringContaining("Moderation"),
				expect.stringContaining("Music"),
			]),
		);
	});

	it("displays commands in grid for each category", async () => {
		const wrapper = await mountSuspended(DisabledCommands, {
			props: {
				commands: mockCommands,
			},
		});

		// Open General category (first category)
		const categoryButtons = wrapper.findAll("button");
		const generalButton = categoryButtons.find((btn) => btn.text().includes("General"));
		await generalButton!.trigger("click");

		// Wait for content to render
		await wrapper.vm.$nextTick();

		// Find command names in the grid
		const commandElements = wrapper.findAll("p.font-medium");

		// Should find General commands: avatar, ping, help
		const commandNames = commandElements.map((el) => el.text());
		expect(commandNames).toContain("avatar");
		expect(commandNames).toContain("ping");
		expect(commandNames).toContain("help");

		// Each command should have a description
		const descriptions = wrapper.findAll("p.text-sm");
		expect(descriptions.length).toBeGreaterThan(0);

		// Verify visibility of command elements
		const avatarElement = commandElements.find((el) => el.text() === "avatar");
		expect(avatarElement).toBeDefined();
		expect(avatarElement!.isVisible()).toBeTruthy();

		const avatarDescription = descriptions.find((el) => el.text().includes("Show user avatar"));
		expect(avatarDescription).toBeDefined();
		expect(avatarDescription!.isVisible()).toBeTruthy();
	});

	it("toggles category open/closed on trigger click", async () => {
		const wrapper = await mountSuspended(DisabledCommands, {
			props: {
				commands: mockCommands,
			},
		});

		const categoryButtons = wrapper.findAll("button");
		const generalButton = categoryButtons.find((btn) => btn.text().includes("General"));

		// Find a specific command element (use "avatar" from General category)
		const findAvatarCommand = () =>
			wrapper.findAll("p.font-medium").find((el) => el.text() === "avatar");

		// Initially, commands should not be visible (accordion closed)
		let avatarElement = findAvatarCommand();
		expect(avatarElement).toBeDefined();
		expect(avatarElement!.isVisible()).toBeFalsy();

		// Click to open
		await generalButton!.trigger("click");
		await wrapper.vm.$nextTick();

		// Command should now be visible
		avatarElement = findAvatarCommand();
		expect(avatarElement).toBeDefined();
		expect(avatarElement!.isVisible()).toBeTruthy();

		// Click to close
		await generalButton!.trigger("click");
		await wrapper.vm.$nextTick();

		// Command should be hidden again
		avatarElement = findAvatarCommand();
		expect(avatarElement!.isVisible()).toBeFalsy();
	});

	it("only one category open at a time (single-open behavior)", async () => {
		const wrapper = await mountSuspended(DisabledCommands, {
			props: {
				commands: mockCommands,
			},
		});

		const categoryButtons = wrapper.findAll("button");
		const generalButton = categoryButtons.find((btn) => btn.text().includes("General"));
		const moderationButton = categoryButtons.find((btn) => btn.text().includes("Moderation"));

		// Open General category
		await generalButton!.trigger("click");
		await wrapper.vm.$nextTick();

		// Find General and Moderation commands
		const findCommand = (name: string) =>
			wrapper.findAll("p.font-medium").find((el) => el.text() === name);

		// General command (avatar) should be visible
		let avatarElement = findCommand("avatar");
		expect(avatarElement).toBeDefined();
		expect(avatarElement!.isVisible()).toBeTruthy();

		// Moderation command (ban) should not be visible
		let banElement = findCommand("ban");
		expect(banElement).toBeDefined();
		expect(banElement!.isVisible()).toBeFalsy();

		// Open Moderation category
		await moderationButton!.trigger("click");
		await wrapper.vm.$nextTick();

		// Now Moderation commands (ban, kick) should be visible
		banElement = findCommand("ban");
		expect(banElement).toBeDefined();
		expect(banElement!.isVisible()).toBeTruthy();

		const kickElement = findCommand("kick");
		expect(kickElement).toBeDefined();
		expect(kickElement!.isVisible()).toBeTruthy();

		// General commands should no longer be visible (only one category open)
		avatarElement = findCommand("avatar");
		expect(avatarElement!.isVisible()).toBeFalsy();
	});

	it("does not mark form as changed on initial render", async () => {
		const wrapper = await mountSuspended(DisabledCommands, {
			props: {
				commands: mockCommands,
			},
		});

		// Wait for component to fully mount and any immediate watchers to run
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();

		// Assert that setGuildSettingsChanges was NOT called during initialization
		// (It should only be called when the user actually changes something)
		expect(mockSetGuildSettingsChanges).not.toHaveBeenCalled();
	});
});
