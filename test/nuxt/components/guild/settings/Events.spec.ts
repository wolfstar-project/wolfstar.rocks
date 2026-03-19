import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Events from "~/components/guild/settings/Events.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const createInitialGuildSettings = () =>
	createMockGuildData("123456789012345678", {
		eventsBanAdd: true,
		eventsBanRemove: false,
		eventsTwemojiReactions: false,
	});

const mockGuildSettings = ref<GuildData | undefined>(createInitialGuildSettings());
const mockOriginalGuildSettings = ref<GuildData | undefined>(createInitialGuildSettings());
const mockGuildData = ref(createMockOauthFlattenedGuild({ id: "123456789012345678" }));

const mockToastAdd = vi.fn();
const mockSetGuildSettingsChanges = vi.fn();
const mockRemoveChange = vi.fn();
const mockSetGuildSettings = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: mockOriginalGuildSettings,
	setGuildSettings: mockSetGuildSettings,
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: mockGuildData,
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

function getSetupState(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
	return (wrapper.vm.$ as any).setupState as {
		state: {
			eventsBanAdd: boolean;
			eventsBanRemove: boolean;
			eventsTwemojiReactions: boolean;
		};
	};
}

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

describe("events guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockGuildSettings.value = createInitialGuildSettings();
		mockOriginalGuildSettings.value = createInitialGuildSettings();
		mockGuildData.value = createMockOauthFlattenedGuild({ id: "123456789012345678" });

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("renders moderation and message event sections", async () => {
		const wrapper = await mountSuspended(Events);

		await nextTick();

		expect(wrapper.text()).toContain("Moderation Events");
		expect(wrapper.text()).toContain("Message Events");
	});

	it("renders toggle switches for all configurable events", async () => {
		const wrapper = await mountSuspended(Events);

		await nextTick();

		expect(getSwitch(wrapper, "Toggle Ban Added").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle Ban Revoked").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle Twemoji Reactions").exists()).toBeTruthy();
	});

	it("initializes state from guildSettings", async () => {
		const wrapper = await mountSuspended(Events);

		await nextTick();
		await nextTick();

		expectSwitchState(wrapper, "Toggle Ban Added", true);
		expectSwitchState(wrapper, "Toggle Ban Revoked", false);
	});

	it("mapToGuildData includes all event keys", async () => {
		const wrapper = await mountSuspended(Events);

		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state).toMatchObject({
			eventsBanAdd: true,
			eventsBanRemove: false,
			eventsTwemojiReactions: false,
		});
		expect(Object.keys(state).toSorted()).toStrictEqual(
			["eventsBanAdd", "eventsBanRemove", "eventsTwemojiReactions"].toSorted(),
		);
	});

	it("computes channels page link from guild ID", async () => {
		const wrapper = await mountSuspended(Events);

		await nextTick();

		const channelsLink = wrapper.find('a[href="/guilds/123456789012345678/manage/channels"]');

		expect(channelsLink.exists()).toBeTruthy();
		expect(channelsLink.text()).toContain("Channels page");
	});

	it("syncs state when guildSettings change externally", async () => {
		const wrapper = await mountSuspended(Events);

		await nextTick();
		expectSwitchState(wrapper, "Toggle Ban Added", true);

		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			eventsBanAdd: false,
			eventsBanRemove: false,
			eventsTwemojiReactions: false,
		});
		await nextTick();
		await nextTick();

		expectSwitchState(wrapper, "Toggle Ban Added", false);
	});
});
