import type { GuildData } from "#server/database";
import type { ComponentInternalInstance } from "vue";
import { GUILD_MODULES } from "#shared/utils/guild-modules";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Modules from "~/components/guild/settings/Modules.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const createInitialGuildSettings = () =>
	createMockGuildData("123456789012345678", {
		modulesAutomod: false,
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

interface ModulesSetupState {
	state: Record<string, boolean>;
	enabledCount: number;
}

function getSetupState(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
	// `setupState` is a Vue internal: it carries the `<script setup>` bindings but
	// is deliberately absent from the public `ComponentInternalInstance` type.
	const instance = wrapper.vm.$ as ComponentInternalInstance & { setupState: ModulesSetupState };
	return instance.setupState;
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

	it("renders a toggle for every module and a configure button for the enabled ones", async () => {
		const wrapper = await mountSuspended(Modules);

		await nextTick();

		const buttonsLabelled = (label: string) =>
			wrapper.findAll("button").filter((button) => button.text().includes(label));

		// Moderation, Roles and the Events are on; the honeypot is set up in
		// Discord and the three lists of channels have no switch, so they always
		// open; a module that is off has to be enabled first, and the appeals are
		// off until their switch is on.
		expect(buttonsLabelled("Configure")).toHaveLength(7);
		expect(buttonsLabelled("Enable first")).toHaveLength(GUILD_MODULES.length - 3 + 1);
		expect(wrapper.findAll('[aria-label^="Toggle "]')).toHaveLength(GUILD_MODULES.length + 1);
	});

	it("tells whether the honeypot is set up, from its channel", async () => {
		const wrapper = await mountSuspended(Modules);
		await nextTick();

		expect(wrapper.text()).toContain("Not set up");

		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			honeypotChannel: "234567890123456789",
		});
		await nextTick();
		await nextTick();

		expect(wrapper.text()).not.toContain("Not set up");
		expect(wrapper.text()).toContain("Set up");
	});

	it("switches the Events with the other modules", async () => {
		const wrapper = await mountSuspended(Modules);
		await nextTick();

		await wrapper.find('[aria-label="Toggle Events"]').trigger("click");
		await nextTick();

		expect(getSetupState(wrapper).state.modulesLogs).toBe(false);
		expect(getSetupState(wrapper).enabledCount).toBe(2);
	});

	it("switches the appeals like a module, Disable all included", async () => {
		const wrapper = await mountSuspended(Modules);
		await nextTick();

		await wrapper.find('[aria-label="Toggle Appeals"]').trigger("click");
		await nextTick();
		expect(getSetupState(wrapper).state.appealsEnabled).toBe(true);
		expect(getSetupState(wrapper).enabledCount).toBe(4);

		const disableAll = wrapper
			.findAll("button")
			.find((button) => button.text().includes("Disable all"));
		await disableAll!.trigger("click");
		await nextTick();

		expect(getSetupState(wrapper).state.appealsEnabled).toBe(false);
		expect(getSetupState(wrapper).enabledCount).toBe(0);
	});

	it("opens the module section from its configure button", async () => {
		const wrapper = await mountSuspended(Modules);

		await nextTick();

		const configureButtons = wrapper
			.findAll("button")
			.filter((button) => button.text().includes("Configure"));
		await configureButtons[0]!.trigger("click");
		await nextTick();

		expect(useActiveGuild().section.value).toBe("moderation");
	});

	it("initializes state and the enabled count from guildSettings", async () => {
		const wrapper = await mountSuspended(Modules);

		await nextTick();

		const { state, enabledCount } = getSetupState(wrapper);

		expect(state.modulesModeration).toBe(true);
		expect(state.modulesRoles).toBe(true);
		expect(state.modulesAutomod).toBe(false);
		expect(state.modulesLogs).toBe(true);
		expect(enabledCount).toBe(3);
		// The four flags of `Modules` and the switch of the appeals.
		expect(wrapper.text()).toContain("3 / 5 enabled");
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
		expect(getSetupState(wrapper).enabledCount).toBe(GUILD_MODULES.length + 1);

		await disableAll!.trigger("click");
		await nextTick();
		expect(getSetupState(wrapper).enabledCount).toBe(0);
	});

	it("syncs state when guildSettings change externally", async () => {
		const wrapper = await mountSuspended(Modules);

		await nextTick();
		expect(getSetupState(wrapper).state.modulesAutomod).toBe(false);

		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			modulesAutomod: true,
		});
		await nextTick();
		await nextTick();

		expect(getSetupState(wrapper).state.modulesAutomod).toBe(true);
	});
});
