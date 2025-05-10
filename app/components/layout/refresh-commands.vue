<template>
    <ShadButton
        aria-label="Refresh commands"
        :disabled="disabled"
        color="neutral"
        variant="ghost"
        :data-tip="tooltipText"
        icon="i-mdi-cached"
        @click="handleClick"
    />
</template>

<script setup lang="ts">
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

// Gestione click
async function handleClick() {
    if (disabled.value)
        return;

    try {
        disabled.value = true;
        await props.onRefresh();
        emit('refresh');
    }
    catch (err) {
        useLogger().error('Errore refresh:', err);
    }
    finally {
        disabled.value = false;
    }
}

const tooltipText = `
  Click to force refresh commands
  Note: If this button is not clickable (greyed out) then you've ran into a rate limit.
  You can try refreshing again at a later time.
`;
</script>
