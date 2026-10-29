<template>
	<div class="flex min-w-0 flex-col gap-1">
		<p :id="labelId" class="text-[0.9375rem]">{{ label }}</p>
		<p v-if="description" class="text-[0.8125rem] text-muted">{{ description }}</p>
		<div
			class="mt-1.5 flex flex-wrap items-center gap-2"
			role="group"
			:aria-labelledby="labelId"
		>
			<span v-if="chosen.length === 0" class="text-[0.8125rem] text-muted">
				{{ emptyLabel ?? ts("select.nothing_chosen") }}
			</span>
			<span
				v-for="option in chosen"
				:key="option.value"
				class="select-chips-chip"
				:class="{ 'select-chips-chip--channel': kind === 'channel' }"
			>
				<SelectOptionMark v-if="kind === 'role'" kind="role" :color="option.color" />
				{{ kind === "channel" ? `#${option.label}` : option.label }}
				<button
					type="button"
					class="select-chips-remove"
					:disabled
					:aria-label="ts('select.remove_option', { name: option.label })"
					@click="remove(option.value)"
				>
					<UIcon name="ic:round-close" class="size-3.5" aria-hidden="true" />
				</button>
			</span>
			<button
				type="button"
				class="select-chips-add"
				:disabled
				:aria-label="ts('select.add_to', { name: label })"
				@click="open = true"
			>
				<UIcon name="ic:round-add" class="size-3.5" aria-hidden="true" />
				{{ ts("select.add") }}
			</button>
		</div>

		<UModal
			v-model:open="open"
			:title="dialogTitle ?? label"
			:description="label"
			:ui="{ content: 'sm:max-w-130', body: 'p-0 sm:p-0' }"
		>
			<template #body>
				<div class="px-5 pt-1 pb-3">
					<UInput
						v-model="query"
						icon="ic:round-search"
						:placeholder="searchPlaceholder ?? ts('select.search')"
						:aria-label="searchPlaceholder ?? ts('select.search')"
						class="w-full"
					/>
				</div>
				<div class="max-h-[min(60vh,32rem)] overflow-y-auto px-5 pb-4">
					<p v-if="groups.length === 0" class="py-3 text-[0.8125rem] text-muted">
						{{ ts("select.nothing_matches") }}
					</p>
					<section
						v-for="group in groups"
						:key="group.name"
						:aria-label="group.name || label"
						class="mt-2 first:mt-0"
					>
						<h3 v-if="group.name" class="mb-1 px-0.5 pt-1.5 console-label">
							{{ group.name }}
						</h3>
						<label
							v-for="option in group.options"
							:key="option.value"
							class="select-chips-row"
						>
							<UCheckbox
								:model-value="model.includes(option.value)"
								:ui="{ base: 'size-4.5 rounded-[4px]' }"
								@update:model-value="toggle(option.value, $event === true)"
							/>
							<SelectOptionMark
								v-if="kind === 'role'"
								kind="role"
								:color="option.color"
							/>
							<span
								:class="
									kind === 'channel' ? 'font-mono text-[0.9375rem]' : 'text-sm'
								"
							>
								{{ kind === "channel" ? `#${option.label}` : option.label }}
							</span>
						</label>
					</section>
				</div>
			</template>

			<template #footer>
				<div class="flex w-full items-center gap-2.5">
					<span class="text-[0.8125rem] text-muted">
						{{ countLabel ? countLabel(model.length) : model.length }}
					</span>
					<span class="grow"></span>
					<UButton
						color="neutral"
						variant="ghost"
						:disabled="model.length === 0"
						@click="model = []"
					>
						{{ ts("select.clear") }}
					</UButton>
					<UButton color="primary" @click="open = false">{{ ts("select.done") }}</UButton>
				</div>
			</template>
		</UModal>
	</div>
</template>

<script setup lang="ts">
import type { SelectKind, SelectOption } from "./Base.vue";

/**
 * A list of channels or roles shown as removable chips, picked in a dialog of
 * checkboxes. For lists that are read more often than they change, such as the
 * channels a log or a rule leaves alone.
 */
const model = defineModel<string[]>({ required: true });

const {
	label,
	description,
	options,
	kind = "channel",
	disabled = false,
	emptyLabel,
	dialogTitle,
	searchPlaceholder,
	countLabel,
} = defineProps<{
	label: string;
	description?: string;
	options: readonly SelectOption[];
	kind?: SelectKind;
	disabled?: boolean;
	/** Shown in place of the chips while the list is empty. */
	emptyLabel?: string;
	dialogTitle?: string;
	searchPlaceholder?: string;
	/** The dialog's footer: how many are chosen, in words. */
	countLabel?: (count: number) => string;
}>();

const { ts } = useI18n();
const labelId = useId();
const open = ref(false);
const query = ref("");

watch(open, (isOpen) => {
	if (isOpen) query.value = "";
});

const byValue = computed(() => new Map(options.map((option) => [option.value, option])));

// A stored id whose channel or role is gone still shows, so it can be removed.
const chosen = computed(() =>
	model.value.map(
		(value) =>
			byValue.value.get(value) ?? {
				label: ts(kind === "role" ? "select.unknown_role" : "select.unknown_channel"),
				value,
			},
	),
);

const groups = computed(() => {
	const needle = query.value.trim().toLowerCase();
	const result = new Map<string, SelectOption[]>();
	for (const option of options) {
		if (needle && !option.label.toLowerCase().includes(needle)) continue;
		const name = option.group ?? "";
		result.set(name, [...(result.get(name) ?? []), option]);
	}
	return Array.from(result, ([name, list]) => ({ name, options: list }));
});

function toggle(value: string, on: boolean) {
	model.value = on
		? [...model.value.filter((entry) => entry !== value), value]
		: model.value.filter((entry) => entry !== value);
}

function remove(value: string) {
	model.value = model.value.filter((entry) => entry !== value);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.select-chips-chip {
	@apply inline-flex h-7 items-center gap-1.5 rounded-full bg-base-content/8 py-0 pr-1.5 pl-2.5 text-[0.8125rem] font-semibold;
}

.select-chips-chip--channel {
	@apply bg-primary/15 text-primary theme-light:text-default;
}

.select-chips-remove {
	@apply flex size-5 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 opacity-70;
	color: inherit;
}

.select-chips-remove:hover:not(:disabled) {
	@apply opacity-100;
	background-color: color-mix(in oklab, currentcolor 15%, transparent);
}

.select-chips-add {
	@apply inline-flex h-7 cursor-pointer items-center gap-1 rounded-full bg-transparent px-3 text-[0.8125rem] font-semibold;
	border: 1px dashed var(--field-border);
	color: var(--ui-text-toned);
}

.select-chips-add:hover:not(:disabled) {
	background-color: var(--field-surface);
}

.select-chips-add:disabled,
.select-chips-remove:disabled {
	@apply cursor-default opacity-50;
}

.select-chips-add:focus-visible,
.select-chips-remove:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 1px;
}

.select-chips-row {
	@apply flex min-h-10 cursor-pointer items-center gap-3 rounded-[5px] px-0.5;
}

.select-chips-row:hover {
	background-color: color-mix(in oklab, var(--field-surface) 50%, transparent);
}
</style>
