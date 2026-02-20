<template>
	<GuildSettingsSection
		title="Channel Settings"
		description="Configure which channels are used for logging events and which channels should be ignored"
	>
		<GuildSettingsForm
			:state="state"
			:schema="schema"
			:map-to-guild-data="mapToGuildData"
			aria-label="General guild settings form"
			class="space-y-8"
			@error="onError"
		>
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<UIcon name="i-heroicons-document-text" class="size-5 text-primary" />
					<h3 class="text-lg font-semibold text-base-content">Logging Channels</h3>
				</div>
				<p class="text-sm text-base-content/70">
					Select which channels should receive specific log events. Leave empty to disable
					logging for that event.
				</p>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<div v-for="config in ConfigurableLoggingChannels" :key="config.key">
						<SelectChannel
							v-model="state[config.key] as string | null"
							:guild="guildData"
							:name="config.name"
							:label="config.name"
							:description="config.description"
						/>
					</div>
				</div>
			</div>

			<Separator />

			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<UIcon name="heroicons:eye-slash" class="size-5 text-warning" />
					<h3 class="text-lg font-semibold text-base-content">Ignore Channels</h3>
				</div>
				<p class="text-sm text-base-content/70">
					Select channels that should be ignored for specific logging events. Messages and
					events in these channels won't be logged.
				</p>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<div v-for="config in ConfigurableIgnoreChannels" :key="config.key">
						<SelectChannels
							v-model="state[config.key] as string[]"
							:guild="guildData"
							:label="config.name"
						/>
					</div>
				</div>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import type { GuildData, GuildDataKey } from "#server/database";
import type { FormErrorEvent } from "@nuxt/ui";
import {
	ConfigurableIgnoreChannels,
	ConfigurableLoggingChannels,
} from "#shared/utils/settingsDataEntries";
import * as v from "valibot";

const { guildData } = useGuildData();
const { guildSettings: _guildSettings } = useGuildSettings();
const toast = useToast();

const createChannelSchema = () => {
	const schemaShape: Record<string, v.GenericSchema> = {};

	for (const config of ConfigurableLoggingChannels) {
		schemaShape[config.key] = v.nullable(v.string());
	}

	for (const config of ConfigurableIgnoreChannels) {
		schemaShape[config.key] = v.optional(v.array(v.string()), []);
	}

	return v.object(schemaShape);
};

const schema = createChannelSchema();

type Schema = v.InferOutput<typeof schema>;

const createDefaultState = (): Record<string, string | null | string[]> => {
	const defaults: Record<string, string | null | string[]> = {};
	for (const config of ConfigurableLoggingChannels) {
		defaults[config.key] = null;
	}
	for (const config of ConfigurableIgnoreChannels) {
		defaults[config.key] = [];
	}
	return defaults;
};

const state = reactive<Record<string, string | null | string[]>>(createDefaultState());

function mapToGuildData(formState: Record<string, string | null | string[]>): Partial<GuildData> {
	const changes: Partial<GuildData> = {};

	for (const config of ConfigurableLoggingChannels) {
		const value = formState[config.key];
		// Include null values for nullable fields (user explicitly cleared)
		// Only exclude undefined (form doesn't control this key)
		if (value !== undefined) {
			changes[config.key as GuildDataKey] = value as any;
		}
	}

	for (const config of ConfigurableIgnoreChannels) {
		const value = formState[config.key];
		// Include empty arrays (user explicitly cleared all ignored channels)
		if (value !== undefined) {
			changes[config.key as GuildDataKey] = value as any;
		}
	}

	return changes;
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: `Failed to update channel settings. ${errorMessage ?? "Unknown error"}`,
		icon: "heroicons:x-circle",
		title: "Error",
	});
}
</script>
