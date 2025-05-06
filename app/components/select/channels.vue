<template>
  <select-many-base
    :label="label"
    :options="channelOptions"
    :value="modelValue"
    :helper-text="description"
    :name="name"
    :tooltip-title="tooltipTitle"
    :required="true"
    :searchable="true"
    @update:value="handleChange"
  />
</template>

<script setup lang="ts">
import type { ValuesType } from 'utility-types'
import type { TransformedLoginData } from '~~/shared/types/discord'
import { ChannelType } from 'discord-api-types/v10'

interface Props {
  label: string
  modelValue: string[] | null
  guild: ValuesType<NonNullable<TransformedLoginData['transformedGuilds']>>
  tooltipTitle?: string
  description?: string
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  tooltipTitle: undefined,
  error: false,
  name: () => `channels-${Math.random().toString(36).slice(2)}`,
  description: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue' | 'change', value: string[]): void
}>()

const channelOptions = computed(() =>
  props.guild.channels
    .filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
    .sort((c1, c2) => c1.rawPosition - c2.rawPosition)
    .map(c => ({
      label: c.name,
      value: c.id,
    })),
)

function handleChange(value: string[] | null) {
  if (value) {
    emit('update:modelValue', value)
  }
  else {
    emit('update:modelValue', [])
  }
}
</script>
