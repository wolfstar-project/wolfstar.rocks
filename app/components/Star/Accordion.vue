<template>
	<AccordionRoot v-model="openItems" :type="type" :class="cn('space-y-2', ui?.root)" collapsible>
		<AccordionItem
			v-for="(item, index) in normalizedItems"
			:key="item.value"
			:value="item.value"
			:disabled="item.disabled"
			:class="ui?.item"
		>
			<AccordionHeader>
				<AccordionTrigger as-child>
					<slot name="default" :item="item" :open="isOpen(item.value)">
						<button
							type="button"
							class="px-4 py-3 font-medium flex w-full items-center justify-between text-left"
							:class="ui?.trigger"
						>
							{{ item.label }}
							<Icon
								name="lucide:chevron-down"
								class="size-4 transition-transform"
								:class="isOpen(item.value) && 'rotate-180'"
							/>
						</button>
					</slot>
				</AccordionTrigger>
			</AccordionHeader>
			<AccordionContent :class="cn('overflow-hidden', ui?.content)">
				<slot name="body" :item="item" :index="index">
					<slot v-if="item.slot" :name="item.slot" :item="item" />
					<div v-else-if="item.content" class="p-4">{{ item.content }}</div>
				</slot>
			</AccordionContent>
		</AccordionItem>
	</AccordionRoot>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
import {
	AccordionContent,
	AccordionHeader,
	AccordionItem,
	AccordionRoot,
	AccordionTrigger,
} from "reka-ui";

interface AccordionItemData {
	label: string;
	value?: string;
	content?: string;
	description?: string;
	slot?: string;
	icon?: string;
	disabled?: boolean;
}

type NormalizedAccordionItem = AccordionItemData & { value: string };

const props = withDefaults(
	defineProps<{
		items?: AccordionItemData[];
		type?: "single" | "multiple";
		ui?: Record<string, string>;
	}>(),
	{
		items: () => [],
		type: "multiple",
	},
);

const openItems = ref<string[] | string>(props.type === "single" ? "" : []);

const normalizedItems = computed<NormalizedAccordionItem[]>(() => {
	const normalized: NormalizedAccordionItem[] = [];
	let index = 0;
	for (const item of props.items ?? []) {
		const value = item.value ?? String(index);
		normalized.push({ ...item, value });
		index += 1;
	}
	return normalized;
});

function isOpen(value: string) {
	return Array.isArray(openItems.value)
		? openItems.value.includes(value)
		: openItems.value === value;
}
</script>
