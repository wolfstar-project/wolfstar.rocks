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

	const moduleSwitch = (wrapper: Awaited<ReturnType<typeof mountReady>>) =>
		wrapper.find('[aria-label="Toggle Honeypot"]');

	describe("without a channel", () => {
		it("is off, with the switch and the Discord way to set it up", async () => {
			const wrapper = await mountReady();

			expect(moduleSwitch(wrapper).attributes("aria-checked")).toBe("false");
			expect(wrapper.text()).toContain("The honeypot is off");
			expect(wrapper.text()).toContain("/honeypot setup in Discord");
			expect(wrapper.findAllComponents(SelectChannel)).toHaveLength(0);
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

		it("opens the form on the switch and stages nothing until a channel is picked", async () => {
			const wrapper = await mountReady();

			await moduleSwitch(wrapper).trigger("click");
			await nextTick();

			expect(wrapper.text()).toContain("Pick the honeypot channel to turn it on.");
			const [trap] = wrapper.findAllComponents(SelectChannel);
			expect(trap!.props("label")).toBe("Honeypot Channel");
			expect(trap!.props("modelValue")).toBeNull();
			expect(mockSetGuildSettingsChanges).not.toHaveBeenCalledWith(
				expect.objectContaining({ honeypotChannel: expect.anything() }),
			);

			trap!.vm.$emit("update:modelValue", TRAP_CHANNEL);
			await nextTick();

			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
				honeypotChannel: TRAP_CHANNEL,
			});
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

		it("is on and names the channel it catches in", async () => {
			const wrapper = await mountReady();

			expect(moduleSwitch(wrapper).attributes("aria-checked")).toBe("true");
			expect(wrapper.text()).toContain(
				"Catching who writes in #do-not-type-here, but the moderators.",
			);
			const pickers = wrapper.findAllComponents(SelectChannel);
			expect(pickers.map((picker) => picker.props("label"))).toStrictEqual([
				"Honeypot Channel",
				"Honeypot Catches Channel",
			]);
		});

		it("keeps the trap and the catches in different channels", async () => {
			const wrapper = await mountReady();

			const [trap, logs] = wrapper.findAllComponents(SelectChannel);
			expect(trap!.props("exclude")).toStrictEqual([LOG_CHANNEL]);
			expect(logs!.props("exclude")).toStrictEqual([TRAP_CHANNEL]);
		});

		it("turns off by clearing the channel", async () => {
			const wrapper = await mountReady();

			await moduleSwitch(wrapper).trigger("click");
			await nextTick();

			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({ honeypotChannel: null });
		});

		it("stages the action and the warning like the other settings", async () => {
			const wrapper = await mountReady();

			await wrapper.find('[role="radio"][value="Kick"]').trigger("click");
			await nextTick();
			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
				honeypotAction: "Kick",
			});

			await wrapper.find('[aria-label="Toggle Honeypot Warning"]').trigger("click");
			await nextTick();
			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
				honeypotAction: "Kick",
				honeypotWarning: false,
			});
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
