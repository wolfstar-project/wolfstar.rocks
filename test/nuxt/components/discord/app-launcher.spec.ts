import type { DOMWrapper, VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordAppLauncher from "~/components/discord/app-launcher/index.vue";
import { discordAppLauncherRecentsList } from "~/utils/constants";

const WARN_COMMAND = {
	id: "command-warn",
	kind: "command",
	commandName: "warn",
	name: "/warn",
	description: "Warn a member in the server",
	avatar: "/avatars/wolfstar.png",
} as const;

function section(wrapper: VueWrapper, headingId: string): DOMWrapper<Element> {
	return wrapper.find(`section[aria-labelledby="${headingId}"]`);
}

function buttonsWithText(root: VueWrapper | DOMWrapper<Element>, text: string) {
	return root.findAll("button").filter((button) => button.text().includes(text));
}

function searchInput(wrapper: VueWrapper): DOMWrapper<HTMLInputElement> {
	return wrapper.find<HTMLInputElement>('input[type="search"]');
}

function listTitle(wrapper: VueWrapper): string {
	return wrapper.find('[role="dialog"] h2').text();
}

describe("DiscordAppLauncher", () => {
	it("renders search, Recents, server apps, and Promoted when open (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
			attachTo: document.body,
		});

		// ASSERT
		const dialog = wrapper.find('[role="dialog"]');
		expect(dialog.attributes("aria-label")).toBe("Apps");
		expect(dialog.attributes("aria-modal")).toBe("true");
		expect(searchInput(wrapper).attributes("placeholder")).toBe("Search Apps & Commands");
		expect(searchInput(wrapper).attributes("aria-label")).toBe("Search Apps & Commands");
		expect(wrapper.text()).toContain("Recents");
		expect(wrapper.text()).toContain("Apps in this Server");
		expect(wrapper.text()).toContain("In This Server");
		expect(wrapper.text()).toContain("Puzzle Games");
		expect(wrapper.text()).toContain("Chill Together");
		expect(wrapper.text()).toContain("WolfStar Beta");
		expect(wrapper.text()).toContain("settings server");

		const recents = section(wrapper, "discord-app-launcher-recents-heading");
		expect(recents.findAll('[role="list"] [role="listitem"] button').length).toBeGreaterThan(0);
		expect(wrapper.find('[data-slot="sheet-handle"]').exists()).toBe(true);

		const promoted = section(wrapper, "discord-app-launcher-promoted-heading");
		expect(promoted.find("h2").text()).toBe("Promoted");
		expect(promoted.findAll("button")).toHaveLength(4);
		expect(promoted.text()).toContain("Wordle");
		expect(promoted.text()).toContain("Magic");
		expect(promoted.text()).toContain("Garden");
		expect(promoted.text()).toContain("Merge Valley");
		expect(promoted.text()).toContain("Watch Together");
	});

	it("does not render the dialog when closed (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: false },
		});

		// ASSERT
		expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
		expect(wrapper.find('input[type="search"]').exists()).toBe(false);
	});

	it("navigates to Recents via its View More control and back (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
			attachTo: document.body,
		});
		const recentsViewMore = buttonsWithText(
			section(wrapper, "discord-app-launcher-recents-heading"),
			"View More",
		)[0];
		expect(recentsViewMore).toBeDefined();

		// ACT
		await recentsViewMore!.trigger("click");

		// ASSERT
		expect(wrapper.find('[role="dialog"]').attributes("aria-label")).toBe("Recents");
		expect(listTitle(wrapper)).toBe("Recents");
		expect(wrapper.text()).toContain("Watch Together");
		expect(wrapper.text()).toContain("Promoted");
		const rows = discordAppLauncherRecentsList.map((entry) =>
			wrapper.findAll("button").find((button) => button.text().includes(entry.name)),
		);
		expect(rows.every((row) => row !== undefined)).toBe(true);
		expect(searchInput(wrapper).exists()).toBe(false);

		// ACT — back
		await wrapper.find('button[aria-label="Back to Apps"]').trigger("click");

		// ASSERT
		expect(wrapper.find('[role="dialog"]').attributes("aria-label")).toBe("Apps");
		expect(searchInput(wrapper).exists()).toBe(true);
		expect(section(wrapper, "discord-app-launcher-promoted-heading").exists()).toBe(true);
	});

	it("opens Apps in this Server list from its View More (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
		});
		const serverViewMore = buttonsWithText(
			section(wrapper, "discord-app-launcher-server-heading"),
			"View More",
		)[0];
		expect(serverViewMore).toBeDefined();

		// ACT
		await serverViewMore!.trigger("click");

		// ASSERT
		expect(listTitle(wrapper)).toBe("Apps in this Server");
		expect(wrapper.text()).toContain("Flamey");
	});

	it("filters entries by search query (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
		});

		// ACT
		await searchInput(wrapper).setValue("Staryl");

		// ASSERT
		expect(searchInput(wrapper).element.value).toBe("Staryl");
		expect(wrapper.text()).toContain("Staryl");
		expect(wrapper.text()).not.toContain("Flamey");
		expect(section(wrapper, "discord-app-launcher-promoted-heading").exists()).toBe(false);
	});

	it("does not list commands until the user searches (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true, commands: [WARN_COMMAND] },
		});

		// ASSERT — idle launcher has apps only; no static /commands listing
		expect(wrapper.text()).not.toContain("/warn");
		expect(wrapper.find("#discord-app-launcher-commands-heading").exists()).toBe(false);
	});

	it("surfaces matching commands on search and emits select for execute (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: {
				open: true,
				commands: [
					WARN_COMMAND,
					{
						id: "command-ban",
						kind: "command",
						commandName: "ban",
						name: "/ban",
						description: "Ban a member from the server",
						avatar: "/avatars/wolfstar.png",
					},
				],
			},
		});

		// ACT
		await searchInput(wrapper).setValue("warn");
		const commands = section(wrapper, "discord-app-launcher-commands-heading");
		await commands
			.find('button[aria-label="/warn. Warn a member in the server"]')
			.trigger("click");

		// ASSERT
		expect(wrapper.find("#discord-app-launcher-commands-heading").text()).toBe("Commands");
		expect(commands.text()).toContain("/warn");
		expect(wrapper.text()).not.toContain("/ban");
		const selected = wrapper.emitted("select");
		expect(selected).toHaveLength(1);
		expect(selected?.[0]?.[0]).toMatchObject({
			kind: "command",
			commandName: "warn",
			name: "/warn",
		});
	});

	it("runs the first matching command on Enter in search (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: {
				open: true,
				commands: [
					{
						id: "command-mute",
						kind: "command",
						commandName: "mute",
						name: "/mute",
						description: "Mute a member in the server",
						avatar: "/avatars/wolfstar.png",
					},
				],
			},
		});
		await searchInput(wrapper).setValue("mute");

		// ACT
		await searchInput(wrapper).trigger("keydown", { key: "Enter" });

		// ASSERT
		expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({
			kind: "command",
			commandName: "mute",
		});
	});

	it("emits select when a server app row is clicked (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
		});
		const row = section(wrapper, "discord-app-launcher-server-heading")
			.findAll("button")
			.find((button) => button.attributes("aria-label")?.startsWith("WolfStar Beta"));
		expect(row).toBeDefined();

		// ACT
		await row!.trigger("click");

		// ASSERT
		const selected = wrapper.emitted("select");
		expect(selected).toHaveLength(1);
		expect(selected?.[0]?.[0]).toMatchObject({ id: "wolfstar", name: "WolfStar Beta" });
	});

	it("emits select when a Recents tile with a subtitle is clicked (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
		});
		const tile = section(wrapper, "discord-app-launcher-recents-heading")
			.findAll("button")
			.find((button) => button.text().includes("settings server"));
		expect(tile).toBeDefined();

		// ACT
		await tile!.trigger("click");

		// ASSERT
		const selected = wrapper.emitted("select");
		expect(selected).toHaveLength(1);
		expect(selected?.[0]?.[0]).toMatchObject({
			id: "wolfstar-settings-menu",
			tileTitle: "settings server",
			kind: "command",
			commandName: "settings server",
		});
	});

	it("closes on Escape from the main view (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
			attachTo: document.body,
		});

		// ACT
		await wrapper.find('[role="dialog"]').trigger("keydown", { key: "Escape" });

		// ASSERT
		expect(wrapper.emitted("close")).toHaveLength(1);
		expect(wrapper.emitted("update:open")).toEqual([[false]]);
	});

	it("returns to main view on Escape from a list view (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
			attachTo: document.body,
		});
		await buttonsWithText(wrapper, "View More")[0]!.trigger("click");
		expect(wrapper.find('button[aria-label="Back to Apps"]').exists()).toBe(true);

		// ACT
		await wrapper.find('[role="dialog"]').trigger("keydown", { key: "Escape" });

		// ASSERT
		expect(searchInput(wrapper).exists()).toBe(true);
		expect(wrapper.emitted("close")).toBeUndefined();
		expect(wrapper.props("open")).toBe(true);
	});

	it("opens at the half sheet snap by default (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
			attachTo: document.body,
		});

		// ASSERT
		expect(wrapper.find('[role="dialog"]').attributes("data-sheet-snap")).toBe("half");
	});

	it("expands to full via the handle ArrowUp key and collapses via ArrowDown (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
			attachTo: document.body,
		});
		const handle = wrapper.find('[data-slot="sheet-handle"]');

		// ACT
		await handle.trigger("keydown", { key: "ArrowUp" });

		// ASSERT
		expect(wrapper.find('[role="dialog"]').attributes("data-sheet-snap")).toBe("full");
		expect(wrapper.emitted("update:sheetSnap")?.at(-1)).toEqual(["full"]);

		// ACT — collapse only, never close
		await handle.trigger("keydown", { key: "ArrowDown" });

		// ASSERT
		expect(wrapper.find('[role="dialog"]').attributes("data-sheet-snap")).toBe("half");
		expect(wrapper.emitted("update:sheetSnap")?.at(-1)).toEqual(["half"]);
		expect(wrapper.props("open")).toBe(true);
		expect(wrapper.emitted("close")).toBeUndefined();
	});

	it("honors initialSheetSnap=full when opening (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true, initialSheetSnap: "full" },
			attachTo: document.body,
		});

		// ASSERT
		expect(wrapper.find('[role="dialog"]').attributes("data-sheet-snap")).toBe("full");
		expect(wrapper.emitted("update:sheetSnap")?.at(-1)).toEqual(["full"]);
	});

	it("shows category View More only when entries overflow the preview (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: {
				open: true,
				categories: [
					{
						id: "overflow-games",
						title: "Overflow Games",
						entries: [
							{ id: "a", name: "Alpha" },
							{ id: "b", name: "Bravo" },
							{ id: "c", name: "Charlie" },
							{ id: "d", name: "Delta" },
							{ id: "e", name: "Echo" },
						],
					},
					{
						id: "exact-games",
						title: "Exact Games",
						entries: [
							{ id: "f", name: "Foxtrot" },
							{ id: "g", name: "Golf" },
							{ id: "h", name: "Hotel" },
							{ id: "i", name: "India" },
						],
					},
				],
			},
		});

		// ASSERT
		const overflowSection = section(wrapper, "discord-app-launcher-overflow-games-heading");
		const exactSection = section(wrapper, "discord-app-launcher-exact-games-heading");
		expect(overflowSection.text()).toContain("Overflow Games");
		expect(overflowSection.text()).not.toContain("Echo");
		expect(buttonsWithText(overflowSection, "View More").length).toBeGreaterThan(0);
		expect(exactSection.text()).toContain("India");
		expect(buttonsWithText(exactSection, "View More")).toHaveLength(0);

		// ACT
		await buttonsWithText(overflowSection, "View More")[0]!.trigger("click");

		// ASSERT
		expect(listTitle(wrapper)).toBe("Overflow Games");
		expect(wrapper.text()).toContain("Echo");
	});

	it("emits requestHelp from the Learn More button (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
		});

		// ACT
		await buttonsWithText(wrapper, "Learn More")[0]!.trigger("click");

		// ASSERT
		expect(wrapper.emitted("requestHelp")).toHaveLength(1);
	});
});
