import type { DOMWrapper } from "@vue/test-utils";
import { DashboardSidebar } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";
import { mockAuth } from "../../utils/auth";

mockAuth({ name: "Wolf" });

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
		for (const label of ["Overview", "Modules", "Auto-moderation", "Moderation", "Logs"]) {
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

		expect(rowFor(wrapper, "Modules").find(".dashboard-nav-count").text()).toBe("4");
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

		await rowFor(wrapper, "Commands").find(".dashboard-nav-pin").trigger("click");

		const modulesGroup = wrapper.findAll(".dashboard-nav-row").map((row) => row.text());
		expect(wrapper.text()).toContain("Pinned");
		expect(modulesGroup.findIndex((text) => text.startsWith("Commands"))).toBeLessThan(
			modulesGroup.findIndex((text) => text.startsWith("Auto-moderation")),
		);
		expect(
			rowFor(wrapper, "Commands").find(".dashboard-nav-pin").attributes("aria-pressed"),
		).toBe("true");
		expect(
			JSON.parse(localStorage.getItem("wolfstar-dashboard-nav") ?? "{}").pinned,
		).toStrictEqual(["commands"]);
	});

	it("offers the sections opened last as shortcuts", async () => {
		const wrapper = await mountSidebar();

		await rowFor(wrapper, "Commands").find(".dashboard-nav-button").trigger("click");
		await nextTick();
		await rowFor(wrapper, "Roles").find(".dashboard-nav-button").trigger("click");
		await nextTick();

		const chips = wrapper.findAll(".dashboard-nav-chip").map((chip) => chip.text());
		// The open section is not repeated as a shortcut.
		expect(chips).toStrictEqual(["Commands"]);
	});

	it("folds a group away", async () => {
		const wrapper = await mountSidebar();

		const toggle = wrapper
			.findAll(".dashboard-nav-label--toggle")
			.find((button) => button.text().includes("Records"));
		await toggle!.trigger("click");

		expect(toggle!.attributes("aria-expanded")).toBe("false");
		expect(wrapper.text()).not.toContain("Logs");
	});
});
