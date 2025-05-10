<template>
    <SelectScrollDownButton
        data-slot="select-scroll-down-button"
        v-bind="forwardedProps"
        :class="cn('flex cursor-default items-center justify-center py-1', props.class)"
    >
        <slot>
            <Icon name="radix-icons:chevrondown" class="size-4" />
        </slot>
    </SelectScrollDownButton>
</template>

<script setup lang="ts">
import type { SelectScrollDownButtonProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';
import { SelectScrollDownButton, useForwardProps } from 'reka-ui';
import { computed } from 'vue';

const props = defineProps<SelectScrollDownButtonProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>
