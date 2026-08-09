<template>
	<div class="space-y-6">
		<!-- Skeleton -->
		<div v-if="loading" class="space-y-6">
			<div class="space-y-3">
				<StarSkeleton class="h-7 w-28" />
				<div v-for="i in 4" :key="i" class="gap-3 flex items-center">
					<StarSkeleton class="h-6 w-11 shrink-0 rounded-full" />
					<div class="space-y-1.5">
						<StarSkeleton class="h-4 w-32" />
						<StarSkeleton class="h-3 w-56" />
					</div>
				</div>
			</div>
			<div class="space-y-3">
				<StarSkeleton class="h-7 w-32" />
				<div class="gap-4 md:grid-cols-2 grid grid-cols-1">
					<StarSkeleton class="h-10 w-full" />
					<StarSkeleton class="h-10 w-full" />
				</div>
				<StarSkeleton class="h-10 w-full" />
				<StarSkeleton class="h-10 w-full" />
			</div>
			<div class="space-y-3">
				<StarSkeleton class="h-7 w-32" />
				<div class="gap-2 flex">
					<StarSkeleton class="h-10 w-48" />
					<StarSkeleton class="h-10 w-20" />
				</div>
			</div>
		</div>

		<!-- Form -->
		<GuildSettingsForm
			v-else
			:state="state"
			:schema="schema"
			:map-to-guild-data="mapToGuildData"
			class="space-y-6"
			:aria-label="t('guild_settings.filter.word.form_aria')"
			@error="onError"
		>
			<!-- Section 1: Word Filter -->
			<GuildSettingsSection :title="t('guild_settings.filter.word.title')">
				<div class="space-y-3">
					<StarFormField name="selfmodFilterEnabled">
						<div class="gap-3 flex items-start">
							<StarSwitch
								v-model="state.selfmodFilterEnabled"
								class="mt-0.5"
								:aria-label="t('guild_settings.filter.word.toggle')"
							/>
							<div>
								<p class="text-sm font-medium leading-none">
									{{
										t("guild_settings.filter.word.filter_label", {
											state: state.selfmodFilterEnabled
												? t("guild_settings.filter.common.enabled")
												: t("guild_settings.filter.common.disabled"),
										})
									}}
								</p>
								<p class="mt-1 text-xs text-muted">
									{{ t("guild_settings.filter.word.toggle_help") }}
								</p>
							</div>
						</div>
					</StarFormField>

					<StarFormField name="softActionAlerts">
						<div class="gap-3 flex items-start">
							<StarSwitch
								v-model="state.softActionAlerts"
								class="mt-0.5"
								:aria-label="t('guild_settings.filter.word.alerts_toggle')"
							/>
							<div>
								<p class="text-sm font-medium leading-none">
									{{ t("guild_settings.filter.common.alerts") }}
									{{
										state.softActionAlerts
											? t("guild_settings.filter.common.enabled")
											: t("guild_settings.filter.common.disabled")
									}}
								</p>
								<p class="mt-1 text-xs text-muted">
									{{ t("guild_settings.filter.common.alerts_help") }}
								</p>
							</div>
						</div>
					</StarFormField>

					<StarFormField name="softActionLogs">
						<div class="gap-3 flex items-start">
							<StarSwitch
								v-model="state.softActionLogs"
								class="mt-0.5"
								:aria-label="t('guild_settings.filter.word.logging_toggle')"
							/>
							<div>
								<p class="text-sm font-medium leading-none">
									{{ t("guild_settings.filter.common.logging") }}
									{{
										state.softActionLogs
											? t("guild_settings.filter.common.enabled")
											: t("guild_settings.filter.common.disabled")
									}}
								</p>
								<p class="mt-1 text-xs text-muted">
									{{ t("guild_settings.filter.common.logging_help") }}
								</p>
							</div>
						</div>
					</StarFormField>

					<StarFormField name="softActionDeletes">
						<div class="gap-3 flex items-start">
							<StarSwitch
								v-model="state.softActionDeletes"
								class="mt-0.5"
								:aria-label="t('guild_settings.filter.word.delete_toggle')"
							/>
							<div>
								<p class="text-sm font-medium leading-none">
									{{ t("guild_settings.filter.common.delete_message") }}
									{{
										state.softActionDeletes
											? t("guild_settings.filter.common.enabled")
											: t("guild_settings.filter.common.disabled")
									}}
								</p>
								<p class="mt-1 text-xs text-muted">
									{{ t("guild_settings.filter.common.delete_message_help") }}
								</p>
							</div>
						</div>
					</StarFormField>
				</div>
			</GuildSettingsSection>

			<Separator />

			<!-- Section 2: Punishments -->
			<GuildSettingsSection :title="t('guild_settings.filter.common.punishments')">
				<div class="gap-4 md:grid-cols-2 grid grid-cols-1">
					<StarFormField
						:label="t('guild_settings.filter.common.hard_action')"
						name="selfmodFilterHardAction"
						:description="t('guild_settings.filter.common.hard_action_description')"
					>
						<StarSelectMenu
							v-model="selectedHardAction"
							:items="hardActionItems"
							class="w-full"
							:aria-label="t('guild_settings.filter.common.select_action_aria')"
						/>
					</StarFormField>

					<StarFormField
						:label="t('guild_settings.filter.common.duration')"
						name="hardActionDurationMs"
						:description="t('guild_settings.filter.common.duration_help')"
					>
						<SelectDuration
							v-model="state.hardActionDurationMs"
							:min="1000"
							:max="31_536_000_000"
						/>
					</StarFormField>
				</div>

				<div class="mt-4 space-y-5">
					<div>
						<p class="mb-2 text-sm font-medium">
							{{ t("guild_settings.filter.common.threshold_maximum") }}
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodFilterThresholdMaximum }})</span
							>
						</p>
						<StarSlider
							v-model="state.selfmodFilterThresholdMaximum"
							:min="0"
							:max="60"
							:aria-label="t('guild_settings.filter.common.threshold_maximum')"
						/>
						<div class="mt-1 text-xs text-muted flex justify-between">
							<span>0</span>
							<span>60</span>
						</div>
					</div>

					<div>
						<p class="mb-2 text-sm font-medium">
							{{ t("guild_settings.filter.common.threshold_duration") }}
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodFilterThresholdDurationSeconds }}s)</span
							>
						</p>
						<StarSlider
							v-model="state.selfmodFilterThresholdDurationSeconds"
							:min="0"
							:max="120"
							:aria-label="t('guild_settings.filter.common.threshold_duration')"
						/>
						<div class="mt-1 text-xs text-muted flex justify-between">
							<span>0s</span>
							<span>120s</span>
						</div>
					</div>
				</div>
			</GuildSettingsSection>

			<Separator />

			<!-- Section 3: Filtered Words -->
			<GuildSettingsSection :title="t('guild_settings.filter.word.filtered_words')">
				<div class="space-y-4">
					<form class="gap-2 flex" @submit.prevent="addWord">
						<StarInput
							v-model="newWord"
							:placeholder="t('guild_settings.filter.word.add_placeholder')"
							class="w-64"
							:aria-label="t('guild_settings.filter.word.add_word')"
						/>
						<StarButton type="submit" color="primary">
							{{ t("common.confirm") }}
						</StarButton>
					</form>

					<div v-if="state.selfmodFilterRaw.length > 0" class="gap-2 flex flex-wrap">
						<StarBadge
							v-for="word in state.selfmodFilterRaw"
							:key="word"
							color="primary"
							variant="soft"
							class="gap-1 flex items-center"
						>
							{{ word }}
							<button
								type="button"
								class="ml-1 rounded-full hover:opacity-70"
								:aria-label="t('guild_settings.filter.word.remove_word', { word })"
								@click="removeWord(word)"
							>
								<Icon name="heroicons:x-mark" class="size-3" />
							</button>
						</StarBadge>
					</div>
				</div>
			</GuildSettingsSection>
		</GuildSettingsForm>
	</div>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "#shared/types/ui";
