<template>
    <NuxtLink v-slot="{ href, navigate, route: linkRoute, rel, target, isExternal, isActive, isExactActive }" v-bind="nuxtLinkProps" custom>
        <template v-if="custom">
            <slot
                v-bind="{
                    ...$attrs,
                    as,
                    type,
                    disabled,
                    href,
                    navigate,
                    rel,
                    target,
                    isExternal,
                    active: isLinkActive({ route: linkRoute, isActive, isExactActive }),
                }"
            ></slot>
        </template>
        <LinkBase
            v-else
            v-bind="{
                ...$attrs,
                as,
                type,
                disabled,
                href,
                navigate,
                rel,
                target,
                isExternal,
            }"
            :class="resolveLinkClass({ route: linkRoute, isActive, isExactActive })"
        >
            <slot :active="isLinkActive({ route: linkRoute, isActive, isExactActive })"></slot>
        </LinkBase>
    </NuxtLink>
</template>

<script setup lang="ts">
import type { LinkProps, LinkSlots } from '.';
import { reactiveOmit } from '@vueuse/core';
import { diff, isEqual } from 'ohash/utils';
import { useForwardProps } from 'reka-ui';
import { tv } from 'tailwind-variants';
import { link, LinkBase } from '.';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<LinkProps>(), {
    as: 'button',
    type: 'button',
    active: undefined,
    activeClass: '',
    inactiveClass: '',
});
defineSlots<LinkSlots>();

const route = useRoute();
const nuxtLinkProps = useForwardProps(
    reactiveOmit(props, 'as', 'type', 'disabled', 'active', 'exact', 'exactQuery', 'exactHash', 'activeClass', 'inactiveClass', 'raw', 'class'),
);

const ui = computed(() =>
    tv({
        extend: link,
        variants: {
            active: {
                true: props.activeClass,
                false: props.inactiveClass,
            },
        },
    }),
);

function isPartiallyEqual(item1: any, item2: any) {
    const diffedKeys = diff(item1, item2).reduce((filtered, q) => {
        if (q.type === 'added') {
            filtered.add(q.key);
        }
        return filtered;
    }, new Set<string>());

    const item1Filtered = Object.fromEntries(Object.entries(item1).filter(([key]) => !diffedKeys.has(key)));
    const item2Filtered = Object.fromEntries(Object.entries(item2).filter(([key]) => !diffedKeys.has(key)));

    return isEqual(item1Filtered, item2Filtered);
}

function isLinkActive({ route: linkRoute, isActive, isExactActive }: any) {
    if (props.active !== undefined) {
        return props.active;
    }

    if (props.exactQuery === 'partial') {
        if (!isPartiallyEqual(linkRoute.query, route.query))
            return false;
    }
    else if (props.exactQuery === true) {
        if (!isEqual(linkRoute.query, route.query))
            return false;
    }

    if (props.exactHash && linkRoute.hash !== route.hash) {
        return false;
    }

    if (props.exact && isExactActive) {
        return true;
    }

    if (!props.exact && isActive) {
        return true;
    }

    return false;
}

function resolveLinkClass({ route, isActive, isExactActive }: any) {
    const active = isLinkActive({ route, isActive, isExactActive });

    if (props.raw) {
        return [props.class, active ? props.activeClass : props.inactiveClass];
    }

    return ui.value({ class: props.class, active, disabled: props.disabled });
}
</script>
