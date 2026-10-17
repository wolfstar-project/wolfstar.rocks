import type { GuildData } from "#server/database";
import type { ComponentInternalInstance } from "vue";
import { ConfigurableLoggingChannels } from "#shared/utils/settingsDataEntries";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { ChannelType } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Channels from "~/components/guild/settings/Channels.vue";
import LogsBulkChannel from "~/components/guild/settings/LogsBulkChannel.vue";
import LogsSelectionBar from "~/components/guild/settings/LogsSelectionBar.vue";
import SelectChannel from "~/components/select/Channel.vue";
import { createMockChannel, createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";
const LOG_CHANNEL = "234567890123456789";
const IGNORED_CHANNEL = "345678901234567890";
const OTHER_CHANNEL = "456789012345678901";

const createSettings = () =>
	createMockGuildData(GUILD_ID, {
		logsIgnoreAll: [IGNORED_CHANNEL],
		logsMemberAdd: LOG_CHANNEL,
	});

const mockGuildSettings = ref<GuildData | undefined>(createSettings());
const mockSetGuildSettingsChanges = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: ref(mockGuildSettings.value),
	setGuildSettings: vi.fn(),
}));

mockNuxtImport("useGuildSettingsChanges", () => () => ({
	guildSettingsChanges: ref<GuildData | undefined>(undefined),
	setGuildSettingsChanges: mockSetGuildSettingsChanges,
	removeChange: vi.fn(),
	resetGuildSettingsChanges: vi.fn(),
	resetCounter: ref(0),
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(
		createMockOauthFlattenedGuild({
			channels: [
				createMockChannel({
					id: LOG_CHANNEL,
					name: "join-log",
					type: ChannelType.GuildText,
				}),
				createMockChannel({
					id: IGNORED_CHANNEL,
					name: "staff",
					type: ChannelType.GuildText,
				}),
				createMockChannel({
					id: OTHER_CHANNEL,
					name: "mod-log",
					type: ChannelType.GuildText,
				}),
			],
			id: GUILD_ID,
		}),
	),
}));

mockNuxtImport("useToast", () => () => ({ add: vi.fn() }));

type Wrapper = VueWrapper;

function getState(wrapper: Wrapper) {
	// `setupState` is a Vue internal: it carries the `<script setup>` bindings but
	// is deliberately absent from the public `ComponentInternalInstance` type.
	const instance = wrapper.vm.$ as ComponentInternalInstance & {
		setupState: { state: Partial<GuildData> };
	};
	return instance.setupState.state;
}

function findBulkPicker(wrapper: Wrapper, label: string) {
	const picker = wrapper
		.findAllComponents(LogsBulkChannel)
		.find((bulk) => bulk.props("label") === label);
	if (!picker) throw new Error(`No bulk channel picker labelled "${label}"`);
	return picker;
}

// The menu itself renders in a portal; the picker's own event is what matters.
async function pickChannel(picker: ReturnType<typeof findBulkPicker>, channel: string | null) {
	picker.findComponent(SelectChannel).vm.$emit("update:modelValue", channel);
	await nextTick();
	await nextTick();
}

async function mountReady() {
	const wrapper = await mountSuspended(Channels);
	await nextTick();
	await nextTick();
	return wrapper;
}

async function startSelecting(wrapper: Wrapper) {
	const toggle = wrapper.findAll("button").find((button) => button.text() === "Select logs");
	if (!toggle) throw new Error("No Select logs button");
	await toggle.trigger("click");
	await flushPromises();
	return toggle;
}

async function tick(wrapper: Wrapper, ariaLabel: string) {
	await wrapper.find(`[aria-label="${ariaLabel}"]`).trigger("click");
	await flushPromises();
}

const MEMBER_LOGS = [
	"logsMemberAdd",
	"logsMemberRemove",
	"logsMemberNicknameUpdate",
	"logsMemberUsernameUpdate",
	"logsPrune",
] as const;

