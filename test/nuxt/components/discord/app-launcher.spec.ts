import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordAppLauncher from "~/components/discord/app-launcher/index.vue";
import { discordAppLauncherRecentsList } from "~/utils/discord-app-launcher";

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
		expect(wrapper.find(".discord-app-launcher-search-input").attributes("placeholder")).toBe(
			"Search Apps & Commands",
		);
		expect(wrapper.text()).toContain("Recents");
		expect(wrapper.text()).toContain("Apps in this Server");
		expect(wrapper.text()).toContain("In This Server");
		expect(wrapper.text()).toContain("Promoted");
		expect(wrapper.text()).toContain("Puzzle Games");
		expect(wrapper.text()).toContain("Chill Together");
		expect(wrapper.findAll(".discord-app-launcher-recent").length).toBeGreaterThan(0);
		expect(wrapper.findAll(".discord-app-launcher-tile").length).toBeGreaterThan(0);
		expect(wrapper.find(".discord-app-launcher-handle").exists()).toBe(true);
		expect(wrapper.findAll(".discord-app-launcher-promo")).toHaveLength(4);
		expect(wrapper.text()).toContain("WolfStar Beta");
		expect(wrapper.text()).toContain("conf menu");
		expect(wrapper.text()).toContain("Wordle");
	});

	it("does not render the dialog when closed (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: false },
		});

		// ASSERT
		expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
		expect(wrapper.find(".discord-app-launcher").exists()).toBe(false);
	});

	it("navigates to Recents via its View More control and back (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
			attachTo: document.body,
		});
		const viewMoreButtons = wrapper.findAll(".discord-app-launcher-view-more");
		const recentsViewMore = viewMoreButtons[0];
		expect(recentsViewMore).toBeDefined();

		// ACT
		await recentsViewMore!.trigger("click");

		// ASSERT
		expect(wrapper.find('[role="dialog"]').attributes("aria-label")).toBe("Recents");
		expect(wrapper.find(".discord-app-launcher-list-title").text()).toBe("Recents");
		expect(wrapper.text()).toContain("Watch Together");
		expect(wrapper.text()).toContain("PROMOTED");
		expect(wrapper.findAll(".discord-app-launcher-list-item").length).toBe(
			discordAppLauncherRecentsList.length,
		);

		// ACT — back
		await wrapper.find(".discord-app-launcher-back").trigger("click");

		// ASSERT
		expect(wrapper.find('[role="dialog"]').attributes("aria-label")).toBe("Apps");
		expect(wrapper.find(".discord-app-launcher-search-input").exists()).toBe(true);
		expect(wrapper.text()).toContain("Promoted");
	});

	it("opens Apps in this Server list from the second View More (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
		});
		const viewMoreButtons = wrapper.findAll(".discord-app-launcher-view-more");
		const serverViewMore = viewMoreButtons[1];
		expect(serverViewMore).toBeDefined();

		// ACT
		await serverViewMore!.trigger("click");

		// ASSERT
		expect(wrapper.find(".discord-app-launcher-list-title").text()).toBe("Apps in this Server");
		expect(wrapper.text()).toContain("Flamey");
	});

	it("filters entries by search query (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
		});
		const input = wrapper.find(".discord-app-launcher-search-input");

		// ACT
		await input.setValue("Staryl");

		// ASSERT
		expect(wrapper.text()).toContain("Staryl");
		expect(wrapper.text()).not.toContain("Flamey");
		expect(wrapper.find(".discord-app-launcher-promoted-grid").exists()).toBe(false);
	});

	it("does not list commands until the user searches (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: {
				open: true,
				commands: [
					{
						id: "command-warn",
						kind: "command",
						commandName: "warn",
						name: "/warn",
						description: "Warn a member in the server",
						avatar: "/avatars/wolfstar.png",
					},
				],
			},
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
					{
						id: "command-warn",
						kind: "command",
						commandName: "warn",
						name: "/warn",
						description: "Warn a member in the server",
						avatar: "/avatars/wolfstar.png",
					},
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
		const input = wrapper.find(".discord-app-launcher-search-input");

		// ACT
		await input.setValue("warn");
		await wrapper
			.findAll(".discord-app-launcher-list-item")
			.find((row) => row.text().includes("/warn"))!
			.trigger("click");

		// ASSERT
		expect(wrapper.find("#discord-app-launcher-commands-heading").exists()).toBe(true);
		expect(wrapper.text()).toContain("/warn");
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
		const input = wrapper.find(".discord-app-launcher-search-input");
		await input.setValue("mute");

		// ACT
		await input.trigger("keydown", { key: "Enter" });

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

		// ACT
		await wrapper
			.findAll(
				".discord-app-launcher-server-list-desktop .discord-app-launcher-list-item",
			)[0]!
			.trigger("click");

		// ASSERT
		const selected = wrapper.emitted("select");
		expect(selected).toHaveLength(1);
		expect(selected?.[0]?.[0]).toMatchObject({ id: "wolfstar", name: "WolfStar Beta" });
	});

	it("emits select when a mobile Recents tile is clicked (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordAppLauncher, {
			props: { open: true },
		});

		// ACT
		await wrapper
			.find(".discord-app-launcher-recents-mobile .discord-app-launcher-tile")
			.trigger("click");

		// ASSERT
		const selected = wrapper.emitted("select");
		expect(selected).toHaveLength(1);
		expect(selected?.[0]?.[0]).toMatchObject({
			id: "wolfstar-conf-menu",
			tileTitle: "conf menu",
			kind: "command",
			commandName: "conf",
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
		await wrapper.findAll(".discord-app-launcher-view-more")[0]!.trigger("click");
		expect(wrapper.find(".discord-app-launcher-list-title").exists()).toBe(true);

		// ACT
		await wrapper.find('[role="dialog"]').trigger("keydown", { key: "Escape" });

		// ASSERT
		expect(wrapper.find(".discord-app-launcher-search-input").exists()).toBe(true);
		expect(wrapper.emitted("close")).toBeUndefined();
		expect(wrapper.props("open")).toBe(true);
	});
});
