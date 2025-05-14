<template>
	<div class="flex flex-col gap-6 p-6">
		<layout-settings-section>
			<SelectBoolean
				:title="roleConfig.removeInitial.name"
				:description="roleConfig.removeInitial.tooltip"
				:model-value="settings.rolesRemoveInitial"
				@update:model-value="(value) => updateRoleSetting('rolesRemoveInitial', value)"
			/>
		</layout-settings-section>

		<layout-settings-section title="Configurable Roles">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<template v-for="role in roleConfig.roles" :key="role.key">
					<component
						:is="getRoleSelectComponent(role.key)"
						v-bind="getRoleProps(role)"
						:model-value="settings[role.key]"
						@update:model-value="(value: string | string[]) => updateRoleSetting(role.key, value)"
						@reset="resetRole(role.key)"
					/>
				</template>
			</div>
		</layout-settings-section>
	</div>
</template>

<script setup lang="ts">
const { roleConfig, settings, updateRoleSetting, resetRole, getRoleSelectComponent, getRoleProps } = useGuildRoles();
</script>
