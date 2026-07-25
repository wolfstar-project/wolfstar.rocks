<template>
	<component
		:is="linkComponent"
		v-bind="linkBindings"
		:class="classes"
		:disabled="isDisabled || undefined"
		:type="linkComponent === 'button' ? type : undefined"
		:aria-disabled="isDisabled || undefined"
		:aria-busy="loading || undefined"
		@click="onClick"
	>
		<span v-if="loading" class="loading loading-spinner loading-sm" aria-hidden="true" />
		<UAvatar
			v-else-if="avatar"
			v-bind="avatar"
			size="xs"
			class="shrink-0"
		/>
		<Icon v-else-if="icon" :name="icon" class="size-4 shrink-0" aria-hidden="true" />
		<span v-if="label || $slots.default" class="truncate">
			<slot>{{ label }}</slot>
		</span>
		<template v-if="$slots.trailing">
			<slot name="trailing" />
		</template>
		<Icon
			v-else-if="trailingIcon"
			:name="trailingIcon"
			class="size-4 shrink-0"
			aria-hidden="true"
		/>
	</component>
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

const linkComponent = computed(() => {
	if (props.to) return resolveComponent("NuxtLink");
	if (props.href) return "a";
	return "button";
});

const linkBindings = computed(() => {
	if (props.to) {
		return {
			to: props.to,
			target: props.target,
			external: props.external,
		};
	}
	if (props.href) {
		return {
			href: props.href,
			target: props.target,
			rel: props.target === "_blank" ? "noopener noreferrer" : undefined,
		};
	}
	return {};
});

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
