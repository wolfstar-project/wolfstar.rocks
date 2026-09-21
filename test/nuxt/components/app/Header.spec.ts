import type { VueWrapper } from "@vue/test-utils";
import { AppHeader } from "#components";
import { mockComponent, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

// Stub the auth dropdown so the header test doesn't trigger a real session fetch.
// The stub keeps an accessible name so it doesn't introduce axe violations.
mockComponent("AppHeaderAuth", async () => {
	const { h } = await import("vue");
	return {
		render: () =>
			h("button", { "type": "button", "aria-label": "Sign in with Discord" }, "Sign in"),
	};
});

async function openDesktopMenu(wrapper: VueWrapper, label: string) {
	const trigger = wrapper.findAll("button").find((button) => button.text().includes(label));
	expect(trigger, `no "${label}" trigger`).toBeDefined();
	await trigger!.trigger("click");
	await new Promise((resolve) => setTimeout(resolve, 100));
	await wrapper.vm.$nextTick();
}

// Accessibility audits for AppHeader live in test/nuxt/a11y.spec.ts.
describe("AppHeader", () => {
	describe("desktop menus", () => {
		it("gives every Features entry an icon badge and a description", async () => {
			const wrapper = await mountSuspended(AppHeader);
			await openDesktopMenu(wrapper, "Features");

			const rows = wrapper.findAll(".app-navbar-row");
			expect(rows).toHaveLength(3);
			expect(rows[0]!.find(".app-navbar-row-icon").exists()).toBe(true);
			expect(rows[0]!.find(".app-navbar-row-description").text()).toBe(
				"Tools to help you moderate your server",
			);
			expect(rows.map((row) => row.attributes("href"))).toStrictEqual([
				"/wolfstar#moderation-tools",
				"/wolfstar#advanced-logging",
				"/wolfstar#moderation-logs",
			]);
		});

		it("gives every Applications entry its app logo and tagline", async () => {
			const wrapper = await mountSuspended(AppHeader);
			await openDesktopMenu(wrapper, "Applications");

			const rows = wrapper.findAll(".app-navbar-row");
			expect(rows).toHaveLength(2);
			expect(rows.map((row) => row.attributes("href"))).toStrictEqual(["/", "/staryl"]);
			expect(rows[0]!.find("img").exists()).toBe(true);
			expect(rows[1]!.find(".app-navbar-row-description").text()).toBe(
				"Social updates for Discord",
			);
		});
	});

	describe("hydration safety", () => {
		it("renders deterministically across mounts (no SSR/client divergence)", async () => {
			const first = await mountSuspended(AppHeader);
			const second = await mountSuspended(AppHeader);
			expect(second.html()).toBe(first.html());
		});
	});
});
