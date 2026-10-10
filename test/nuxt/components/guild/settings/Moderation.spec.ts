import type { GuildData } from "#server/database";
import { ConfigurableModerationToggles } from "#shared/utils/settingsDataEntries";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Moderation from "~/components/guild/settings/Moderation.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
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

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(createMockOauthFlattenedGuild({ id: "123456789012345678" })),
}));

function getSwitch(wrapper: Awaited<ReturnType<typeof mountSuspended>>, label: string) {
	return wrapper.find(`[aria-label="${label}"]`);
}

function readSwitchState(
	wrapper: Awaited<ReturnType<typeof mountSuspended>>,
	label: string,
): boolean {
	const switchElement = getSwitch(wrapper, label);

	if (!switchElement.exists()) {
		throw new Error(`Switch not found for ${label}`);
	}

	const ariaChecked = switchElement.attributes("aria-checked");
	if (ariaChecked !== undefined) {
		return ariaChecked === "true";
	}

	const ariaPressed = switchElement.attributes("aria-pressed");
	if (ariaPressed !== undefined) {
		return ariaPressed === "true";
	}

	const dataState = switchElement.attributes("data-state");
	if (dataState !== undefined) {
		return dataState === "checked";
	}

	if (switchElement.element instanceof HTMLInputElement) {
		return switchElement.element.checked;
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

		for (const setting of ConfigurableModerationToggles) {
			expect(getSwitch(wrapper, `Toggle ${setting.name}`).exists()).toBeTruthy();
		}
	});

	it("shows section title and description", async () => {
		const wrapper = await mountSuspended(Moderation);

		await nextTick();

		expect(wrapper.text()).toContain("Moderation");
		expect(wrapper.text()).toContain(
			"Choose where moderation cases are logged and which manual actions open a case.",
		);
	});

	it("initializes toggle states from guildSettings", async () => {
		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			moderationTrackTimeouts: true,
		});
		const wrapper = await mountSuspended(Moderation);

		await nextTick();
		await nextTick();

		expect(readSwitchState(wrapper, "Toggle Track Manual Bans")).toBe(false);
		expect(readSwitchState(wrapper, "Toggle Track Manual Timeouts")).toBe(true);
	});

	it("stages only the key a toggle edits", async () => {
		const wrapper = await mountSuspended(Moderation);

		await nextTick();
		await nextTick();

		await getSwitch(wrapper, "Toggle Track Manual Bans").trigger("click");
		await nextTick();

		expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
			moderationTrackBans: true,
		});
	});

	it("syncs state when guildSettings change externally", async () => {
		const wrapper = await mountSuspended(Moderation);

		await nextTick();
		expect(readSwitchState(wrapper, "Toggle Track Manual Bans")).toBe(false);

		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			moderationTrackBans: true,
		});
		await nextTick();
		await nextTick();

		expect(readSwitchState(wrapper, "Toggle Track Manual Bans")).toBe(true);
	});

	it("has correct aria-labels for accessibility", async () => {
		const wrapper = await mountSuspended(Moderation);

		await nextTick();

		for (const setting of ConfigurableModerationToggles) {
			const switchElement = getSwitch(wrapper, `Toggle ${setting.name}`);

			expect(switchElement.exists()).toBeTruthy();
			expect(switchElement.attributes("aria-label")).toBe(`Toggle ${setting.name}`);
		}
	});
});
