<template>
	<div class="space-y-6">
		<!-- Skeleton -->
		<div v-if="loading" class="space-y-6">
			<div class="space-y-3">
				<StarSkeleton class="h-7 w-48" />
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
				<StarSkeleton class="h-7 w-24" />
				<StarSkeleton class="h-10 w-full" />
				<StarSkeleton class="h-10 w-full" />
			</div>
		</div>

		<!-- Form -->
		<GuildSettingsForm
			v-else
			:state="state"
			:schema="schema"
			:map-to-guild-data="mapToGuildData"
			class="space-y-6"
			aria-label="Capital letters filter settings form"
			@error="onError"
		>
			<!-- Section 1: Capital Letters Filter -->
			<GuildSettingsSection title="Capital Letters Filter">
				<div class="space-y-3">
					<StarFormField name="selfmodCapitalsEnabled">
						<div class="gap-3 flex items-start">
							<StarSwitch
								v-model="state.selfmodCapitalsEnabled"
								class="mt-0.5"
								aria-label="Toggle capital letters filter"
							/>
							<div>
								<p class="text-sm font-medium leading-none">
									Filter
									{{ state.selfmodCapitalsEnabled ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">
									Flags messages with excessive capital letters.
								</p>
							</div>
						</div>
					</StarFormField>

					<StarFormField name="softActionAlerts">
						<div class="gap-3 flex items-start">
							<StarSwitch
								v-model="state.softActionAlerts"
								class="mt-0.5"
								aria-label="Toggle alerts soft action"
							/>
							<div>
								<p class="text-sm font-medium leading-none">
									Alerts {{ state.softActionAlerts ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">
									Posts an alert in the channel where the violation occurred.
								</p>
							</div>
						</div>
					</StarFormField>

					<StarFormField name="softActionLogs">
						<div class="gap-3 flex items-start">
							<StarSwitch
								v-model="state.softActionLogs"
								class="mt-0.5"
								aria-label="Toggle logs soft action"
							/>
							<div>
								<p class="text-sm font-medium leading-none">
									Logs {{ state.softActionLogs ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">
									Sends a log entry to the moderation logs channel.
								</p>
							</div>
						</div>
					</StarFormField>

					<StarFormField name="softActionDeletes">
						<div class="gap-3 flex items-start">
							<StarSwitch
								v-model="state.softActionDeletes"
								class="mt-0.5"
								aria-label="Toggle deletes soft action"
							/>
							<div>
								<p class="text-sm font-medium leading-none">
									Deletes {{ state.softActionDeletes ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">
									Automatically deletes the offending message.
								</p>
							</div>
						</div>
					</StarFormField>
				</div>
			</GuildSettingsSection>

			<Separator />

			<!-- Section 2: Punishments -->
			<GuildSettingsSection title="Punishments">
				<div class="gap-4 md:grid-cols-2 grid grid-cols-1">
					<StarFormField
						label="Action"
						name="selfmodCapitalsHardAction"
						description="What happens when a member exceeds the limit"
					>
						<StarSelectMenu
							v-model="selectedHardAction"
							:items="hardActionItems"
							class="w-full"
							aria-label="Select punishment action"
						/>
					</StarFormField>

					<StarFormField
						label="Duration"
						name="hardActionDurationMs"
						description="How long the mute or ban lasts"
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
							Violations before punishment
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodCapitalsThresholdMaximum }})</span
							>
						</p>
						<StarSlider
							v-model="state.selfmodCapitalsThresholdMaximum"
							:min="0"
							:max="60"
							aria-label="Capitals filter violations before punishment slider"
						/>
						<div class="mt-1 text-xs text-muted flex justify-between">
							<span>0</span>
							<span>60</span>
						</div>
					</div>

					<div>
						<p class="mb-2 text-sm font-medium">
							Time window (seconds)
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodCapitalsThresholdDurationSeconds }}s)</span
							>
						</p>
						<StarSlider
							v-model="state.selfmodCapitalsThresholdDurationSeconds"
							:min="0"
							:max="120"
							aria-label="Capitals filter time window (seconds) slider"
						/>
						<div class="mt-1 text-xs text-muted flex justify-between">
							<span>0s</span>
							<span>120s</span>
						</div>
					</div>
				</div>
			</GuildSettingsSection>

			<Separator />

			<!-- Section 3: Options -->
			<GuildSettingsSection title="Options">
				<div class="space-y-5">
					<div>
						<p class="mb-2 text-sm font-medium">
							Minimum Characters
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodCapitalsMinimum }})</span
							>
						</p>
						<StarSlider
							v-model="state.selfmodCapitalsMinimum"
							:min="5"
							:max="2000"
							aria-label="Capitals selfmod filter minimum characters slider"
						/>
						<div class="mt-1 text-xs text-muted flex justify-between">
							<span>5</span>
							<span>2000</span>
						</div>
					</div>

					<div>
						<p class="mb-2 text-sm font-medium">
							Maximum Uppercase Characters (%)
							<span class="ml-1 text-muted tabular-nums"
								>({{ state.selfmodCapitalsMaximum }}%)</span
							>
						</p>
						<StarSlider
							v-model="state.selfmodCapitalsMaximum"
							:min="10"
							:max="100"
							aria-label="Capitals selfmod filter maximum uppercase characters slider"
						/>
						<div class="mt-1 text-xs text-muted flex justify-between">
							<span>10%</span>
							<span>100%</span>
						</div>
					</div>
				</div>
			</GuildSettingsSection>
		</GuildSettingsForm>
	</div>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "#shared/types/ui";
