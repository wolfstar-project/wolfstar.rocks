import type { DiscordProfileUser } from "#shared/types/discord";
import type { DOMWrapper } from "@vue/test-utils";
import { AppPreferencesDialog, DashboardSidebar } from "#components";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";
import { mockAuth } from "../../utils/auth";

mockAuth({ name: "Wolf" });

// The Discord account behind the session, wearing a nameplate and a frame.
const discordUser = ref<DiscordProfileUser | null>({
	avatar: null,
	avatar_decoration_data: { asset: "a_frame", sku_id: "2" },
	collectibles: {
		nameplate: {
			asset: "nameplates/nameplates/twilight/",
			label: "",
			palette: "violet",
			sku_id: "1",
		},
	},
	discriminator: "0",
	global_name: "Wolf",
	id: "987654321098765432",
	name: "Wolf",
	username: "wolf",
} as DiscordProfileUser);
mockNuxtImport("useUser", () => () => ({ user: discordUser }));

const GUILD_ID = "123456789012345678";

type Wrapper = Awaited<ReturnType<typeof mountSuspended>>;

// Every mounted sidebar listens to the same storage key, so a sidebar left
// mounted by one test would write its pins back into the next one.
const mounted: Wrapper[] = [];
async function mountSidebar() {
	const wrapper = await mountSuspended(DashboardSidebar);
	mounted.push(wrapper);
	return wrapper;
}

function rowFor(wrapper: Wrapper, label: string) {
	const row = wrapper
		.findAll(".dashboard-nav-row")
		.find((candidate: DOMWrapper<Element>) =>
			candidate.find(".dashboard-nav-button").text().startsWith(label),
		);
	expect(row, `expected a "${label}" row`).toBeDefined();
	return row!;
}