import { WordFilterSchema, type WordFilter } from "#shared/schemas";

function sanitizeWord(raw: string): string {
	return raw.replace(/[^0-9a-z]/gi, "").toLowerCase();
}

const { t } = useI18n();
const { guildSettings } = useGuildSettings();
const toast = useToast();

const loading = computed(() => !guildSettings.value);

const newWord = ref("");

const hardActionItems = computed(() => [
	{ label: t("guild_settings.filter.common.actions.none"), value: 0 },
	{ label: t("guild_settings.filter.common.actions.warning"), value: 1 },
	{ label: t("guild_settings.filter.common.actions.kick"), value: 2 },
	{ label: t("guild_settings.filter.common.actions.mute"), value: 3 },
	{ label: t("guild_settings.filter.common.actions.softban"), value: 4 },
	{ label: t("guild_settings.filter.common.actions.ban"), value: 5 },
]);

const schema = WordFilterSchema;
type Schema = WordFilter;

function createDefaultState(): Schema {
	const settings = guildSettings.value;
	const softAction = settings?.selfmodFilterSoftAction ?? 0;

	return {
		hardActionDurationMs: settings?.selfmodFilterHardActionDuration
			? Number(settings.selfmodFilterHardActionDuration)
			: 0,
		selfmodFilterEnabled: settings?.selfmodFilterEnabled ?? false,
		selfmodFilterHardAction: settings?.selfmodFilterHardAction ?? 0,
		selfmodFilterRaw: [...(settings?.selfmodFilterRaw ?? [])],
		selfmodFilterThresholdDurationSeconds: Math.floor(
			(settings?.selfmodFilterThresholdDuration ?? 60_000) / 1_000,
		),
		selfmodFilterThresholdMaximum: settings?.selfmodFilterThresholdMaximum ?? 10,
		softActionAlerts: bitwiseHas(softAction, 0b100),
		softActionDeletes: bitwiseHas(softAction, 0b001),
		softActionLogs: bitwiseHas(softAction, 0b010),
	};
}

