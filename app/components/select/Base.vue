<template>
	<USelectMenu
		:id
		v-model="model"
		:items="groupedItems"
		:multiple
		:disabled
		:size
		value-key="value"
		label-key="label"
		:search-input="searchInput"
		:clear="clearable && hasValue"
		:placeholder
		:aria-label="ariaLabel"
		:aria-describedby="ariaDescribedby"
		:ui="{ base: multipleBase, itemTrailingIcon: multiple ? 'hidden' : undefined }"
	>
		<template v-if="hasValue" #default>
			<span v-if="multiple" class="flex min-w-0 flex-wrap gap-1">
				<span v-for="option in chips" :key="option.value" class="select-chip">
					<SelectOptionMark :kind :color="option.color" class="size-3" />
					<span class="truncate">{{ option.label }}</span>
				</span>
				<span v-if="hiddenChips > 0" class="self-center font-mono text-xs text-muted">
					+{{ hiddenChips }}
				</span>
			</span>
			<span v-else-if="first" class="flex min-w-0 items-center gap-2">
				<SelectOptionMark :kind :color="first.color" />
				<span class="truncate">{{ first.label }}</span>
			</span>
		</template>

		<template #item-leading="{ item }">
			<span
				v-if="multiple"
				class="select-check"
				:class="{ 'select-check--on': isSelected(item) }"
				aria-hidden="true"
			>
				<UIcon v-if="isSelected(item)" name="ic:round-check" class="size-3" />
			</span>
			<SelectOptionMark :kind :color="optionOf(item)?.color" />
		</template>

		<template #item-trailing="{ item }">
			<span v-if="optionOf(item)?.note" class="font-mono text-[0.6875rem] text-muted">
				{{ optionOf(item)?.note }}
			</span>
		</template>

		<template #empty>{{ ts("select.nothing_matches") }}</template>
	</USelectMenu>
</template>

<script lang="ts">
export interface SelectOption {
	value: string;
	label: string;
	/** Options that share a group are listed under its heading. */
	group?: string;
	/** Short text set to the right of the label, such as a language code. */
	note?: string;
	/** CSS colour of a role's dot. */
	color?: string;
}

/** What the options are, which decides the mark shown in front of each one. */
export type SelectKind = "string" | "channel" | "role";
</script>

<script setup lang="ts">
// Above this a plain list of strings is long enough to be worth searching;
// channels and roles always are.
const SEARCH_THRESHOLD = 7;
// A multi-select shows this many chips and counts the rest.
const VISIBLE_CHIPS = 4;

const model = defineModel<string | string[] | null>({ required: true });

const {
	options,
	kind = "string",
	multiple = false,
	disabled = false,
	clearable = true,
	size = "md",
	placeholder,
	id,
	ariaLabel,
	ariaDescribedby,
} = defineProps<{
	options: readonly SelectOption[];
	kind?: SelectKind;
	multiple?: boolean;
	disabled?: boolean;
	/** Shows a button that empties the field while it holds a value. */
	clearable?: boolean;
	size?: "sm" | "md";
	placeholder?: string;
	id?: string;
	ariaLabel?: string;
	ariaDescribedby?: string;
}>();

const { ts } = useI18n();

// Chips may wrap, so a multi-select grows from its size's height instead of
// being held to it.
const multipleBase = computed(() => {
	if (!multiple) return undefined;
	return size === "sm" ? "h-auto min-h-8 py-0.75" : "h-auto min-h-10 py-1";
});

const selected = computed(() => {
	const value = model.value;
	if (Array.isArray(value)) return value;
	return value ? [value] : [];
});
const hasValue = computed(() => selected.value.length > 0);

const byValue = computed(() => new Map(options.map((option) => [option.value, option])));

// A stored id whose channel or role is gone still has to be shown, and cleared.
const chosen = computed(() =>
	selected.value.map(
		(value) =>
			byValue.value.get(value) ?? {
				label:
					kind === "role"
						? ts("select.unknown_role")
						: kind === "channel"
							? ts("select.unknown_channel")
							: value,
				value,
			},
	),
);
const first = computed(() => chosen.value[0]);
const chips = computed(() => chosen.value.slice(0, VISIBLE_CHIPS));
const hiddenChips = computed(() => Math.max(0, chosen.value.length - VISIBLE_CHIPS));

const searchInput = computed(() =>
	kind !== "string" || options.length > SEARCH_THRESHOLD
		? { icon: "ic:round-search", placeholder: ts("select.search") }
		: false,
);

/** An option, or the heading of a group (which Nuxt UI never selects). */
interface MenuItem {
	label: string;
	value: string;
	type?: "label";
}

/** One list per group, each led by its heading when it has one. */
const groupedItems = computed<MenuItem[][]>(() => {
	const groups = new Map<string, MenuItem[]>();
	for (const option of options) {
		const name = option.group ?? "";
		let items = groups.get(name);
		if (!items) {
			items = name ? [{ label: name, type: "label", value: `group:${name}` }] : [];
			groups.set(name, items);
		}
		items.push({ label: option.label, value: option.value });
	}
	return [...groups.values()];
});

function optionOf(item: unknown): SelectOption | undefined {
	const value = (item as { value?: unknown } | null)?.value;
	return typeof value === "string" ? byValue.value.get(value) : undefined;
}

function isSelected(item: unknown): boolean {
	const option = optionOf(item);
	return option !== undefined && selected.value.includes(option.value);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.select-chip {
	@apply inline-flex h-5.5 max-w-full items-center gap-1.25 rounded-full bg-base-content/8 px-2 text-xs font-semibold;
}

.select-check {
	@apply flex size-4 shrink-0 items-center justify-center rounded-[4px] border-2 border-(--ink-300) text-white;
}

.select-check--on {
	@apply border-primary bg-primary;
}
</style>
