<template>
	<UAlert :color="alertColor" variant="soft" class="not-prose my-4">
		<template #description>
			<slot />
		</template>
	</UAlert>
</template>

<script setup lang="ts">
const props = defineProps<{
	type?: "info" | "warning" | "danger" | "success";
}>();

const alertColor = computed(() => {
	const colorMap = {
		info: "info",
		warning: "warning",
		danger: "error",
		success: "success",
	} as const;
	return colorMap[props.type ?? "info"];
});
</script>
