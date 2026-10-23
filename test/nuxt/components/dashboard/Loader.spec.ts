import { DashboardLoader } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

describe("DashboardLoader", () => {
	it("announces the load and hides the bot's mark from assistive technology", async () => {
		const wrapper = await mountSuspended(DashboardLoader);

		const status = wrapper.find("[role='status']");
		expect(status.exists()).toBe(true);
		expect(status.text()).toBe("Loading");
		expect(wrapper.find("svg").attributes("aria-hidden")).toBe("true");
	});
});