const state = reactive<Schema>(createDefaultState());

const selectedHardAction = computed({
	get: () =>
		hardActionItems.value.find((item) => item.value === state.selfmodFilterHardAction) ??
		hardActionItems.value[0]!,
	set: (item) => {
		state.selfmodFilterHardAction = item.value;
	},
});

watch(
	loading,
	(isLoading) => {
		if (!isLoading && guildSettings.value) {
			Object.assign(state, createDefaultState());
		}
	},
	{ immediate: true },
);

function addWord() {
	const word = sanitizeWord(newWord.value);
	if (word.length < 3 || state.selfmodFilterRaw.includes(word)) {
		return;
	}
	state.selfmodFilterRaw.push(word);
	newWord.value = "";
}

function removeWord(word: string) {
	const index = state.selfmodFilterRaw.indexOf(word);
	if (index !== -1) {
		state.selfmodFilterRaw.splice(index, 1);
	}
}

function mapToGuildData(formState: Schema): Partial<GuildData> {
	const softAction = bitwiseSet(
		bitwiseSet(
			bitwiseSet(0, 0b100, formState.softActionAlerts),
			0b010,
			formState.softActionLogs,
		),
		0b001,
		formState.softActionDeletes,
	);

	const durationMs =
		formState.hardActionDurationMs > 0 ? BigInt(formState.hardActionDurationMs) : null;

	return {
		selfmodFilterEnabled: formState.selfmodFilterEnabled,
		selfmodFilterHardAction: formState.selfmodFilterHardAction,
		selfmodFilterHardActionDuration: durationMs,
		selfmodFilterRaw: formState.selfmodFilterRaw,
		selfmodFilterSoftAction: softAction,
		selfmodFilterThresholdDuration: formState.selfmodFilterThresholdDurationSeconds * 1_000,
		selfmodFilterThresholdMaximum: formState.selfmodFilterThresholdMaximum,
	};
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: t("guild_settings.filter.word.save_failed", {
			message: errorMessage ?? t("guild_settings.please_try_again"),
		}),
		icon: "heroicons:x-circle",
		title: t("guild_settings.save_failed"),
	});
}
</script>