import { CapitalsFilterSchema, type CapitalsFilter } from "#shared/schemas";

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

const schema = CapitalsFilterSchema;
type Schema = CapitalsFilter;

function createDefaultState(): Schema {
	const settings = guildSettings.value;
	const softAction = settings?.selfmodCapitalsSoftAction ?? 0;

	return {
		hardActionDurationMs: settings?.selfmodCapitalsHardActionDuration
			? Number(settings.selfmodCapitalsHardActionDuration)
			: 0,
		selfmodCapitalsEnabled: settings?.selfmodCapitalsEnabled ?? false,
		selfmodCapitalsHardAction: settings?.selfmodCapitalsHardAction ?? 0,
		selfmodCapitalsMaximum: settings?.selfmodCapitalsMaximum ?? 50,
		selfmodCapitalsMinimum: settings?.selfmodCapitalsMinimum ?? 15,
		selfmodCapitalsThresholdDurationSeconds: Math.floor(
			(settings?.selfmodCapitalsThresholdDuration ?? 60_000) / 1_000,
		),
		selfmodCapitalsThresholdMaximum: settings?.selfmodCapitalsThresholdMaximum ?? 10,
		softActionAlerts: bitwiseHas(softAction, 0b100),
		softActionDeletes: bitwiseHas(softAction, 0b001),
		softActionLogs: bitwiseHas(softAction, 0b010),
	};
}

const state = reactive<Schema>(createDefaultState());

const selectedHardAction = computed({
	get: () =>
		hardActionItems.find((item) => item.value === state.selfmodCapitalsHardAction) ??
		hardActionItems[0]!,
	set: (item) => {
		state.selfmodCapitalsHardAction = item.value;
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
		selfmodCapitalsEnabled: formState.selfmodCapitalsEnabled,
		selfmodCapitalsHardAction: formState.selfmodCapitalsHardAction,
		selfmodCapitalsHardActionDuration: durationMs,
		selfmodCapitalsMaximum: formState.selfmodCapitalsMaximum,
		selfmodCapitalsMinimum: formState.selfmodCapitalsMinimum,
		selfmodCapitalsSoftAction: softAction,
		selfmodCapitalsThresholdDuration: formState.selfmodCapitalsThresholdDurationSeconds * 1_000,
		selfmodCapitalsThresholdMaximum: formState.selfmodCapitalsThresholdMaximum,
	};
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: `Couldn't save capitals filter settings. ${errorMessage ?? "Please try again."}`,
		icon: "heroicons:x-circle",
		title: "Save Failed",
	});
}
</script>
