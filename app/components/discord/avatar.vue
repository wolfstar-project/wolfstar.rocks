<template>
  <div class="discord-message-avatar-wrapper" :class="size.classes" role="img" :aria-label="`${profile.name}'s avatar`">
    <nuxt-img v-if="profile.app" :src="`/avatars/${user}.png`" :width="size.dimensions" :height="size.dimensions" :alt="`${profile.name} avatar`" />
    <UIcon v-else-if="user === 'baddie'" name="ph:smiley-angry-fill" class="discord-message-avatar baddie size-full" aria-hidden="true" />
    <UIcon v-else name="ph:shooting-star-fill" class="h-full w-full text-info" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import type { ProfileName } from "~/utils/constants";
import { computed } from "vue";
import { Profiles } from "~/utils/constants";

const props = defineProps<{ user: ProfileName; size: SizeKey }>();

const Sizes = {
  tiny: { dimensions: 16, classes: "h-4 w-4" },
  medium: { dimensions: 48, classes: "h-8 w-8 md:h-12 md:w-12" },
} as const;

type SizeKey = keyof typeof Sizes;

const profile = computed(() => Profiles[props.user]);
const size = computed(() => Sizes[props.size]);
</script>

<style scoped>
@reference "@/assets/css/main.css";
.discord-message-avatar-wrapper {
	@apply flex-none select-none overflow-hidden rounded-full;
}

.discord-message-avatar.baddie {
	filter: drop-shadow(0 0 0.2rem oklch(var(--er) / 0.4));
}

.discord-message-avatar.baddie :deep(path) {
	@apply fill-error;
}
</style>
