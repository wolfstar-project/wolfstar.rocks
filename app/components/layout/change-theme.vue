<template>
	<div class="fixed right-3 bottom-36 z-50 sm:bottom-20">
		<SpotlightButton
			aria-label="scroll to top button"
			class="text-muted flex size-10 items-center justify-center p-1 transition-all duration-200"
			rounded
			:class="{ 'opacity-100': isDark, 'opacity-0': !isDark }"
			:icon="colorMode.preference === 'dark' || colorMode.preference === 'system' ? 'i-lucide-moon' : 'i-lucide-sun'"
			@click="() => (isDark = !isDark)"
		/>
	</div>
</template>

<script setup>
const colorMode = useColorMode();

const isDark = computed({
	get() {
		return colorMode.value === 'dark';
	},
	set() {
		colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
	}
});
</script>
