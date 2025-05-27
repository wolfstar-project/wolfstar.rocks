<!-- eslint-disable vue/multi-word-component-names -->
<template>
	<Primitive :as="as" :data-orientation="orientation" :class="ui.root({ class: [props.class, props.ui?.root] })">
		<slot name="leading">
			<Avatar
				v-if="avatar"
				:size="(props.ui?.avatarSize || ui.avatarSize()) as AvatarProps['size']"
				v-bind="avatar"
				:class="ui.avatar({ class: props.ui?.avatar })"
			/>
			<Icon v-else-if="icon" :name="icon" :class="ui.icon({ class: props.ui?.icon })" />
		</slot>

		<div :class="ui.wrapper({ class: props.ui?.wrapper })">
			<div v-if="title || !!slots.title" :class="ui.title({ class: cn('mb-1 leading-none font-medium tracking-tight', props.ui?.title) })">
				<slot name="title">
					{{ title }}
				</slot>
			</div>
			<div
				v-if="description || !!slots.description"
				:class="cn(ui.description({ class: props.ui?.description }), 'text-sm [&_p]:leading-relaxed')"
			>
				<slot name="description">
					{{ description }}
				</slot>
			</div>

			<div v-if="orientation === 'vertical' && actions?.length" :class="ui.actions({ class: props.ui?.actions })">
				<slot name="actions">
					<Button v-for="(action, index) in actions" :key="index" size="xs" v-bind="action" />
				</slot>
			</div>
		</div>

		<div
			v-if="(orientation === 'horizontal' && actions?.length) || close"
			:class="ui.actions({ class: props.ui?.actions, orientation: 'horizontal' })"
		>
			<template v-if="orientation === 'horizontal' && actions?.length">
				<slot name="actions">
					<Button v-for="(action, index) in actions" :key="index" size="xs" v-bind="action" />
				</slot>
			</template>

			<slot name="close" :ui="ui">
				<Button
					v-if="close"
					:icon="closeIcon || 'radix-icons:cross'"
					size="md"
					color="neutral"
					variant="link"
					aria-label="Close"
					v-bind="typeof close === 'object' ? (close as Partial<ButtonProps>) : {}"
					:class="ui.close({ class: props.ui?.close })"
					@click="emits('update:open', false)"
				/>
			</slot>
		</div>
	</Primitive>
</template>

<script setup lang="ts">
import type { AlertEmits, AlertProps, AlertSlots } from '.';
import type { AvatarProps } from '@/components/ui/avatar';
import type { ButtonProps } from '@/components/ui/button';
import { Primitive } from 'reka-ui';
import { computed } from 'vue';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { alert } from '.';

const props = withDefaults(defineProps<AlertProps>(), {
	orientation: 'vertical'
});
const emits = defineEmits<AlertEmits>();
const slots = defineSlots<AlertSlots>();

const ui = computed(() =>
	alert({
		color: props.color,
		variant: props.variant,
		orientation: props.orientation,
		title: !!props.title || !!slots.title
	})
);
</script>
