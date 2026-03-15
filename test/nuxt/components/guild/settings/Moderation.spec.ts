import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Moderation from "~/components/guild/settings/Moderation.vue";
import { ConfigurableModerationKeys } from "~~/shared/utils/settingsDataEntries";
import { createMockGuildData } from "~~/test/mocks/guildData";

const mockGuildSettings = ref<GuildData | undefined>(createMockGuildData("123456789012345678"));
const mockToastAdd = vi.fn();
const mockSetGuildSettingsChanges = vi.fn();
const mockRemoveChange = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: ref(mockGuildSettings.value),
	setGuildSettings: vi.fn(),
}));

mockNuxtImport("useGuildSettingsChanges", () => () => ({
	guildSettingsChanges: ref<GuildData | undefined>(undefined),
	setGuildSettingsChanges: mockSetGuildSettingsChanges,
	removeChange: mockRemoveChange,
	resetGuildSettingsChanges: vi.fn(),
	resetCounter: ref(0),
}));

mockNuxtImport("useToast", () => () => ({
	add: mockToastAdd,
}));

function getSwitch(wrapper: Awaited<ReturnType<typeof mountSuspended>>, label: string) {
	return wrapper.find(`[aria-label="${label}"]`);
}

function expectSwitchState(
	wrapper: Awaited<ReturnType<typeof mountSuspended>>,
	label: string,
	expected: boolean,
) {
	const switchElement = getSwitch(wrapper, label);

	expect(switchElement.exists()).toBeTruthy();

	const ariaChecked = switchElement.attributes("aria-checked");
	if (ariaChecked !== undefined) {
		expect(ariaChecked === "true").toBe(expected);
		return;
	}

	const ariaPressed = switchElement.attributes("aria-pressed");
	if (ariaPressed !== undefined) {
		expect(ariaPressed === "true").toBe(expected);
		return;
	}

	const dataState = switchElement.attributes("data-state");
	if (dataState !== undefined) {
		expect(dataState === "checked").toBe(expected);
		return;
	}

	if (switchElement.element instanceof HTMLInputElement) {
		expect(switchElement.element.checked).toBe(expected);
		return;
	}

	throw new Error(`Unable to determine switch state for ${label}`);
}

describe("moderation guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGuildSettings.value = createMockGuildData("123456789012345678");

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("renders all moderation setting toggles", async () => {
		const wrapper = await mountSuspended(Moderation);

		await nextTick();

		for (const setting of ConfigurableModerationKeys) {
			expect(getSwitch(wrapper, `Toggle ${setting.name}`).exists()).toBeTruthy();
		}
	});

	it("shows section title and description", async () => {
		const wrapper = await mountSuspended(Moderation);

		await nextTick();

		expect(wrapper.text()).toContain("Punishment Settings");
		expect(wrapper.text()).toContain(
			"These settings affect what WolfStar does when you're punishing (ban, kick, mute, etc) someone.",
		);
	});

	it("initializes toggle states from guildSettings", async () => {
		const wrapper = await mountSuspended(Moderation);

		await nextTick();
		await nextTick();

		expectSwitchState(wrapper, "Toggle Hide Message", false);
		expectSwitchState(wrapper, "Toggle Send Punishment Response", true);
	});

	it("syncs state when guildSettings change externally", async () => {
		const wrapper = await mountSuspended(Moderation);

		await nextTick();
		expectSwitchState(wrapper, "Toggle Hide Message", false);

		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			messagesModerationAutoDelete: true,
		});
		await nextTick();
		await nextTick();

		expectSwitchState(wrapper, "Toggle Hide Message", true);
	});

	it("has correct aria-labels for accessibility", async () => {
		const wrapper = await mountSuspended(Moderation);

		await nextTick();

		for (const setting of ConfigurableModerationKeys) {
			const switchElement = getSwitch(wrapper, `Toggle ${setting.name}`);

			expect(switchElement.exists()).toBeTruthy();
			expect(switchElement.attributes("aria-label")).toBe(`Toggle ${setting.name}`);
		}
	});
});
