<template>
	<div v-if="loading" class="chip-skeleton">
		<div class="h-6 w-20 skeleton"></div>
		<div class="ml-2 h-4 w-4 skeleton"></div>
	</div>
	<div v-else class="chip" :class="[colorClass, { 'opacity-75 hover:opacity-100': interactive }]">
		<span>{{ text }}</span>
		<ShadIcon :name="`i-mdi-${icon}`" class="ml-2" />
	</div>
</template>

<script setup lang="ts">
type ChipColor = 'primary' | 'secondary' | 'warning' | 'error' | 'success';

interface Props {
	text: string;
	icon: string;
	color?: ChipColor;
	loading?: boolean;
	interactive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	color: 'primary',
	loading: false,
	interactive: false
});

const colorClass = computed(() => `chip-${props.color}`);
</script>

<style scoped>
@reference "@/assets/css/main.css";
.chip {
  @apply flex items-center justify-between rounded-lg p-2 px-4 text-white transition-all duration-200;
}

.chip-primary {
  @apply bg-primary hover:bg-primary/60;
}
.chip-secondary {
  @apply bg-secondary hover:bg-secondary/60;
}
.chip-warning {
  @apply bg-warning hover:bg-warning/60;
}
.chip-error {
  @apply bg-error hover:bg-error/60;
}
.chip-success {
  @apply bg-success hover:bg-success/60;
}

.chip-skeleton {
  @apply flex items-center justify-between rounded-lg bg-gray-200 p-2 px-4 dark:bg-gray-800;
}
</style>
