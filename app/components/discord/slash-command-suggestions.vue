<template>
	<section class="discord-slash-command-suggestions" :aria-label="ariaLabel">
		<p class="discord-slash-command-suggestions-header">Commands matching {{ prefix }}</p>
		<div role="listbox" :aria-label="listboxLabel">
			<slot />
		</div>
	</section>
</template>

<script setup lang="ts">
const { listboxLabel = "Slash command suggestions", prefix } = defineProps<{
	listboxLabel?: string;
	prefix: string;
}>();

const ariaLabel = computed(() => `Commands matching ${prefix}`);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-suggestions {
	--discord-slash-command-suggestions-bg: hsl(220, 7%, 12%);
	--discord-slash-command-suggestions-header: hsla(220, 2.7%, 66.1%, 1);

	@apply px-2 py-2;
	background-color: var(--discord-slash-command-suggestions-bg);
}

.discord-slash-command-suggestions-header {
	@apply px-2 py-1.5 text-[11px] font-bold tracking-wide uppercase;
	color: var(--discord-slash-command-suggestions-header);
}
</style>
