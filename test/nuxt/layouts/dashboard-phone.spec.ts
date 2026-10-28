import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { defineComponent, h, ref } from "vue";
import DashboardLayout from "~/layouts/dashboard.vue";
import { mockAuth } from "../utils/auth";

mockAuth({ name: "Wolf" });
// No server list or guild to fetch: the test is about which screen shows.
mockNuxtImport("useUser", () => () => ({
	guilds: ref([]),
	status: ref("success"),
	user: ref(null),
}));

const Page = defineComponent({ render: () => h("p", { class: "test-page" }, "page") });

// The layout reads the screen from the query alone; `/app` itself would redirect to the sign-in.
async function mountLayout(route: string) {
	const wrapper = await mountSuspended(DashboardLayout, {
		attachTo: document.body,
		route,
		slots: { default: () => h(Page) },
	});
	return {
		wrapper,
		shown: (selector: string) => {
			const element = wrapper.find(selector).element as HTMLElement | undefined;
			return element !== undefined && getComputedStyle(element).display !== "none";
		},
	};
}

describe("the dashboard on a phone", () => {
	beforeAll(async () => {
		await page.viewport(390, 844);
	});

	afterAll(async () => {
		await page.viewport(1280, 900);
	});

	beforeEach(() => {
		clearNuxtState();
	});

	it("shows the list: the server rail and the sections, not the page", async () => {
		const { shown, wrapper } = await mountLayout("/");

		expect(shown(".guild-rail")).toBe(true);
		expect(shown(".console-sidebar")).toBe(true);
		expect(shown(".console-main")).toBe(false);
		wrapper.unmount();
	});

	it("shows the page alone once a section is open", async () => {
		const { shown, wrapper } = await mountLayout("/?screen=page");

		expect(shown(".console-main")).toBe(true);
		expect(shown(".guild-rail")).toBe(false);
		expect(shown(".console-sidebar")).toBe(false);
		wrapper.unmount();
	});
});
