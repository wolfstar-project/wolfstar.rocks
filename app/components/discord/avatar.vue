<template>
	<Avatar
		class="discord-message-avatar-wrapper select-none"
		:class="[size.classes, !profile.app && 'bg-transparent']"
		role="img"
		:aria-label="`${profile.name}'s avatar`"
	>
		<AvatarImage
			v-if="profile.app"
			:src="`/avatars/${user}.png`"
			:width="size.dimensions"
			:height="size.dimensions"
		/>
		<AvatarFallback v-else>
			<UIcon
				v-if="user === 'baddie'"
				name="ph:smiley-angry-fill"
				class="size-full text-error drop-shadow-[0_0_0.2rem_color-mix(in_oklab,var(--color-error)_40%,transparent)]"
				aria-hidden="true"
			/>
			<UIcon
				v-else
				name="ph:shooting-star-fill"
				class="size-full text-info"
				aria-hidden="true"
			/>
		</AvatarFallback>
	</Avatar>
</template>

<script lang="ts">
type AvatarSizeKey = "medium" | "tiny";

interface AvatarProps {
	user: ProfileName;
	size: AvatarSizeKey;
}
</script>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

const { user, size: sizeKey } = defineProps<AvatarProps>();

const Sizes = {
	medium: { classes: "h-8 w-8 md:h-12 md:w-12", dimensions: 48 },
	tiny: { classes: "h-4 w-4", dimensions: 16 },
} as const;

const profile = computed(() => Profiles[user]);
const size = computed(() => Sizes[sizeKey]);
</script>
