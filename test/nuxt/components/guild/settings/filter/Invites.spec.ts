import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Invites from "~/components/guild/settings/filter/Invites.vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

const mockGuildSettings = ref<GuildData | undefined>(
	createMockGuildData("123456789012345678", {
		selfmodInvitesEnabled: true,
		selfmodInvitesSoftAction: 0b110,
		selfmodInvitesHardAction: 2,
		selfmodInvitesHardActionDuration: 60000n,
		selfmodInvitesThresholdMaximum: 15,
		selfmodInvitesThresholdDuration: 30_000,
	}),
);

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

function getSetupState(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
	return (wrapper.vm.$ as any).setupState as {
		state: {
			hardActionDurationMs: number;
			selfmodInvitesEnabled: boolean;
			selfmodInvitesHardAction: number;
			selfmodInvitesThresholdDurationSeconds: number;
			selfmodInvitesThresholdMaximum: number;
			softActionAlerts: boolean;
			softActionDeletes: boolean;
			softActionLogs: boolean;
		};
	};
}

function getSwitch(wrapper: Awaited<ReturnType<typeof mountSuspended>>, label: string) {
	return wrapper.find(`[aria-label="${label}"]`);
}

describe("invite link filter guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			selfmodInvitesEnabled: true,
			selfmodInvitesSoftAction: 0b110,
			selfmodInvitesHardAction: 2,
			selfmodInvitesHardActionDuration: 60000n,
			selfmodInvitesThresholdMaximum: 15,
			selfmodInvitesThresholdDuration: 30_000,
		});

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("renders filter toggle switches", async () => {
		const wrapper = await mountSuspended(Invites);

		await nextTick();
		await nextTick();

		expect(getSwitch(wrapper, "Toggle invite link filter").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle alerts soft action").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle logs soft action").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle deletes soft action").exists()).toBeTruthy();
	});

	it("initializes state from guildSettings with bitwise soft actions", async () => {
		const wrapper = await mountSuspended(Invites);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.softActionAlerts).toBe(true);
		expect(state.softActionLogs).toBe(true);
		expect(state.softActionDeletes).toBe(false);
	});

	it("initializes threshold duration in seconds from milliseconds", async () => {
		const wrapper = await mountSuspended(Invites);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.selfmodInvitesThresholdDurationSeconds).toBe(30);
	});

	it("converts hard action duration from BigInt to number", async () => {
		const wrapper = await mountSuspended(Invites);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.hardActionDurationMs).toBe(60000);
	});

	it("shows loading skeleton when guildSettings is undefined", async () => {
		mockGuildSettings.value = undefined;

		const wrapper = await mountSuspended(Invites);

		await nextTick();
		await nextTick();

		expect(wrapper.find('form[aria-label="Invite link filter settings form"]').exists()).toBe(
			false,
		);
		expect(wrapper.findAllComponents({ name: "USkeleton" }).length).toBeGreaterThan(0);
	});

	it("shows form when guildSettings is loaded", async () => {
		const wrapper = await mountSuspended(Invites);

		await nextTick();
		await nextTick();

		expect(wrapper.find('form[aria-label="Invite link filter settings form"]').exists()).toBe(
			true,
		);
		expect(wrapper.findAllComponents({ name: "USkeleton" })).toHaveLength(0);
	});
});
