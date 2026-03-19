import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import NewLine from "~/components/guild/settings/filter/NewLine.vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

const mockGuildSettings = ref<GuildData | undefined>(
	createMockGuildData("123456789012345678", {
		selfmodNewlinesEnabled: true,
		selfmodNewlinesSoftAction: 0b100,
		selfmodNewlinesHardAction: 4,
		selfmodNewlinesHardActionDuration: 180000n,
		selfmodNewlinesMaximum: 50,
		selfmodNewlinesThresholdMaximum: 12,
		selfmodNewlinesThresholdDuration: 20_000,
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
			selfmodNewlinesEnabled: boolean;
			selfmodNewlinesHardAction: number;
			selfmodNewlinesMaximum: number;
			selfmodNewlinesThresholdDurationSeconds: number;
			selfmodNewlinesThresholdMaximum: number;
			softActionAlerts: boolean;
			softActionDeletes: boolean;
			softActionLogs: boolean;
		};
	};
}

function getSwitch(wrapper: Awaited<ReturnType<typeof mountSuspended>>, label: string) {
	return wrapper.find(`[aria-label="${label}"]`);
}

describe("new line filter guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			selfmodNewlinesEnabled: true,
			selfmodNewlinesSoftAction: 0b100,
			selfmodNewlinesHardAction: 4,
			selfmodNewlinesHardActionDuration: 180000n,
			selfmodNewlinesMaximum: 50,
			selfmodNewlinesThresholdMaximum: 12,
			selfmodNewlinesThresholdDuration: 20_000,
		});

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("renders filter toggle switches", async () => {
		const wrapper = await mountSuspended(NewLine);

		await nextTick();
		await nextTick();

		expect(getSwitch(wrapper, "Toggle line spam filter").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle alerts soft action").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle logs soft action").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle deletes soft action").exists()).toBeTruthy();
	});

	it("initializes state from guildSettings with bitwise soft actions", async () => {
		const wrapper = await mountSuspended(NewLine);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.softActionAlerts).toBe(true);
		expect(state.softActionLogs).toBe(false);
		expect(state.softActionDeletes).toBe(false);
	});

	it("initializes threshold duration in seconds from milliseconds", async () => {
		const wrapper = await mountSuspended(NewLine);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.selfmodNewlinesThresholdDurationSeconds).toBe(20);
	});

	it("converts hard action duration from BigInt to number", async () => {
		const wrapper = await mountSuspended(NewLine);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.hardActionDurationMs).toBe(180000);
	});

	it("shows loading skeleton when guildSettings is undefined", async () => {
		mockGuildSettings.value = undefined;

		const wrapper = await mountSuspended(NewLine);

		await nextTick();
		await nextTick();

		expect(wrapper.find('form[aria-label="New line filter settings form"]').exists()).toBe(
			false,
		);
		expect(wrapper.findAllComponents({ name: "USkeleton" }).length).toBeGreaterThan(0);
	});

	it("shows form when guildSettings is loaded", async () => {
		const wrapper = await mountSuspended(NewLine);

		await nextTick();
		await nextTick();

		expect(wrapper.find('form[aria-label="New line filter settings form"]').exists()).toBe(
			true,
		);
		expect(wrapper.findAllComponents({ name: "USkeleton" })).toHaveLength(0);
	});
});