// Accessibility audits for the shared pickers live in test/nuxt/a11y.spec.ts.
describe("channels guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGuildSettings.value = createSettings();

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	// The form used to start empty whatever was saved, so opening the section
	// made configured log channels look unset.
	it("shows the channels that are already saved", async () => {
		const wrapper = await mountSuspended(Channels);

		await nextTick();

		const state = getState(wrapper);
		expect(state.logsMemberAdd).toBe(LOG_CHANNEL);
		expect(state.logsIgnoreAll).toStrictEqual([IGNORED_CHANNEL]);
		expect(state.logsMessageDelete).toBeNull();
		expect(wrapper.text()).toContain("join-log");
	});

	it("does not stage anything on first render", async () => {
		await mountSuspended(Channels);

		await nextTick();
		await nextTick();

		expect(mockSetGuildSettingsChanges).not.toHaveBeenCalled();
	});

	it("stages only the setting that changed, under its V7 key", async () => {
		const wrapper = await mountSuspended(Channels);

		await nextTick();
		await nextTick();

		await wrapper.find('[aria-label="Toggle Twemoji Reactions"]').trigger("click");
		await nextTick();

		expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
			logsReactionEmojiIncludeTwemoji: true,
		});
	});

	it("follows the saved settings when they change", async () => {
		const wrapper = await mountSuspended(Channels);

		await nextTick();

		mockGuildSettings.value = createMockGuildData(GUILD_ID, { logsMemberAdd: null });
		await nextTick();
		await nextTick();

		expect(getState(wrapper).logsMemberAdd).toBeNull();
	});

	describe("bulk channel pickers", () => {
		it("tells whether the logs of a group share a channel", async () => {
			const wrapper = await mountReady();

			expect(findBulkPicker(wrapper, "All Members logs").text()).toContain("mixed channels");
			expect(findBulkPicker(wrapper, "All Messages logs").text()).toContain("not logged");

			await pickChannel(findBulkPicker(wrapper, "All Members logs"), LOG_CHANNEL);

			expect(findBulkPicker(wrapper, "All Members logs").text()).toContain("join-log");
		});

		it("sets the channel of every log of its group, and stages it", async () => {
			const wrapper = await mountReady();

			await pickChannel(findBulkPicker(wrapper, "All Members logs"), OTHER_CHANNEL);

			const state = getState(wrapper);
			for (const key of MEMBER_LOGS) expect(state[key]).toBe(OTHER_CHANNEL);
			expect(state.logsMessageDelete).toBeNull();
			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith(
				Object.fromEntries(MEMBER_LOGS.map((key) => [key, OTHER_CHANNEL])),
			);
		});

		it("removes the channel of every log of its group when cleared", async () => {
			const wrapper = await mountReady();

			await pickChannel(findBulkPicker(wrapper, "All Members logs"), OTHER_CHANNEL);
			await pickChannel(findBulkPicker(wrapper, "All Members logs"), null);

			const state = getState(wrapper);
			for (const key of MEMBER_LOGS) expect(state[key]).toBeNull();
		});

		it("sets the channel of every log at once", async () => {
			const wrapper = await mountReady();

			await pickChannel(findBulkPicker(wrapper, "Every log"), OTHER_CHANNEL);

			const state = getState(wrapper);
			for (const entry of ConfigurableLoggingChannels) {
				expect(state[entry.key]).toBe(OTHER_CHANNEL);
			}
			// The ignored channels are not log channels.
			expect(state.logsIgnoreAll).toStrictEqual([IGNORED_CHANNEL]);
		});
	});

	describe("mass edit", () => {
		it("shows a checkbox per log only while selecting", async () => {
			const wrapper = await mountReady();
			expect(wrapper.find('[aria-label="Select Message Delete Logs"]').exists()).toBe(false);

			const toggle = await startSelecting(wrapper);

			expect(toggle.attributes("aria-pressed")).toBe("true");
			expect(wrapper.find('[aria-label="Select Message Delete Logs"]').exists()).toBe(true);
			expect(wrapper.find('[role="status"]').text()).toBe("No logs selected");
		});

		it("sets, then removes, the channel of the ticked logs only", async () => {
			const wrapper = await mountReady();
			await startSelecting(wrapper);
			await tick(wrapper, "Select Message Delete Logs");
			await tick(wrapper, "Select Role Create Logs");

			expect(wrapper.find('[role="status"]').text()).toBe("2 logs selected");

			await pickChannel(findBulkPicker(wrapper, "Selected logs"), OTHER_CHANNEL);

			const state = getState(wrapper);
			expect(state.logsMessageDelete).toBe(OTHER_CHANNEL);
			expect(state.logsRoleCreate).toBe(OTHER_CHANNEL);
			expect(state.logsMessageUpdate).toBeNull();
			expect(state.logsMemberAdd).toBe(LOG_CHANNEL);

			const remove = wrapper
				.findComponent(LogsSelectionBar)
				.findAll("button")
				.find((button) => button.text() === "Remove channel");
			await remove?.trigger("click");
			await nextTick();

			expect(state.logsMessageDelete).toBeNull();
			expect(state.logsRoleCreate).toBeNull();
			expect(state.logsMemberAdd).toBe(LOG_CHANNEL);
		});

		it("ticks a whole group, and shows a partly ticked one as mixed", async () => {
			const wrapper = await mountReady();
			await startSelecting(wrapper);
			await tick(wrapper, "Select every log in Roles");

			expect(wrapper.find('[role="status"]').text()).toBe("3 logs selected");
			expect(
				wrapper.find('[aria-label="Select every log in Roles"]').attributes("aria-checked"),
			).toBe("true");

			await tick(wrapper, "Select Role Update Logs");

			expect(
				wrapper.find('[aria-label="Select every log in Roles"]').attributes("aria-checked"),
			).toBe("mixed");
			expect(wrapper.find('[role="status"]').text()).toBe("2 logs selected");
		});

		it("forgets the selection when leaving the mode", async () => {
			const wrapper = await mountReady();
			await startSelecting(wrapper);
			await tick(wrapper, "Select Message Delete Logs");

			const cancel = wrapper
				.findComponent(LogsSelectionBar)
				.findAll("button")
				.find((button) => button.text() === "Cancel selection");
			await cancel?.trigger("click");
			await nextTick();

			expect(wrapper.findComponent(LogsSelectionBar).exists()).toBe(false);
			expect(wrapper.find('[aria-label="Select Message Delete Logs"]').exists()).toBe(false);

			await startSelecting(wrapper);
			expect(wrapper.find('[role="status"]').text()).toBe("No logs selected");
		});
	});
});
