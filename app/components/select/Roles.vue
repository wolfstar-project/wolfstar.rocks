<template>
  <SelectMany
    :label="label"
    :name="roleSummary"
    :values="roleValues"
    :model-value="modelValue"
    :tooltip-title="tooltipTitle"
    :image-in-name="imageInName"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event); $emit('change', $event)"
    @change="$emit('change', $event)"
  />
</template>

<script lang="ts">
import type { TransformedLoginData } from "#shared/types/discord";
import type { ValuesType } from "#shared/types/utils";
import type { DeepReadonly } from "@sapphire/utilities";
import type { SelectManyValue } from "./Many.vue";

export interface SelectRolesProps {
  /** The label to show on the button */
  label: string;
  /** The current selected role IDs */
  modelValue: string[];
  /** The guild data containing roles */
  guild: DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>;
  /** Content to be shown as a tooltip when hovering over the button */
  tooltipTitle?: string;
  /** Whether to append an image to the end of the button, next to the value of the key */
  imageInName?: string;
  /** Disable the field */
  disabled?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: string[]): void;
  (e: "change", value: string[]): void;
}
</script>

<script setup lang="ts">
const {
  label,
  modelValue,
  guild,
  tooltipTitle,
  imageInName,
  disabled = false,
} = defineProps<SelectRolesProps>();

defineEmits<Emits>();

// Generate summary for the button
const roleSummary = computed(() => {
  if (!modelValue || modelValue.length === 0)
    return "None";
  return `${modelValue.length} selected`;
});

// Filter and sort roles, then map to SelectManyValue format
const roleValues = computed<SelectManyValue[]>(() => {
  return [...guild.roles]
    .filter(r => r.id !== guild.id)
    .sort((r1, r2) => r2.rawPosition - r1.rawPosition)
    .map(r => ({
      name: r.name,
      value: r.id,
      icon: "discord:text-channel", // Using typical icon, could be customized or removed
    }));
});
</script>
