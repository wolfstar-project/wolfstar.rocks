<template>
	<!-- The wrapper holds the trailing glyph: AppLauncherItem has no slot after its text. -->
	<div class="relative">
		<AppLauncherItem
			:name="name"
			:description="description"
			:promoted="promoted"
			:aria-label="ariaLabel"
			:class="{ 'pe-10': hasTrailingGlyph }"
			v-bind="$attrs"
			@click="emit('select')"
		>
			<template #icon>
				<AppLauncherItemIcon
					:round="round"
					:class="{ '[&>img]:object-contain [&>img]:p-1': isWolfstarAvatar }"
					:style="iconBg ? { backgroundColor: iconBg } : undefined"
				>
					<NuxtImg v-if="avatar" :src="avatar" alt="" width="40" height="40" />
					<UIcon v-else-if="icon" :name="icon" class="size-5 text-newt-on-accent" />
				</AppLauncherItemIcon>
			</template>
		</AppLauncherItem>
		<span
			v-if="hasTrailingGlyph"
			class="pointer-events-none absolute inset-y-0 end-3 flex items-center text-newt-text-secondary"
			aria-hidden="true"
		>
			<UIcon v-if="showEye" name="discord:eye" class="size-[18px] max-md:hidden" />
			<UIcon
				v-if="showChevron"
				name="ph:caret-right-bold"
				class="hidden size-4 max-md:block"
			/>
		</span>
	</div>
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

defineOptions({ inheritAttrs: false });

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
const hasTrailingGlyph = computed(() => showEye || showChevron);

const ariaLabel = computed(() => {
	const parts = [name];
	if (promoted) parts.push(ts("discord.launcher.promoted"));
	if (description) parts.push(description);
	return parts.join(". ");
});
</script>
