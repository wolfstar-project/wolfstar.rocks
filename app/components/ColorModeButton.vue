<template>
	<ClientOnly>
		<UButton
			:aria-label="`Switch theme (current: ${colorMode.preference})`"
			:icon="themeIcon"
			color="neutral"
			variant="ghost"
			size="sm"
			class="rounded-full"
			@click="startViewTransition"
		/>
		<template #fallback>
			<div class="size-4"></div>
		</template>
	</ClientOnly>
</template>

<script setup lang="ts">
interface DocumentWithActiveVT extends Document {
	readonly activeViewTransition: ViewTransition | null;
}

const THEMES = ["light", "dark", "midnight"] as const;
type ThemeName = (typeof THEMES)[number];

const colorMode = useColorMode();
const { effectiveReduceMotion } = useReduceMotion();

const themeIcon = computed(() => {
	const preference = colorMode.preference;
	const activeTheme =
		preference === "system" ? (colorMode.value as ThemeName) : (preference as ThemeName);

	switch (activeTheme) {
		case "light":
			return "lucide:sun";
		case "dark":
			return "lucide:moon";
		case "midnight":
			return "lucide:sparkles";
		default:
			return "lucide:sun-moon";
	}
});

const nextTheme = computed((): ThemeName => {
	const preference = colorMode.preference;
	const current =
		preference === "system" ? (colorMode.value as ThemeName) : (preference as ThemeName);
	const index = THEMES.indexOf(current);
	const nextIndex = index === -1 ? 0 : (index + 1) % THEMES.length;
	return THEMES[nextIndex] ?? "light";
});

const switchTheme = () => {
	colorMode.preference = nextTheme.value;
};

const startViewTransition = (event: MouseEvent) => {
	if (!document.startViewTransition) {
		switchTheme();
		return;
	}

	if (effectiveReduceMotion.value) {
		switchTheme();
		return;
	}

	if ((document as DocumentWithActiveVT).activeViewTransition) {
		switchTheme();
		return;
	}

	const x = event.clientX;
	const y = event.clientY;
	const endRadius = Math.hypot(
		Math.max(x, window.innerWidth - x),
		Math.max(y, window.innerHeight - y),
	);

	const transition = document.startViewTransition(() => {
		switchTheme();
	});

	transition.ready.then(() => {
		const duration = 600;
		document.documentElement.animate(
			{
				clipPath: [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${endRadius}px at ${x}px ${y}px)`,
				],
			},
			{
				duration,
				easing: "cubic-bezier(.76,.32,.29,.99)",
				pseudoElement: "::view-transition-new(root)",
			},
		);
	});
};
</script>

<style>
::view-transition-old(root),
::view-transition-new(root) {
	mix-blend-mode: normal;
	animation: none;
}

::view-transition-new(root) {
	z-index: 9999;
}
::view-transition-old(root) {
	z-index: 1;
}
</style>
