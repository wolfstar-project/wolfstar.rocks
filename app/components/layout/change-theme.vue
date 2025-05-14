<template>
	<ClientOnly class="swap swap-rotate">
		<ShadButton :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'" color="neutral" variant="ghost" :circle="true" size="lg" @click="toggleTheme" />

		<template #fallback>
			<div class="size-8"></div>
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

function toggleTheme() {
	isDark.value = !isDark.value;
}
</script>
