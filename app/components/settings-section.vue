<template>
  <section class="mb-6 w-full">
    <template v-if="title">
      <div v-if="disableTypography" v-bind="titleProps">
        {{ title }}
      </div>
      <h2 v-else class="mb-4 text-xl font-semibold text-base-content border-b border-base-300 pb-2" v-bind="titleProps">
        {{ title }}
      </h2>
    </template>

    <div class="space-y-4">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title?: string | number
  disableTypography?: boolean
  titleProps?: Record<string, unknown>
}

defineProps<Props>()
</script>

<style scoped>
.border-primary {
  border-color: var(--color-primary);
}
</style>
