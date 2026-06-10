<template>
	<slot v-if="mounted"></slot>
</template>

<script setup lang="ts">
const mounted = ref(false);

onMounted(() => {
	const show = () => {
		mounted.value = true;
	};

	if (typeof window.requestIdleCallback === "function") {
		window.requestIdleCallback(show, { timeout: 3000 });
	} else {
		setTimeout(show, 1);
	}
});
</script>
