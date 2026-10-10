<template>
	<GuildSettingsSection
		:title="ts('guild_settings.roles.title')"
		:description="ts('guild_settings.roles.subtitle')"
	>
		<GuildSettingsForm
			:state="state"
			:schema="schema"
			:map-to-guild-data="mapToGuildData"
			:aria-label="ts('guild_settings.roles.form_aria')"
			class="space-y-8"
			@error="onError"
		>
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<UIcon
						name="heroicons:adjustments-horizontal"
						class="size-5 text-primary"
						aria-hidden="true"
					/>
					<h3 class="text-lg font-semibold text-base-content">
						{{ ts("guild_settings.roles.general_options") }}
					</h3>
				</div>

				<div>
					<GuildSettingsToggleRow
						v-for="config in ConfigurableRoleToggles"
						:key="config.key"
						v-model="state[config.key]"
						:name="config.key"
						:title="translateEntry(config, 'name')"
						:description="translateEntry(config, 'description')"
					/>
				</div>
			</div>

			<template v-for="group in roleGroups" :key="group.id">
				<Separator />

				<div class="space-y-4">
					<div class="flex items-center gap-2">
						<UIcon :name="group.icon" class="size-5 text-primary" aria-hidden="true" />
						<h3 class="text-lg font-semibold text-base-content">{{ group.title }}</h3>
					</div>
					<p class="text-sm text-base-content/70">{{ group.help }}</p>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						<template v-for="roleConfig in group.roles" :key="roleConfig.key">
							<SelectRoles
								v-if="roleConfig.many"
								v-model="state[roleConfig.key]"
								:label="translateEntry(roleConfig, 'name')"
								:guild="guildData"
								:tooltip-title="translateEntry(roleConfig, 'description')"
							/>
							<SelectRole
								v-else
								v-model="state[roleConfig.key]"
								:label="translateEntry(roleConfig, 'name')"
								:guild="guildData"
								:tooltip-title="translateEntry(roleConfig, 'description')"
							/>
						</template>
					</div>
				</div>
			</template>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import type { Roles } from "#shared/types";
import { ConfigurableRoles, ConfigurableRoleToggles } from "#shared/utils/settingsDataEntries";

const { ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const { guildData } = useGuildData();

const isManyRole = (role: Roles.Role): role is Roles.ManyRole => role.many;
const isOneRole = (role: Roles.Role): role is Roles.OneRole => !role.many;

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: ConfigurableRoles.filter(isOneRole).map((role) => role.key),
	many: ConfigurableRoles.filter(isManyRole).map((role) => role.key),
	toggles: ConfigurableRoleToggles.map((entry) => entry.key),
});

const roleGroups = computed(() => [
	{
		id: "standard",
		icon: "heroicons:user-group",
		title: ts("guild_settings.roles.configurable"),
		help: ts("guild_settings.roles.configurable_help"),
		roles: ConfigurableRoles.filter((role) => role.group === "standard"),
	},
	{
		id: "restricted",
		icon: "heroicons:shield-check",
		title: ts("guild_settings.roles.restricted"),
		help: ts("guild_settings.roles.restricted_help"),
		roles: ConfigurableRoles.filter((role) => role.group === "restricted"),
	},
]);
</script>
