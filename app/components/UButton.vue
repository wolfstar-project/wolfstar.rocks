<template>
	<NuxtLink
		v-if="to"
		:to="to"
		:target="target"
		:external="external"
		:class="classes"
		:aria-disabled="isDisabled || undefined"
		:aria-busy="loading || undefined"
		:tabindex="isDisabled ? -1 : undefined"
		@click="onClick"
	>
		<span v-if="loading" class="loading loading-sm loading-spinner" aria-hidden="true" />
		<UAvatar v-else-if="avatar" v-bind="avatar" size="xs" class="shrink-0" />
		<Icon v-else-if="icon" :name="icon" class="size-4 shrink-0" aria-hidden="true" />
		<span v-if="label || $slots.default" class="truncate">
			<slot>{{ label }}</slot>
		</span>
		<slot name="trailing">
			<Icon
				v-if="trailingIcon"
				:name="trailingIcon"
				class="size-4 shrink-0"
				aria-hidden="true"
			/>
		</slot>
	</NuxtLink>
	<a
		v-else-if="href"
		:href="href"
		:target="target"
		:rel="target === '_blank' ? 'noopener noreferrer' : undefined"
		:class="classes"
		:aria-disabled="isDisabled || undefined"
		:aria-busy="loading || undefined"
		:tabindex="isDisabled ? -1 : undefined"
		@click="onClick"
	>
		<span v-if="loading" class="loading loading-sm loading-spinner" aria-hidden="true" />
		<UAvatar v-else-if="avatar" v-bind="avatar" size="xs" class="shrink-0" />
		<Icon v-else-if="icon" :name="icon" class="size-4 shrink-0" aria-hidden="true" />
		<span v-if="label || $slots.default" class="truncate">
			<slot>{{ label }}</slot>
		</span>
		<slot name="trailing">
			<Icon
				v-if="trailingIcon"
				:name="trailingIcon"
				class="size-4 shrink-0"
				aria-hidden="true"
			/>
		</slot>
	</a>
	<button
		v-else
		:type="type"
		:class="classes"
		:disabled="isDisabled || undefined"
		:aria-disabled="isDisabled || undefined"
		:aria-busy="loading || undefined"
		@click="onClick"
	>
		<span v-if="loading" class="loading loading-sm loading-spinner" aria-hidden="true" />
		<UAvatar v-else-if="avatar" v-bind="avatar" size="xs" class="shrink-0" />
		<Icon v-else-if="icon" :name="icon" class="size-4 shrink-0" aria-hidden="true" />
		<span v-if="label || $slots.default" class="truncate">
			<slot>{{ label }}</slot>
		</span>
		<slot name="trailing">
			<Icon
				v-if="trailingIcon"
				:name="trailingIcon"
				class="size-4 shrink-0"
				aria-hidden="true"
			/>
		</slot>
	</button>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
import {
	btnColorClass,
	btnSizeClass,
	btnVariantClass,
	type ButtonVariant,
	type UiSize,
} from "~/utils/ui-classes";

const props = withDefaults(
	defineProps<{
		label?: string;
		icon?: string;
		trailingIcon?: string;
		color?: string;
		variant?: ButtonVariant;
		size?: UiSize;
		block?: boolean;
		square?: boolean;
		circle?: boolean;
		loading?: boolean;
		disabled?: boolean;
		to?: string;
		href?: string;
		target?: string;
		type?: "button" | "submit" | "reset";
		active?: boolean;
		external?: boolean;
		avatar?: { src?: string; alt?: string };
		ui?: Record<string, string>;
	}>(),
	{
		color: "primary",
		variant: "solid",
		size: "md",
		type: "button",
	},
);

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const isDisabled = computed(() => props.disabled || props.loading);

const classes = computed(() =>
	cn(
		"btn",
		btnColorClass(props.color),
		btnVariantClass(props.variant),
		btnSizeClass(props.size),
		props.block && "btn-block",
		props.square && "btn-square",
		props.circle && "btn-circle",
		props.active && "btn-active",
		props.ui?.base,
	),
);

function onClick(event: MouseEvent) {
	if (isDisabled.value) {
		event.preventDefault();
		event.stopPropagation();
		return;
	}
	emit("click", event);
}
</script>
