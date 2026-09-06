<template>
	<div class="space-y-6">
		<!-- Skeleton -->
		<div v-if="loading" class="space-y-6">
			<div class="space-y-3">
				<USkeleton class="h-7 w-36" />
				<div v-for="i in 4" :key="i" class="flex items-center gap-3">
					<USkeleton class="h-6 w-11 shrink-0 rounded-full" />
					<div class="space-y-1.5">
						<USkeleton class="h-4 w-32" />
						<USkeleton class="h-3 w-56" />
					</div>
				</div>
			</div>
			<div class="space-y-3">
				<USkeleton class="h-7 w-32" />
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<USkeleton class="h-10 w-full" />
					<USkeleton class="h-10 w-full" />
				</div>
				<USkeleton class="h-10 w-full" />
				<USkeleton class="h-10 w-full" />
			</div>
		</div>

		<!-- Form -->
		<GuildSettingsForm
			v-else
			:state="state"
			:schema="schema"
			:map-to-guild-data="mapToGuildData"
			class="space-y-6"
			:aria-label="ts('guild_settings.filter.reactions.form_aria')"
			@error="onError"
		>
			<!-- Section 1: Reaction Filter -->
			<GuildSettingsSection :title="ts('guild_settings.filter.reactions.title')">
				<div class="space-y-3">
					<UFormField name="selfmodReactionsEnabled">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.selfmodReactionsEnabled"
								class="mt-0.5"
								:aria-label="ts('guild_settings.filter.reactions.toggle')"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									{{
										ts("guild_settings.filter.reactions.filter_label", {
											state: state.selfmodReactionsEnabled
												? ts("guild_settings.filter.common.enabled")
												: ts("guild_settings.filter.common.disabled"),
										})
									}}
								</p>
								<p class="mt-1 text-xs text-muted">
									{{ ts("guild_settings.filter.reactions.toggle_help") }}
								</p>
							</div>
						</div>
					</UFormField>

					<UFormField name="softActionAlerts">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.softActionAlerts"
								class="mt-0.5"
								:aria-label="ts('guild_settings.filter.word.alerts_toggle')"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									{{ ts("guild_settings.filter.common.alerts") }}
									{{
										state.softActionAlerts
											? ts("guild_settings.filter.common.enabled")
											: ts("guild_settings.filter.common.disabled")
									}}
								</p>
								<p class="mt-1 text-xs text-muted">
									{{ ts("guild_settings.filter.common.alerts_help") }}
								</p>
							</div>
						</div>
					</UFormField>

					<UFormField name="softActionLogs">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.softActionLogs"
								class="mt-0.5"
								:aria-label="ts('guild_settings.filter.word.logging_toggle')"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									{{ ts("guild_settings.filter.common.logging") }}
									{{
										state.softActionLogs
											? ts("guild_settings.filter.common.enabled")
											: ts("guild_settings.filter.common.disabled")
									}}
								</p>
								<p class="mt-1 text-xs text-muted">
									{{ ts("guild_settings.filter.common.logging_help") }}
								</p>
							</div>
						</div>
					</UFormField>

					<UFormField name="softActionDeletes">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.softActionDeletes"
								class="mt-0.5"
								:aria-label="ts('guild_settings.filter.word.delete_toggle')"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									{{ ts("guild_settings.filter.common.delete_message") }}
									{{
										state.softActionDeletes
											? ts("guild_settings.filter.common.enabled")
											: ts("guild_settings.filter.common.disabled")
									}}
								</p>
								<p class="mt-1 text-xs text-muted">
									{{ ts("guild_settings.filter.common.delete_message_help") }}
								</p>
							</div>
						</div>
					</UFormField>
				</div>
			</GuildSettingsSection>

			<Separator />

			<!-- Section 2: Punishments -->
			<GuildSettingsSection :title="ts('guild_settings.filter.common.punishments')">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<UFormField
						:label="ts('guild_settings.filter.common.hard_action')"
						name="selfmodReactionsHardAction"
						:description="ts('guild_settings.filter.common.hard_action_description')"
					>
						<USelectMenu
							v-model="selectedHardAction"
							:items="hardActionItems"
							class="w-full"
							:aria-label="ts('guild_settings.filter.common.select_action_aria')"
						/>
					</UFormField>

					<UFormField
						:label="ts('guild_settings.filter.common.duration')"
						name="hardActionDurationMs"
						:description="ts('guild_settings.filter.common.duration_help')"
					>
						<SelectDuration
							v-model="state.hardActionDurationMs"
							:min="1000"
							:max="31_536_000_000"
						/>
					</UFormField>
				</div>

				<div class="mt-4 space-y-5">
					<div>
						<p class="mb-2 text-sm font-medium">
							{{ ts("guild_settings.filter.common.threshold_maximum") }}
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodReactionsThresholdMaximum }})</span
							>
						</p>
						<USlider
							v-model="state.selfmodReactionsThresholdMaximum"
							:min="0"
							:max="60"
							:aria-label="ts('guild_settings.filter.common.threshold_maximum')"
						/>
						<div class="mt-1 flex justify-between text-xs text-muted">
							<span>0</span>
							<span>60</span>
						</div>
					</div>

					<div>
						<p class="mb-2 text-sm font-medium">
							{{ ts("guild_settings.filter.common.threshold_duration") }}
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodReactionsThresholdDurationSeconds }}s)</span
							>
						</p>
						<USlider
							v-model="state.selfmodReactionsThresholdDurationSeconds"
							:min="0"
							:max="120"
							:aria-label="ts('guild_settings.filter.common.threshold_duration')"
						/>
						<div class="mt-1 flex justify-between text-xs text-muted">
							<span>0s</span>
							<span>120s</span>
						</div>
					</div>
				</div>
			</GuildSettingsSection>
		</GuildSettingsForm>
	</div>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "@nuxt/ui";
