<template>
	<div class="space-y-6">
		<!-- Skeleton -->
		<div v-if="loading" class="space-y-6">
			<div class="space-y-3">
				<USkeleton class="h-7 w-56" />
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
			aria-label="Message duplication filter settings form"
			@error="onError"
		>
			<!-- Section 1: Message Duplication Filter -->
			<GuildSettingsSection title="Message Duplication Filter">
				<div class="space-y-3">
					<UFormField name="selfmodMessagesEnabled">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.selfmodMessagesEnabled"
								class="mt-0.5"
								aria-label="Toggle message duplication filter"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									Filter
									{{ state.selfmodMessagesEnabled ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">
									Whether or not this system should be enabled.
								</p>
							</div>
						</div>
					</UFormField>

					<UFormField name="softActionAlerts">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.softActionAlerts"
								class="mt-0.5"
								aria-label="Toggle alerts soft action"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									Alerts {{ state.softActionAlerts ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">
									Toggle message alerts in the channel the infraction took place.
								</p>
							</div>
						</div>
					</UFormField>

					<UFormField name="softActionLogs">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.softActionLogs"
								class="mt-0.5"
								aria-label="Toggle logs soft action"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									Logs {{ state.softActionLogs ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">
									Toggle message logs in the moderation logs channel.
								</p>
							</div>
						</div>
					</UFormField>

					<UFormField name="softActionDeletes">
						<div class="flex items-start gap-3">
							<USwitch
								v-model="state.softActionDeletes"
								class="mt-0.5"
								aria-label="Toggle deletes soft action"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									Deletes {{ state.softActionDeletes ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">Toggle message deletions.</p>
							</div>
						</div>
					</UFormField>
				</div>
			</GuildSettingsSection>

			<Separator />

			<!-- Section 2: Punishments -->
			<GuildSettingsSection title="Punishments">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<UFormField
						label="Action"
						name="selfmodMessagesHardAction"
						description="The action to perform as punishment"
					>
						<USelectMenu
							v-model="selectedHardAction"
							:items="hardActionItems"
							class="w-full"
							aria-label="Select punishment action"
						/>
					</UFormField>

					<UFormField
						label="Duration"
						name="hardActionDurationMs"
						description="How long the punishment should last"
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
							Maximum Threshold
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodMessagesThresholdMaximum }})</span
							>
						</p>
						<USlider
							v-model="state.selfmodMessagesThresholdMaximum"
							:min="0"
							:max="60"
							aria-label="Messages selfmod filter maximum threshold slider"
						/>
						<div class="mt-1 flex justify-between text-xs text-muted">
							<span>0</span>
							<span>60</span>
						</div>
					</div>

					<div>
						<p class="mb-2 text-sm font-medium">
							Threshold Duration (in seconds)
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodMessagesThresholdDurationSeconds }}s)</span
							>
						</p>
						<USlider
							v-model="state.selfmodMessagesThresholdDurationSeconds"
							:min="0"
							:max="120"
							aria-label="Messages selfmod filter threshold duration slider"
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
import { MessagesFilterSchema, type MessagesFilter } from "#shared/schemas";

const { guildSettings } = useGuildSettings();
const toast = useToast();

const loading = computed(() => !guildSettings.value);

const hardActionItems = [
	{ label: "None", value: 0 },
	{ label: "Warning", value: 1 },
	{ label: "Kick", value: 2 },
	{ label: "Mute", value: 3 },
	{ label: "Softban", value: 4 },
	{ label: "Ban", value: 5 },
];

const schema = MessagesFilterSchema;
type Schema = MessagesFilter;

function createDefaultState(): Schema {
	const settings = guildSettings.value;
	const softAction = settings?.selfmodMessagesSoftAction ?? 0;

	return {
		hardActionDurationMs: settings?.selfmodMessagesHardActionDuration
			? Number(settings.selfmodMessagesHardActionDuration)
			: 0,
		selfmodMessagesEnabled: settings?.selfmodMessagesEnabled ?? false,
		selfmodMessagesHardAction: settings?.selfmodMessagesHardAction ?? 0,
		selfmodMessagesThresholdDurationSeconds: Math.floor(
			(settings?.selfmodMessagesThresholdDuration ?? 60_000) / 1_000,
		),
		selfmodMessagesThresholdMaximum: settings?.selfmodMessagesThresholdMaximum ?? 10,
		softActionAlerts: bitwiseHas(softAction, 0b100),
		softActionDeletes: bitwiseHas(softAction, 0b001),
		softActionLogs: bitwiseHas(softAction, 0b010),
	};
}

const state = reactive<Schema>(createDefaultState());

const selectedHardAction = computed({
	get: () =>
		hardActionItems.find((item) => item.value === state.selfmodMessagesHardAction) ??
		hardActionItems[0]!,
	set: (item) => {
		state.selfmodMessagesHardAction = item.value;
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
		selfmodMessagesEnabled: formState.selfmodMessagesEnabled,
		selfmodMessagesHardAction: formState.selfmodMessagesHardAction,
		selfmodMessagesHardActionDuration: durationMs,
		selfmodMessagesSoftAction: softAction,
		selfmodMessagesThresholdDuration: formState.selfmodMessagesThresholdDurationSeconds * 1_000,
		selfmodMessagesThresholdMaximum: formState.selfmodMessagesThresholdMaximum,
	};
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: `Could not save message duplication filter settings. ${errorMessage ?? "Please try again."}`,
		icon: "heroicons:x-circle",
		title: "Save Failed",
	});
}
</script>
