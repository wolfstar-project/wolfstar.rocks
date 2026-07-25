<template>
	<aside
		:id="id"
		:class="
			cn(
				'sticky top-0 flex h-screen shrink-0 flex-col border-r border-base-200 transition-[width] duration-200',
				collapsed ? 'w-16' : 'w-64',
				ui?.root,
			)
		"
	>
		<div v-if="$slots.header" :class="cn('flex items-center gap-2 p-3', ui?.header)">
			<slot name="header" :collapsed="collapsed" />
		</div>
		<div :class="cn('flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2', ui?.body)">
			<slot :collapsed="collapsed" />
		</div>
		<div v-if="$slots.footer" :class="cn('mt-auto p-2', ui?.footer)">
			<slot name="footer" :collapsed="collapsed" />
		</div>
	</aside>
</template>

<script setup lang="ts">
import { dashboardSidebarCollapseKey } from "#shared/types/ui";
import { cn } from "cnfast";

withDefaults(
	defineProps<{
		id?: string;
		collapsible?: boolean;
		resizable?: boolean;
		ui?: Record<string, string>;
	}>(),
	{
		id: "default",
		collapsible: true,
	},
);

const injected = inject(dashboardSidebarCollapseKey, null);
const localCollapsed = ref(false);
const collapsed = computed(() => injected?.collapsed.value ?? localCollapsed.value);
</script>
