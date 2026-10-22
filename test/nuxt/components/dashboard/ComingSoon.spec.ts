import { DashboardComingSoon } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it } from "vitest";

describe("DashboardComingSoon", () => {
	beforeEach(() => {
		clearNuxtState();
		useActiveGuild().selectGuild("123456789012345678");
	});

	// Every section the sidebar lists has a page today, so the announced one is
	// made up: the page only reads its label, icon and description.
	it("names the announced section and says it is not available yet", async () => {
		const wrapper = await mountSuspended(DashboardComingSoon, {
			props: {
				item: {
					comingSoon: true,
					descriptionKey: "guild_settings.modules.descriptions.automessage",
					group: "modules",
					icon: "ic:round-schedule-send",
					labelKey: "dashboard.nav.automessage",
					slug: "announced",
				},
			},
		});

		expect(wrapper.find("h2").text()).toBe("Auto-Message");
		expect(wrapper.text()).toContain("Send a message in a channel again and again.");
		expect(wrapper.text()).toContain("Coming soon");
		expect(wrapper.text()).toContain("Not available yet");
	});
});
