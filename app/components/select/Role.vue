<template>
  <SelectOne
    :label="label"
    :name="roleName"
    :values="roleValues"
    :tooltip-title="tooltipTitle"
    :image-in-name="imageInName"
    :disabled="disabled"
    @change="$emit('change', $event)"
    @reset="$emit('reset')"
  />
</template>

<script lang="ts">
import type { TransformedLoginData } from "#shared/types/discord";
import type { ValuesType } from "#shared/types/utils";
import type { DeepReadonly } from "@sapphire/utilities";
import type { SelectOneValue } from "./One.vue";

export interface SelectRoleProps {
  /** The label to show on the button */
  label: string;
  /** The current selected channel ID */
  value: string | null;
  /** The guild data containing channels */
  guild: DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>;
  /** Content to be shown as a tooltip when hovering over the button */
  tooltipTitle?: string;
  /** Whether to append an image to the end of the button, next to the value of the key */
  imageInName?: string;
  /** Disable the field */
  disabled?: boolean;
}

interface Emits {
  (e: "change", value: string): void;
  (e: "reset"): void;
}
</script>

<script setup lang="ts">
const {
  label,
  value,
  guild,
  tooltipTitle,
  imageInName,
  disabled = false,
} = defineProps<SelectRoleProps>();

defineEmits<Emits>();

// Find the channel name based on the current value
const roleName = computed(() => {
  if (!value)
    return undefined;
  const role = guild.roles.find(c => c.id === value);
  return role?.name;
});

// Filter and sort channels, then map to SelectOneValue format
const roleValues = computed<SelectOneValue[]>(() => {
  return [...guild.roles]
    .sort((c1, c2) => c1.rawPosition - c2.rawPosition)
    .map(c => ({
      name: c.name,
      value: c.id,
      icon: "discord:text-channel",
    }));
});
</script>
