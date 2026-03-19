import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Links from "~/components/guild/settings/filter/Links.vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

const mockGuildSettings = ref<GuildData | undefined>(
	createMockGuildData("123456789012345678", {
		selfmodLinksEnabled: true,
		selfmodLinksSoftAction: 0b101,
		selfmodLinksHardAction: 1,
		selfmodLinksHardActionDuration: 120000n,
		selfmodLinksAllowed: ["example.com", "trusted.org"],
		selfmodLinksThresholdMaximum: 20,
		selfmodLinksThresholdDuration: 90_000,
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
			selfmodLinksAllowed: string[];
			selfmodLinksEnabled: boolean;
			selfmodLinksHardAction: number;
			selfmodLinksThresholdDurationSeconds: number;
			selfmodLinksThresholdMaximum: number;
			softActionAlerts: boolean;
			softActionDeletes: boolean;
			softActionLogs: boolean;
		};
	};
}

function getSwitch(wrapper: Awaited<ReturnType<typeof mountSuspended>>, label: string) {
	return wrapper.find(`[aria-label="${label}"]`);
}

describe("link filter guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGuildSettings.value = createMockGuildData("123456789012345678", {
			selfmodLinksEnabled: true,
			selfmodLinksSoftAction: 0b101,
			selfmodLinksHardAction: 1,
			selfmodLinksHardActionDuration: 120000n,
			selfmodLinksAllowed: ["example.com", "trusted.org"],
			selfmodLinksThresholdMaximum: 20,
			selfmodLinksThresholdDuration: 90_000,
		});

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("renders filter toggle switches", async () => {
		const wrapper = await mountSuspended(Links);

		await nextTick();
		await nextTick();

		expect(getSwitch(wrapper, "Toggle link filter").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle alerts soft action").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle logs soft action").exists()).toBeTruthy();
		expect(getSwitch(wrapper, "Toggle deletes soft action").exists()).toBeTruthy();
	});

	it("initializes state from guildSettings with bitwise soft actions", async () => {
		const wrapper = await mountSuspended(Links);

		await nextTick();
		await nextTick();

		const { state } = getSetupState(wrapper);

		expect(state.softActionAlerts).toBe(true);
		expect(state.softActionLogs).toBe(false);
		expect(state.softActionDeletes).toBe(true);
	});

	it("renders existing allowed links as badges", async () => {
		const wrapper = await mountSuspended(Links);

		await nextTick();
		await nextTick();

		expect(wrapper.text()).toContain("example.com");
		expect(wrapper.text()).toContain("trusted.org");
	});

	it("shows loading skeleton when guildSettings is undefined", async () => {
		mockGuildSettings.value = undefined;

		const wrapper = await mountSuspended(Links);

		await nextTick();
		await nextTick();

		expect(wrapper.find('form[aria-label="Link filter settings form"]').exists()).toBe(false);
		expect(wrapper.findAllComponents({ name: "USkeleton" }).length).toBeGreaterThan(0);
	});

	it("shows form when guildSettings is loaded", async () => {
		const wrapper = await mountSuspended(Links);

		await nextTick();
		await nextTick();

		expect(wrapper.find('form[aria-label="Link filter settings form"]').exists()).toBe(true);
		expect(wrapper.findAllComponents({ name: "USkeleton" })).toHaveLength(0);
	});

	it("renders remove buttons for each allowed link", async () => {
		const wrapper = await mountSuspended(Links);

		await nextTick();
		await nextTick();

		expect(wrapper.find('[aria-label="Remove example.com"]').exists()).toBe(true);
		expect(wrapper.find('[aria-label="Remove trusted.org"]').exists()).toBe(true);
	});
});
