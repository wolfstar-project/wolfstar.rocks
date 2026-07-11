<template>
	<div v-if="visible" style="view-transition-name: pwa-update-prompt">
		<div
			class="flex items-center gap-3 rounded-full bg-base-200 px-4 py-3 shadow-lg ring-1 ring-base-100"
		>
			<span class="text-lg">✨</span>
			<div class="text-sm font-medium">Update available</div>
			<UButton color="primary" size="xs" label="Refresh" @click="reload" />
			<UButton
				color="neutral"
				variant="ghost"
				size="xs"
				icon="heroicons:x-mark-20-solid"
				@click="dismiss"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
interface DocumentWithActiveVT extends Document {
	readonly activeViewTransition: ViewTransition | null;
}

const skewProtection = useSkewProtection();
const isOnline = skewProtection.isOnline;
const isAppOutdated = skewProtection.isAppOutdated;
const serverVersion = skewProtection.serverVersion;
const isPrerendered = !!useNuxtApp().payload.prerenderedAt;

const chunksOutdated = ref(false);
// Tracks which server version was last dismissed, rather than a sticky
// boolean, so a later deployment (a new serverVersion) re-opens the prompt
// instead of being silenced for the rest of the tab's lifetime.
const dismissedServerVersion = ref<string | undefined>(undefined);

skewProtection.onCurrentChunksOutdated(() => {
	chunksOutdated.value = true;
});

const isOpen = computed(() => {
	if (!isOnline.value) return false;
	if (chunksOutdated.value) return true;
	if (isPrerendered) return false;
	return isAppOutdated.value && serverVersion.value !== dismissedServerVersion.value;
});

function dismiss() {
	chunksOutdated.value = false;
	dismissedServerVersion.value = serverVersion.value;
}

function reload() {
	reloadNuxtApp({ force: true, persistState: true });
}

const { effectiveReduceMotion } = useReduceMotion();
const visible = ref(isOpen.value);

if (import.meta.client) {
	watch(isOpen, (newVal) => {
		if (!document.startViewTransition || effectiveReduceMotion.value) {
			visible.value = newVal;
			return;
		}
		if ((document as DocumentWithActiveVT).activeViewTransition) {
			visible.value = newVal;
			return;
		}
		document.startViewTransition(async () => {
			visible.value = newVal;
			await nextTick();
		});
	});
}
</script>
