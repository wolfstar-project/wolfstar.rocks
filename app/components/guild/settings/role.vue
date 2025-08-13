<template>
  <div class="space-y-8">
    <SettingsSection title="Role Options">
      <SelectBoolean
        :title="roleConfig.removeInitial.name"
        :description="roleConfig.removeInitial.tooltip"
        :model-value="settings.rolesRemoveInitial"
        @update:model-value="(value) => updateRoleSetting('rolesRemoveInitial', value)"
      />
    </SettingsSection>

    <SettingsSection title="Configurable Roles">
      <div v-if="guildData" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <template v-for="role in roleConfig.roles" :key="role.key">
          <SelectRole
            v-if="getRoleSelectComponent(role.key) === 'SelectRole'"
            v-bind="getRoleProps(role)"
            :guild="guildData"
            :model-value="(settings[role.key] as string) || null"
            @update:model-value="(value: string) => updateRoleSetting(role.key, value)"
            @reset="resetRole(role.key)"
          />
          <SelectRoles
            v-else
            v-bind="getRoleProps(role)"
            :guild="guildData"
            :model-value="(settings[role.key] as string[]) || []"
            @update:model-value="(value: string[]) => updateRoleSetting(role.key, value)"
            @reset="resetRole(role.key)"
          />
        </template>
      </div>
      <div v-else class="text-center py-8 text-base-content/70">
        Loading guild data...
      </div>
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { useGuildRoles } from "~~/app/composables/useGuildSettings";

const { roleConfig, settings, updateRoleSetting, resetRole, getRoleSelectComponent, getRoleProps } = useGuildRoles();
const guildData = useGuildData();
</script>
