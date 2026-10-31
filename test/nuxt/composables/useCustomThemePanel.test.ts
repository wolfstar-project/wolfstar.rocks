import { AppCustomThemePanel, AppPreferences } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { nextTick } from "vue";
import { DEFAULT_CUSTOM_THEME } from "~/utils/color-themes";

describe("useCustomThemePanel", () => {
	beforeEach(() => {
		useThemeChoice().selectColorTheme("aurora");
		useThemeChoice().updateCustomTheme({ ...DEFAULT_CUSTOM_THEME });
		// Building the custom theme above picked it: the settings start on the preset.
		useThemeChoice().selectColorTheme("aurora");
		usePreferencesDialog().open("appearance");
	});

	afterEach(() => {
		useCustomThemePanel().discard();
		usePreferencesDialog().isOpen.value = false;
		useThemeChoice().selectBase("system");
	});

	it("closes the settings and previews the custom theme beside the page", () => {
		useCustomThemePanel().open();

		expect(useCustomThemePanel().isOpen.value).toBe(true);
		expect(usePreferencesDialog().isOpen.value).toBe(false);
		expect(useThemeChoice().colorTheme.value).toBe("custom");
	});

	it("keeps the changes on Apply, back in the settings", () => {
		const panel = useCustomThemePanel();
		panel.open();
		useThemeChoice().updateCustomTheme({ angle: 90 });

		panel.apply();

		expect(useThemeChoice().colorTheme.value).toBe("custom");
		expect(useThemeChoice().customTheme.value.angle).toBe(90);
		expect(panel.isOpen.value).toBe(false);
		expect(usePreferencesDialog().isOpen.value).toBe(true);
		expect(usePreferencesDialog().requestedSection.value).toBe("appearance");
	});

	it("puts the previous theme back on Back", () => {
		const panel = useCustomThemePanel();
		panel.open();
		useThemeChoice().updateCustomTheme({ angle: 90 });

		panel.back();

		expect(useThemeChoice().colorTheme.value).toBe("aurora");
		expect(useThemeChoice().customTheme.value.angle).toBe(DEFAULT_CUSTOM_THEME.angle);
		expect(usePreferencesDialog().isOpen.value).toBe(true);
	});

	it("puts the previous theme back when closed, without reopening the settings", () => {
		const panel = useCustomThemePanel();
		panel.open();
		useThemeChoice().updateCustomTheme({ angle: 90 });

		panel.discard();

		expect(useThemeChoice().colorTheme.value).toBe("aurora");
		expect(panel.isOpen.value).toBe(false);
		expect(usePreferencesDialog().isOpen.value).toBe(false);
	});

	it("keeps the theme it first replaced when the settings open it again", () => {
		const panel = useCustomThemePanel();
		panel.open();
		useThemeChoice().updateCustomTheme({ angle: 90 });

		panel.open();
		panel.back();

		expect(useThemeChoice().colorTheme.value).toBe("aurora");
		expect(useThemeChoice().customTheme.value.angle).toBe(DEFAULT_CUSTOM_THEME.angle);
	});

	it("puts the previous theme back when the page is left", async () => {
		const wrapper = await mountSuspended(AppCustomThemePanel);
		const panel = useCustomThemePanel();
		panel.open();
		useThemeChoice().updateCustomTheme({ angle: 90 });
		await nextTick();

		window.dispatchEvent(new Event("pagehide"));
		await nextTick();

		expect(useThemeChoice().colorTheme.value).toBe("aurora");
		expect(localStorage.getItem("wolfstar-settings")).toContain('"colorTheme":"aurora"');
		wrapper.unmount();
	});

	it("opens from the custom theme's swatch in the settings", async () => {
		const wrapper = await mountSuspended(AppPreferences, { props: { only: "appearance" } });

		await wrapper.get('button[aria-label="Custom theme"]').trigger("click");

		expect(useCustomThemePanel().isOpen.value).toBe(true);
		// The swatch no longer holds an editor of its own.
		expect(wrapper.find('input[aria-label="Selected color hex value"]').exists()).toBe(false);
	});

	it("lets the arrow keys walk the themes without leaving the settings", async () => {
		const wrapper = await mountSuspended(AppPreferences, {
			attachTo: document.body,
			props: { only: "appearance" },
		});
		useThemeChoice().selectBase("system");
		await nextTick();
		wrapper.get<HTMLInputElement>('input[aria-label="Sync with system"]').element.focus();

		await userEvent.keyboard("{ArrowRight}");

		expect(useCustomThemePanel().isOpen.value).toBe(false);
		expect(usePreferencesDialog().isOpen.value).toBe(true);
		expect(useThemeChoice().colorTheme.value).not.toBeNull();
		wrapper.unmount();
	});
});
