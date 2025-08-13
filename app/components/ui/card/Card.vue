<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div v-if="!!slots.header" :class="ui.header({ class: props.ui?.header })">
      <slot name="header"></slot>
    </div>

    <div v-if="!!slots.default" :class="ui.body({ class: props.ui?.body })">
      <slot></slot>
    </div>

    <div v-if="!!slots.footer" :class="ui.footer({ class: props.ui?.footer })">
      <slot name="footer"></slot>
    </div>
  </Primitive>
</template>

<script setup lang="ts">
import type { CardProps, CardSlots } from ".";
import { Primitive } from "reka-ui";
import { computed } from "vue";
import { card } from ".";

const props = defineProps<CardProps>();
const slots = defineSlots<CardSlots>();

const ui = computed(() => card({ variant: props.variant }));
</script>
