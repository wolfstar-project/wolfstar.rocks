import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import GuildSettingsForm from "~/components/guild/settings/Form.vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";
const CHANNEL_A = "234567890123456789";
const CHANNEL_B = "345678901234567890";

// The real stores, not mocks: what this guards is the round trip between the
// form state, the staged draft and the merged settings the state follows.
const Harness = defineComponent({
	components: { GuildSettingsForm },
	setup() {
		const form = useSettingsForm({
			one: ["logsMemberAdd"],
			many: ["logsIgnoreAll"],
			toggles: ["logsReactionEmojiIncludeTwemoji"],
		});
		return { ...form };
	},
	template: `
		<GuildSettingsForm :schema="schema" :state="state" :map-to-guild-data="mapToGuildData">
			<span />
		</GuildSettingsForm>
	`,
});

async function settle() {
	// Enough ticks for form -> draft -> merged settings -> form to go round.
	for (let index = 0; index < 5; index++) {
		await nextTick();
	}
}

describe("useSettingsForm", () => {
	beforeEach(() => {
		clearNuxtState();
		useActiveGuild().selectGuild(GUILD_ID);
		useGuildSettings().setGuildSettings(
			createMockGuildData(GUILD_ID, {
				logsIgnoreAll: [CHANNEL_A],
				logsMemberAdd: CHANNEL_A,
			}),
		);
	});

	it("starts from the saved settings and stages nothing", async () => {
		const wrapper = await mountSuspended(Harness);
		await settle();

		expect(wrapper.vm.state).toStrictEqual({
			logsIgnoreAll: [CHANNEL_A],
			logsMemberAdd: CHANNEL_A,
			logsReactionEmojiIncludeTwemoji: false,
		});
		expect(useGuildSettingsChanges().guildSettingsChanges.value).toBeUndefined();
	});

	// The state follows the merged settings, which change on every edit of this
	// same form. Writing an unchanged list back as a fresh array would re-run
	// the form's change tracking forever.
	it("stages a list edit once and settles", async () => {
		const wrapper = await mountSuspended(Harness);
		await settle();

		wrapper.vm.state.logsIgnoreAll = [CHANNEL_A, CHANNEL_B];
		await settle();

		const staged = wrapper.vm.state.logsIgnoreAll;
		expect(useGuildSettingsChanges().guildSettingsChanges.value).toStrictEqual({
			logsIgnoreAll: [CHANNEL_A, CHANNEL_B],
		});

		await settle();
		// Same array instance: nothing wrote the list back after it settled.
		expect(wrapper.vm.state.logsIgnoreAll).toBe(staged);
	});

	it("only maps the keys the section owns", async () => {
		const wrapper = await mountSuspended(Harness);
		await settle();

		expect(Object.keys(wrapper.vm.mapToGuildData(wrapper.vm.state)).toSorted()).toStrictEqual([
			"logsIgnoreAll",
			"logsMemberAdd",
			"logsReactionEmojiIncludeTwemoji",
		]);
	});

	it("drops the staged key when the edit is undone", async () => {
		const wrapper = await mountSuspended(Harness);
		await settle();

		wrapper.vm.state.logsMemberAdd = null;
		await settle();
		expect(useGuildSettingsChanges().guildSettingsChanges.value).toStrictEqual({
			logsMemberAdd: null,
		});

		wrapper.vm.state.logsMemberAdd = CHANNEL_A;
		await settle();
		expect(useGuildSettingsChanges().guildSettingsChanges.value).toBeUndefined();
	});

	it("follows the settings after a save lands", async () => {
		const wrapper = await mountSuspended(Harness);
		await settle();

		useGuildSettings().setGuildSettings(
			createMockGuildData(GUILD_ID, { logsIgnoreAll: [CHANNEL_B], logsMemberAdd: null }),
		);
		await settle();

		expect(wrapper.vm.state.logsIgnoreAll).toStrictEqual([CHANNEL_B]);
		expect(wrapper.vm.state.logsMemberAdd).toBeNull();
		expect(useGuildSettingsChanges().guildSettingsChanges.value).toBeUndefined();
	});
});
