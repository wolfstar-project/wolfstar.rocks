<template>
	<Link
		v-slot="{ active, ...slotProps }"
		:type="type"
		:disabled="disabled || isLoading"
		:class="ui.base({ class: [props.class, props.ui?.base] })"
		v-bind="omit(linkProps, ['type', 'disabled'])"
		custom
	>
		<LinkBase
			v-bind="slotProps"
			:class="
				ui.base({
					class: [props.class, props.ui?.base],
					active,
					...(active && activeVariant ? { variant: activeVariant } : {}),
					...(active && activeColor ? { color: activeColor } : {})
				})
			"
			@click="onClickWrapper"
		>
			<slot name="leading">
				<Icon v-if="isLeading && leadingIconName" :name="leadingIconName" :class="ui.leadingIcon({ class: props.ui?.leadingIcon, active })" />
				<Avatar
					v-else-if="!!avatar"
					:size="(props.ui?.leadingAvatarSize || ui.leadingAvatarSize()) as AvatarProps['size']"
					v-bind="avatar"
					:class="ui.leadingAvatar({ class: props.ui?.leadingAvatar, active })"
				/>
			</slot>

			<slot>
				<span v-if="label" :class="ui.label({ class: props.ui?.label, active })">
					{{ label }}
				</span>
			</slot>

			<slot name="trailing">
				<Icon
					v-if="isTrailing && trailingIconName"
					:name="trailingIconName"
					:class="ui.trailingIcon({ class: props.ui?.trailingIcon, active })"
				/>
			</slot>
		</LinkBase>
	</Link>
</template>

<script setup lang="ts">
import { type Ref, computed, ref, inject } from 'vue';
import { useForwardProps } from 'reka-ui';
import { Icon } from '@/components/ui/icon';
import { Avatar, type AvatarProps } from '@/components/ui/avatar';
import { LinkBase, Link, pickLinkProps } from '@/components/ui/link';
import { tv } from 'tailwind-variants';
import type { ButtonSlots, ButtonProps } from '.';
import { formLoadingInjectionKey } from '@/composables/useFormField';
import { buttonVariants } from '@/components/ui/button';
import { omit } from '@/utils/index';

const props = withDefaults(defineProps<ButtonProps>(), {
	active: undefined,
	activeClass: '',
	inactiveClass: ''
});
const slots = defineSlots<ButtonSlots>();

const linkProps = useForwardProps(pickLinkProps(props));

const { orientation, size: buttonSize } = useButtonGroup<ButtonProps>(props);

const loadingAutoState = ref(false);
const formLoading = inject<Ref<boolean> | undefined>(formLoadingInjectionKey, undefined);

async function onClickWrapper(event: MouseEvent) {
	loadingAutoState.value = true;
	const callbacks = Array.isArray(props.onClick) ? props.onClick : [props.onClick];
	try {
		await Promise.all(callbacks.map((fn) => fn?.(event)));
	} finally {
		loadingAutoState.value = false;
	}
}

const isLoading = computed(() => {
	return props.loading || (props.loadingAuto && (loadingAutoState.value || (formLoading?.value && props.type === 'submit')));
});

const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(computed(() => ({ ...props, loading: isLoading.value })));

const ui = computed(() =>
	tv({
		extend: buttonVariants,
		variants: {
			active: {
				true: {
					base: props.activeClass
				},
				false: {
					base: props.inactiveClass
				}
			}
		}
	})({
		color: props.color,
		variant: props.variant,
		size: buttonSize.value,
		loading: isLoading.value,
		block: props.block,
		square: props.square || (!slots.default && !props.label),
		leading: isLeading.value,
		trailing: isTrailing.value,
		buttonGroup: orientation.value
	})
);
</script>
