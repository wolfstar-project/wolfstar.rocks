<template>
	<GuildSettingsSection
		:title="t('guild_settings.roles.title')"
		:description="t('guild_settings.roles.subtitle')"
	>
		<!-- Loading Skeleton -->
		<div v-if="loading" class="space-y-8">
			<!-- Toggles Skeleton -->
			<div class="space-y-4">
				<StarSkeleton class="h-8 w-32" />
				<StarSkeleton class="h-10 w-full" />
			</div>

			<!-- Configurable Roles Skeleton -->
			<div class="space-y-4">
				<StarSkeleton class="h-8 w-48" />
				<div class="gap-4 md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
					<div v-for="i in 6" :key="`roles-skeleton-${i}`" class="space-y-2">
						<StarSkeleton class="h-5 w-32" />
						<StarSkeleton class="h-10 w-full" />
					</div>
				</div>
			</div>
		</div>

		<!-- Roles Settings Form -->
		<GuildSettingsForm
			v-else
			:state="state"
			:schema="schema"
			:map-to-guild-data="mapToGuildData"
			:aria-label="t('guild_settings.roles.form_aria')"
			class="space-y-8"
			@error="onError"
		>
			<!-- Toggles Section -->
			<div class="space-y-4">
				<div class="gap-2 flex items-center">
					<Icon name="heroicons:adjustments-horizontal" class="size-5 text-primary" />
					<h3 class="text-lg font-semibold text-base-content">
						{{ t("guild_settings.roles.general_options") }}
					</h3>
				</div>

				<StarFormField
					:label="translateEntry(ConfigurableRemoveInitialRole, 'name')"
					:description="translateEntry(ConfigurableRemoveInitialRole, 'tooltip')"
					name="rolesRemoveInitial"
				>
					<div class="gap-2 flex items-center">
						<StarSwitch v-model="state.rolesRemoveInitial as boolean" />
					</div>
				</StarFormField>
			</div>

			<Separator />

			<!-- Configurable Roles Section -->
			<div class="space-y-4">
				<div class="gap-2 flex items-center">
					<Icon name="heroicons:user-group" class="size-5 text-primary" />
					<h3 class="text-lg font-semibold text-base-content">
						{{ t("guild_settings.roles.configurable") }}
					</h3>
				</div>
				<p class="text-sm text-base-content/70">
					{{ t("guild_settings.roles.configurable_help") }}
				</p>

				<div class="gap-4 md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
					<template v-for="roleConfig in standardRoles" :key="roleConfig.key">
						<!-- Many (Array) -->
						<SelectRoles
							v-if="isArrayKey(roleConfig.key)"
							v-model="state[roleConfig.key] as string[]"
							:label="translateEntry(roleConfig, 'name')"
							:guild="guildData"
							:tooltip-title="translateEntry(roleConfig, 'tooltip')"
						/>

						<!-- One (Single) -->
						<SelectRole
							v-else
							v-model="state[roleConfig.key] as string | null"
							:label="translateEntry(roleConfig, 'name')"
							:guild="guildData"
							:tooltip-title="translateEntry(roleConfig, 'tooltip')"
						/>
					</template>
				</div>
			</div>

			<Separator />

			<!-- Restricted Roles Section -->
			<div class="space-y-4">
				<div class="gap-2 flex items-center">
					<Icon name="heroicons:shield-check" class="size-5 text-primary" />
					<h3 class="text-lg font-semibold text-base-content">
						{{ t("guild_settings.roles.restricted") }}
					</h3>
				</div>
				<p class="text-sm text-base-content/70">
					{{ t("guild_settings.roles.restricted_help") }}
				</p>

				<div class="gap-4 md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
					<template v-for="roleConfig in restrictedRoles" :key="roleConfig.key">
						<!-- Many (Array) -->
						<SelectRoles
							v-if="isArrayKey(roleConfig.key)"
							v-model="state[roleConfig.key] as string[]"
							:label="translateEntry(roleConfig, 'name')"
							:guild="guildData"
							:tooltip-title="translateEntry(roleConfig, 'tooltip')"
						/>

						<!-- One (Single) -->
						<SelectRole
							v-else
							v-model="state[roleConfig.key] as string | null"
							:label="translateEntry(roleConfig, 'name')"
							:guild="guildData"
							:tooltip-title="translateEntry(roleConfig, 'tooltip')"
						/>
					</template>
				</div>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "#shared/types/ui";
