import { AppCustomThemeEditor } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CUSTOM_THEME_MAX_COLORS, DEFAULT_CUSTOM_THEME } from "~/utils/color-themes";

// Accessibility audits for AppCustomThemeEditor live in test/nuxt/a11y.spec.ts.
describe("AppCustomThemeEditor", () => {
	beforeEach(() => {
		useThemeChoice().updateCustomTheme({ ...DEFAULT_CUSTOM_THEME });
	});

	afterEach(() => {
		useThemeChoice().selectBase("system");
	});

	const colors = () => useThemeChoice().customTheme.value.colors;

	it("shows a square on the strip for each colour, the first one picked", async () => {
		const wrapper = await mountSuspended(AppCustomThemeEditor);

		const stops = wrapper.findAll(
			'[role="radiogroup"] input[type="radio"][aria-label^="Color"]',
		);
		expect(stops).toHaveLength(3);
		expect((stops[0]!.element as HTMLInputElement).checked).toBe(true);
		expect((wrapper.get('input[type="text"]').element as HTMLInputElement).value).toBe(
			"#3208CB",
		);
	});

	it("edits the colour that is picked", async () => {
		const wrapper = await mountSuspended(AppCustomThemeEditor);

		await wrapper.findAll('input[aria-label^="Color"]')[1]!.setValue(true);
		expect((wrapper.get('input[type="text"]').element as HTMLInputElement).value).toBe(
			"#1572B8",
		);

		await wrapper.get('input[type="text"]').setValue("#ff8800");

		expect(colors()).toStrictEqual(["#3208CB", "#FF8800", "#7B6BCC"]);
	});

	it("flags a hex that is not a colour yet and applies nothing", async () => {
		const wrapper = await mountSuspended(AppCustomThemeEditor);
		const field = wrapper.get('input[type="text"]');

		await field.setValue("#12");

		expect(field.attributes("aria-invalid")).toBe("true");
		expect(colors()[0]).toBe("#3208CB");

		await field.trigger("blur");
		expect((field.element as HTMLInputElement).value).toBe("#3208CB");
		expect(field.attributes("aria-invalid")).toBe("false");
	});

	it("moves the colour with the arrow keys of the picker", async () => {
		const wrapper = await mountSuspended(AppCustomThemeEditor);
		const area = wrapper.get('[role="slider"][aria-label="Color saturation and brightness"]');
		const before = colors()[0];

		await area.trigger("keydown", { key: "ArrowDown", shiftKey: true });

		expect(colors()[0]).not.toBe(before);
		expect(area.attributes("aria-valuetext")).toMatch(/^Saturation \d+%, brightness \d+%$/);
	});

	it("adds colours up to the most there can be, and removes down to one", async () => {
		const wrapper = await mountSuspended(AppCustomThemeEditor);
		const findButton = (label: string) =>
			wrapper.findAll("button").find((button) => button.text().includes(label));

		while (colors().length < CUSTOM_THEME_MAX_COLORS) {
			await findButton("Add color")!.trigger("click");
		}
		expect(findButton("Add color")).toBeUndefined();

		for (let index = colors().length; index > 1; index--) {
			await wrapper.get('button[aria-label^="Remove color"]').trigger("click");
		}
		expect(colors()).toHaveLength(1);
		expect(
			wrapper.get('button[aria-label^="Remove color"]').attributes("disabled"),
		).toBeDefined();
	});

	it("sets the base, and starts over keeping it", async () => {
		const wrapper = await mountSuspended(AppCustomThemeEditor);

		await wrapper.get('input[aria-label="Light base"]').setValue(true);
		await wrapper.get('input[type="text"]').setValue("#00ff00");
		const reset = wrapper.findAll("button").find((button) => button.text() === "Reset")!;
		await reset.trigger("click");

		expect(useThemeChoice().customTheme.value).toStrictEqual({
			...DEFAULT_CUSTOM_THEME,
			base: "light",
		});
	});
});
