<template>
	<GuildSettingsSection title="Roles" subtitle="Here you can configure special roles known to WolfStar for your server.">
		<!-- Loading Skeleton -->
		<div v-if="loading" class="space-y-8">
			<!-- Toggles Skeleton -->
			<div class="space-y-4">
				<USkeleton class="h-8 w-32" />
				<USkeleton class="h-10 w-full" />
			</div>

			<!-- Configurable Roles Skeleton -->
			<div class="space-y-4">
				<USkeleton class="h-8 w-48" />
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<div v-for="i in 6" :key="`roles-skeleton-${i}`" class="space-y-2">
						<USkeleton class="h-5 w-32" />
						<USkeleton class="h-10 w-full" />
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
			aria-label="Roles settings form"
			class="space-y-8"
			@error="onError"
		>
			<!-- Toggles Section -->
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<UIcon name="heroicons:adjustments-horizontal" class="size-5 text-primary" />
					<h3 class="text-lg font-semibold text-base-content">General Options</h3>
				</div>

				<UFormField
					:label="ConfigurableRemoveInitialRole.name"
					:description="ConfigurableRemoveInitialRole.tooltip"
					name="rolesRemoveInitial"
				>
					<div class="flex items-center gap-2">
						<USwitch v-model="state.rolesRemoveInitial" />
					</div>
				</UFormField>
			</div>

			<Separator />

			<!-- Configurable Roles Section -->
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<UIcon name="heroicons:user-group" class="size-5 text-primary" />
					<h3 class="text-lg font-semibold text-base-content">Configurable Roles</h3>
				</div>
				<p class="text-sm text-base-content/70">Assign specific roles for different bot functions and permissions.</p>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<template v-for="roleConfig in standardRoles" :key="roleConfig.key">
						<!-- Many (Array) -->
						<SelectRoles
							v-if="isArrayKey(roleConfig.key)"
							v-model="state[roleConfig.key] as string[]"
							:label="roleConfig.name"
							:guild="guildData"
							:tooltip-title="roleConfig.tooltip"
						/>

						<!-- One (Single) -->
						<SelectRole
							v-else
							v-model="state[roleConfig.key]"
							:label="roleConfig.name"
							:guild="guildData"
							:tooltip-title="roleConfig.tooltip"
						/>
					</template>
				</div>
			</div>

			<Separator />

			<!-- Restricted Roles Section -->
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<UIcon name="heroicons:shield-check" class="size-5 text-primary" />
					<h3 class="text-lg font-semibold text-base-content">Restricted Roles</h3>
				</div>
				<p class="text-sm text-base-content/70">Roles used for restricted moderation commands.</p>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<template v-for="roleConfig in restrictedRoles" :key="roleConfig.key">
						<!-- Many (Array) -->
						<SelectRoles
							v-if="isArrayKey(roleConfig.key)"
							v-model="state[roleConfig.key] as string[]"
							:label="roleConfig.name"
							:guild="guildData"
							:tooltip-title="roleConfig.tooltip"
						/>

						<!-- One (Single) -->
						<SelectRole
							v-else
							v-model="state[roleConfig.key]"
							:label="roleConfig.name"
							:guild="guildData"
							:tooltip-title="roleConfig.tooltip"
						/>
					</template>
				</div>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import type { GuildData, GuildDataKey } from "#server/database";
import type { FormErrorEvent } from "@nuxt/ui";
import { isNullOrUndefined } from "@sapphire/utilities";
import * as v from "valibot";
import { ConfigurableRemoveInitialRole, ConfigurableRoles } from "~~/shared/utils/settingsDataEntries";

const { guildData } = useGuildData();
const { guildSettings } = useGuildSettings();
const toast = useToast();

const arrayKeys = new Set(["rolesAdmin", "rolesModerator", "rolesPublic", "rolesInitial", "rolesMuted"]);
function isArrayKey(key: string): boolean {
	return arrayKeys.has(key);
}

const restrictedRoles = ConfigurableRoles.filter((r) => r.key.startsWith("rolesRestricted"));
const standardRoles = ConfigurableRoles.filter((r) => !r.key.startsWith("rolesRestricted"));

// Create dynamic schema for form validation
const createRoleSchema = () => {
	const schemaShape: Record<string, v.GenericSchema> = {
		rolesRemoveInitial: v.boolean(),
	};

	for (const roleConfig of ConfigurableRoles) {
		if (isArrayKey(roleConfig.key)) {
			schemaShape[roleConfig.key] = v.optional(v.array(v.string()), []);
		} else {
			schemaShape[roleConfig.key] = v.nullable(v.string());
		}
	}

	return v.object(schemaShape);
};

const schema = createRoleSchema();
// Valibot's InferOutput on Record<string, GenericSchema> resolves to { [x: string]: unknown }.
// Use explicit type matching the original dynamic Yup schema behavior.
type Schema = { rolesRemoveInitial: boolean } & Record<string, any>;

// Initialize form state with defaults
const createDefaultState = (): Schema => {
	const defaults: Record<string, any> = { rolesRemoveInitial: false };
	for (const roleConfig of ConfigurableRoles) {
		defaults[roleConfig.key] = isArrayKey(roleConfig.key) ? [] : null;
	}
	return defaults as Schema;
};

const state = reactive<Schema>(createDefaultState());

// Loading state
const loading = computed(() => !guildData.value?.roles || !guildSettings.value);

// Compute original values from initialized state (snapshot)
const originalValues = computed(() => {
	if (loading.value) {
		return createDefaultState();
	}

	const values: Record<string, any> = {};

	// Bool toggle
	if (guildSettings.value && !isNullOrUndefined(guildSettings.value.rolesRemoveInitial)) {
		values.rolesRemoveInitial = guildSettings.value.rolesRemoveInitial;
	} else {
		values.rolesRemoveInitial = false;
	}

	// Roles
	for (const roleConfig of ConfigurableRoles) {
		const key = roleConfig.key as GuildDataKey;
		if (guildSettings.value && !isNullOrUndefined(guildSettings.value[key])) {
			const val = guildSettings.value[key];
			if (isArrayKey(roleConfig.key)) {
				values[roleConfig.key] = Array.isArray(val) ? [...val] : [];
			} else {
				values[roleConfig.key] = val;
			}
		} else {
			values[roleConfig.key] = isArrayKey(roleConfig.key) ? [] : null;
		}
	}

	return values as Schema;
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
	changes.rolesRemoveInitial = formState.rolesRemoveInitial;

	for (const roleConfig of ConfigurableRoles) {
		const value = formState[roleConfig.key];
		// Include null values for nullable single-role fields (user explicitly cleared)
		// Include empty arrays for multi-role fields (user explicitly cleared all)
		// Only exclude undefined (form doesn't control this key)
		if (value !== undefined) {
			changes[roleConfig.key as GuildDataKey] = value;
		}
	}

	return changes;
}

// Form error handler
async function onError(event: FormErrorEvent) {
	const element = event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: `Failed to update role settings. ${errorMessage ?? "Unknown error"}`,
		icon: "heroicons:x-circle",
		title: "Error",
	});
}
</script>
