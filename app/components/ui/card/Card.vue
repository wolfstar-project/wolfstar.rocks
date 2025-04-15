<template>
	<Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
		<div v-if="!!slots.header" :class="ui.header({ class: props.ui?.header })">
			<slot name="header" />
		</div>

		<div v-if="!!slots.default" :class="ui.body({ class: props.ui?.body })">
			<slot />
		</div>

		<div v-if="!!slots.footer" :class="ui.footer({ class: props.ui?.footer })">
			<slot name="footer" />
		</div>
	</Primitive>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Primitive } from 'reka-ui';
import { card, type CardProps, type CardSlots } from '.';

const props = defineProps<CardProps>();
const slots = defineSlots<CardSlots>();

const ui = computed(() => card({ variant: props.variant }));
</script>
