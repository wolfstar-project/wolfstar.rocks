import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ChannelType } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Checkpoint from "~/components/guild/joinguard/Checkpoint.vue";
import { createMockChannel, createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "254360814063058944";
const VERIFY_CHANNEL = "345678901234567890";

const mockGuildSettings = ref<GuildData | undefined>(undefined);
const mockOriginalGuildSettings = ref<GuildData | undefined>(undefined);
const mockSetGuildSettingsChanges = vi.fn();
const mockCopy = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: mockOriginalGuildSettings,
	setGuildSettings: vi.fn(),
}));

mockNuxtImport("useGuildSettingsChanges", () => () => ({
	guildSettingsChanges: ref<GuildData | undefined>(undefined),
	removeChange: vi.fn(),
	resetCounter: ref(0),
	resetGuildSettingsChanges: vi.fn(),
	setGuildSettingsChanges: mockSetGuildSettingsChanges,
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(
		createMockOauthFlattenedGuild({
			channels: [
				createMockChannel({
					id: VERIFY_CHANNEL,
					name: "verify",
					type: ChannelType.GuildText,
				}),
			],
			id: GUILD_ID,
		}),
	),
}));

mockNuxtImport("useClipboard", () => () => ({ copied: ref(false), copy: mockCopy }));

function settings(overrides: Partial<GuildData> = {}) {
	const value = createMockGuildData(GUILD_ID, {
		joinGuardCheckpoint: true,
		joinGuardCheckpointChannel: VERIFY_CHANNEL,
		joinGuardCheckpointTimeout: 86_400,
		joinGuardEnabled: true,
		joinGuardMinimumTrust: 2,
		...overrides,
	});
	mockGuildSettings.value = value;
	mockOriginalGuildSettings.value = structuredClone(value);
}

async function mountCard() {
	const wrapper = await mountSuspended(Checkpoint);
	await nextTick();
	await nextTick();
	return wrapper;
}

/** What the form staged last, merged over the earlier stagings. */
function staged(): Partial<GuildData> {
	return Object.assign({}, ...mockSetGuildSettingsChanges.mock.calls.map(([changes]) => changes));
}

// Accessibility audits for the Join Guard components live in test/nuxt/a11y.spec.ts.
describe("GuildJoinguardCheckpoint", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		settings();
	});

	it("shows the link of the guild's page and copies it", async () => {
		const wrapper = await mountCard();

		const link = wrapper.get(`a[href$="/verify/${GUILD_ID}"]`);
		expect(link.text()).toMatch(new RegExp(`/verify/${GUILD_ID}$`));
		expect(link.text()).not.toMatch(/^https?:/);

		const copy = wrapper.findAll("button").find((button) => button.text() === "Copy link");
		await copy!.trigger("click");
		expect(mockCopy).toHaveBeenCalledWith(link.attributes("href"), expect.any(Object));
	});

	it("asks for the button once the channel is saved, and not before", async () => {
		const wrapper = await mountCard();
		const post = () =>
			wrapper.findAll("button").find((button) => button.text() === "Post the button");

		await post()!.trigger("click");
		expect(wrapper.emitted("postButton")).toHaveLength(1);

		settings({ joinGuardCheckpointChannel: null });
		await nextTick();
		expect(post()!.attributes("disabled")).toBeDefined();
		expect(wrapper.text()).toContain("Save a verification channel first");
	});

	it("edits the timeout in hours and stages it in seconds", async () => {
		const wrapper = await mountCard();

		expect(wrapper.text()).toContain(
			"Kicked after 24 hours at the checkpoint. The kick is cancelled if they verify, or leave, before.",
		);
		const hours = wrapper.get('input[aria-label="Hours before the kick"]');
		expect((hours.element as HTMLInputElement).value).toBe("24");

		const field = wrapper.findComponent({ name: "UInputNumber" });
		field.vm.$emit("update:modelValue", 2);
		await nextTick();
		await nextTick();
		expect(staged().joinGuardCheckpointTimeout).toBe(7200);

		field.vm.$emit("update:modelValue", 0);
		await nextTick();
		await nextTick();
		expect(staged().joinGuardCheckpointTimeout).toBe(0);
		expect(wrapper.text()).toContain("Never kicked: they wait at the checkpoint");
	});

	it("offers the three minimums as a radio group, the saved one picked", async () => {
		const wrapper = await mountCard();

		const radios = wrapper.findAll('[role="radio"]');
		expect(radios).toHaveLength(3);
		expect(wrapper.text()).toContain("Low Trust");
		expect(wrapper.text()).toContain("Very Trusted");
		const picked = radios.filter((radio) => radio.attributes("aria-checked") === "true");
		expect(picked).toHaveLength(1);
		expect(radios.indexOf(picked[0]!)).toBe(1);
	});

	it("hides the checkpoint's settings while its switch is off", async () => {
		settings({ joinGuardCheckpoint: false });
		const wrapper = await mountCard();

		expect(wrapper.text()).toContain("Send stopped members to the checkpoint");
		expect(wrapper.text()).not.toContain("Pending role");
		expect(wrapper.text()).not.toContain("Post the button");
	});
});
