<template>
	<DashboardPageHeader
		:title="ts('guild_settings.honeypot.title')"
		:description="ts('guild_settings.honeypot.subtitle')"
	/>

	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.honeypot.form_aria')"
		@error="onError"
	>
		<div class="flex flex-col gap-5">
			<GuildModuleBanner
				icon="ic:round-hive"
				:title="ts('guild_settings.honeypot.title')"
				:hint="bannerHint"
				:on="isOn"
			>
				<USwitch
					:model-value="switchOn"
					:aria-label="
						ts('guild_settings.modules.toggle_aria', {
							title: ts('guild_settings.honeypot.title'),
						})
					"
					@update:model-value="setSwitch"
				/>
			</GuildModuleBanner>

			<template v-if="switchOn">
				<section class="console-card" :aria-labelledby="channelsHeadingId">
					<div class="honeypot-card-heading">
						<h2 :id="channelsHeadingId">
							{{ ts("guild_settings.honeypot.channels_title") }}
						</h2>
						<span class="honeypot-card-rule" aria-hidden="true"></span>
					</div>

					<div class="mt-4 grid gap-5 md:grid-cols-2">
						<SelectChannel
							v-model="state.honeypotChannel"
							layout="field"
							:guild="guildData"
							:exclude="trapExcluded"
							:empty-label="ts('guild_settings.honeypot.pick_channel')"
							:label="translateEntry(channelEntry, 'name')"
							:tooltip-title="ts('guild_settings.honeypot.channel_help')"
						/>
						<SelectChannel
							v-for="config in ConfigurableHoneypotChannels"
							:key="config.key"
							v-model="state[config.key]"
							layout="field"
							:guild="guildData"
							:exclude="trapChannels"
							:empty-label="ts('guild_settings.honeypot.not_reported')"
							:label="translateEntry(config, 'name')"
							:tooltip-title="translateEntry(config, 'description')"
						/>
					</div>
				</section>

				<section class="console-card" :aria-labelledby="actionHeadingId">
					<div class="honeypot-card-heading">
						<h2 :id="actionHeadingId">
							{{ ts("guild_settings.honeypot.action_title") }}
						</h2>
						<span class="honeypot-card-rule" aria-hidden="true"></span>
					</div>
					<p class="mt-1.5 text-[0.8125rem] text-muted">
						{{ ts("guild_settings.honeypot.action_help") }}
					</p>
					<GuildSettingsChoiceCards
						v-model="state.honeypotAction"
						class="mt-4"
						name="honeypotAction"
						:label="translateEntry(actionEntry, 'name')"
						:options="actionOptions"
						label-hidden
					/>
				</section>

				<section class="console-card" :aria-labelledby="behaviourHeadingId">
					<div class="honeypot-card-heading">
						<h2 :id="behaviourHeadingId">
							{{ ts("guild_settings.honeypot.behaviour_title") }}
						</h2>
						<span class="honeypot-card-rule" aria-hidden="true"></span>
					</div>
					<div class="mt-2">
						<GuildSettingsToggleRow
							v-for="config in ConfigurableHoneypotToggles"
							:key="config.key"
							v-model="state[config.key]"
							:name="config.key"
							:title="translateEntry(config, 'name')"
							:description="translateEntry(config, 'description')"
						/>
						<GuildSettingsToggleRow
							v-model="state.honeypotWarning"
							name="honeypotWarning"
							:title="translateEntry(warningEntry, 'name')"
							:description="ts('guild_settings.honeypot.warning_help')"
						/>
					</div>
				</section>
			</template>

			<section
				v-else
				class="console-card flex flex-col items-center gap-3 px-4 py-12 text-center"
				:aria-labelledby="offHeadingId"
			>
				<h2 :id="offHeadingId" class="text-base font-semibold">
					{{ ts("guild_settings.honeypot.off_title") }}
				</h2>
				<p class="max-w-lg text-[0.8125rem] leading-normal text-muted">
					{{ ts("guild_settings.honeypot.off_body") }}
				</p>
				<UButton
					color="neutral"
					variant="outline"
					icon="ic:round-content-copy"
					@click="copySetup"
				>
					{{ ts("guild_settings.honeypot.copy_setup") }}
				</UButton>
			</section>
		</div>
	</GuildSettingsForm>
