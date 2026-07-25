<template>
	<div class="avatar" :class="{ 'avatar-placeholder': !src, online: chip === true || chip === 'online', offline: chip === 'offline' }">
		<div :class="cn('rounded-full', avatarSizeClass(size))">
			<img v-if="src" :src="src" :alt="alt ?? ''" />
			<span
				v-else
				class="flex h-full w-full items-center justify-center bg-neutral text-neutral-content text-xs font-medium"
			>
				{{ initials }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
import { avatarSizeClass, type UiSize } from "~/utils/ui-classes";

const props = withDefaults(
	defineProps<{
		src?: string;
		alt?: string;
		size?: UiSize;
		chip?: boolean | "online" | "offline";
		text?: string;
	}>(),
	{
		size: "md",
	},
);

const initials = computed(() => {
	if (props.text) return props.text.slice(0, 2).toUpperCase();
	const label = props.alt?.trim();
	if (!label) return "?";
	const parts = label.split(/\s+/).filter(Boolean);
	const first = parts[0]?.[0] ?? "";
	const second = parts[1]?.[0] ?? "";
	return `${first}${second}`.toUpperCase() || "?";
});
</script>
