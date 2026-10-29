<template>
	<span class="user-avatar">
		<UAvatar :src="src" alt="" icon="ic:round-person" :class="avatarClass" :size />
		<!-- The frame sits a little outside the avatar, as on Discord. -->
		<img v-if="decoration" :src="decoration" alt="" class="user-avatar-decoration" />
	</span>
</template>

<script setup lang="ts">
import type { AvatarProps } from "@nuxt/ui";

/** An avatar with the decoration its owner wears on Discord around it. */
const {
	src,
	decoration = null,
	size,
	avatarClass,
} = defineProps<{
	src?: string;
	/** URL of the avatar decoration, when the account has one. */
	decoration?: string | null;
	size?: AvatarProps["size"];
	avatarClass?: string;
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.user-avatar {
	@apply relative inline-flex shrink-0;
}

.user-avatar-decoration {
	@apply pointer-events-none absolute -inset-[10%] h-[120%] w-[120%] max-w-none;
}
</style>
