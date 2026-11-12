import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import Automod from "~/components/guild/settings/Automod.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: ref(createMockGuildData(GUILD_ID)),
	originalGuildSettings: ref(createMockGuildData(GUILD_ID)),
	setGuildSettings: vi.fn(),
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(createMockOauthFlattenedGuild({ id: GUILD_ID })),
}));

function mount() {
	return mountSuspended(Automod, { global: { stubs: { GuildAutomodRules: true } } });
}

// Accessibility audits for GuildSettingsAutomod live in test/nuxt/a11y.spec.ts.
describe("GuildSettingsAutomod", () => {
	it("stacks the log channel, with its help under the field", async () => {
		const wrapper = await mount();

		expect(wrapper.find(".select-row").exists()).toBe(false);
		const help = wrapper.get(".select-field-help");
		expect(help.text()).toContain("Receives a log message");
		expect(help.classes()).not.toContain("sr-only");
	});

	it("puts the switch of Discord's AutoMod before its text", async () => {
		const wrapper = await mount();

		expect(wrapper.get(".order-first").find("[role='switch']").exists()).toBe(true);
	});
});
