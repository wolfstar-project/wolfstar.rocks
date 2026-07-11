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
const manifest = skewProtection.manifest;
const isPrerendered = !!useNuxtApp().payload.prerenderedAt;

const chunksOutdated = ref(false);
// Identifies the deployment currently being advertised. The SSE/WS strategies
// fill `serverVersion` from `skew:message`, but under `updateStrategy: "polling"`
// it stays undefined, so fall back to the manifest build id, which changes on
// every deployment (and is always set when `isAppOutdated` is true). Tracking
// the dismissed id rather than a sticky boolean lets a later deployment re-open
// the prompt instead of being silenced for the rest of the tab's lifetime.
const currentVersion = computed(() => serverVersion.value ?? manifest.value?.id);
const dismissedVersion = ref<string | undefined>(undefined);

skewProtection.onCurrentChunksOutdated(() => {
	chunksOutdated.value = true;
});

const isOpen = computed(() => {
	if (!isOnline.value) return false;
	if (chunksOutdated.value) return true;
	if (isPrerendered) return false;
	return isAppOutdated.value && currentVersion.value !== dismissedVersion.value;
});

function dismiss() {
	chunksOutdated.value = false;
	dismissedVersion.value = currentVersion.value;
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
