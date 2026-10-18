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
		// The custom theme first, then Discord's 23 presets.
		expect(colourNames).toHaveLength(24);
		expect(colourNames[0]).toBe("Custom theme");
		expect(colourNames).toContain("Mint Apple");
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

	it("offers the three base themes in the compact set", async () => {
		const wrapper = await mountSuspended(AppPreferences, {
			props: { only: "appearance", quick: true },
		});

		const labels = wrapper
			.findAll('[role="radiogroup"]')
			.map((group) => group.findAll("label").length);
		expect(labels).toStrictEqual([3]);
		expect(wrapper.text()).not.toContain("Midnight");
		expect(wrapper.text()).not.toContain("Cozy");
	});

	it("keeps midnight in the compact set while it is the theme in use", async () => {
		useAppColorMode().setColorMode("midnight");
		const wrapper = await mountSuspended(AppPreferences, {
			props: { only: "appearance", quick: true },
		});

		expect(wrapper.text()).toContain("Midnight (experimental)");
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
