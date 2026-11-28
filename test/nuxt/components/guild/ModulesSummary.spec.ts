import type { SocialModuleStatus } from "~/composables/useSocialModule";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ModulesSummary from "~/components/guild/ModulesSummary.vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";

const mockSocialStatus = ref<SocialModuleStatus>({ kind: "loading" });
const mockUseAutoChannels = vi.fn();

mockNuxtImport("useSocialModule", () => () => ({ status: mockSocialStatus }));
mockNuxtImport(
	"useAutoChannels",
	() =>
		(...args: unknown[]) =>
			mockUseAutoChannels(...args),
);

async function rows() {
	const wrapper = await mountSuspended(ModulesSummary);
	return wrapper.findAll(".module-row").map((row) =>
		row
			.findAll("span")
			.map((span) => span.text().trim())
			.filter(Boolean)
			.join(" "),
	);
}

describe("ModulesSummary", () => {
	beforeEach(() => {
		clearNuxtState();
		mockUseAutoChannels.mockReset();
		useActiveGuild().selectGuild(GUILD_ID);
		mockSocialStatus.value = { kind: "loading" };
	});

	// A module with no channel yet still has a switch: the card shows the switch.
	it("shows the switch of the Auto-* modules, not their channel count", async () => {
		useGuildSettings().setGuildSettings(
			createMockGuildData(GUILD_ID, {
				modulesAutodelete: true,
				modulesAutomessage: false,
				modulesAutopurge: true,
			}),
		);

		const list = await rows();

		expect(list).toContain("Auto-Delete Enabled");
		expect(list).toContain("Auto-Purge Enabled");
		expect(list).toContain("Auto-Message Disabled");
		expect(mockUseAutoChannels).not.toHaveBeenCalled();
	});

	it("shows the honeypot as disabled while it has no channel, even with its switch on", async () => {
		useGuildSettings().setGuildSettings(
			createMockGuildData(GUILD_ID, { honeypotChannel: null, modulesHoneypot: true }),
		);
		expect(await rows()).toContain("Honeypot Disabled");

		useGuildSettings().setGuildSettings(
			createMockGuildData(GUILD_ID, {
				honeypotChannel: "234567890123456789",
				modulesHoneypot: true,
			}),
		);
		expect(await rows()).toContain("Honeypot Enabled");
	});

	// The badge counts what the rows show, so a honeypot without a channel is not counted.
	it("counts the badge from the rows", async () => {
		useGuildSettings().setGuildSettings(
			createMockGuildData(GUILD_ID, { honeypotChannel: null, modulesHoneypot: true }),
		);
		const wrapper = await mountSuspended(ModulesSummary);
		const shown = wrapper.findAll(".module-row .bg-success").length;

		expect(wrapper.text()).toContain(`${shown} / 12 enabled`);
	});

	it("lists the modules in the order of the sidebar's categories", async () => {
		useGuildSettings().setGuildSettings(createMockGuildData(GUILD_ID, {}));

		const labels = (await rows()).map((row) => row.replace(/ (Enabled|Disabled)$/, ""));

		expect(labels).toStrictEqual([
			"Auto Moderation",
			"Moderation",
			"Join Guard",
			"Honeypot",
			"Appeals",
			"Auto-Delete",
			"Auto-Purge",
			"Events",
			"Roles",
			"Auto-Message",
			"Onboarding",
			"Social",
		]);
	});
});
