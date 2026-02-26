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
				<div class="grid grid-cols-2 gap-4">
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
			aria-label="Invite link filter settings form"
			@error="onError"
		>
			<!-- Section 1: Invite Link Filter -->
			<GuildSettingsSection title="Invite Link Filter">
				<div class="space-y-3">
					<UFormField name="selfmodInvitesEnabled">
						<div class="flex items-start gap-3">
							<USwitch v-model="state.selfmodInvitesEnabled" class="mt-0.5" aria-label="Toggle invite link filter" />
							<div>
								<p class="text-sm font-medium leading-none">
									Filter {{ state.selfmodInvitesEnabled ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">Whether or not this system should be enabled.</p>
							</div>
						</div>
					</UFormField>

					<UFormField name="softActionAlerts">
						<div class="flex items-start gap-3">
							<USwitch v-model="state.softActionAlerts" class="mt-0.5" aria-label="Toggle alerts soft action" />
							<div>
								<p class="text-sm font-medium leading-none">
									Alerts {{ state.softActionAlerts ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">Toggle message alerts in the channel the infraction took place.</p>
							</div>
						</div>
					</UFormField>

					<UFormField name="softActionLogs">
						<div class="flex items-start gap-3">
							<USwitch v-model="state.softActionLogs" class="mt-0.5" aria-label="Toggle logs soft action" />
							<div>
								<p class="text-sm font-medium leading-none">
									Logs {{ state.softActionLogs ? "Enabled" : "Disabled" }}
								</p>
								<p class="mt-1 text-xs text-muted">Toggle message logs in the moderation logs channel.</p>
							</div>
						</div>
					</UFormField>

					<UFormField name="softActionDeletes">
						<div class="flex items-start gap-3">
							<USwitch v-model="state.softActionDeletes" class="mt-0.5" aria-label="Toggle deletes soft action" />
							<div>
								<p class="text-sm font-medium leading-none">
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
				<div class="grid grid-cols-2 gap-4">
					<UFormField label="Action" name="selfmodInvitesHardAction" description="The action to perform as punishment">
						<USelectMenu
							v-model="selectedHardAction"
							:items="hardActionItems"
							class="w-full"
							aria-label="Select punishment action"
						/>
					</UFormField>

					<UFormField label="Duration" name="hardActionDurationMs" description="How long the punishment should last">
						<SelectDuration v-model="state.hardActionDurationMs" :min="0" />
					</UFormField>
				</div>

				<div class="mt-4 space-y-5">
					<div>
						<p class="mb-2 text-sm font-medium">
							Maximum Threshold
							<span class="ml-1 tabular-nums text-muted">({{ state.selfmodInvitesThresholdMaximum }})</span>
						</p>
						<USlider
							v-model="state.selfmodInvitesThresholdMaximum"
							:min="0"
							:max="60"
							aria-label="Invites selfmod filter maximum threshold slider"
						/>
						<div class="mt-1 flex justify-between text-xs text-muted">
							<span>0</span>
							<span>60</span>
						</div>
					</div>

					<div>
						<p class="mb-2 text-sm font-medium">
							Threshold Duration (in seconds)
							<span class="ml-1 tabular-nums text-muted">({{ state.selfmodInvitesThresholdDurationSeconds }}s)</span>
						</p>
						<USlider
							v-model="state.selfmodInvitesThresholdDurationSeconds"
							:min="0"
							:max="120"
							aria-label="Invites selfmod filter threshold duration slider"
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
import { bitwiseHas, bitwiseSet } from "#shared/utils/bits";
import * as v from "valibot";

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

const schema = v.object({
	hardActionDurationMs: v.pipe(v.number(), v.minValue(0)),
	selfmodInvitesEnabled: v.boolean(),
	selfmodInvitesHardAction: v.pipe(v.number(), v.minValue(0), v.maxValue(5)),
	selfmodInvitesThresholdDurationSeconds: v.pipe(v.number(), v.minValue(0), v.maxValue(120)),
	selfmodInvitesThresholdMaximum: v.pipe(v.number(), v.minValue(0), v.maxValue(60)),
	softActionAlerts: v.boolean(),
	softActionDeletes: v.boolean(),
	softActionLogs: v.boolean(),
});

type Schema = v.InferOutput<typeof schema>;

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
	get: () => hardActionItems.find((item) => item.value === state.selfmodInvitesHardAction) ?? hardActionItems[0]!,
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
		bitwiseSet(bitwiseSet(0, 0b100, formState.softActionAlerts), 0b010, formState.softActionLogs),
		0b001,
		formState.softActionDeletes,
	);

	const durationMs = formState.hardActionDurationMs > 0 ? BigInt(formState.hardActionDurationMs) : null;

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
		description: `Failed to update invite link filter settings. ${errorMessage ?? "Unknown error"}`,
		icon: "heroicons:x-circle",
		title: "Error",
	});
}
</script>
