import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import MessageDuplication from "~/components/guild/settings/filter/MessageDuplication.vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

const mockGuildSettings = ref<GuildData | undefined>(
	createMockGuildData("123456789012345678", {
		selfmodMessagesEnabled: true,
		selfmodMessagesSoftAction: 0b011,
		selfmodMessagesHardAction: 3,
		selfmodMessagesHardActionDuration: 300000n,
		selfmodMessagesThresholdMaximum: 25,
		selfmodMessagesThresholdDuration: 45_000,
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
			selfmodMessagesEnabled: boolean;
			selfmodMessagesHardAction: number;
			selfmodMessagesThresholdDurationSeconds: number;
			selfmodMessagesThresholdMaximum: number;
			softActionAlerts: boolean;
			softActionDeletes: boolean;
			softActionLogs: boolean;
		};
	};
}

function getSwitch(wrapper: Awaited<ReturnType<typeof mountSuspended>>, label: string) {
	return wrapper.find(`[aria-label="${label}"]`);
}

describe("message duplication filter guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			selfmodMessagesEnabled: true,
			selfmodMessagesSoftAction: 0b011,
			selfmodMessagesHardAction: 3,
			selfmodMessagesHardActionDuration: 300000n,
			selfmodMessagesThresholdMaximum: 25,
			selfmodMessagesThresholdDuration: 45_000,
		});

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("renders filter toggle switches", async () => {
		const wrapper = await mountSuspended(MessageDuplication);

		await nextTick();
		await nextTick();

		expect(getSwitch(wrapper, "Toggle message duplication filter").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle alerts soft action").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle logs soft action").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle deletes soft action").exists()).toBeTruthy();
	});

	it("initializes state from guildSettings with bitwise soft actions", async () => {
		const wrapper = await mountSuspended(MessageDuplication);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.softActionAlerts).toBe(false);
		expect(state.softActionLogs).toBe(true);
		expect(state.softActionDeletes).toBe(true);
	});

	it("initializes threshold duration in seconds from milliseconds", async () => {
		const wrapper = await mountSuspended(MessageDuplication);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.selfmodMessagesThresholdDurationSeconds).toBe(45);
	});

	it("converts hard action duration from BigInt to number", async () => {
		const wrapper = await mountSuspended(MessageDuplication);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.hardActionDurationMs).toBe(300000);
	});

	it("shows loading skeleton when guildSettings is undefined", async () => {
		mockGuildSettings.value = undefined;

		const wrapper = await mountSuspended(MessageDuplication);

		await nextTick();
		await nextTick();

		expect(
			wrapper.find('form[aria-label="Message duplication filter settings form"]').exists(),
		).toBe(false);
		expect(wrapper.findAllComponents({ name: "USkeleton" }).length).toBeGreaterThan(0);
	});

	it("shows form when guildSettings is loaded", async () => {
		const wrapper = await mountSuspended(MessageDuplication);

		await nextTick();
		await nextTick();

		expect(
			wrapper.find('form[aria-label="Message duplication filter settings form"]').exists(),
		).toBe(true);
		expect(wrapper.findAllComponents({ name: "USkeleton" })).toHaveLength(0);
	});
});
