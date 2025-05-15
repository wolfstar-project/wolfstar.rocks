<template>
	<section class="mr-0 mb-2 w-full not-first-of-type:mt-3 md:mr-4 md:w-auto md:not-first-of-type:mt-0">
		<template v-if="title">
			<div v-if="disableTypography" v-bind="titleProps">
				{{ title }}
			</div>
			<h1 v-else class="mb-3 border-b-2 border-primary pb-0.5 text-xl font-medium" v-bind="titleProps">
				{{ title }}
			</h1>
		</template>

		<slot></slot>
	</section>
</template>

<script setup lang="ts">
interface Props {
	title?: string | number;
	disableTypography?: boolean;
	titleProps?: Record<string, unknown>;
}

defineProps<Props>();
</script>

<style scoped>
.border-primary {
  border-color: var(--color-primary);
}
</style>
