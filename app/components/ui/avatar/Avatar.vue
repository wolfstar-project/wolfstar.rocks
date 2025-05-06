<template>
  <AvatarBase :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })" :style="props.style">
    <nuxt-img
      v-if="src && !error"
      role="img"
      :src="src"
      :alt="alt"
      :width="sizePx"
      :height="sizePx"
      v-bind="$attrs"
      :class="ui.image({ class: props.ui?.image })"
      @error="onError"
    />

    <slot v-else>
      <Icon v-if="icon" :name="icon" :class="ui.icon({ class: props.ui?.icon })" />
      <AvatarFallback v-else :class="ui.fallback({ class: props.ui?.fallback })">{{ fallback || '&nbsp;' }}</AvatarFallback>
    </slot>
  </AvatarBase>
</template>

<script setup lang="ts">
import type { AvatarProps } from '.'
import { Icon } from '@/components/ui/icon'
import { computed, ref } from 'vue'
import { AvatarBase, AvatarFallback, avatarVariant } from '.'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
  shape: 'circle',
  as: 'span',
})

const { size } = useAvatarGroup(props)

const ui = computed(() =>
  avatarVariant({
    size: size.value,
  }),
)

const sizePx = computed(
  () =>
    ({
      '3xs': 16,
      '2xs': 20,
      'xs': 24,
      'sm': 28,
      'md': 32,
      'lg': 36,
      'xl': 40,
      '2xl': 44,
      '3xl': 48,
    })[props.size || 'md'],
)

const error = ref(false)

const fallback = computed(
  () =>
    props.fallback
    || (props.alt || '')
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2),
)

function onError() {
  error.value = true
}
</script>