import { ReactionsFilterSchema, type ReactionsFilter } from "#shared/schemas";

const { ts } = useI18n();
const { guildSettings } = useGuildSettings();
const toast = useToast();

const loading = computed(() => !guildSettings.value);

const hardActionItems = computed(() => [
	{ label: ts("guild_settings.filter.common.actions.none"), value: 0 },
	{ label: ts("guild_settings.filter.common.actions.warning"), value: 1 },
	{ label: ts("guild_settings.filter.common.actions.kick"), value: 2 },
	{ label: ts("guild_settings.filter.common.actions.mute"), value: 3 },
	{ label: ts("guild_settings.filter.common.actions.softban"), value: 4 },
	{ label: ts("guild_settings.filter.common.actions.ban"), value: 5 },
]);

const schema = ReactionsFilterSchema;
type Schema = ReactionsFilter;

function createDefaultState(): Schema {
	const settings = guildSettings.value;
	const softAction = settings?.selfmodReactionsSoftAction ?? 0;

	return {
		hardActionDurationMs: settings?.selfmodReactionsHardActionDuration
			? Number(settings.selfmodReactionsHardActionDuration)
			: 0,
		selfmodReactionsEnabled: settings?.selfmodReactionsEnabled ?? false,
		selfmodReactionsHardAction: settings?.selfmodReactionsHardAction ?? 0,
		selfmodReactionsThresholdDurationSeconds: Math.floor(
			(settings?.selfmodReactionsThresholdDuration ?? 60_000) / 1_000,
		),
		selfmodReactionsThresholdMaximum: settings?.selfmodReactionsThresholdMaximum ?? 10,
		softActionAlerts: bitwiseHas(softAction, 0b100),
		softActionDeletes: bitwiseHas(softAction, 0b001),
		softActionLogs: bitwiseHas(softAction, 0b010),
	};
}

const state = reactive<Schema>(createDefaultState());

const selectedHardAction = computed({
	get: () =>
		hardActionItems.value.find((item) => item.value === state.selfmodReactionsHardAction) ??
		hardActionItems.value[0]!,
	set: (item) => {
		state.selfmodReactionsHardAction = item.value;
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
		selfmodReactionsEnabled: formState.selfmodReactionsEnabled,
		selfmodReactionsHardAction: formState.selfmodReactionsHardAction,
		selfmodReactionsHardActionDuration: durationMs,
		selfmodReactionsSoftAction: softAction,
		selfmodReactionsThresholdDuration:
			formState.selfmodReactionsThresholdDurationSeconds * 1_000,
		selfmodReactionsThresholdMaximum: formState.selfmodReactionsThresholdMaximum,
	};
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: ts("guild_settings.filter.reactions.save_failed", {
			message: errorMessage ?? ts("guild_settings.please_try_again"),
		}),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.save_failed"),
	});
}
</script>
