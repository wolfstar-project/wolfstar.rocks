<template>
	<Avatar
		class="discord-message-avatar-wrapper select-none"
		:class="[sizeEntry.class, !profile.app && 'bg-transparent']"
		:size="sizeEntry.size"
		role="img"
		:aria-label="ts('discord.avatar.label', { name: profile.name })"
	>
		<AvatarImage
			v-if="profile.app"
			:src="`/avatars/${user}.png`"
			:width="sizeEntry.dimensions"
			:height="sizeEntry.dimensions"
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

interface AvatarSizeEntry {
	size: AvatarVariants["size"];
	class?: string;
	/** Intrinsic size of the image, the largest box it fills. */
	dimensions: number;
}

/** `medium` is a message avatar: 32px on a phone, 48px from `md` up. `tiny` is a reply line. */
const Sizes = {
	medium: { size: "md", class: "md:size-12", dimensions: 48 },
	tiny: { size: "xs", dimensions: 16 },
} as const satisfies Record<AvatarSizeKey, AvatarSizeEntry>;
</script>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage, type AvatarVariants } from "~/components/ui/avatar";

const { ts } = useI18n();
const { user, size: sizeKey } = defineProps<AvatarProps>();

const profile = computed(() => Profiles[user]);
const sizeEntry = computed<AvatarSizeEntry>(() => Sizes[sizeKey]);
</script>
