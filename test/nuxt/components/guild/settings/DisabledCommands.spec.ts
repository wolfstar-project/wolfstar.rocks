import type { GuildData } from "#server/database";
import type { DOMWrapper } from "@vue/test-utils";
import type { H3Event } from "h3";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DisabledCommands from "~/components/guild/settings/DisabledCommands.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

// Mock composables at module scope
const mockGuildSettings = createMockGuildData("123456789012345678", {
	commandsDisabled: ["ban"],
	commandsRestrictions: [
		{ command: "kick", ignoredChannels: ["400000000000000001"] },
		{
			command: "mute",
			allowedRoles: ["300000000000000001", "300000000000000002"],
			ignoredUsers: ["500000000000000001"],
		},
	],
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

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(createMockOauthFlattenedGuild({ id: "123456789012345678" })),
}));

// h3's `readBody` needs Node's `Buffer`, which the browser runner lacks; the
// stub hands the handler the web request, whose body reads as it is.
let lastBody: Record<string, unknown> | undefined;
async function readSentBody(event: H3Event): Promise<Record<string, unknown>> {
	lastBody = (await event.web?.request?.json()) as Record<string, unknown>;
	return lastBody;
}
function lastPutBody(): Record<string, unknown> | undefined {
	return lastBody;
}

registerEndpoint("/api/guilds/123456789012345678/command-rules/ban", {
	method: "GET",
	handler: () => ({
		command: "ban",
		enabled: false,
		rule: {
			command: "ban",
			allowedChannels: [],
			ignoredChannels: [],
			allowedRoles: [],
			ignoredRoles: [],
			allowedUsers: [],
			ignoredUsers: [],
		},
		revision: 3,
	}),
});
registerEndpoint("/api/guilds/123456789012345678/command-rules/ban", {
	method: "PUT",
	handler: async (event) => {
		const body = await readSentBody(event);
		return {
			command: "ban",
			enabled: body.enabled,
			rule: {
				command: "ban",
				allowedChannels: [],
				ignoredChannels: [],
				allowedRoles: [],
				ignoredRoles: [],
				allowedUsers: [],
				ignoredUsers: [],
			},
			revision: 4,
			commandsDisabled: body.enabled ? [] : ["ban"],
			commandsRestrictions: [],
		};
	},
});

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

type MountedDisabledCommands = Awaited<ReturnType<typeof mountSuspended>>;

function getCommandCard(wrapper: MountedDisabledCommands, commandName: string) {
	const label = wrapper
		.findAll(".command-tile .font-mono")
		.find((el: DOMWrapper<Element>) => el.text() === commandName);
	expect(label, `expected command label "${commandName}"`).toBeDefined();

	let current: Element | null = label!.element.parentElement;
	while (current && !current.classList.contains("command-tile")) {
		current = current.parentElement;
	}

	expect(current, `expected command card for "${commandName}"`).toBeTruthy();
	return current!;
}

