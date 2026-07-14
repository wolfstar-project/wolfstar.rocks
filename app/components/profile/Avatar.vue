<template>
	<div class="avatar" :class="{ 'avatar-placeholder': isDefault }">
		<div
			class="flex items-center justify-center rounded-full ring-base-300 ring-offset-base-100"
			:class="{
				'transition-transform duration-300 group-hover:scale-105': !effectiveReduceMotion,
			}"
		>
			<NuxtImg
				v-if="isDefault"
				:src="defaultAvatar"
				alt="Default Avatar"
				class="h-full w-full object-cover"
				:width="128"
				:height="128"
				format="png"
				loading="lazy"
				decoding="async"
				crossorigin="anonymous"
			/>
			<NuxtImg
				v-else
				:src="createUrl(preferredFormat, 256)"
				:format="preferredFormat === 'gif' ? undefined : 'webp'"
				:width="128"
				:height="128"
				sizes="128px"
				:alt="`${user?.global_name ?? user?.username} avatar`"
				class="h-full w-full object-cover"
				loading="lazy"
				decoding="async"
				crossorigin="anonymous"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { RESTGetAPICurrentUserResult } from "discord-api-types/v10";

interface ProfileAvatarProps {
	user: RESTGetAPICurrentUserResult | null | undefined;
	effectiveReduceMotion?: boolean;
}

const { user, effectiveReduceMotion = false } = defineProps<ProfileAvatarProps>();

const isDefault = ref(false);
const isAnimated = ref(false);

const preferredFormat = computed<"gif" | "png">(() => {
	if (isAnimated.value && !effectiveReduceMotion) {
		return "gif";
	}

	return "png";
});

const defaultAvatar = computed(() =>
	user?.id
		? `https://cdn.discordapp.com/embed/avatars/${BigInt(user.id) % 5n}.png`
		: "https://cdn.discordapp.com/embed/avatars/0.png",
);

function createUrl(format: "webp" | "png" | "gif", size: number) {
	return `https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.${format}?size=${size}`;
}

watch(
	() => user,
	(currentUser) => {
		if (currentUser?.avatar) {
			isDefault.value = false;
			isAnimated.value = currentUser.avatar.startsWith("a_");
		} else {
			isDefault.value = true;
			isAnimated.value = false;
		}
	},
	{ immediate: true },
);
</script>
