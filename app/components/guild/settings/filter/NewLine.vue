<template>
	<div class="space-y-6">
		<!-- Skeleton -->
		<div v-if="loading" class="space-y-6">
			<div class="space-y-3">
				<StarSkeleton class="h-7 w-40" />
				<div v-for="i in 4" :key="i" class="flex items-center gap-3">
					<StarSkeleton class="h-6 w-11 shrink-0 rounded-full" />
					<div class="space-y-1.5">
						<StarSkeleton class="h-4 w-32" />
						<StarSkeleton class="h-3 w-56" />
					</div>
				</div>
			</div>
			<div class="space-y-3">
				<StarSkeleton class="h-7 w-32" />
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<StarSkeleton class="h-10 w-full" />
					<StarSkeleton class="h-10 w-full" />
				</div>
				<StarSkeleton class="h-10 w-full" />
				<StarSkeleton class="h-10 w-full" />
			</div>
			<div class="space-y-3">
				<StarSkeleton class="h-7 w-24" />
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
			aria-label="New line filter settings form"
			@error="onError"
		>
			<!-- Section 1: Line Spam Filter -->
			<GuildSettingsSection title="Line Spam Filter">
				<div class="space-y-3">
					<StarFormField name="selfmodNewlinesEnabled">
						<div class="flex items-start gap-3">
							<StarSwitch
								v-model="state.selfmodNewlinesEnabled"
								class="mt-0.5"
								aria-label="Toggle line spam filter"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									Filter
									{{ state.selfmodNewlinesEnabled ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-base-content/60">
									Flags messages with excessive line breaks.
								</p>
							</div>
						</div>
					</StarFormField>

					<StarFormField name="softActionAlerts">
						<div class="flex items-start gap-3">
							<StarSwitch
								v-model="state.softActionAlerts"
								class="mt-0.5"
								aria-label="Toggle alerts soft action"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									Alerts {{ state.softActionAlerts ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-base-content/60">
									Posts an alert in the channel where the violation occurred.
								</p>
							</div>
						</div>
					</StarFormField>

					<StarFormField name="softActionLogs">
						<div class="flex items-start gap-3">
							<StarSwitch
								v-model="state.softActionLogs"
								class="mt-0.5"
								aria-label="Toggle logs soft action"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									Logs {{ state.softActionLogs ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-base-content/60">
									Sends a log entry to the moderation logs channel.
								</p>
							</div>
						</div>
					</StarFormField>

					<StarFormField name="softActionDeletes">
						<div class="flex items-start gap-3">
							<StarSwitch
								v-model="state.softActionDeletes"
								class="mt-0.5"
								aria-label="Toggle deletes soft action"
							/>
							<div>
								<p class="text-sm leading-none font-medium">
									Deletes {{ state.softActionDeletes ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-base-content/60">
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
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<StarFormField
						label="Action"
						name="selfmodNewlinesHardAction"
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
							<span class="ml-1 text-base-content/60 tabular-nums"
								>({{ state.selfmodNewlinesThresholdMaximum }})</span
							>
						</p>
						<StarSlider
							v-model="state.selfmodNewlinesThresholdMaximum"
							:min="0"
							:max="60"
							aria-label="New lines filter violations before punishment slider"
						/>
						<div class="mt-1 flex justify-between text-xs text-base-content/60">
							<span>0</span>
							<span>60</span>
						</div>
					</div>

					<div>
						<p class="mb-2 text-sm font-medium">
							Time window (seconds)
							<span class="ml-1 text-base-content/60 tabular-nums"
								>({{ state.selfmodNewlinesThresholdDurationSeconds }}s)</span
							>
						</p>
						<StarSlider
							v-model="state.selfmodNewlinesThresholdDurationSeconds"
							:min="0"
							:max="120"
							aria-label="New lines filter time window (seconds) slider"
						/>
						<div class="mt-1 flex justify-between text-xs text-base-content/60">
							<span>0s</span>
							<span>120s</span>
						</div>
					</div>
				</div>
			</GuildSettingsSection>

			<Separator />

			<!-- Section 3: Options -->
			<GuildSettingsSection title="Options">
				<div>
					<p class="mb-1 text-sm font-medium">
						Maximum New Lines
						<span class="ml-1 text-base-content/60 tabular-nums"
							>({{ state.selfmodNewlinesMaximum }})</span
						>
					</p>
					<p class="mb-3 text-xs text-base-content/60">
						Maximum amount of new lines in a message before filter is applied
					</p>
					<StarSlider
						v-model="state.selfmodNewlinesMaximum"
						:min="10"
						:max="2000"
						aria-label="New lines selfmod filter maximum lines slider"
					/>
					<div class="mt-1 flex justify-between text-xs text-base-content/60">
						<span>10</span>
						<span>2000</span>
					</div>
				</div>
			</GuildSettingsSection>
		</GuildSettingsForm>
	</div>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "#shared/types/ui";
import { NewlinesFilterSchema, type NewlinesFilter } from "#shared/schemas";

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

const schema = NewlinesFilterSchema;
type Schema = NewlinesFilter;

function createDefaultState(): Schema {
	const settings = guildSettings.value;
	const softAction = settings?.selfmodNewlinesSoftAction ?? 0;

	return {
		hardActionDurationMs: settings?.selfmodNewlinesHardActionDuration
			? Number(settings.selfmodNewlinesHardActionDuration)
			: 0,
		selfmodNewlinesEnabled: settings?.selfmodNewlinesEnabled ?? false,
		selfmodNewlinesHardAction: settings?.selfmodNewlinesHardAction ?? 0,
		selfmodNewlinesMaximum: settings?.selfmodNewlinesMaximum ?? 10,
		selfmodNewlinesThresholdDurationSeconds: Math.floor(
			(settings?.selfmodNewlinesThresholdDuration ?? 60_000) / 1_000,
		),
		selfmodNewlinesThresholdMaximum: settings?.selfmodNewlinesThresholdMaximum ?? 10,
		softActionAlerts: bitwiseHas(softAction, 0b100),
		softActionDeletes: bitwiseHas(softAction, 0b001),
		softActionLogs: bitwiseHas(softAction, 0b010),
	};
}

const state = reactive<Schema>(createDefaultState());

const selectedHardAction = computed({
	get: () =>
		hardActionItems.find((item) => item.value === state.selfmodNewlinesHardAction) ??
		hardActionItems[0]!,
	set: (item) => {
		state.selfmodNewlinesHardAction = item.value;
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
		selfmodNewlinesEnabled: formState.selfmodNewlinesEnabled,
		selfmodNewlinesHardAction: formState.selfmodNewlinesHardAction,
		selfmodNewlinesHardActionDuration: durationMs,
		selfmodNewlinesMaximum: formState.selfmodNewlinesMaximum,
		selfmodNewlinesSoftAction: softAction,
		selfmodNewlinesThresholdDuration: formState.selfmodNewlinesThresholdDurationSeconds * 1_000,
		selfmodNewlinesThresholdMaximum: formState.selfmodNewlinesThresholdMaximum,
	};
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: `Couldn't save line spam filter settings. ${errorMessage ?? "Please try again."}`,
		icon: "heroicons:x-circle",
		title: "Save Failed",
	});
}
</script>
