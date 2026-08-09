<template>
	<aside
		:id="id"
		:class="
			cn(
				'top-0 border-base-200 sticky flex h-screen shrink-0 flex-col border-r transition-[width] duration-200',
				collapsed ? 'w-16' : 'w-64',
				ui?.root,
			)
		"
	>
		<div v-if="$slots.header" :class="cn('gap-2 p-3 flex items-center', ui?.header)">
			<slot name="header" :collapsed="collapsed" />
		</div>
		<div :class="cn('min-h-0 gap-2 p-2 flex flex-1 flex-col overflow-y-auto', ui?.body)">
			<slot :collapsed="collapsed" />
		</div>
		<div v-if="$slots.footer" :class="cn('p-2 mt-auto', ui?.footer)">
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
