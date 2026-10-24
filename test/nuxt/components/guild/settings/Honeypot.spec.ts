import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ChannelType } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Honeypot from "~/components/guild/settings/Honeypot.vue";
import SelectChannel from "~/components/select/Channel.vue";
import { createMockChannel, createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";
const TRAP_CHANNEL = "234567890123456789";
const LOG_CHANNEL = "345678901234567890";

const mockGuildSettings = ref<GuildData | undefined>(createMockGuildData(GUILD_ID));
const mockSetGuildSettingsChanges = vi.fn();
const mockCopy = vi.fn();

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
					id: TRAP_CHANNEL,
					name: "do-not-type-here",
					type: ChannelType.GuildText,
				}),
				createMockChannel({
					id: LOG_CHANNEL,
					name: "mod-log",
					type: ChannelType.GuildText,
				}),
			],
			id: GUILD_ID,
		}),
	),
}));

mockNuxtImport("useClipboard", () => () => ({ copy: mockCopy, copied: ref(false) }));
mockNuxtImport("useToast", () => () => ({ add: vi.fn() }));

async function mountReady() {
	const wrapper = await mountSuspended(Honeypot);
	await nextTick();
	await nextTick();
	return wrapper;
}

describe("honeypot guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGuildSettings.value = createMockGuildData(GUILD_ID);

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	describe("without a channel", () => {
		it("says the trap is off and how Discord sets it up", async () => {
			const wrapper = await mountReady();

			expect(wrapper.text()).toContain("Not set up");
			expect(wrapper.text()).toContain("The honeypot is off");
			expect(wrapper.text()).toContain("Run /honeypot setup in Discord");
			expect(wrapper.find("form").exists()).toBe(false);
		});

		it("copies the setup command", async () => {
			const wrapper = await mountReady();

			const copy = wrapper
				.findAll("button")
				.find((button) => button.text() === "Copy /honeypot setup");
			await copy!.trigger("click");

			expect(mockCopy).toHaveBeenCalledWith(
				"/honeypot setup",
				expect.objectContaining({ title: "Command copied" }),
			);
		});
	});

	describe("with a channel", () => {
		beforeEach(() => {
			mockGuildSettings.value = createMockGuildData(GUILD_ID, {
				honeypotAction: "Ban",
				honeypotChannel: TRAP_CHANNEL,
				honeypotLogChannel: LOG_CHANNEL,
			});
		});

		it("names the channel it catches in, which only Discord changes", async () => {
			const wrapper = await mountReady();

			expect(wrapper.text()).toContain(
				"Catching who writes in #do-not-type-here, but the moderators.",
			);
			// One picker, for the reports: the trap itself is no field.
			const pickers = wrapper.findAllComponents(SelectChannel);
			expect(pickers).toHaveLength(1);
			expect(pickers[0]!.props("label")).toBe("Honeypot Catches Channel");
		});

		it("cannot report the catches to the trap itself", async () => {
			const wrapper = await mountReady();

			expect(wrapper.findComponent(SelectChannel).props("exclude")).toStrictEqual([
				TRAP_CHANNEL,
			]);
		});

		it("shows the action and the warning without letting them change", async () => {
			const wrapper = await mountReady();

			const ban = wrapper.find('[role="radio"][value="Ban"]');
			expect(ban.attributes("aria-checked")).toBe("true");
			expect(ban.attributes("disabled")).toBeDefined();
			expect(
				wrapper.find('[aria-label="Toggle Honeypot Warning"]').attributes("disabled"),
			).toBeDefined();
		});

		it("stages the switches the dashboard edits", async () => {
			const wrapper = await mountReady();

			await wrapper.find('[aria-label="Toggle Tell Caught Members Why"]').trigger("click");
			await nextTick();

			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
				honeypotDirectMessage: false,
			});
		});
	});
});
