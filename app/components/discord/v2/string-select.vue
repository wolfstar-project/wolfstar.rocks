<template>
	<div
		class="discord-v2-string-select"
		:class="{ 'discord-v2-string-select-disabled': disabled }"
		aria-hidden="true"
	>
		<span class="discord-v2-string-select-placeholder">{{ placeholder }}</span>
		<UIcon name="ph:caret-down-bold" class="discord-v2-string-select-chevron size-4" />
	</div>
</template>

<script lang="ts">
interface StringSelectProps {
	placeholder?: string;
	disabled?: boolean;
}
</script>

<script setup lang="ts">
const { placeholder = "Choose an option...", disabled = true } = defineProps<StringSelectProps>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
.discord-v2-string-select {
	--discord-v2-string-select-bg: hsla(223, 6.7%, 20.6%, 1);
	--discord-v2-string-select-border: hsla(0, 0%, 100%, 0.1);
	--discord-v2-string-select-text: hsla(220, 2.7%, 66.1%, 1);

	@apply flex w-full max-w-96 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm;
	background-color: var(--discord-v2-string-select-bg);
	border-color: var(--discord-v2-string-select-border);
	color: var(--discord-v2-string-select-text);
}

.discord-v2-string-select-placeholder {
	@apply truncate;
}

.discord-v2-string-select-chevron {
	@apply shrink-0;
}
</style>
