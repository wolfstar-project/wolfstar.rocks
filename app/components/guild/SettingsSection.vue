<template>
  <div class="mb-6 w-full">
    <template v-if="title">
      <div
        v-if="disableTypography && !forceSemanticHeading"
        v-bind="titleProps"
      >
        {{ title }}
      </div>
      <component
        :is="headingLevel"
        v-else
        :class="[
          disableTypography ? '' : 'divider divider-start text-xl font-semibold'
        ]"
        v-bind="titleProps"
      >
        {{ title }}
      </component>
    </template>

    <div class="space-y-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface Props {
  title?: string | number;
  disableTypography?: boolean;
  titleProps?: Record<string, unknown>;
  headingLevel?: HeadingLevel;
  forceSemanticHeading?: boolean;
}

const {
  headingLevel = "h2",
  forceSemanticHeading = false,
  title,
  disableTypography,
  titleProps,
} = defineProps<Props>();
</script>
