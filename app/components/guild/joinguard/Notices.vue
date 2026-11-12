<template>
	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.joinguard.notices.form_aria')"
		@error="onError"
	>
		<section class="console-card" :aria-labelledby="headingId">
			<div class="jg-heading">
				<h2 :id="headingId">{{ ts("guild_settings.joinguard.notices.title") }}</h2>
				<span class="jg-heading-rule" aria-hidden="true"></span>
			</div>

			<div class="mt-4 grid gap-4 md:grid-cols-2">
				<SelectChannel
					v-model="state.joinGuardLogChannel"
					layout="field"
					:guild="guildData"
					:label="ts('guild_settings.joinguard.notices.log')"
					:tooltip-title="ts('guild_settings.joinguard.notices.log_help')"
					:empty-label="ts('guild_settings.joinguard.notices.not_logged')"
				/>
			</div>

			<div class="mt-4 border-t border-(--home-border-subtle) pt-1">
				<GuildSettingsToggleRow
					v-model="state.joinGuardDirectMessage"
					name="joinGuardDirectMessage"
					:title="ts('guild_settings.joinguard.notices.direct_message')"
					:description="
						ts('guild_settings.joinguard.notices.direct_message_help', {
							placeholder: SERVER_PLACEHOLDER,
						})
					"
				/>
			</div>

			<UFormField
				v-if="state.joinGuardDirectMessage"
				name="joinGuardDirectMessageContent"
				class="mt-1"
				:label="ts('guild_settings.joinguard.notices.message')"
				:help="
					ts('guild_settings.joinguard.notices.message_help', {
						placeholder: SERVER_PLACEHOLDER,
					})
				"
				:ui="{ label: 'sr-only', help: 'mt-1.5 text-[0.8125rem] text-muted' }"
			>
				<UTextarea
					v-model="state.joinGuardDirectMessageContent"
					:rows="3"
					autoresize
					class="w-full"
					:maxlength="JoinGuardLimits.directMessage"
					:placeholder="ts('guild_settings.joinguard.notices.message_placeholder')"
				/>
				<template #hint>
					<span class="font-mono text-xs text-muted">
						{{
							ts("guild_settings.joinguard.notices.count", {
								count: state.joinGuardDirectMessageContent.length,
								max: JoinGuardLimits.directMessage,
							})
						}}
					</span>
				</template>
			</UFormField>
		</section>
	</GuildSettingsForm>
</template>

<script setup lang="ts">
/**
 * Where the join guard logs what it does, and the direct message it sends to
 * whom a rule stops; staged with the save bar.
 */
// Written between curly brackets in the message; the bot puts the server's name there.
const SERVER_PLACEHOLDER = "{server}";

const { ts } = useI18n();
const { guildData } = useGuildData();

const headingId = useId();

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: ["joinGuardLogChannel"],
	toggles: ["joinGuardDirectMessage"],
	texts: ["joinGuardDirectMessageContent"],
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
