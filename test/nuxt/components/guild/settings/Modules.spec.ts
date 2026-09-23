import type { GuildData } from "#server/database";
import { GUILD_MODULES } from "#shared/utils/guild-modules";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Modules from "~/components/guild/settings/Modules.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const createInitialGuildSettings = () =>
	createMockGuildData("123456789012345678", {
		selfmodFilterEnabled: true,
		selfmodInvitesEnabled: true,
	});

const mockGuildSettings = ref<GuildData | undefined>(createInitialGuildSettings());
const mockOriginalGuildSettings = ref<GuildData | undefined>(createInitialGuildSettings());
const mockGuildData = ref(createMockOauthFlattenedGuild({ id: "123456789012345678" }));
const mockToastAdd = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: mockOriginalGuildSettings,
	setGuildSettings: vi.fn(),
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: mockGuildData,
}));

mockNuxtImport("useGuildSettingsChanges", () => () => ({
	guildSettingsChanges: ref<GuildData | undefined>(undefined),
	setGuildSettingsChanges: vi.fn(),
	removeChange: vi.fn(),
	resetGuildSettingsChanges: vi.fn(),
	resetCounter: ref(0),
}));

mockNuxtImport("useToast", () => () => ({
	add: mockToastAdd,
}));

function getSetupState(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
	return (wrapper.vm.$ as any).setupState as {
		state: Record<string, boolean>;
		enabledCount: number;
	};
}

describe("modules guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGuildSettings.value = createInitialGuildSettings();
		mockOriginalGuildSettings.value = createInitialGuildSettings();

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("renders a toggle and a configure button for every module", async () => {
		const wrapper = await mountSuspended(Modules);

		await nextTick();

		const configureButtons = wrapper
			.findAll("button")
			.filter((button) => button.text().includes("Configure"));

		expect(configureButtons).toHaveLength(GUILD_MODULES.length);
		expect(wrapper.findAll('[aria-label^="Toggle "]')).toHaveLength(GUILD_MODULES.length);
	});

	it("opens the module section from its configure button", async () => {
		const wrapper = await mountSuspended(Modules);

		await nextTick();

		const configureButtons = wrapper
			.findAll("button")
			.filter((button) => button.text().includes("Configure"));
		await configureButtons[1]!.trigger("click");
		await nextTick();

		expect(useActiveGuild().section.value).toBe("moderation/capitals");
	});

	it("initializes state and the enabled count from guildSettings", async () => {
		const wrapper = await mountSuspended(Modules);

		await nextTick();

		const { state, enabledCount } = getSetupState(wrapper);

		expect(state.selfmodFilterEnabled).toBe(true);
		expect(state.selfmodInvitesEnabled).toBe(true);
		expect(state.selfmodLinksEnabled).toBe(false);
		expect(enabledCount).toBe(2);
		expect(wrapper.text()).toContain(`2 / ${GUILD_MODULES.length} enabled`);
	});

	it("enables and disables every module at once", async () => {
		const wrapper = await mountSuspended(Modules);

		await nextTick();

		const buttons = wrapper.findAll("button");
		const enableAll = buttons.find((button) => button.text().includes("Enable all"));
		const disableAll = buttons.find((button) => button.text().includes("Disable all"));

		expect(enableAll?.exists()).toBeTruthy();
		expect(disableAll?.exists()).toBeTruthy();

		await enableAll!.trigger("click");
		await nextTick();
		expect(getSetupState(wrapper).enabledCount).toBe(GUILD_MODULES.length);

		await disableAll!.trigger("click");
		await nextTick();
		expect(getSetupState(wrapper).enabledCount).toBe(0);
	});

	it("syncs state when guildSettings change externally", async () => {
		const wrapper = await mountSuspended(Modules);

		await nextTick();
		expect(getSetupState(wrapper).state.selfmodLinksEnabled).toBe(false);

		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			selfmodLinksEnabled: true,
		});
		await nextTick();
		await nextTick();

		expect(getSetupState(wrapper).state.selfmodLinksEnabled).toBe(true);
	});
});
