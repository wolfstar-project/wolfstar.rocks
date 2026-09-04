<template>
	<div v-if="visible" style="view-transition-name: pwa-update-prompt">
		<div
			class="flex items-center gap-3 rounded-full bg-base-200 px-4 py-3 shadow-lg ring-1 ring-base-100"
		>
			<span class="text-lg" aria-hidden="true">✨</span>
			<div class="text-sm font-medium">{{ ts("pwa.update_available") }}</div>
			<UButton color="primary" size="xs" :label="ts('pwa.reload')" @click="reload" />
			<UButton
				color="neutral"
				variant="ghost"
				size="xs"
				icon="heroicons:x-mark-20-solid"
				:aria-label="ts('pwa.dismiss')"
				@click="dismiss"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
const { ts } = useI18n();

interface DocumentWithActiveVT extends Document {
	readonly activeViewTransition: ViewTransition | null;
}

const skewProtection = useSkewProtection();
const isOnline = skewProtection.isOnline;
const isAppOutdated = skewProtection.isAppOutdated;
const serverVersion = skewProtection.serverVersion;
const manifest = skewProtection.manifest;
const nuxtApp = useNuxtApp();
const { $pwa } = nuxtApp;

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

// `manifest` is populated by the `app:manifest:update` hook that
// `plugins/skew-protection.client.ts` registers at boot, so this component sees
// an update that landed before it was mounted -- it is lazy behind DeferredMount.
// Prerendered routes are deliberately not excluded: their HTML ships with the
// deployment, so a build id older than `builds/latest.json` there means the
// browser really is holding a stale copy and a reload does resolve it.
const isOpen = computed(() => {
	if (!isOnline.value) return false;
	if (chunksOutdated.value) return true;
	return isAppOutdated.value && currentVersion.value !== dismissedVersion.value;
});

function dismiss() {
	chunksOutdated.value = false;
	dismissedVersion.value = currentVersion.value;
}

function reload() {
	// A new deployment ships a new service worker that installs but waits
	// (registerType: "prompt"). Activate it so the reload is served the freshly
	// precached assets instead of the previous version held by the old worker;
	// updateServiceWorker(true) skips waiting and reloads once the new worker
	// takes control. Fall back to a plain reload when no worker update is pending.
	if ($pwa?.getSWRegistration()?.waiting) {
		void $pwa.updateServiceWorker(true);
		return;
	}
	reloadNuxtApp({ force: true, persistState: true });
}

const { effectiveReduceMotion } = useReduceMotion();
const visible = ref(isOpen.value);

if (import.meta.client) {
	watch(isOpen, (newVal) => {
		// When the prompt opens for a new deployment, proactively check for the
		// matching service-worker update so it is waiting (and can be activated)
		// by the time the user chooses to reload.
		if (newVal) void $pwa?.getSWRegistration()?.update();
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
