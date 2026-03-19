import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Word from "~/components/guild/settings/filter/Word.vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

const mockGuildSettings = ref<GuildData | undefined>(
	createMockGuildData("123456789012345678", {
		selfmodFilterEnabled: true,
		selfmodFilterSoftAction: 0b101,
		selfmodFilterHardAction: 1,
		selfmodFilterRaw: ["badword", "offensive"],
		selfmodFilterThresholdMaximum: 20,
		selfmodFilterThresholdDuration: 90_000,
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
			selfmodFilterEnabled: boolean;
			selfmodFilterHardAction: number;
			selfmodFilterRaw: string[];
			selfmodFilterThresholdDurationSeconds: number;
			selfmodFilterThresholdMaximum: number;
			softActionAlerts: boolean;
			softActionDeletes: boolean;
			softActionLogs: boolean;
		};
	};
}

function getSwitch(wrapper: Awaited<ReturnType<typeof mountSuspended>>, label: string) {
	return wrapper.find(`[aria-label="${label}"]`);
}

describe("word filter guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			selfmodFilterEnabled: true,
			selfmodFilterSoftAction: 0b101,
			selfmodFilterHardAction: 1,
			selfmodFilterRaw: ["badword", "offensive"],
			selfmodFilterThresholdMaximum: 20,
			selfmodFilterThresholdDuration: 90_000,
		});

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("renders filter toggle switches", async () => {
		const wrapper = await mountSuspended(Word);

		await nextTick();
		await nextTick();

		expect(getSwitch(wrapper, "Toggle word filter").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle alerts soft action").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle logs soft action").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle deletes soft action").exists()).toBeTruthy();
	});

	it("initializes state from guildSettings with bitwise soft actions", async () => {
		const wrapper = await mountSuspended(Word);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.softActionAlerts).toBe(true);
		expect(state.softActionLogs).toBe(false);
		expect(state.softActionDeletes).toBe(true);
	});

	it("renders existing filtered words as badges", async () => {
		const wrapper = await mountSuspended(Word);

		await nextTick();
		await nextTick();

		expect(wrapper.text()).toContain("badword");
		expect(wrapper.text()).toContain("offensive");
	});

	it("shows loading skeleton when guildSettings is undefined", async () => {
		mockGuildSettings.value = undefined;

		const wrapper = await mountSuspended(Word);

		await nextTick();
		await nextTick();

		expect(wrapper.find('form[aria-label="Word filter settings form"]').exists()).toBe(false);
		expect(wrapper.findAllComponents({ name: "USkeleton" }).length).toBeGreaterThan(0);
	});

	it("shows form when guildSettings is loaded", async () => {
		const wrapper = await mountSuspended(Word);

		await nextTick();
		await nextTick();

		expect(wrapper.find('form[aria-label="Word filter settings form"]').exists()).toBe(true);
		expect(wrapper.findAllComponents({ name: "USkeleton" })).toHaveLength(0);
	});

	it("renders remove buttons for each filtered word", async () => {
		const wrapper = await mountSuspended(Word);

		await nextTick();
		await nextTick();

		expect(wrapper.find('[aria-label="Remove badword"]').exists()).toBe(true);
		expect(wrapper.find('[aria-label="Remove offensive"]').exists()).toBe(true);
	});
});
