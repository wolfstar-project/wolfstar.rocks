import { AppPreferences } from "#components";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it } from "vitest";

const mockColorMode = { preference: "system", value: "dark" };
mockNuxtImport("useColorMode", () => () => mockColorMode);

// Accessibility audits for AppPreferences live in test/nuxt/a11y.spec.ts.
describe("AppPreferences", () => {
	afterEach(() => {
		useLogDensity().value = "cozy";
		useThemeChoice().selectBase("system");
	});

	function swatches(group: Element | undefined) {
		return [...(group?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [])];
	}

	it("offers Discord's base themes and its colour themes as two radio groups", async () => {
		const wrapper = await mountSuspended(AppPreferences, { props: { only: "appearance" } });

		const [base, colour] = wrapper.findAll('[role="radiogroup"]');
		expect(
			swatches(base?.element).map((input) => input.getAttribute("aria-label")),
		).toStrictEqual(["Light", "Ash", "Dark", "Onyx", "Sync with system"]);
		const colourNames = swatches(colour?.element).map((input) =>
			input.getAttribute("aria-label"),
		);
		// Discord's 23 presets; the custom theme is a button in front of them.
		expect(colourNames).toHaveLength(23);
		expect(colourNames).not.toContain("Custom theme");
		expect(colourNames).toContain("Mint Apple");
		expect(wrapper.find('button[aria-label="Custom theme"]').exists()).toBe(true);
	});

	it("picks a base theme, which the colour theme gives way to", async () => {
		const wrapper = await mountSuspended(AppPreferences, { props: { only: "appearance" } });
		const [base, colour] = wrapper.findAll('[role="radiogroup"]');
		const pick = (group: typeof base, name: string) =>
			group!
				.findAll('input[type="radio"]')
				.find((input) => input.attributes("aria-label") === name)!
				.setValue(true);

		await pick(colour, "Mint Apple");
		expect(useThemeChoice().colorTheme.value).toBe("mint-apple");
		expect(useAppColorMode().preference.value).toBe("light");

		await pick(base, "Onyx");
		expect(useThemeChoice().colorTheme.value).toBeNull();
		expect(useAppColorMode().preference.value).toBe("midnight");
	});

	it("offers only the base themes in the compact set", async () => {
		const wrapper = await mountSuspended(AppPreferences, {
			props: { only: "appearance", quick: true },
		});

		const groups = wrapper.findAll('[role="radiogroup"]');
		expect(groups).toHaveLength(1);
		expect(
			swatches(groups[0]?.element).map((input) => input.getAttribute("aria-label")),
		).toStrictEqual(["Light", "Ash", "Dark", "Onyx", "Sync with system"]);
		expect(wrapper.text()).not.toContain("Cozy");
	});

	it("leaves the clock to the dashboard in the compact set", async () => {
		const full = await mountSuspended(AppPreferences, { props: { only: "language" } });
		expect(full.find('[role="radiogroup"]').exists()).toBe(true);

		const quick = await mountSuspended(AppPreferences, {
			props: { only: "language", quick: true },
		});
		expect(quick.find('[role="radiogroup"]').exists()).toBe(false);
	});

	it("switches the log tables to compact rows", async () => {
		const wrapper = await mountSuspended(AppPreferences, { props: { only: "appearance" } });

		const density = wrapper.findAll('[role="radiogroup"]')[2]!;
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
