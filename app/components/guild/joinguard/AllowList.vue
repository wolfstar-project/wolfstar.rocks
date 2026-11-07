<template>
	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.joinguard.allow.form_aria')"
		@error="onError"
	>
		<section class="console-card" :aria-labelledby="headingId">
			<div class="jg-heading">
				<h2 :id="headingId">{{ ts("guild_settings.joinguard.allow.title") }}</h2>
				<span class="jg-heading-rule" aria-hidden="true"></span>
			</div>
			<p class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
				{{ ts("guild_settings.joinguard.allow.help") }}
			</p>
			<p
				v-if="state.joinGuardAllowedUsers.length + state.joinGuardAllowedRoles.length === 0"
				class="mt-3 text-[0.8125rem] text-muted"
			>
				{{ ts("guild_settings.joinguard.allow.nobody") }}
			</p>

			<div class="mt-4 grid gap-5 md:grid-cols-2">
				<GuildMemberPicker
					v-if="guildData"
					:ids="state.joinGuardAllowedUsers"
					:guild-id="guildData.id"
					:label="ts('guild_settings.joinguard.allow.members')"
					:empty-label="ts('select.none')"
					@update:ids="state.joinGuardAllowedUsers = $event"
				/>
				<SelectRoles
					v-model="state.joinGuardAllowedRoles"
					layout="chips"
					:guild="guildData"
					:label="ts('guild_settings.joinguard.allow.roles')"
					:empty-label="ts('select.none')"
				/>
			</div>
		</section>
	</GuildSettingsForm>
</template>

<script setup lang="ts">
/**
 * The members and roles the join guard never stops, staged with the save bar.
 */
const { ts } = useI18n();
const { guildData } = useGuildData();

const headingId = useId();

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	many: ["joinGuardAllowedUsers", "joinGuardAllowedRoles"],
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.jg-heading {
	@apply flex items-center gap-3;
}

.jg-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.jg-heading-rule {
	@apply h-px flex-1;
	background-color: var(--console-border);
}
</style>