function readCommandEnabled(wrapper: MountedDisabledCommands, commandName: string): boolean {
	const state = getCommandCard(wrapper, commandName).querySelector(".command-state");

	expect(state, `expected a state pill for "${commandName}"`).not.toBeNull();
	return state!.textContent?.includes("On") === true;
}

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
		const commandElements = wrapper.findAll(".command-tile .font-mono");

		// Should find General commands: avatar, ping, help
		const commandNames = commandElements.map((el) => el.text());
		expect(commandNames).toContain("avatar");
		expect(commandNames).toContain("ping");
		expect(commandNames).toContain("help");

		// Each command should have a description
		const descriptions = wrapper.findAll(".command-tile .text-xs");
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
			wrapper.findAll(".command-tile .font-mono").find((el) => el.text() === "avatar");

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
			wrapper.findAll(".command-tile .font-mono").find((el) => el.text() === name);

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

	it("category action buttons work (enable all, disable all, reset)", async () => {
		const wrapper = await mountSuspended(DisabledCommands, {
			props: {
				commands: mockCommands,
			},
		});

		// Collapsed panels stay mounted (`unmount-on-hide=false`), so pick the
		// visible action buttons for the open Moderation category.
		const enableAllButton = wrapper
			.findAll("button")
			.find((btn) => btn.text().includes("Enable all") && btn.isVisible());
		const disableAllButton = wrapper
			.findAll("button")
			.find((btn) => btn.text().includes("Disable all") && btn.isVisible());
		const resetButton = wrapper
			.findAll("button")
			.find((btn) => btn.text().includes("Reset") && btn.isVisible());

		expect(enableAllButton).toBeDefined();
		expect(disableAllButton).toBeDefined();
		expect(resetButton).toBeDefined();

		// Initial mock has `ban` disabled and other Moderation commands enabled.
		expect(readCommandEnabled(wrapper, "ban")).toBe(false);
		expect(readCommandEnabled(wrapper, "kick")).toBe(true);
		expect(readCommandEnabled(wrapper, "mute")).toBe(true);

		await disableAllButton!.trigger("click");
		await nextTick();
		expect(readCommandEnabled(wrapper, "ban")).toBe(false);
		expect(readCommandEnabled(wrapper, "kick")).toBe(false);
		expect(readCommandEnabled(wrapper, "mute")).toBe(false);

		await enableAllButton!.trigger("click");
		await nextTick();
		expect(readCommandEnabled(wrapper, "ban")).toBe(true);
		expect(readCommandEnabled(wrapper, "kick")).toBe(true);
		expect(readCommandEnabled(wrapper, "mute")).toBe(true);

		await resetButton!.trigger("click");
		await nextTick();
		expect(readCommandEnabled(wrapper, "ban")).toBe(false);
		expect(readCommandEnabled(wrapper, "kick")).toBe(true);
		expect(readCommandEnabled(wrapper, "mute")).toBe(true);

		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				color: "info",
				description: expect.stringContaining("Moderation"),
				title: "Category Reset",
			}),
		);
	});

	it("shows one tile per command and saves the command's settings name", async () => {
		// The bot lists every subcommand as an entry and names its command in
		// `command`; the settings turn off the whole command by that name.
		const entry = (
			name: string,
			command: string,
			category = "Moderation",
		): FlattenedCommand => ({
			category,
			command,
			description: `${name} description`,
			extendedHelp: {},
			guarded: false,
			name,
			permissionLevel: 5,
			preconditions: { entries: [], mode: 0, runCondition: 0 },
		});
		const wrapper = await mountSuspended(DisabledCommands, {
			props: {
				commands: [
					entry("ban add", "ban"),
					entry("ban remove", "ban"),
					entry("warn-thresholds list", "warnThresholds"),
				],
			},
		});

		expect(wrapper.findAll(".command-tile .font-mono").map((el) => el.text())).toEqual([
			"ban",
			"warn-thresholds",
		]);
		const banTile = getCommandCard(wrapper, "ban");
		expect(banTile.textContent).toContain("add, remove");
		expect(readCommandEnabled(wrapper, "ban")).toBe(false);

		await wrapper
			.findAll("button")
			.find((btn) => btn.text().includes("Disable all"))!
			.trigger("click");
		await nextTick();

		expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
			commandsDisabled: ["ban", "warnThresholds"],
		});
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

	it("opens Moderation first, the one category most servers come for", async () => {
		const wrapper = await mountSuspended(DisabledCommands, {
			props: { commands: mockCommands },
		});
		const tile = (name: string) =>
			wrapper.findAll(".command-tile .font-mono").find((el) => el.text() === name);

		expect(tile("ban")!.isVisible()).toBe(true);
		expect(tile("avatar")!.isVisible()).toBe(false);
	});

	it("tells on each tile its status and how many rules it has", async () => {
		const wrapper = await mountSuspended(DisabledCommands, {
			props: { commands: mockCommands },
		});

		const kick = getCommandCard(wrapper, "kick");
		expect(kick.tagName).toBe("BUTTON");
		expect(kick.textContent).toContain("On");
		expect(kick.textContent).toContain("1 rule");

		// Members count too: the rule holds them, and the editor keeps them.
		expect(getCommandCard(wrapper, "mute").textContent).toContain("3 rules");

		const ban = getCommandCard(wrapper, "ban");
		expect(ban.textContent).toContain("Off");
		expect(ban.textContent).not.toContain("rule");
		expect(ban.classList).toContain("command-tile--off");
	});

	it("names each tile for what it opens, and describes it by its status", async () => {
		const wrapper = await mountSuspended(DisabledCommands, {
			props: { commands: mockCommands },
		});

		const kick = wrapper.get('button[aria-label="Settings for kick"]');
		expect(kick.attributes("aria-haspopup")).toBe("dialog");
		const description = kick.find(`[id="${kick.attributes("aria-describedby")}"]`);
		expect(description.text()).toContain("On");
		expect(description.text()).toContain("1 rule");
	});

	it("adds a channel where no command runs, one at a time", async () => {
		const wrapper = await mountSuspended(DisabledCommands, {
			props: { commands: mockCommands },
		});
		const picker = wrapper.findComponent({ name: "SelectChips" });

		expect(picker.props("oneAtATime")).toBe(true);
		expect(wrapper.text()).toContain(
			"Every command is ignored here, whatever its own settings say.",
		);
		expect(wrapper.find('button[aria-label="Add to Disabled Channels"]').exists()).toBe(true);
	});

	it("edits a command's rules from its tile and keeps both statuses in step", async () => {
		useActiveGuild().selectGuild("123456789012345678");
		const wrapper = await mountSuspended(DisabledCommands, {
			props: { commands: mockCommands },
			attachTo: document.body,
		});
		// Statuses staged on the other tiles, not saved yet.
		await wrapper
			.findAll("button")
			.find((btn) => btn.text().includes("Disable all") && btn.isVisible())!
			.trigger("click");

		await wrapper.get('button[aria-label="Settings for ban"]').trigger("click");
		await vi.waitFor(() =>
			expect(document.querySelector('[role="dialog"] form')).not.toBeNull(),
		);
		const modalSwitch = document.querySelector<HTMLElement>('[role="dialog"] [role="switch"]');
		expect(modalSwitch?.getAttribute("aria-checked")).toBe("false");

		modalSwitch?.click();
		await nextTick();
		[...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')]
			.find((button) => button.textContent?.includes("Save rules"))
			?.click();

		await vi.waitFor(() => expect(readCommandEnabled(wrapper, "ban")).toBe(true));
		expect(lastPutBody()).toMatchObject({ revision: 3, enabled: true });
		expect(mockSetGuildSettings).toHaveBeenCalledWith(
			expect.objectContaining({ commandsDisabled: [], commandsRestrictions: [] }),
			"123456789012345678",
		);
		expect(readCommandEnabled(wrapper, "kick")).toBe(false);
		await vi.waitFor(() =>
			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
				commandsDisabled: ["kick", "mute"],
			}),
		);
		await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
		wrapper.unmount();
	});
});
