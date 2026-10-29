<template>
	<DashboardPageHeader
		:title="ts('guild_settings.appeals.title')"
		:description="ts('guild_settings.appeals.subtitle')"
	/>

	<UAlert
		color="neutral"
		variant="subtle"
		icon="ic:round-info"
		:title="ts('guild_settings.appeals.form_notice_title')"
		:description="ts('guild_settings.appeals.form_notice')"
	/>

	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.appeals.form_aria')"
		@error="onError"
	>
		<div class="flex flex-col gap-5">
			<section class="console-card flex items-center gap-4" :aria-labelledby="headId">
				<span
					class="flex size-11 shrink-0 items-center justify-center rounded-lg"
					:class="
						state.appealsEnabled
							? 'bg-primary/15 text-primary'
							: 'bg-base-content/8 text-muted'
					"
					aria-hidden="true"
				>
					<UIcon name="ic:round-rate-review" class="size-5.5" />
				</span>
				<div class="min-w-0 flex-1">
					<h2 :id="headId" class="text-base font-bold">
						{{ ts("guild_settings.appeals.title") }}
					</h2>
					<p class="mt-0.5 text-[0.8125rem] text-muted">
						{{
							state.appealsEnabled
								? ts("guild_settings.appeals.on_summary")
								: ts("guild_settings.appeals.off_summary")
						}}
					</p>
				</div>
				<UFormField name="appealsEnabled" class="shrink-0">
					<USwitch
						v-model="state.appealsEnabled"
						:aria-label="ts('guild_settings.appeals.switch_aria')"
					/>
				</UFormField>
			</section>

			<template v-if="state.appealsEnabled">
				<section class="console-card" :aria-labelledby="settingsHeadingId">
					<div class="appeals-card-heading">
						<h2 :id="settingsHeadingId">
							{{ ts("guild_settings.appeals.settings_title") }}
						</h2>
						<span class="appeals-card-rule" aria-hidden="true"></span>
					</div>
					<div class="mt-4 grid gap-5 md:grid-cols-2">
						<SelectChannel
							v-for="config in ConfigurableAppealChannels"
							:key="config.key"
							v-model="state[config.key]"
							layout="field"
							:guild="guildData"
							:label="translateEntry(config, 'name')"
							:tooltip-title="translateEntry(config, 'description')"
						/>
					</div>
					<h3 class="mt-5 text-[0.8125rem] font-semibold text-muted">
						{{ ts("guild_settings.appeals.appealable_title") }}
					</h3>
					<div class="mt-1">
						<GuildSettingsToggleRow
							v-for="config in ConfigurableAppealToggles"
							:key="config.key"
							v-model="state[config.key]"
							:name="config.key"
							:title="translateEntry(config, 'name')"
							:description="translateEntry(config, 'description')"
						/>
					</div>
				</section>

				<section class="console-card" :aria-labelledby="questionsHeadingId">
					<div class="appeals-card-heading">
						<h2 :id="questionsHeadingId">
							{{ ts("guild_settings.appeals.questions_title") }}
						</h2>
						<span class="appeals-card-rule" aria-hidden="true"></span>
						<UBadge color="primary" variant="soft" class="font-semibold">
							{{
								ts("guild_settings.appeals.questions_count", {
									count: Math.min(
										state.appealsQuestions.length,
										MAXIMUM_ASKED_APPEAL_QUESTIONS,
									),
									maximum: MAXIMUM_ASKED_APPEAL_QUESTIONS,
								})
							}}
						</UBadge>
					</div>
					<p class="mt-1.5 mb-3 text-[0.8125rem] text-muted">
						{{ ts("guild_settings.appeals.questions_help") }}
					</p>
					<GuildSettingsAppealQuestions v-model="state.appealsQuestions" />
				</section>
			</template>

			<section
				v-else
				class="console-card flex flex-col items-center gap-2 px-4 py-12 text-center"
				:aria-labelledby="offHeadingId"
			>
				<h2 :id="offHeadingId" class="text-base font-semibold">
					{{ ts("guild_settings.appeals.off_title") }}
				</h2>
				<p class="max-w-lg text-[0.8125rem] leading-normal text-muted">
					{{ ts("guild_settings.appeals.off_body") }}
				</p>
			</section>
		</div>
	</GuildSettingsForm>
</template>

<script setup lang="ts">
import { MAXIMUM_ASKED_APPEAL_QUESTIONS } from "#shared/utils/settings-choices";
import {
	ConfigurableAppealChannels,
	ConfigurableAppealQuestions,
	ConfigurableAppealSwitch,
	ConfigurableAppealToggles,
} from "#shared/utils/settingsDataEntries";

const { ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const { guildData } = useGuildData();

const headId = useId();
const settingsHeadingId = useId();
const questionsHeadingId = useId();
const offHeadingId = useId();

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: ConfigurableAppealChannels.map((entry) => entry.key),
	many: ConfigurableAppealQuestions.map((entry) => entry.key),
	toggles: [...ConfigurableAppealSwitch, ...ConfigurableAppealToggles].map((entry) => entry.key),
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.appeals-card-heading {
	@apply flex items-center gap-3;
}

.appeals-card-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.appeals-card-rule {
	@apply h-px flex-1;
	background-color: var(--console-border);
}
</style>
