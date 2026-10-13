import { DashboardComingSoon } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it } from "vitest";

describe("DashboardComingSoon", () => {
	beforeEach(() => {
		clearNuxtState();
		useActiveGuild().selectGuild("123456789012345678");
	});

	it("names the announced section and says it is not available yet", async () => {
		useActiveGuild().setSection("autodelete");
		const wrapper = await mountSuspended(DashboardComingSoon);

		expect(wrapper.find("h2").text()).toBe("Auto-Delete");
		expect(wrapper.text()).toContain("Delete messages in a channel after a delay.");
		expect(wrapper.text()).toContain("Coming soon");
		expect(wrapper.text()).toContain("Not available yet");
	});
});
