import type { OnboardingState } from "#shared/utils/onboarding";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { ChannelType } from "discord-api-types/v10";
import { createError } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingSection from "~/components/guild/settings/Onboarding.vue";
import {
	createMockChannel,
	createMockOauthFlattenedGuild,
	createMockRole,
} from "~~/test/mocks/discord";
import { createMockOnboardingStage, createMockOnboardingState } from "~~/test/mocks/onboarding";

const GUILD_ID = "123456789012345678";
const MOD_LOG = "234567890123456789";
const VERIFY = "345678901234567890";
const MEMBER = "456789012345678901";

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(
		createMockOauthFlattenedGuild({
			channels: [
				createMockChannel({ id: MOD_LOG, name: "mod-log", type: ChannelType.GuildText }),
				createMockChannel({ id: VERIFY, name: "verify", type: ChannelType.GuildText }),
			],
			id: GUILD_ID,
			roles: [createMockRole({ id: MEMBER, name: "Member" })],
		}),
	),
}));

let answer: () => OnboardingState = () => createMockOnboardingState();

// Each test opens a guild of its own, so no answer kept for another is shown.
let guildNumber = 0;
let guildId = GUILD_ID;

async function mountSection() {
	useActiveGuild().selectGuild(guildId);
	const wrapper = await mountSuspended(OnboardingSection);
	return wrapper;
}

// Accessibility audits for the Onboarding section live in test/nuxt/a11y.spec.ts.
describe("GuildSettingsOnboarding", () => {
	beforeEach(() => {
		guildNumber += 1;
		guildId = `${GUILD_ID.slice(0, -3)}${String(guildNumber).padStart(3, "0")}`;
		answer = () => createMockOnboardingState();
		registerEndpoint(`/api/guilds/${guildId}/onboarding`, {
			handler: () => answer(),
			method: "GET",
		});
	});

	it("counts the stages that are on and the passes of the week", async () => {
		answer = () =>
			createMockOnboardingState({
				stages: [
					createMockOnboardingStage({ id: "1" }),
					createMockOnboardingStage({ id: "2", name: "Server rules", position: 1 }),
					createMockOnboardingStage({
						enabled: false,
						id: "3",
						name: "Quick check",
						position: 2,
					}),
				],
				week: { failed: 11, passed: 148, waiting: 0 },
			});

		const wrapper = await mountSection();

		await vi.waitFor(() => expect(wrapper.text()).toContain("2 of 3 stages on"));
		expect(wrapper.text()).toContain("148 passed this week");
		expect(wrapper.text()).toContain("Every stage that is on can run.");
	});

	it("lists a stage with what it asks, its role, what a failure costs and its week", async () => {
		answer = () =>
			createMockOnboardingState({
				stages: [
					createMockOnboardingStage({
						failureAction: "Kick",
						id: "7",
						roleId: MEMBER,
					}),
				],
				weekByStage: { "7": { failed: 9, passed: 131, waiting: 2 } },
			});

		const wrapper = await mountSection();

		await vi.waitFor(() => expect(wrapper.find("h4").exists()).toBe(true));
		expect(wrapper.find("h4").text()).toBe("Are you human?");
		expect(wrapper.findAll(".ob-chip").map((chip) => chip.text())).toStrictEqual([
			"On join",
			"Emoji",
			"Gives @Member",
			"Kick on failure",
		]);
		expect(wrapper.find(".ob-pill").text()).toBe("Ready");
		expect(wrapper.find("article").text()).toContain("131 passed · 9 failed this week");
		expect(wrapper.find("article").text()).toContain("2 waiting now");
	});

	it("says what is blocked, how to fix it, and which stage it stops", async () => {
		answer = () =>
			createMockOnboardingState({
				blockers: [{ code: "communityOff", stageIds: ["2"] }],
				stages: [
					createMockOnboardingStage({ id: "1" }),
					createMockOnboardingStage({
						id: "2",
						name: "Server rules",
						position: 1,
						trigger: "NativeOnboarding",
					}),
				],
			});

		const wrapper = await mountSection();

		await vi.waitFor(() => expect(wrapper.text()).toContain("What is blocked"));
		expect(wrapper.text()).toContain(
			"Stage 2 “Server rules” waits for Discord's onboarding, and this server has no Community.",
		);
		expect(wrapper.text()).toContain(
			"In Discord, open Server Settings, then Enable Community.",
		);
		expect(wrapper.text()).toContain("1 stage is blocked.");
		expect(wrapper.findAll(".ob-pill").map((pill) => pill.text())).toStrictEqual([
			"Ready",
			"Blocked",
		]);
	});

	it("shows no list of blockers when nothing is blocked", async () => {
		answer = () => createMockOnboardingState({ stages: [createMockOnboardingStage()] });

		const wrapper = await mountSection();

		await vi.waitFor(() => expect(wrapper.find("h4").exists()).toBe(true));
		expect(wrapper.text()).not.toContain("What is blocked");
	});

	it("says where the bot posted its message and where it logs", async () => {
		answer = () =>
			createMockOnboardingState({ logChannelId: MOD_LOG, messageChannelId: VERIFY });

		const wrapper = await mountSection();

		await vi.waitFor(() => expect(wrapper.text()).toContain("WolfStar posted it in #verify."));
		expect(wrapper.text()).toContain("#mod-log");
	});

	it("says how to post the message when the bot posted none", async () => {
		const wrapper = await mountSection();

		await vi.waitFor(() =>
			expect(wrapper.text()).toContain(
				"WolfStar has not posted it. Post it from WolfStar's onboarding panel in Discord.",
			),
		);
		expect(wrapper.text()).toContain("No log channel");
		expect(wrapper.text()).toContain("No stage yet");
	});

	it("offers to try again when the onboarding cannot be read", async () => {
		registerEndpoint(`/api/guilds/${guildId}/onboarding`, {
			handler: () => {
				throw createError({ statusCode: 500 });
			},
			method: "GET",
		});

		const wrapper = await mountSection();

		await vi.waitFor(() => expect(wrapper.text()).toContain("Couldn't load the onboarding."));
		const retry = wrapper.findAll("button").find((button) => button.text() === "Try again");
		expect(retry?.exists()).toBe(true);
		expect(wrapper.find("article").exists()).toBe(false);
	});
});
