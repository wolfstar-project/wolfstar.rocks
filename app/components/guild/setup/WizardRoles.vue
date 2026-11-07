<template>
	<h2 class="setup-title" tabindex="-1">{{ ts("guild_settings.setup.roles.title") }}</h2>
	<p class="setup-lead">{{ ts("guild_settings.setup.roles.description") }}</p>

	<div class="setup-field">
		<SelectRoles
			:model-value="draft.admin"
			:guild="guildData"
			:label="ts('guild_settings.setup.roles.admin_label')"
			:tooltip-title="ts('guild_settings.setup.roles.admin_help')"
			:empty-label="ts('guild_settings.setup.roles.none')"
			@update:model-value="update({ admin: $event })"
		/>
	</div>
	<div class="setup-field">
		<SelectRoles
			:model-value="draft.moderator"
			:guild="guildData"
			:label="ts('guild_settings.setup.roles.moderator_label')"
			:tooltip-title="ts('guild_settings.setup.roles.moderator_help')"
			:empty-label="ts('guild_settings.setup.roles.none')"
			@update:model-value="update({ moderator: $event })"
		/>
	</div>
	<div class="setup-field">
		<SelectRole
			:model-value="draft.muted"
			:guild="guildData"
			:label="ts('guild_settings.setup.roles.muted_label')"
			:tooltip-title="ts('guild_settings.setup.roles.muted_help')"
			@update:model-value="update({ muted: $event })"
		/>
	</div>
</template>

<script setup lang="ts">
import type { SetupDraft } from "~/utils/guild-setup";

const draft = defineModel<SetupDraft>("draft", { required: true });

const { ts } = useI18n();
const { guildData } = useGuildData();

function update(patch: Partial<SetupDraft>) {
	draft.value = { ...draft.value, ...patch };
}
</script>
