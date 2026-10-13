import type { GuildData } from "#server/database";
import type { ComponentInternalInstance } from "vue";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ChannelType } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Channels from "~/components/guild/settings/Channels.vue";
import { createMockChannel, createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";
const LOG_CHANNEL = "234567890123456789";
const IGNORED_CHANNEL = "345678901234567890";

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
			],
			id: GUILD_ID,
		}),
	),
}));

mockNuxtImport("useToast", () => () => ({ add: vi.fn() }));

function getState(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
	// `setupState` is a Vue internal: it carries the `<script setup>` bindings but
	// is deliberately absent from the public `ComponentInternalInstance` type.
	const instance = wrapper.vm.$ as ComponentInternalInstance & {
		setupState: { state: Partial<GuildData> };
	};
	return instance.setupState.state;
}

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
});
