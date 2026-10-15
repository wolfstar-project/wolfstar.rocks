import { AppPreferences } from "#components";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it } from "vitest";

const mockColorMode = { preference: "system", value: "dark" };
mockNuxtImport("useColorMode", () => () => mockColorMode);

// Accessibility audits for AppPreferences live in test/nuxt/a11y.spec.ts.
describe("AppPreferences", () => {
	afterEach(() => {
		useLogDensity().value = "cozy";
		useAppColorMode().setColorMode("system");
	});

	it("offers each theme as a card of one radio group", async () => {
		const wrapper = await mountSuspended(AppPreferences, { props: { only: "appearance" } });

		const themes = wrapper.findAll('[role="radiogroup"]')[0]!;
		const labels = themes.findAll("label").map((label) => label.text());
		expect(labels).toStrictEqual([
			"Dark",
			"Light",
			"Sync with system",
			"Midnight (experimental)",
		]);

		await themes.findAll('input[type="radio"]')[1]!.setValue(true);
		expect(useAppColorMode().preference.value).toBe("light");
	});

	it("switches the log tables to compact rows", async () => {
		const wrapper = await mountSuspended(AppPreferences, { props: { only: "appearance" } });

		const density = wrapper.findAll('[role="radiogroup"]')[1]!;
		expect(density.text()).toContain("Cozy");
		await density.findAll('input[type="radio"]')[1]!.setValue(true);

		expect(useLogDensity().value).toBe("compact");
	});

	it("keeps reduced motion on a page of its own", async () => {
		const appearance = await mountSuspended(AppPreferences, { props: { only: "appearance" } });
		expect(appearance.text()).not.toContain("Reduce Motion");

		const accessibility = await mountSuspended(AppPreferences, {
			props: { only: "accessibility" },
		});
		expect(accessibility.text()).toContain("Reduce Motion");
		expect(accessibility.find('[role="radiogroup"]').exists()).toBe(false);
	});
});
