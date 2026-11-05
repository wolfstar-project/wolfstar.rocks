<template>
	<div class="flex flex-col gap-1.5">
		<div ref="container" class="min-h-16.5"></div>
		<p v-if="failed" class="text-[0.8125rem] text-error" role="alert">
			{{ ts("verify.captcha_failed") }}
		</p>
	</div>
</template>

<script setup lang="ts">
/**
 * Cloudflare Turnstile, the captcha of the verification page. Its script is
 * loaded only here, on demand and in explicit mode, so no other page asks
 * Cloudflare for anything; the widget follows the site's light or dark theme
 * and hands its token up, or `null` when it expires or fails.
 */
const { siteKey } = defineProps<{ siteKey: string }>();

const emit = defineEmits<{ token: [token: string | null] }>();

const { ts } = useI18n();
const colorMode = useColorMode();
const { locale } = useAppLocale();

const container = useTemplateRef<HTMLDivElement>("container");
const failed = ref(false);
let widgetId: string | null = null;

const theme = computed(() => (colorMode.value === "light" ? "light" : "dark"));

function render() {
	const turnstile = window.turnstile;
	if (!turnstile || !container.value) return;
	if (widgetId !== null) turnstile.remove(widgetId);
	failed.value = false;
	widgetId = turnstile.render(container.value, {
		"callback": (token: string) => emit("token", token),
		"error-callback": () => {
			failed.value = true;
			emit("token", null);
		},
		"expired-callback": () => emit("token", null),
		"language": locale.value,
		"sitekey": siteKey,
		"theme": theme.value,
	});
}

onMounted(async () => {
	try {
		await loadTurnstile();
		render();
	} catch {
		failed.value = true;
	}
});

// The widget draws itself once, so a theme change draws it again, and the
// token of the last one is no longer good.
watch(theme, () => {
	emit("token", null);
	render();
});

onBeforeUnmount(() => {
	if (widgetId !== null) window.turnstile?.remove(widgetId);
	widgetId = null;
});

/** Draws a new widget, for a token that was used or refused. */
function reset() {
	emit("token", null);
	if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
	else render();
}

defineExpose({ reset });
</script>
