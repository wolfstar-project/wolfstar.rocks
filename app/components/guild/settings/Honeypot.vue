<template>
	<DashboardPageHeader
		:title="ts('guild_settings.honeypot.title')"
		:description="ts('guild_settings.honeypot.subtitle')"
	/>

	<section class="console-card flex items-center gap-4" :aria-labelledby="headId">
		<span
			class="flex size-11 shrink-0 items-center justify-center rounded-lg"
			:class="isOn ? 'bg-primary/15 text-primary' : 'bg-base-content/8 text-muted'"
			aria-hidden="true"
		>
			<UIcon name="ic:round-hive" class="size-5.5" />
		</span>
		<div class="min-w-0 flex-1">
			<h2 :id="headId" class="text-base font-bold">
				{{ ts("guild_settings.honeypot.title") }}
			</h2>
			<p class="mt-0.5 text-[0.8125rem] text-muted">
				{{
					isOn
						? ts("guild_settings.honeypot.catching", { channel: channelName })
						: ts("guild_settings.honeypot.off_summary")
				}}
			</p>
		</div>
		<UBadge
			:color="isOn ? 'success' : 'neutral'"
			variant="subtle"
			class="shrink-0 font-semibold"
		>
			{{
				isOn
					? ts("guild_settings.honeypot.active")
					: ts("guild_settings.honeypot.not_set_up")
			}}
		</UBadge>
	</section>

	<GuildSettingsForm
		v-if="isOn"
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.honeypot.form_aria')"
		@error="onError"
	>
		<div class="flex flex-col gap-5">
			<section class="console-card" :aria-labelledby="channelsHeadingId">
				<div class="honeypot-card-heading">
					<h2 :id="channelsHeadingId">
						{{ ts("guild_settings.honeypot.channels_title") }}
					</h2>
					<span class="honeypot-card-rule" aria-hidden="true"></span>
				</div>

				<div class="mt-4 grid gap-5 md:grid-cols-2">
					<div class="flex min-w-0 flex-col gap-1.5">
						<p :id="channelLabelId" class="text-sm font-medium">
							{{ translateEntry(channelEntry, "name") }}
						</p>
						<p
							class="honeypot-channel"
							:aria-labelledby="channelLabelId"
							:aria-describedby="channelHelpId"
						>
							<UIcon name="ic:round-tag" class="size-4 shrink-0 text-muted" />
							<span class="truncate">{{ channelName }}</span>
						</p>
						<p :id="channelHelpId" class="text-[0.8125rem] leading-normal text-muted">
							{{ ts("guild_settings.honeypot.channel_help") }}
						</p>
					</div>
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
					<h2 :id="actionHeadingId">{{ ts("guild_settings.honeypot.action_title") }}</h2>
					<span class="honeypot-card-rule" aria-hidden="true"></span>
				</div>
				<p class="mt-1.5 text-[0.8125rem] text-muted">
					{{ ts("guild_settings.honeypot.action_help") }}
				</p>
				<GuildSettingsChoiceCards
					class="mt-4"
					name="honeypotAction"
					:model-value="savedAction"
					:label="translateEntry(actionEntry, 'name')"
					:options="actionOptions"
					label-hidden
					disabled
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
						name="honeypotWarning"
						:model-value="savedWarning"
						:title="translateEntry(warningEntry, 'name')"
						:description="ts('guild_settings.honeypot.warning_help')"
						disabled
					/>
				</div>
			</section>
		</div>
	</GuildSettingsForm>

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
		<UButton color="neutral" variant="outline" icon="ic:round-content-copy" @click="copySetup">
			{{ ts("guild_settings.honeypot.copy_setup") }}
		</UButton>
	</section>
</template>

<script setup lang="ts">
import {
	BotManagedHoneypotSettings,
	ConfigurableHoneypotChannels,
	ConfigurableHoneypotToggles,
} from "#shared/utils/settingsDataEntries";

const SETUP_COMMAND = "/honeypot setup";

const { ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const { guildData } = useGuildData();
const { guildSettings } = useGuildSettings();
const { copy } = useClipboard();

const headId = useId();
const channelsHeadingId = useId();
const actionHeadingId = useId();
const behaviourHeadingId = useId();
const offHeadingId = useId();
const channelLabelId = useId();
const channelHelpId = useId();

const {
	honeypotAction: actionEntry,
	honeypotChannel: channelEntry,
	honeypotWarning: warningEntry,
} = BotManagedHoneypotSettings;

// The channel, the action and the warning change only through `/honeypot` in
// Discord, which posts or rewrites the warning in the channel as they change:
// they are read from the saved settings and never staged here.
const trapChannel = computed(() => guildSettings.value?.honeypotChannel ?? null);
const isOn = computed(() => trapChannel.value !== null);
const trapChannels = computed(() => (trapChannel.value ? [trapChannel.value] : []));
const savedAction = computed(() => guildSettings.value?.honeypotAction ?? "Softban");
const savedWarning = computed(() => guildSettings.value?.honeypotWarning ?? true);

const channelName = computed(() => {
	const id = trapChannel.value;
	const channel = guildData.value?.channels.find((candidate) => candidate.id === id);
	return channel?.name ?? ts("select.unknown_channel");
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

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: ConfigurableHoneypotChannels.map((entry) => entry.key),
	toggles: ConfigurableHoneypotToggles.map((entry) => entry.key),
});

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

/* The look of a field, without one: only the bot sets this channel. */
.honeypot-channel {
	@apply flex h-10 min-w-0 items-center gap-2 rounded-lg px-3 text-sm;
	background-color: var(--field-surface);
	border: 1px solid var(--field-border);
}
</style>
