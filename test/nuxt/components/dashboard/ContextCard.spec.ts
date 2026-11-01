import { DashboardContextCard } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { nextTick } from "vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";

function openServer(overrides: Parameters<typeof createMockGuildData>[1] = {}) {
	useActiveGuild().selectGuild(GUILD_ID);
	useGuildData().setGuildData(
		createMockOauthFlattenedGuild({ id: GUILD_ID, name: "WolfStar HQ" }),
	);
	useGuildSettings().setGuildSettings(createMockGuildData(GUILD_ID, overrides));
}

describe("DashboardContextCard", () => {
	beforeEach(() => {
		clearNuxtState();
	});

	it("names the server and counts the modules on the overview", async () => {
		openServer({
			appealsEnabled: false,
			modulesAutodelete: false,
			modulesAutomessage: false,
			modulesAutomod: true,
			modulesAutopurge: false,
			modulesLogs: false,
			modulesModeration: true,
			modulesRoles: false,
		});
		const wrapper = await mountSuspended(DashboardContextCard, { route: "/app?screen=page" });

		expect(wrapper.text()).toContain("WolfStar HQ");
		expect(wrapper.text()).toContain("2 of 8 modules on");
	});

	it("offers the switch of a module section, bound to its staged setting", async () => {
		openServer({ modulesAutomod: true });
		useActiveGuild().setSection("automod");
		const wrapper = await mountSuspended(DashboardContextCard, { route: "/app?screen=page" });

		const toggle = wrapper.find('[role="switch"]');
		expect(toggle.attributes("aria-checked")).toBe("true");
		expect(wrapper.text()).toContain("Auto Moderation · On");

		await toggle.trigger("click");
		expect(useGuildSettingsChanges().guildSettingsChanges.value).toMatchObject({
			modulesAutomod: false,
		});

		// Back to what is saved: nothing is left staged.
		await toggle.trigger("click");
		expect(useGuildSettingsChanges().guildSettingsChanges.value).toBeUndefined();
	});

	it("holds the switch back until the saved settings are in", async () => {
		useActiveGuild().selectGuild(GUILD_ID);
		useActiveGuild().setSection("automod");
		const wrapper = await mountSuspended(DashboardContextCard, { route: "/app?screen=page" });

		expect(wrapper.find('[role="switch"]').exists()).toBe(false);
		expect(wrapper.text()).not.toMatch(/· O(n|ff)/);

		useGuildSettings().setGuildSettings(
			createMockGuildData(GUILD_ID, { modulesAutomod: true }),
		);
		await nextTick();

		expect(wrapper.find('[role="switch"]').attributes("aria-checked")).toBe("true");
		expect(useGuildSettingsChanges().guildSettingsChanges.value).toBeUndefined();
	});

	describe("by screen width", () => {
		afterEach(async () => {
			await page.viewport(1280, 900);
		});

		// From `sm` up the page's own banner carries the module's switch, and the sidebar names the server.
		it("shows on a phone only", async () => {
			await page.viewport(1280, 900);
			openServer({ modulesAutomod: true });
			useActiveGuild().setSection("automod");
			const wrapper = await mountSuspended(DashboardContextCard, {
				attachTo: document.body,
				route: "/app?screen=page",
			});
			const display = () => getComputedStyle(wrapper.element as HTMLElement).display;

			expect(display()).toBe("none");

			await page.viewport(390, 844);
			await expect.poll(display).toBe("flex");
			wrapper.unmount();
		});
	});

	it("goes back to the list from a section without a switch", async () => {
		openServer();
		useActiveGuild().setSection("commands");
		const wrapper = await mountSuspended(DashboardContextCard, { route: "/app?screen=page" });

		expect(wrapper.find('[role="switch"]').exists()).toBe(false);
		await wrapper.find('[data-testid="context-card-list"]').trigger("click");
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(useRouter().currentRoute.value.query.screen).toBeUndefined();
	});
});
