<template>
	<div class="flex min-h-screen w-full">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { dashboardSidebarCollapseKey } from "#shared/types/ui";

defineProps<{
	unit?: string;
}>();

const collapsed = ref(false);

provide(dashboardSidebarCollapseKey, {
	collapsed,
	toggle: () => {
		collapsed.value = !collapsed.value;
	},
});
</script>
