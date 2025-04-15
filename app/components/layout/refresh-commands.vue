<template>
	<div class="fixed right-2 bottom-2 z-50" :class="{ 'right-8': trigger }">
		<SpotlightButton
			aria-label="Refresh commands"
			class="text-muted flex size-14 items-center justify-center p-1 transition-all duration-200"
			rounded
			:disabled="disabled"
			:data-tip="tooltipText"
			icon="i-mdi-cached"
			@click="handleClick"
		/>
	</div>
</template>

<script setup lang="ts">
import type { FlattenedCommand } from '~~/shared/types/discord';

const props = defineProps<{
	commands: FlattenedCommand[];
	loading?: boolean;
	onRefresh: () => Promise<void>;
}>();

const emit = defineEmits<{
	(e: 'refresh'): void;
}>();

// State
const disabled = ref(props.loading || false);
const { y } = useScroll(window);
const trigger = computed(() => y.value > 100);

// Gestione click
const handleClick = async () => {
	if (disabled.value) return;

	try {
		disabled.value = true;
		await props.onRefresh();
		emit('refresh');
	} catch (err) {
		useLogger().error('Errore refresh:', err);
	} finally {
		disabled.value = false;
	}
};

const tooltipText = `
  Click to force refresh commands
  Note: If this button is not clickable (greyed out) then you've ran into a rate limit.
  You can try refreshing again at a later time.
`;
</script>

<style scoped>
@reference "@/assets/css/main.css";
</style>
