import type { DOMWrapper, VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick, ref } from "vue";
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

function dialog(wrapper: VueWrapper): DOMWrapper<Element> {
	return wrapper.find('[role="dialog"]');
}

/** The accessible name of the dialog, read from the element it is labelled by. */
function dialogName(wrapper: VueWrapper): string | undefined {
	const labelledBy = dialog(wrapper).attributes("aria-labelledby");
	if (labelledBy === undefined) return undefined;
	return document.getElementById(labelledBy)?.textContent?.trim();
}

function headings(wrapper: VueWrapper): string[] {
	return dialog(wrapper)
		.findAll("h2")
		.map((heading) => heading.text());
}

function sheetHandle(wrapper: VueWrapper, name: "Expand" | "Collapse"): DOMWrapper<Element> {
	return wrapper.find(`button[aria-label="${name} Apps sheet"]`);
}

// A modal launcher makes the rest of the page inert until it unmounts.
const mounted: VueWrapper[] = [];
afterEach(() => {
	for (const wrapper of mounted.splice(0)) wrapper.unmount();
});

function track<T extends VueWrapper>(wrapper: T): T {
	mounted.push(wrapper);
	return wrapper;
}

describe("DiscordAppLauncher", () => {
	it("renders search, Recents, server apps, and Promoted when open (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);

		// ASSERT
		expect(dialogName(wrapper)).toBe("Apps");
		expect(dialog(wrapper).attributes("aria-modal")).toBe("true");
		expect(searchInput(wrapper).attributes("placeholder")).toBe("Search Apps & Commands");
		expect(searchInput(wrapper).attributes("aria-label")).toBe("Search Apps & Commands");
		expect(wrapper.text()).toContain("Recents");
		expect(wrapper.text()).toContain("Apps in this Server");
		expect(wrapper.text()).toContain("In This Server");
		expect(wrapper.text()).toContain("Puzzle Games");
		expect(wrapper.text()).toContain("Chill Together");
		expect(wrapper.text()).toContain("WolfStar Beta");
		expect(wrapper.text()).toContain("settings server");

		// Each strip of recents is a list a screen reader counts, named by the section heading.
		const recentLists = section(wrapper, "discord-app-launcher-recents-heading").findAll(
			'ul[role="list"][aria-labelledby="discord-app-launcher-recents-heading"]',
		);
		expect(recentLists).toHaveLength(2);
		for (const list of recentLists) {
			expect(list.findAll(":scope > li").length).toBeGreaterThan(0);
			expect(list.findAll(":scope > :not(li)")).toHaveLength(0);
		}

		const promoted = section(wrapper, "discord-app-launcher-promoted-heading");
		expect(promoted.find("h2").text()).toBe("Promoted");
		expect(promoted.findAll("button")).toHaveLength(4);
		expect(promoted.text()).toContain("Wordle");
		expect(promoted.text()).toContain("Magic");
		expect(promoted.text()).toContain("Garden");
		expect(promoted.text()).toContain("Merge Valley");
		expect(promoted.text()).toContain("Watch Together");
		expect(promoted.find('button[aria-label^="Wordle. "]').exists()).toBe(true);
	});

	it("does not render the dialog when closed (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: false },
			}),
		);

		// ASSERT
		expect(dialog(wrapper).exists()).toBe(false);
		expect(wrapper.find('input[type="search"]').exists()).toBe(false);
	});

	it("moves focus in when it opens and returns it to the opener on Escape (positive)", async () => {
		// ARRANGE
		const Host = defineComponent({
			setup() {
				const open = ref(false);
				return () =>
					h("div", [
						h("button", { id: "opener", onClick: () => (open.value = true) }, "Open"),
						h(DiscordAppLauncher, {
							"open": open.value,
							"onUpdate:open": (value: boolean) => (open.value = value),
						}),
					]);
			},
		});
		const wrapper = track(await mountSuspended(Host, { attachTo: document.body }));
		const opener = wrapper.find<HTMLButtonElement>("#opener");
		opener.element.focus();

		// ACT
		await opener.trigger("click");
		await nextTick();

		// ASSERT
		expect(dialog(wrapper).element.contains(document.activeElement)).toBe(true);

		// ACT
		await dialog(wrapper).trigger("keydown", { key: "Escape" });

		// ASSERT
		expect(dialog(wrapper).exists()).toBe(false);
		await vi.waitFor(() => expect(document.activeElement).toBe(opener.element));
	});

	it("navigates to Recents via its View More control and back (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);
		const recentsViewMore = buttonsWithText(
			section(wrapper, "discord-app-launcher-recents-heading"),
			"View More",
		)[0];
		expect(recentsViewMore).toBeDefined();

		// ACT
		await recentsViewMore!.trigger("click");
		await nextTick();

		// ASSERT
		expect(headings(wrapper)).toEqual(["Apps", "Recents"]);
		const back = wrapper.find('button[aria-label="Back to Apps"]');
		expect(document.activeElement).toBe(back.element);
		expect(wrapper.text()).toContain("Watch Together");
		expect(wrapper.text()).toContain("Promoted");
		const rows = discordAppLauncherRecentsList.map((entry) =>
			wrapper.findAll("button").find((button) => button.text().includes(entry.name)),
		);
		expect(rows.every((row) => row !== undefined)).toBe(true);
		expect(searchInput(wrapper).exists()).toBe(false);

		// ACT: back
		await back.trigger("click");
		await nextTick();

		// ASSERT
		expect(dialogName(wrapper)).toBe("Apps");
		expect(searchInput(wrapper).exists()).toBe(true);
		expect(document.activeElement).toBe(searchInput(wrapper).element);
		expect(section(wrapper, "discord-app-launcher-promoted-heading").exists()).toBe(true);
	});

	it("opens Apps in this Server list from its View More (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);
		const serverViewMore = buttonsWithText(
			section(wrapper, "discord-app-launcher-server-heading"),
			"View More",
		)[0];
		expect(serverViewMore).toBeDefined();

		// ACT
		await serverViewMore!.trigger("click");

		// ASSERT
		expect(headings(wrapper)).toEqual(["Apps", "Apps in this Server"]);
		expect(wrapper.text()).toContain("Flamey");
	});

	it("filters entries by search query (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);

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
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true, commands: [WARN_COMMAND] },
				attachTo: document.body,
			}),
		);

		// ASSERT: idle launcher has apps only; no static /commands listing
		expect(wrapper.text()).not.toContain("/warn");
		expect(wrapper.find("#discord-app-launcher-commands-heading").exists()).toBe(false);
	});

	it("surfaces matching commands on search and emits select for execute (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
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
				attachTo: document.body,
			}),
		);

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
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
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
				attachTo: document.body,
			}),
		);
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
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);
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
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);
		const tile = section(wrapper, "discord-app-launcher-recents-heading").find(
			'button[aria-label="settings server, WolfStar Beta"]',
		);
		expect(tile.exists()).toBe(true);

		// ACT
		await tile.trigger("click");

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

	it("emits selectPromo when a promoted card is clicked (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);

		// ACT
		await section(wrapper, "discord-app-launcher-promoted-heading")
			.find('button[aria-label^="Wordle. "]')
			.trigger("click");

		// ASSERT
		expect(wrapper.emitted("selectPromo")?.[0]?.[0]).toMatchObject({ variant: "wordle" });
	});

	it("closes on Escape from the main view (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);

		// ACT
		await dialog(wrapper).trigger("keydown", { key: "Escape" });

		// ASSERT
		expect(wrapper.emitted("close")).toHaveLength(1);
		expect(wrapper.emitted("update:open")).toEqual([[false]]);
	});

	it("returns to main view on Escape from a list view (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);
		await buttonsWithText(wrapper, "View More")[0]!.trigger("click");
		expect(wrapper.find('button[aria-label="Back to Apps"]').exists()).toBe(true);

		// ACT
		await dialog(wrapper).trigger("keydown", { key: "Escape" });

		// ASSERT
		expect(searchInput(wrapper).exists()).toBe(true);
		expect(wrapper.emitted("close")).toBeUndefined();
		expect(wrapper.props("open")).toBe(true);
	});

	it("opens at the half sheet snap by default (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);

		// ASSERT
		expect(dialog(wrapper).attributes("data-sheet-snap")).toBe("half");
		expect(sheetHandle(wrapper, "Expand").attributes("aria-expanded")).toBe("false");
	});

	it("expands to full via the handle ArrowUp key and collapses via ArrowDown (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);

		// ACT
		await sheetHandle(wrapper, "Expand").trigger("keydown", { key: "ArrowUp" });

		// ASSERT
		expect(dialog(wrapper).attributes("data-sheet-snap")).toBe("full");
		expect(sheetHandle(wrapper, "Collapse").attributes("aria-expanded")).toBe("true");
		expect(wrapper.emitted("update:sheetSnap")?.at(-1)).toEqual(["full"]);

		// ACT: collapse only, never close
		await sheetHandle(wrapper, "Collapse").trigger("keydown", { key: "ArrowDown" });

		// ASSERT
		expect(dialog(wrapper).attributes("data-sheet-snap")).toBe("half");
		expect(wrapper.emitted("update:sheetSnap")?.at(-1)).toEqual(["half"]);
		expect(wrapper.props("open")).toBe(true);
		expect(wrapper.emitted("close")).toBeUndefined();
	});

	it("toggles the sheet when the handle is pressed (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);

		// ACT: a synthetic click has detail 0, as a press of Enter or Space does
		await sheetHandle(wrapper, "Expand").trigger("click");

		// ASSERT
		expect(dialog(wrapper).attributes("data-sheet-snap")).toBe("full");

		// ACT
		await sheetHandle(wrapper, "Collapse").trigger("click");

		// ASSERT
		expect(dialog(wrapper).attributes("data-sheet-snap")).toBe("half");
	});

	it("collapses when the handle is dragged down, and the drag's click does not undo it (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true, initialSheetSnap: "full" },
				attachTo: document.body,
			}),
		);
		const handle = sheetHandle(wrapper, "Collapse");
		const target = wrapper.find("#discord-app-launcher-recents-heading");
		expect(
			target.element.getBoundingClientRect().top - handle.element.getBoundingClientRect().top,
		).toBeGreaterThan(80);

		// ACT: a real pointer drag, which ends with a click on the handle
		await userEvent.dragAndDrop(handle.element, target.element);

		// ASSERT
		await vi.waitFor(() => expect(dialog(wrapper).attributes("data-sheet-snap")).toBe("half"));
		expect(wrapper.emitted("update:sheetSnap")?.at(-1)).toEqual(["half"]);
		expect(sheetHandle(wrapper, "Expand").attributes("aria-expanded")).toBe("false");
	});

	it("honors initialSheetSnap=full when opening (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true, initialSheetSnap: "full" },
				attachTo: document.body,
			}),
		);

		// ASSERT
		expect(dialog(wrapper).attributes("data-sheet-snap")).toBe("full");
		expect(wrapper.emitted("update:sheetSnap")?.at(-1)).toEqual(["full"]);
	});

	it("shows category View More only when entries overflow the preview (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
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
				attachTo: document.body,
			}),
		);

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
		expect(headings(wrapper)).toEqual(["Apps", "Overflow Games"]);
		expect(wrapper.text()).toContain("Echo");
	});

	it("emits requestHelp from the Learn More button (positive)", async () => {
		// ARRANGE
		const wrapper = track(
			await mountSuspended(DiscordAppLauncher, {
				props: { open: true },
				attachTo: document.body,
			}),
		);

		// ACT
		await buttonsWithText(wrapper, "Learn More")[0]!.trigger("click");

		// ASSERT
		expect(wrapper.emitted("requestHelp")).toHaveLength(1);
	});
});
