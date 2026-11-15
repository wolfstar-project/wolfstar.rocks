<template>
	<AppLauncherItem
		:name="name"
		:description="description"
		:promoted="promoted"
		:promoted-label="ts('discord.launcher.promoted')"
		:aria-label="ariaLabel"
		@click="emit('select')"
	>
		<template #icon>
			<AppLauncherItemIcon
				:round="round"
				:fit="isWolfstarAvatar ? 'contain' : 'cover'"
				:class="{ 'p-1': isWolfstarAvatar }"
				:style="iconBg ? { backgroundColor: iconBg } : undefined"
			>
				<NuxtImg v-if="avatar" :src="avatar" alt="" width="40" height="40" />
				<UIcon v-else-if="icon" :name="icon" class="size-5 text-newt-on-accent" />
			</AppLauncherItemIcon>
		</template>
		<template v-if="showEye || showChevron" #trailing>
			<UIcon
				v-if="showEye"
				name="discord:eye"
				class="size-[18px] text-newt-text-secondary max-md:hidden"
				aria-hidden="true"
			/>
			<UIcon
				v-if="showChevron"
				name="ph:caret-right-bold"
				class="hidden size-4 text-newt-text-secondary max-md:block"
				aria-hidden="true"
			/>
		</template>
	</AppLauncherItem>
</template>

<script lang="ts">
interface AppLauncherListItemProps {
	name: string;
	description?: string;
	avatar?: string;
	icon?: string;
	iconBg?: string;
	promoted?: boolean;
	/** Bots use circular avatars; games and activities keep the squircle. */
	round?: boolean;
	/** Desktop-only preview glyph after the text. */
	showEye?: boolean;
	/** Mobile-only chevron after the text. */
	showChevron?: boolean;
}

interface AppLauncherListItemEmits {
	select: [];
}
</script>

<script setup lang="ts">
import { AppLauncherItem, AppLauncherItemIcon } from "~/components/ui/app-launcher";

const {
	name,
	description,
	avatar,
	icon,
	iconBg,
	promoted = false,
	round = false,
	showEye = true,
	showChevron = true,
} = defineProps<AppLauncherListItemProps>();

const emit = defineEmits<AppLauncherListItemEmits>();

const { ts } = useI18n();

const isWolfstarAvatar = computed(() => avatar === "/avatars/wolfstar.png");

// Full stops between the parts make a screen reader pause between them.
const ariaLabel = computed(() => {
	const parts = [name];
	if (promoted) parts.push(ts("discord.launcher.promoted"));
	if (description) parts.push(description);
	return parts.join(". ");
});
</script>
