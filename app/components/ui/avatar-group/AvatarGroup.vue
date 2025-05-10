<template>
    <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
        <Avatar v-if="hiddenCount > 0" :text="`+${hiddenCount}`" :class="ui.base({ class: props.ui?.base })" />
        <component :is="avatar" v-for="(avatar, count) in visibleAvatars" :key="count" :class="ui.base({ class: props.ui?.base })" />
    </Primitive>
</template>

<script setup lang="ts">
import type { AvatarGroupProps, AvatarGroupSlots } from '.';
import { Avatar } from '@/components/ui/avatar';
import { Primitive } from 'reka-ui';
import { computed, provide } from 'vue';
import { AvatarGroupInjectionKey } from '~/composables/useAvatarGroup';
import { avatarGroupVariants } from '.';

const props = defineProps<AvatarGroupProps>();
const slots = defineSlots<AvatarGroupSlots>();

const ui = computed(() =>
    avatarGroupVariants({
        size: props.size,
    }),
);

const max = computed(() => (typeof props.max === 'string' ? Number.parseInt(props.max, 10) : props.max));

const children = computed(() => {
    let children = slots.default?.();
    if (children?.length) {
        children = children

            .flatMap((child: any) => {
                if (typeof child.type === 'symbol') {
                    // `v-if="false"` or commented node
                    if (typeof child.children === 'string') {
                        // eslint-disable-next-line array-callback-return
                        return;
                    }

                    return child.children;
                }

                return child;
            })
            .filter(Boolean);
    }

    return children || [];
});

const visibleAvatars = computed(() => {
    if (!children.value.length) {
        return [];
    }

    if (!max.value || max.value <= 0) {
        return [...children.value].reverse();
    }

    return [...children.value].slice(0, max.value).reverse();
});

const hiddenCount = computed(() => {
    if (!children.value.length) {
        return 0;
    }

    return children.value.length - visibleAvatars.value.length;
});

provide(
    AvatarGroupInjectionKey,
    computed(() => ({
        size: props.size,
    })),
);
</script>
