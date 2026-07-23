<template>
	<div
		class="discord-v2-separator"
		:class="[spacing === 'large' ? 'discord-v2-separator-large' : 'discord-v2-separator-small']"
		role="separator"
	>
		<hr v-if="divider" class="discord-v2-separator-line" />
	</div>
</template>

<script lang="ts">
interface SeparatorProps {
	spacing?: "small" | "large";
	divider?: boolean;
}
</script>

<script setup lang="ts">
const { spacing = "small", divider = true } = defineProps<SeparatorProps>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
.discord-v2-separator {
	@apply flex items-center;
}

.discord-v2-separator-small {
	@apply py-1;
}

.discord-v2-separator-large {
	@apply py-2;
}

.discord-v2-separator-line {
	@apply m-0 w-full border-0 border-t;
	border-color: var(--color-base-content);
	border-color: oklch(from var(--color-base-content) l c h / 0.12);
}
</style>
