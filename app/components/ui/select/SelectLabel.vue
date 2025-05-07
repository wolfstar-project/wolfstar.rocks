<template>
  <SelectLabel data-slot="select-label" :class="cn('px-2 py-1.5 text-sm font-medium', props.class)">
    <slot></slot>
  </SelectLabel>
</template>

<script setup lang="ts">
import type { SelectLabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils/cn'
import { SelectLabel } from 'reka-ui'

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes['class'] }>()
</script>
