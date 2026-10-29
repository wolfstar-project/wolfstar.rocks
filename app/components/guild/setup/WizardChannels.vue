<template>
	<h2 class="setup-title" tabindex="-1">{{ ts("guild_settings.setup.channels.title") }}</h2>
	<p class="setup-lead">{{ ts("guild_settings.setup.channels.description") }}</p>

	<div v-if="fields.moderation" class="setup-field">
		<SelectChannel
			:model-value="draft.moderationChannel"
			:guild="guildData"
			:label="ts('guild_settings.setup.channels.moderation_label')"
			:tooltip-title="ts('guild_settings.setup.channels.moderation_help')"
			@update:model-value="update({ moderationChannel: $event })"
		/>
	</div>
	<div v-if="fields.automod" class="setup-field">
		<SelectChannel
			:model-value="draft.automodChannel"
			:guild="guildData"
			:label="ts('guild_settings.setup.channels.automod_label')"
			:tooltip-title="ts('guild_settings.setup.channels.automod_help')"
			@update:model-value="update({ automodChannel: $event })"
		/>
	</div>
	<div v-if="fields.events" class="setup-field">
		<SelectChannel
			:model-value="draft.eventsChannel"
			:guild="guildData"
			:label="ts('guild_settings.setup.channels.events_label')"
			:tooltip-title="ts('guild_settings.setup.channels.events_help')"
			@update:model-value="update({ eventsChannel: $event })"
		/>
	</div>

	<p v-if="!fields.moderation && !fields.automod && !fields.events" class="setup-empty">
		{{ ts("guild_settings.setup.channels.none") }}
	</p>
	<p class="setup-note">
		<UIcon
			name="ic:round-info"
			class="mt-0.5 size-4 shrink-0 text-primary"
			aria-hidden="true"
		/>
		<span>{{ ts("guild_settings.setup.channels.note") }}</span>
	</p>
</template>

<script setup lang="ts">
import { type SetupDraft, setupChannelFields } from "~/utils/guild-setup";

const draft = defineModel<SetupDraft>("draft", { required: true });

const { ts } = useI18n();
const { guildData } = useGuildData();

const fields = computed(() => setupChannelFields(draft.value));

function update(patch: Partial<SetupDraft>) {
	draft.value = { ...draft.value, ...patch };
}
</script>
