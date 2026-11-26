import type { GuildData } from "#server/database";
import type { ComponentInternalInstance } from "vue";
import type { SocialModuleStatus } from "~/composables/useSocialModule";
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

// Staryl holds the Social module, so its state comes from Staryl and not from the settings.
const socialReady = (enabled: boolean): SocialModuleStatus => ({
	kind: "ready",
	state: {
		enabled,
		installed: true,
		limits: { messageLength: 200, subscriptions: 25, targetLength: 500, xAccounts: 2 },
		providers: [],
		subscriptions: [],
		twitch: [],
		twitchLiveConfigured: true,
	},
});
const mockSocialStatus = ref<SocialModuleStatus>(socialReady(true));
const mockSetSocialEnabled = vi.fn();
const mockRefreshSocial = vi.fn();

mockNuxtImport("useSocialModule", () => () => ({
	refresh: mockRefreshSocial,
	setEnabled: mockSetSocialEnabled,
	status: mockSocialStatus,
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
		mockSocialStatus.value = socialReady(true);
		mockSetSocialEnabled.mockResolvedValue({ ok: true, value: false });

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
		// open; a module that is off has to be enabled first, and the appeals, the
		// join guard and the onboarding are off until their switch is on. Staryl's
		// Social opens too.
		expect(buttonsLabelled("Configure")).toHaveLength(8);
		expect(buttonsLabelled("Enable first")).toHaveLength(GUILD_MODULES.length - 3 + 3);
		// The flags of `Modules`, the honeypot, the appeals, the join guard, the
		// onboarding, the three Auto-* modules and Staryl's Social.
		expect(wrapper.findAll('[aria-label^="Toggle "]')).toHaveLength(GUILD_MODULES.length + 8);
	});

	describe("Staryl's Social", () => {
		it("is shown apart, and not counted with the switches of WolfStar", async () => {
			mockSocialStatus.value = socialReady(false);
			const wrapper = await mountSuspended(Modules);
			await nextTick();

			const social = wrapper.get('[aria-label="Toggle Social"]');
			expect(social.attributes("aria-checked")).toBe("false");
			expect(wrapper.text()).toContain("No subscription");
			// Off, it takes nothing from the count, which is of the staged switches.
			expect(wrapper.text()).toContain(`/ ${MODULE_SWITCH_KEYS.length} enabled`);
		});

		it("saves a flip of its switch at once", async () => {
			const wrapper = await mountSuspended(Modules);
			await nextTick();

			await wrapper.get('[aria-label="Toggle Social"]').trigger("click");

			expect(mockSetSocialEnabled).toHaveBeenCalledWith(false);
		});

		it("is left alone by Disable all, which stages WolfStar's switches", async () => {
			const wrapper = await mountSuspended(Modules);
			await nextTick();

			const disableAll = wrapper
				.findAll("button")
				.find((button) => button.text() === "Disable all");
			await disableAll?.trigger("click");
			await nextTick();

			expect(mockSetSocialEnabled).not.toHaveBeenCalled();
			expect(wrapper.get('[aria-label="Toggle Social"]').attributes("aria-checked")).toBe(
				"true",
			);
		});

		it("says why a flip did not go through", async () => {
			mockSetSocialEnabled.mockResolvedValue({ code: "unavailable", ok: false });
			const wrapper = await mountSuspended(Modules);
			await nextTick();

			await wrapper.get('[aria-label="Toggle Social"]').trigger("click");

			await vi.waitFor(() =>
				expect(mockToastAdd).toHaveBeenCalledWith(
					expect.objectContaining({
						color: "error",
						description:
							"The dashboard could not reach Staryl. Try again in a few minutes.",
					}),
				),
			);
		});

		it("offers Staryl's invite, and no switch, where Staryl is not in the server", async () => {
			mockSocialStatus.value = { kind: "not-installed" };
			const wrapper = await mountSuspended(Modules);
			await nextTick();

			expect(wrapper.find('[aria-label="Toggle Social"]').exists()).toBe(false);
			expect(wrapper.text()).toContain("Staryl is not in this server");
			const invite = wrapper.findAll("a").find((link) => link.text() === "Invite Staryl");
			expect(invite?.attributes("href")).toBe(useInvites().Staryl);
		});

		it("says Social is not available when Staryl cannot be reached, and tries again", async () => {
			mockSocialStatus.value = { kind: "unavailable" };
			const wrapper = await mountSuspended(Modules);
			await nextTick();

			expect(wrapper.find('[aria-label="Toggle Social"]').exists()).toBe(false);
			expect(wrapper.text()).toContain("Not available");

			const retry = wrapper
				.findAll("button")
				.find((button) => button.text() === "Retry Social");
			await retry?.trigger("click");

			expect(mockRefreshSocial).toHaveBeenCalledOnce();
		});
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

	it("switches an Auto-* module, whose channels stay", async () => {
		const wrapper = await mountSuspended(Modules);
		await nextTick();

		const autoDelete = wrapper.get('[aria-label="Toggle Auto-Delete"]');
		expect(autoDelete.attributes("aria-checked")).toBe("true");
		// The list of its channels is still told, beside the switch.
		expect(wrapper.text()).toContain("No channel");

		await autoDelete.trigger("click");
		await nextTick();

		expect(getSetupState(wrapper).state.modulesAutodelete).toBe(false);
	});

	it("switches the Events with the other modules", async () => {
		const wrapper = await mountSuspended(Modules);
		await nextTick();

		await wrapper.find('[aria-label="Toggle Events"]').trigger("click");
		await nextTick();

		expect(getSetupState(wrapper).state.modulesLogs).toBe(false);
		expect(getSetupState(wrapper).enabledCount).toBe(6);
	});

	it("switches the appeals like a module, Disable all included", async () => {
		const wrapper = await mountSuspended(Modules);
		await nextTick();

		await wrapper.find('[aria-label="Toggle Appeals"]').trigger("click");
		await nextTick();
		expect(getSetupState(wrapper).state.appealsEnabled).toBe(true);
		expect(getSetupState(wrapper).enabledCount).toBe(8);

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
		expect(enabledCount).toBe(7);
		// The flags of `Modules`, and the switches of the modules with a table of their own.
		expect(wrapper.text()).toContain("7 / 11 enabled");
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
		expect(getSetupState(wrapper).enabledCount).toBe(GUILD_MODULES.length + 7);

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
