<template>
	<div :class="layout === 'row' ? 'select-row' : 'select-field'">
		<label :for="fieldId" :class="layout === 'row' ? 'select-row-label' : 'select-field-label'">
			{{ formattedLabel }}
		</label>
		<SelectBase
			:id="fieldId"
			v-model="selected"
			:options
			:kind
			multiple
			:disabled
			:size="layout === 'row' ? 'sm' : 'md'"
			:placeholder="emptyLabel ?? ts('select.none')"
			:aria-describedby="tooltipTitle ? `${fieldId}-help` : undefined"
			:class="layout === 'row' ? 'select-row-control' : 'w-full'"
		/>
		<p
			v-if="tooltipTitle"
			:id="`${fieldId}-help`"
			:class="layout === 'row' ? 'sr-only' : 'select-field-help'"
		>
			{{ tooltipTitle }}
		</p>
	</div>
</template>

<script lang="ts">
import type { SelectKind, SelectOption } from "./Base.vue";

interface SelectManyProps {
	/** The label of the field */
	label: string;
	/** The options to choose from */
	options: readonly SelectOption[];
	/** What the options are: plain strings, channels or roles */
	kind?: SelectKind;
	modelValue?: string[];
	/** Help text: shown under a `field`, read to screen readers in a `row` */
	tooltipTitle?: string;
	/** Disable the field */
	disabled?: boolean;
	/**
	 * `field` stacks the label, a full-width select and the help text. `row`
	 * puts the label on the left and a compact select on the right, for
	 * settings lists.
	 */
	layout?: "field" | "row";
	/** Text shown while nothing is selected */
	emptyLabel?: string;
}
</script>

<script setup lang="ts">
import { toTitleCase } from "@sapphire/utilities";

const {
	label,
	options,
	kind = "string",
	modelValue = [],
	tooltipTitle,
	disabled = false,
	layout = "field",
	emptyLabel,
} = defineProps<SelectManyProps>();

const emit = defineEmits<{
	"update:modelValue": [value: string[]];
	"change": [value: string[]];
}>();

const { ts } = useI18n();
const fieldId = useId();
const formattedLabel = computed(() => toTitleCase(label));

const selected = computed<string | string[] | null>({
	get: () => modelValue,
	set: (value) => {
		const next = Array.isArray(value) ? value : [];
		emit("update:modelValue", next);
		emit("change", next);
	},
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.select-row {
	@apply flex min-h-9 items-center justify-between gap-4;
}

.select-row-label {
	@apply min-w-0 text-sm;
}

/* A fixed width, so a column of rows lines up. */
.select-row :deep(.select-row-control) {
	@apply w-64 max-w-[60%] shrink-0;
}

.select-field {
	@apply flex min-w-0 flex-col gap-1.5;
}

.select-field-label {
	@apply text-sm font-medium;
}

.select-field-help {
	@apply text-[0.8125rem] leading-normal text-muted;
}
</style>