describe("DashboardSidebar", () => {
	afterEach(() => {
		for (const wrapper of mounted.splice(0)) {
			wrapper.unmount();
		}
	});

	beforeEach(() => {
		localStorage.removeItem("wolfstar-dashboard-nav");
		clearNuxtState();
		useActiveGuild().selectGuild(GUILD_ID);
		useGuildData().setGuildData(
			createMockOauthFlattenedGuild({ id: GUILD_ID, name: "WolfStar HQ" }),
		);
		useGuildSettings().setGuildSettings(
			createMockGuildData(GUILD_ID, { modulesRoles: false, modulesAutomod: true }),
		);
	});

	it("names the server and lists every section", async () => {
		const wrapper = await mountSidebar();

		expect(wrapper.text()).toContain("WolfStar HQ");
		for (const label of ["Overview", "Modules", "Auto Moderation", "Moderation", "Logs"]) {
			expect(rowFor(wrapper, label).exists()).toBe(true);
		}
	});

	it("marks the open section as the current page", async () => {
		useActiveGuild().setSection("moderation");
		const wrapper = await mountSidebar();

		const current = wrapper.findAll('[aria-current="page"]');
		expect(current).toHaveLength(1);
		expect(current[0]!.text()).toContain("Moderation");
	});

	it("counts the enabled modules and flags a module that is off", async () => {
		const wrapper = await mountSidebar();

		// Automod, Moderation and Events are on; Roles is off. Commands is not a module.
		expect(rowFor(wrapper, "Modules").find(".dashboard-nav-count").text()).toBe("3");
		expect(rowFor(wrapper, "Roles").find('[title="Module is off"]').exists()).toBe(true);
		expect(rowFor(wrapper, "Moderation").find('[title="Module is off"]').exists()).toBe(false);
	});

	it("opens a section and tells a drawer to close", async () => {
		const wrapper = await mountSidebar();

		await rowFor(wrapper, "Commands").find(".dashboard-nav-button").trigger("click");

		expect(useActiveGuild().section.value).toBe("commands");
		expect(wrapper.emitted("navigate")).toHaveLength(1);
	});

	it("pins a section above the others and remembers it", async () => {
		const wrapper = await mountSidebar();

		await rowFor(wrapper, "Roles").find(".dashboard-nav-pin").trigger("click");

		const modulesGroup = wrapper.findAll(".dashboard-nav-row").map((row) => row.text());
		expect(wrapper.text()).toContain("Pinned");
		expect(modulesGroup.findIndex((text) => text.startsWith("Roles"))).toBeLessThan(
			modulesGroup.findIndex((text) => text.startsWith("Auto Moderation")),
		);
		expect(rowFor(wrapper, "Roles").find(".dashboard-nav-pin").attributes("aria-pressed")).toBe(
			"true",
		);
		expect(
			JSON.parse(localStorage.getItem("wolfstar-dashboard-nav") ?? "{}").pinned,
		).toStrictEqual(["roles"]);
	});

	it("offers the modules opened last as shortcuts", async () => {
		const wrapper = await mountSidebar();

		await rowFor(wrapper, "Events").find(".dashboard-nav-button").trigger("click");
		await nextTick();
		await rowFor(wrapper, "Roles").find(".dashboard-nav-button").trigger("click");
		await nextTick();

		const chips = wrapper.findAll(".dashboard-nav-chip").map((chip) => chip.text());
		// The open section is not repeated as a shortcut.
		expect(chips).toStrictEqual(["Events"]);
	});

	it("folds the modules away and leaves Commands and Logs", async () => {
		const wrapper = await mountSidebar();

		const toggle = wrapper
			.findAll(".dashboard-nav-label--toggle")
			.find((button) => button.text().includes("Modules"));
		await toggle!.trigger("click");

		expect(toggle!.attributes("aria-expanded")).toBe("false");
		expect(wrapper.text()).not.toContain("Auto Moderation");
		expect(rowFor(wrapper, "Commands").exists()).toBe(true);
		expect(rowFor(wrapper, "Logs").exists()).toBe(true);
	});

	it("keeps Commands and Logs out of the modules, in a group of their own", async () => {
		const wrapper = await mountSidebar();

		// Only the modules have a title and fold; Commands and Logs sit below a divider.
		expect(wrapper.findAll(".dashboard-nav-label--toggle")).toHaveLength(1);
		expect(wrapper.findAll(".dashboard-nav-divider").length).toBeGreaterThan(0);
		for (const label of ["Commands", "Logs"]) {
			const row = rowFor(wrapper, label);
			expect(row.find(".dashboard-nav-pin").exists()).toBe(false);
			expect(row.find('[title="Module is off"]').exists()).toBe(false);
		}
	});

	// The dialog is mounted by `app.vue`, apart from the sidebar, so both are
	// rendered here.
	it("opens the settings from the account card, with the bug report in them", async () => {
		usePreferencesDialog().isOpen.value = false;
		const wrapper = await mountSuspended(
			defineComponent({
				setup: () => () => [h(DashboardSidebar), h(AppPreferencesDialog)],
			}),
			{ attachTo: document.body },
		);
		mounted.push(wrapper);

		// `useUserSession()` cannot be mocked in browser mode, so the card is
		// found by its class and the session's name is not checked.
		const account = wrapper.get("button.account-user");
		expect(account.attributes("aria-label")).toMatch(/^User settings for/);
		await account.trigger("click");

		expect(usePreferencesDialog().isOpen.value).toBe(true);
		await vi.waitFor(() => {
			expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain(
				"Report a Bug",
			);
		});
		const report = [
			...document.body.querySelectorAll<HTMLButtonElement>(".settings-nav-item"),
		].find((item) => item.textContent?.includes("Report a Bug"));
		report!.click();
		await vi.waitFor(() => {
			expect(document.body.querySelector('[role="dialog"] textarea')).not.toBeNull();
		});

		usePreferencesDialog().isOpen.value = false;
	});

	it("wears the account's nameplate and avatar frame from Discord's CDN", async () => {
		const wrapper = await mountSidebar();

		const plate = wrapper.get(".account-nameplate-art");
		expect(plate.attributes("src") ?? plate.attributes("poster")).toContain(
			"/assets/collectibles/nameplates/nameplates/twilight/",
		);
		expect(wrapper.get(".user-avatar-decoration").attributes("src")).toContain(
			"/avatar-decoration-presets/a_frame.png",
		);
	});
});