import {
	isRoleArrayKey,
	RolesSettingsSchema as schema,
	type RolesSettingsSchemaType as Schema,
} from "#shared/schemas";
import { setGuildDataChange } from "#shared/utils/guild-settings-map";
import { isNullOrUndefined } from "@sapphire/utilities";
import {
	ConfigurableRemoveInitialRole,
	ConfigurableRoles,
} from "~~/shared/utils/settingsDataEntries";

const { t } = useI18n();
const { translateEntry } = useSettingsEntryI18n();

const { guildData } = useGuildData();
const { guildSettings } = useGuildSettings();
const toast = useToast();

function isArrayKey(key: string): boolean {
	return isRoleArrayKey(key);
}

const restrictedRoles = ConfigurableRoles.filter((r) => r.key.startsWith("rolesRestricted"));
const standardRoles = ConfigurableRoles.filter((r) => !r.key.startsWith("rolesRestricted"));

// Initialize form state with defaults
const createDefaultState = (): Schema => {
	const defaults: Schema = { rolesRemoveInitial: false };
	for (const roleConfig of ConfigurableRoles) {
		defaults[roleConfig.key] = isArrayKey(roleConfig.key) ? [] : null;
	}
	return defaults;
};

const state = reactive<Schema>(createDefaultState());

// Loading state
const loading = computed(() => !guildData.value?.roles || !guildSettings.value);

// Compute original values from initialized state (snapshot)
const originalValues = computed(() => {
	if (loading.value) {
		return createDefaultState();
	}

	const values = createDefaultState();

	// Bool toggle
	if (guildSettings.value && !isNullOrUndefined(guildSettings.value.rolesRemoveInitial)) {
		values.rolesRemoveInitial = guildSettings.value.rolesRemoveInitial;
	}

	// Roles
	for (const roleConfig of ConfigurableRoles) {
		const key = roleConfig.key;
		if (guildSettings.value && !isNullOrUndefined(guildSettings.value[key])) {
			const val = guildSettings.value[key];
			if (isArrayKey(roleConfig.key)) {
				values[key] = Array.isArray(val) ? [...val] : [];
			} else {
				values[key] = typeof val === "string" ? val : null;
			}
		}
	}

	return values;
});

// Watch for loading state change to populate local state
watch(
	loading,
	(isLoading) => {
		if (!isLoading && guildData.value && guildSettings.value) {
			const newValues = originalValues.value;
			Object.assign(state, newValues);
		}
	},
	{ immediate: true },
);

// Map form state to GuildData changes
function mapToGuildData(formState: Schema): Partial<GuildData> {
	const changes: Partial<GuildData> = {};

	// Always include the boolean toggle
	if (typeof formState.rolesRemoveInitial === "boolean") {
		setGuildDataChange(changes, "rolesRemoveInitial", formState.rolesRemoveInitial);
	}

	for (const roleConfig of ConfigurableRoles) {
		const value = formState[roleConfig.key];
		if (value === undefined) {
			continue;
		}

		if (isArrayKey(roleConfig.key)) {
			setGuildDataChange(changes, roleConfig.key, Array.isArray(value) ? value : []);
			continue;
		}

		setGuildDataChange(changes, roleConfig.key, typeof value === "string" ? value : null);
	}

	return changes;
}

// Form error handler
async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: errorMessage ?? t("guild_settings.please_try_again"),
		icon: "heroicons:x-circle",
		title: t("guild_settings.save_failed"),
	});
}
</script>
