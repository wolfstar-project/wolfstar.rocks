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

				<section class="console-card" :aria-labelledby="reviewHeadingId">
					<div class="appeals-card-heading">
						<h2 :id="reviewHeadingId">
							{{ ts("guild_settings.appeals.review_title") }}
						</h2>
						<span class="appeals-card-rule" aria-hidden="true"></span>
					</div>
					<div class="mt-4 grid gap-5 md:grid-cols-2">
						<SelectRoles
							v-for="config in ConfigurableAppealRoles"
							:key="config.key"
							v-model="state[config.key]"
							layout="chips"
							:guild="guildData"
							:label="translateEntry(config, 'name')"
							:tooltip-title="translateEntry(config, 'description')"
							:empty-label="ts('select.none')"
						/>
					</div>
					<h3 class="mt-5 text-[0.8125rem] font-semibold text-muted">
						{{ translateEntry(AppealThreadSetting, "name") }}
					</h3>
					<p class="mt-1 text-[0.8125rem] text-muted">
						{{ translateEntry(AppealThreadSetting, "description") }}
					</p>
					<GuildSettingsChoiceCards
						v-model="state.appealsThread"
						class="mt-3"
						name="appealsThread"
						:label="translateEntry(AppealThreadSetting, 'name')"
						:options="threadOptions"
						label-hidden
					/>
					<div class="mt-3">
						<GuildSettingsToggleRow
							v-for="config in ConfigurableAppealReviewToggles"
							:key="config.key"
							v-model="state[config.key]"
							:name="config.key"
							:title="translateEntry(config, 'name')"
							:description="translateEntry(config, 'description')"
						/>
					</div>
				</section>

				<section class="console-card" :aria-labelledby="limitsHeadingId">
					<div class="appeals-card-heading">
						<h2 :id="limitsHeadingId">
							{{ ts("guild_settings.appeals.limits_title") }}
						</h2>
						<span class="appeals-card-rule" aria-hidden="true"></span>
					</div>
					<div class="mt-4 grid gap-5 md:grid-cols-2">
						<GuildSettingsNumberField
							v-for="config in ConfigurableAppealNumbers"
							:key="config.key"
							v-model="state[config.key]"
							:name="config.key"
							:label="translateEntry(config, 'name')"
							:description="translateEntry(config, 'description')"
							:unit="numberUnits[config.key]"
						/>
					</div>
					<div class="mt-3">
						<GuildSettingsToggleRow
							v-for="config in ConfigurableAppealLimitToggles"
							:key="config.key"
							v-model="state[config.key]"
							:name="config.key"
							:title="translateEntry(config, 'name')"
							:description="translateEntry(config, 'description')"
						/>
					</div>
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

	<!-- Not settings: the forms are rows of their own, written as they are edited. -->
	<GuildAppealsForms v-if="state.appealsEnabled" class="mt-5" />
</template>

<script setup lang="ts">
import type { NumberSettingKey } from "#shared/utils/settings-choices";
import {
	AppealThreadSetting,
	ConfigurableAppealChannels,
	ConfigurableAppealLimitToggles,
	ConfigurableAppealNumbers,
	ConfigurableAppealReviewToggles,
	ConfigurableAppealRoles,
	ConfigurableAppealSwitch,
	ConfigurableAppealToggles,
} from "#shared/utils/settingsDataEntries";

const { ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const { guildData } = useGuildData();

const headId = useId();
const settingsHeadingId = useId();
const reviewHeadingId = useId();
const limitsHeadingId = useId();
const offHeadingId = useId();

const numberUnits = computed<Partial<Record<NumberSettingKey, string>>>(() => ({
	appealsCooldownDays: ts("guild_settings.appeals.days"),
	appealsMaxActive: ts("guild_settings.appeals.per_member"),
}));

const threadOptions = computed(() => [
	{
		value: "none",
		label: ts("guild_settings.appeals.thread.none"),
		description: ts("guild_settings.appeals.thread.none_help"),
	},
	{
		value: "public",
		label: ts("guild_settings.appeals.thread.public"),
		description: ts("guild_settings.appeals.thread.public_help"),
	},
	{
		value: "private",
		label: ts("guild_settings.appeals.thread.private"),
		description: ts("guild_settings.appeals.thread.private_help"),
	},
]);

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: ConfigurableAppealChannels.map((entry) => entry.key),
	many: ConfigurableAppealRoles.map((entry) => entry.key),
	toggles: [
		...ConfigurableAppealSwitch,
		...ConfigurableAppealToggles,
		...ConfigurableAppealReviewToggles,
		...ConfigurableAppealLimitToggles,
	].map((entry) => entry.key),
	numbers: ConfigurableAppealNumbers.map((entry) => entry.key),
	choices: ["appealsThread"],
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
