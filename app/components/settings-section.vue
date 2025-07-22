<template>
  <div class="mb-6 w-full">
    <template v-if="title">
      <div v-if="disableTypography" v-bind="titleProps">
        {{ title }}
      </div>
      <div v-else class="divider divider-start text-xl font-semibold" v-bind="titleProps">
        {{ title }}
      </div>
    </template>

    <div class="space-y-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string | number
  disableTypography?: boolean
  titleProps?: Record<string, unknown>
}

defineProps<Props>()
</script>