</template>

<script setup lang="ts">
import {
	ConfigurableHoneypotChannels,
	ConfigurableHoneypotToggles,
	HoneypotTrapSettings,
} from "#shared/utils/settingsDataEntries";
import { ChannelType } from "discord-api-types/v10";

const SETUP_COMMAND = "/honeypot setup";

const { ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const { activeGuildId } = useActiveGuild();
const { guildData } = useGuildData();
const { copy } = useClipboard();

const channelsHeadingId = useId();
const actionHeadingId = useId();
const behaviourHeadingId = useId();
const offHeadingId = useId();

const {
	honeypotAction: actionEntry,
	honeypotChannel: channelEntry,
	honeypotWarning: warningEntry,
} = HoneypotTrapSettings;

// Saved like any other setting: the bot is told of the write, and posts, moves
// or takes down the warning in the channel to match.
const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: ["honeypotChannel", ...ConfigurableHoneypotChannels.map((entry) => entry.key)],
	toggles: ["honeypotWarning", ...ConfigurableHoneypotToggles.map((entry) => entry.key)],
	choices: ["honeypotAction"],
});

// A channel is what turns the honeypot on, as `/honeypot setup` sets one and
// `/honeypot disable` clears it. Turning the switch on only opens the form:
// nothing is staged until a channel is picked.
const enabling = ref(false);
const isOn = computed(() => state.honeypotChannel !== null);
const switchOn = computed(() => isOn.value || enabling.value);

function setSwitch(on: boolean) {
	enabling.value = on;
	if (!on) state.honeypotChannel = null;
}

// A guild switch or a reset of the staged changes puts the saved settings
// back: a switch turned on without saving goes back off with them.
const { resetCounter } = useGuildSettingsChanges();
watch([activeGuildId, resetCounter], () => {
	enabling.value = false;
});

const trapChannels = computed(() => (state.honeypotChannel ? [state.honeypotChannel] : []));

// The trap is a text channel, never an announcement one, and never the channel
// its catches are reported to.
const trapExcluded = computed(() => [
	...(guildData.value?.channels ?? [])
		.filter((channel) => channel.type === ChannelType.GuildAnnouncement)
		.map((channel) => channel.id),
	...(state.honeypotLogChannel ? [state.honeypotLogChannel] : []),
]);

const channelName = computed(() => {
	const id = state.honeypotChannel;
	const channel = guildData.value?.channels.find((candidate) => candidate.id === id);
	return channel?.name ?? ts("select.unknown_channel");
});

const bannerHint = computed(() => {
	if (isOn.value) return ts("guild_settings.honeypot.catching", { channel: channelName.value });
	return enabling.value
		? ts("guild_settings.honeypot.pick_channel_hint")
		: ts("guild_settings.honeypot.off_summary");
});

const actionOptions = computed(() => [
	{
		description: ts("guild_settings.honeypot.actions.kick_help"),
		label: ts("guild_settings.honeypot.actions.kick"),
		value: "Kick" as const,
	},
	{
		description: ts("guild_settings.honeypot.actions.softban_help"),
		label: ts("guild_settings.honeypot.actions.softban"),
		value: "Softban" as const,
	},
	{
		description: ts("guild_settings.honeypot.actions.ban_help"),
		label: ts("guild_settings.honeypot.actions.ban"),
		value: "Ban" as const,
	},
]);

function copySetup() {
	void copy(SETUP_COMMAND, {
		color: "success",
		description: ts("guild_settings.honeypot.copied_description"),
		icon: "heroicons:check",
		title: ts("guild_settings.honeypot.copied_title"),
	});
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.honeypot-card-heading {
	@apply flex items-center gap-3;
}

.honeypot-card-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.honeypot-card-rule {
	@apply h-px flex-1;
	background-color: var(--console-border);
}
</style>
