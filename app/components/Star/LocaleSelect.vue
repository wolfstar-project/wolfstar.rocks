<template>
	<select
		class="select-bordered select"
		:class="selectClass"
		:value="modelValue"
		:aria-label="ariaLabel"
		:disabled="disabled"
		v-bind="$attrs"
		@change="onChange"
	>
		<option v-for="locale in locales" :key="locale.code" :value="locale.code">
			{{ locale.name }}
		</option>
	</select>
</template>

<script setup lang="ts">
interface LocaleSelectItem {
	code: string;
	name: string;
	dir?: "ltr" | "rtl";
}

const props = withDefaults(
	defineProps<{
		modelValue?: string;
		locales?: LocaleSelectItem[];
		ariaLabel?: string;
		disabled?: boolean;
		size?: "xs" | "sm" | "md" | "lg";
		color?: string;
		variant?: string;
		/** Accepted for Nuxt UI API compat; unused with native select. */
		content?: Record<string, unknown>;
		ui?: Record<string, unknown>;
	}>(),
	{
		locales: () => [],
		size: "sm",
	},
);

const emit = defineEmits<{
	"update:modelValue": [value: string];
}>();

const selectClass = computed(() => {
	const sizeClass =
		props.size === "xs"
			? "select-xs"
			: props.size === "sm"
				? "select-sm"
				: props.size === "lg"
					? "select-lg"
					: "";
	const ghost = props.variant === "ghost" ? "select-ghost border-0 bg-transparent" : "";
	return [sizeClass, ghost].filter(Boolean).join(" ");
});

function onChange(event: Event) {
	const target = event.target;
	if (!(target instanceof HTMLSelectElement)) return;
	emit("update:modelValue", target.value);
}
</script>
