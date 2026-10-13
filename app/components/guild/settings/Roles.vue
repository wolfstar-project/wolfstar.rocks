<template>
	<DashboardPageHeader
		:title="ts('guild_settings.roles.title')"
		:description="ts('guild_settings.roles.subtitle')"
	/>

	<GuildSettingsForm
		:state="state"
		:schema="schema"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.roles.form_aria')"
		class="space-y-4"
		@error="onError"
	>
		<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
			<section
				v-for="group in roleGroups"
				:key="group.id"
				class="console-card"
				:aria-labelledby="`roles-${group.id}`"
			>
				<h3 :id="`roles-${group.id}`" class="mb-3 console-label">{{ group.title }}</h3>
				<div class="space-y-2">
					<template v-for="roleConfig in group.roles" :key="roleConfig.key">
						<SelectRoles
							v-if="roleConfig.many"
							v-model="state[roleConfig.key]"
							layout="row"
							:label="translateEntry(roleConfig, 'name')"
							:guild="guildData"
							:tooltip-title="translateEntry(roleConfig, 'description')"
						/>
						<SelectRole
							v-else
							v-model="state[roleConfig.key]"
							layout="row"
							:empty-label="ts('guild_settings.roles.not_set')"
							:label="translateEntry(roleConfig, 'name')"
							:guild="guildData"
							:tooltip-title="translateEntry(roleConfig, 'description')"
						/>
					</template>
				</div>
			</section>
		</div>

		<section class="console-card" aria-labelledby="roles-behaviour">
			<h3 id="roles-behaviour" class="mb-1 console-label">
				{{ ts("guild_settings.roles.general_options") }}
			</h3>
			<GuildSettingsToggleRow
				v-for="config in ConfigurableRoleToggles"
				:key="config.key"
				v-model="state[config.key]"
				:name="config.key"
				:title="translateEntry(config, 'name')"
				:description="translateEntry(config, 'description')"
			/>
		</section>
	</GuildSettingsForm>
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

// The cards follow how the bot uses the roles: who is given what on join, who
// counts as staff, what moderation hands out and the roles a restriction sets.
const ROLE_GROUPS = [
	{
		id: "join",
		keys: ["rolesInitial", "rolesInitialHumans", "rolesInitialRobots"],
	},
	{ id: "staff", keys: ["rolesAdmin", "rolesModerator"] },
	{ id: "moderation", keys: ["rolesMuted", "rolesPublic"] },
	{ id: "restrictions", group: "restricted" },
] as const;

const roleGroups = computed(() =>
	ROLE_GROUPS.map((group) => ({
		id: group.id,
		roles: ConfigurableRoles.filter((role) =>
			"keys" in group
				? (group.keys as readonly string[]).includes(role.key)
				: role.group === group.group,
		),
		title: ts(`guild_settings.roles.groups.${group.id}`),
	})).filter((group) => group.roles.length > 0),
);
</script>
