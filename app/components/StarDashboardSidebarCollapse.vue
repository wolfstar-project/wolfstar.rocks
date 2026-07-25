<template>
	<button
		type="button"
		class="btn btn-square btn-ghost btn-sm"
		aria-label="Toggle sidebar"
		@click="toggle"
	>
		<Icon name="lucide:panel-left" class="size-5" />
	</button>
</template>

<script setup lang="ts">
import { dashboardSidebarCollapseKey } from "#shared/types/ui";

const ctx = inject(dashboardSidebarCollapseKey, null);

function toggle() {
	ctx?.toggle();
}
</script>
