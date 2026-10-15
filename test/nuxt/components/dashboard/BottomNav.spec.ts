import { DashboardBottomNav } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it } from "vitest";
import { mockAuth } from "../../utils/auth";

mockAuth({ name: "Wolf" });

describe("DashboardBottomNav", () => {
	beforeEach(() => {
		clearNuxtState();
		useActiveGuild().selectGuild("123456789012345678");
	});

	it("offers the main sections and the preferences", async () => {
		const wrapper = await mountSuspended(DashboardBottomNav);

		expect(wrapper.findAll("button").map((button) => button.text())).toStrictEqual([
			"Overview",
			"Modules",
			"AutoMod",
			"Logs",
			"You",
		]);
	});

	it("marks the open section", async () => {
		useActiveGuild().setSection("modules");
		const wrapper = await mountSuspended(DashboardBottomNav);

		const current = wrapper.findAll('[aria-current="page"]');
		expect(current).toHaveLength(1);
		expect(current[0]!.text()).toBe("Modules");
	});

	it("opens a section from its tab", async () => {
		const wrapper = await mountSuspended(DashboardBottomNav);

		await wrapper
			.findAll("button")
			.find((button) => button.text() === "Logs")!
			.trigger("click");

		expect(useActiveGuild().section.value).toBe("logs");
	});

	it("opens the preferences from the last tab", async () => {
		const wrapper = await mountSuspended(DashboardBottomNav);

		await wrapper
			.findAll("button")
			.find((button) => button.text() === "You")!
			.trigger("click");

		expect(usePreferencesDialog().isOpen.value).toBe(true);
	});
});
