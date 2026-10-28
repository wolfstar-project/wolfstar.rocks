import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
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

const Page = defineComponent({
	render: () => h("h1", { class: "test-page", tabindex: -1 }, "page"),
});

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

	// Each screen hides the control that had the focus.
	it("moves the focus to the page's title, and back to the thread that opened it", async () => {
		const { wrapper } = await mountLayout("/");
		const thread = wrapper.get(".dm-row").element as HTMLButtonElement;
		thread.focus();
		thread.click();

		await vi.waitFor(() => {
			expect(document.activeElement?.classList.contains("test-page")).toBe(true);
		});

		// The browser's back, as the gesture does.
		useRouter().back();
		await vi.waitFor(() => {
			expect(document.activeElement).toBe(thread);
		});
		wrapper.unmount();
	});

	// The settings open in a dialog over the list; no section was picked.
	it("stays on the list when the account card opens the settings", async () => {
		usePreferencesDialog().isOpen.value = false;
		const { shown, wrapper } = await mountLayout("/");
		// Opening the page pushes `?screen=page` within the click itself.
		const push = vi.spyOn(useRouter(), "push");

		await wrapper.get("button.account-user").trigger("click");

		expect(usePreferencesDialog().isOpen.value).toBe(true);
		expect(push).not.toHaveBeenCalled();
		expect(shown(".console-sidebar")).toBe(true);
		push.mockRestore();
		usePreferencesDialog().isOpen.value = false;
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
