import type { WarnThreshold } from "#shared/utils/warn-thresholds";
import type { ComponentInternalInstance } from "vue";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WarnThresholds from "~/components/guild/moderation/WarnThresholds.vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";

const mockThresholds = ref<WarnThreshold[]>([]);
const mockSetThreshold = vi.fn();
const mockRemoveThreshold = vi.fn();
const mockToastAdd = vi.fn();

mockNuxtImport("useWarnThresholds", () => () => ({
	error: ref(null),
	refresh: vi.fn(),
	removeThreshold: mockRemoveThreshold,
	setThreshold: mockSetThreshold,
	status: ref("success"),
	thresholds: mockThresholds,
}));

mockNuxtImport("useToast", () => () => ({ add: mockToastAdd }));

const mounted: { unmount(): void }[] = [];
async function mountSection() {
	const wrapper = await mountSuspended(WarnThresholds, { attachTo: document.body });
	mounted.push(wrapper);
	await flushPromises();
	return wrapper;
}

type Wrapper = Awaited<ReturnType<typeof mountSection>>;

interface SectionState {
	draft: { action: string; count: number | null; duration: number; period: number };
}

// The fields are Nuxt UI inputs: the draft they fill is reached directly.
function draftOf(wrapper: Wrapper) {
	return (wrapper.vm.$ as ComponentInternalInstance & { setupState: SectionState }).setupState
		.draft;
}

function settings(overrides: Parameters<typeof createMockGuildData>[1] = {}) {
	useGuildSettings().setGuildSettings(createMockGuildData(GUILD_ID, overrides));
}

describe("GuildModerationWarnThresholds", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearNuxtState();
		useActiveGuild().selectGuild(GUILD_ID);
		mockThresholds.value = [];
		mockSetThreshold.mockImplementation(async (count: number, body: object) => ({
			ok: true,
			value: { count, ...body },
		}));
		mockRemoveThreshold.mockResolvedValue({ ok: true, value: undefined });
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("shows the defaults the bot uses while the server has none, without actions", async () => {
		settings({ moderationDefaultWarnThresholds: true, rolesMuted: null });
		const wrapper = await mountSection();

		expect(wrapper.text()).toContain("WolfStar uses the defaults below");
		const rows = wrapper.findAll("tbody tr").map((row) => row.text());
		expect(rows).toHaveLength(3);
		expect(rows[0]).toContain("Timeout");
		expect(rows[0]).toContain("30m");
		expect(rows[2]).toContain("Ban");
		expect(wrapper.find('tbody button[aria-label^="Remove"]').exists()).toBe(false);
	});

	it("says there are none when the defaults are off", async () => {
		settings({ moderationDefaultWarnThresholds: false });
		const wrapper = await mountSection();

		expect(wrapper.text()).toContain("No thresholds yet");
		expect(wrapper.find("table").exists()).toBe(false);
	});

	it("lists the server's thresholds with their period and duration", async () => {
		settings();
		mockThresholds.value = [
			{ action: "Mute", count: 3, duration: null, period: 604_800 },
			{ action: "Kick", count: 5, duration: null, period: 0 },
		];
		const wrapper = await mountSection();

		const [mute, kick] = wrapper.findAll("tbody tr").map((row) => row.text());
		expect(mute).toContain("7d");
		expect(mute).toContain("Permanent");
		expect(kick).toContain("Any time");
		expect(kick).toContain("—");
		expect(wrapper.text()).toContain("2 of 10");
	});

	it("adds a threshold in seconds, and keeps no duration for a kick", async () => {
		settings();
		const wrapper = await mountSection();
		Object.assign(draftOf(wrapper), {
			action: "Kick",
			count: 4,
			duration: 60_000,
			period: 86_400_000,
		});
		await nextTick();

		await wrapper.find("form").trigger("submit");
		await flushPromises();

		expect(mockSetThreshold).toHaveBeenCalledWith(4, {
			action: "Kick",
			duration: null,
			period: 86_400,
		});
		expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
	});

	it("loads a row to edit, and offers to replace it", async () => {
		settings();
		mockThresholds.value = [{ action: "Ban", count: 7, duration: 86_400, period: 0 }];
		const wrapper = await mountSection();

		await wrapper
			.find('button[aria-label="Edit the threshold at 7 warnings"]')
			.trigger("click");

		expect(draftOf(wrapper)).toMatchObject({ action: "Ban", count: 7, duration: 86_400_000 });
		expect(wrapper.find('button[type="submit"]').text()).toBe("Replace threshold");
	});

	it("refuses a timeout without a duration before it is sent", async () => {
		settings();
		const wrapper = await mountSection();
		Object.assign(draftOf(wrapper), { action: "Timeout", duration: 0 });
		await nextTick();

		await wrapper.find("form").trigger("submit");
		await flushPromises();

		expect(mockSetThreshold).not.toHaveBeenCalled();
		expect(wrapper.find('[role="alert"]').text()).toBe("A timeout needs a duration.");
	});

	it("warns that a mute needs a muted role the server does not have", async () => {
		settings({ rolesMuted: null });
		const wrapper = await mountSection();
		draftOf(wrapper).action = "Mute";
		await nextTick();

		expect(wrapper.text()).toContain("This server has no muted role");
	});

	it("stops offering a new number once the server has ten", async () => {
		settings();
		mockThresholds.value = Array.from({ length: 10 }, (_, index) => ({
			action: "Kick" as const,
			count: index + 1,
			duration: null,
			period: 0,
		}));
		const wrapper = await mountSection();
		draftOf(wrapper).count = 20;
		await nextTick();

		expect(wrapper.find('button[type="submit"]').attributes("disabled")).toBeDefined();
		expect(wrapper.text()).toContain("A server has 10 thresholds at most");
	});

	it("removes a threshold", async () => {
		settings();
		mockThresholds.value = [{ action: "Kick", count: 5, duration: null, period: 0 }];
		const wrapper = await mountSection();

		await wrapper
			.find('button[aria-label="Remove the threshold at 5 warnings"]')
			.trigger("click");
		await flushPromises();

		expect(mockRemoveThreshold).toHaveBeenCalledWith(5);
		expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
	});
});
