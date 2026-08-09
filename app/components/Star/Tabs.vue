<template>
	<div class="w-full">
		<div role="tablist" class="tabs-box tabs" :class="ui?.list">
			<button
				v-for="item in items"
				:key="String(item.value)"
				type="button"
				role="tab"
				class="tab gap-2"
				:class="{ 'tab-active': String(item.value) === String(model) }"
				:disabled="item.disabled"
				:aria-selected="String(item.value) === String(model)"
				@click="model = item.value"
			>
				<Icon v-if="item.icon" :name="item.icon" class="size-4" aria-hidden="true" />
				{{ item.label }}
			</button>
		</div>
		<div v-for="item in items" :key="`panel-${String(item.value)}`" class="mt-2">
			<template v-if="String(item.value) === String(model)">
				<slot v-if="$slots.content" name="content" :item="item" />
				<slot v-else-if="item.slot && $slots[item.slot]" :name="item.slot" :item="item" />
				<slot
					v-else-if="$slots[String(item.value)]"
					:name="String(item.value)"
					:item="item"
				/>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TabsItem } from "#shared/types/ui";

withDefaults(
	defineProps<{
		items?: TabsItem[];
		variant?: string;
		unmountOnHide?: boolean;
		ui?: Record<string, string>;
	}>(),
	{
		items: () => [],
	},
);

const model = defineModel<string | number>({ default: "" });
</script>
