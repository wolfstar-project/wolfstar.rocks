<template>
	<ClientOnly class="swap swap-rotate">
		<ShadButton
			:icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
			color="neutral"
			variant="ghost"
			:circle="true"
			size="lg"
			@click="isDark = !isDark"
		/>

		<template #fallback>
			<div class="size-8" />
		</template>
	</ClientOnly>
</template>

<script setup>
const colorMode = useColorMode();

const isDark = computed({
	get() {
		return colorMode.value === 'dark';
	},
	set(_isDark) {
		colorMode.preference = _isDark ? 'dark' : 'light';
	}
});
</script>
