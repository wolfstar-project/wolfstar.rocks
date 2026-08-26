<template>
	<div class="space-y-6">
		<!-- Skeleton -->
		<div v-if="loading" class="space-y-6">
			<div class="space-y-3">
				<USkeleton class="h-7 w-40" />
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
			:aria-label="t('guild_settings.filter.invites.form_aria')"
			@error="onError"
		>
			<!-- Section 1: Invite Link Filter -->
			<GuildSettingsSection :title="t('guild_settings.filter.invites.title')">
				<div class="space-y-3">
					<UFormField name="selfmodInvitesEnabled">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.selfmodInvitesEnabled"
								class="mt-0.5"
								:aria-label="t('guild_settings.filter.invites.toggle')"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									{{
										t("guild_settings.filter.invites.filter_label", {
											state: state.selfmodInvitesEnabled
												? t("guild_settings.filter.common.enabled")
												: t("guild_settings.filter.common.disabled"),
										})
									}}
								</p>
								<p class="mt-1 text-xs text-muted">
									{{ t("guild_settings.filter.invites.toggle_help") }}
								</p>
							</div>
						</div>
					</UFormField>

					<UFormField name="softActionAlerts">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.softActionAlerts"
								class="mt-0.5"
								:aria-label="t('guild_settings.filter.word.alerts_toggle')"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
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
					</UFormField>

					<UFormField name="softActionLogs">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.softActionLogs"
								class="mt-0.5"
								:aria-label="t('guild_settings.filter.word.logging_toggle')"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
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
					</UFormField>

					<UFormField name="softActionDeletes">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.softActionDeletes"
								class="mt-0.5"
								:aria-label="t('guild_settings.filter.word.delete_toggle')"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
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
					</UFormField>
				</div>
			</GuildSettingsSection>

			<Separator />

			<!-- Section 2: Punishments -->
			<GuildSettingsSection :title="t('guild_settings.filter.common.punishments')">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<UFormField
						:label="t('guild_settings.filter.common.hard_action')"
						name="selfmodInvitesHardAction"
						:description="t('guild_settings.filter.common.hard_action_description')"
					>
						<USelectMenu
							v-model="selectedHardAction"
							:items="hardActionItems"
							class="w-full"
							:aria-label="t('guild_settings.filter.common.select_action_aria')"
						/>
					</UFormField>

					<UFormField
						:label="t('guild_settings.filter.common.duration')"
						name="hardActionDurationMs"
						:description="t('guild_settings.filter.common.duration_help')"
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
							{{ t("guild_settings.filter.common.threshold_maximum") }}
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodInvitesThresholdMaximum }})</span
							>
						</p>
						<USlider
							v-model="state.selfmodInvitesThresholdMaximum"
							:min="0"
							:max="60"
							:aria-label="t('guild_settings.filter.common.threshold_maximum')"
						/>
						<div class="mt-1 flex justify-between text-xs text-muted">
							<span>0</span>
							<span>60</span>
						</div>
					</div>

					<div>
						<p class="mb-2 text-sm font-medium">
							{{ t("guild_settings.filter.common.threshold_duration") }}
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodInvitesThresholdDurationSeconds }}s)</span
							>
						</p>
						<USlider
							v-model="state.selfmodInvitesThresholdDurationSeconds"
							:min="0"
							:max="120"
							:aria-label="t('guild_settings.filter.common.threshold_duration')"
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
import { InvitesFilterSchema, type InvitesFilter } from "#shared/schemas";

const { ts: t } = useI18n();
const { guildSettings } = useGuildSettings();
const toast = useToast();

const loading = computed(() => !guildSettings.value);

const hardActionItems = computed(() => [
	{ label: t("guild_settings.filter.common.actions.none"), value: 0 },
	{ label: t("guild_settings.filter.common.actions.warning"), value: 1 },
	{ label: t("guild_settings.filter.common.actions.kick"), value: 2 },
	{ label: t("guild_settings.filter.common.actions.mute"), value: 3 },
	{ label: t("guild_settings.filter.common.actions.softban"), value: 4 },
	{ label: t("guild_settings.filter.common.actions.ban"), value: 5 },
]);

const schema = InvitesFilterSchema;
type Schema = InvitesFilter;

function createDefaultState(): Schema {
	const settings = guildSettings.value;
	const softAction = settings?.selfmodInvitesSoftAction ?? 0;

	return {
		hardActionDurationMs: settings?.selfmodInvitesHardActionDuration
			? Number(settings.selfmodInvitesHardActionDuration)
			: 0,
		selfmodInvitesEnabled: settings?.selfmodInvitesEnabled ?? false,
		selfmodInvitesHardAction: settings?.selfmodInvitesHardAction ?? 0,
		selfmodInvitesThresholdDurationSeconds: Math.floor(
			(settings?.selfmodInvitesThresholdDuration ?? 60_000) / 1_000,
		),
		selfmodInvitesThresholdMaximum: settings?.selfmodInvitesThresholdMaximum ?? 10,
		softActionAlerts: bitwiseHas(softAction, 0b100),
		softActionDeletes: bitwiseHas(softAction, 0b001),
		softActionLogs: bitwiseHas(softAction, 0b010),
	};
}

const state = reactive<Schema>(createDefaultState());

const selectedHardAction = computed({
	get: () =>
		hardActionItems.value.find((item) => item.value === state.selfmodInvitesHardAction) ??
		hardActionItems.value[0]!,
	set: (item) => {
		state.selfmodInvitesHardAction = item.value;
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
		selfmodInvitesEnabled: formState.selfmodInvitesEnabled,
		selfmodInvitesHardAction: formState.selfmodInvitesHardAction,
		selfmodInvitesHardActionDuration: durationMs,
		selfmodInvitesSoftAction: softAction,
		selfmodInvitesThresholdDuration: formState.selfmodInvitesThresholdDurationSeconds * 1_000,
		selfmodInvitesThresholdMaximum: formState.selfmodInvitesThresholdMaximum,
	};
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: t("guild_settings.filter.invites.save_failed", {
			message: errorMessage ?? t("guild_settings.please_try_again"),
		}),
		icon: "heroicons:x-circle",
		title: t("guild_settings.save_failed"),
	});
}
</script>
