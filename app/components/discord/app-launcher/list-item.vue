<template>
	<button
		type="button"
		class="discord-app-launcher-list-item"
		:aria-label="ariaLabel"
		@click="emit('select')"
	>
		<span
			class="discord-app-launcher-list-item-icon"
			:class="{
				'discord-app-launcher-list-item-icon--wolfstar': avatar === '/avatars/wolfstar.png',
			}"
			:style="iconBg ? { backgroundColor: iconBg } : undefined"
			aria-hidden="true"
		>
			<NuxtImg
				v-if="avatar"
				:src="avatar"
				:alt="`${name} icon`"
				width="40"
				height="40"
				class="discord-app-launcher-list-item-avatar"
				:class="{
					'discord-app-launcher-list-item-avatar--wolfstar':
						avatar === '/avatars/wolfstar.png',
				}"
			/>
			<StarIcon v-else-if="icon" :name="icon" class="discord-app-launcher-list-item-glyph" />
		</span>

		<span class="discord-app-launcher-list-item-body">
			<span class="discord-app-launcher-list-item-title-row">
				<span class="discord-app-launcher-list-item-name">{{ name }}</span>
				<StarIcon
					v-if="showEye"
					name="discord:eye"
					class="discord-app-launcher-list-item-eye"
					aria-hidden="true"
				/>
				<span v-if="promoted" class="discord-app-launcher-list-item-promoted">
					PROMOTED
				</span>
			</span>
			<span v-if="description" class="discord-app-launcher-list-item-description">
				{{ description }}
			</span>
		</span>

		<StarIcon
			name="ph:caret-right-bold"
			class="discord-app-launcher-list-item-chevron"
			aria-hidden="true"
		/>
	</button>
</template>

<script lang="ts">
interface AppLauncherListItemProps {
	name: string;
	description?: string;
	avatar?: string;
	icon?: string;
	iconBg?: string;
	promoted?: boolean;
	showEye?: boolean;
}

interface AppLauncherListItemEmits {
	select: [];
}
</script>

<script setup lang="ts">
const {
	name,
	description,
	avatar,
	icon,
	iconBg,
	promoted = false,
	showEye = true,
} = defineProps<AppLauncherListItemProps>();

const emit = defineEmits<AppLauncherListItemEmits>();

const ariaLabel = computed(() => {
	const parts = [name];
	if (promoted) parts.push("Promoted");
	if (description) parts.push(description);
	return parts.join(". ");
});
</script>

<style scoped>
.discord-app-launcher-list-item {
	/* Discord row tokens: #35373c hover, #f2f3f5 name, #949ba4 body, #b5bac1 glyphs. */
	--discord-app-launcher-list-item-hover: oklch(31.4% 0.006 272.93);
	--discord-app-launcher-list-item-name: oklch(96.2% 0.002 272.93);
	--discord-app-launcher-list-item-description: oklch(71.01% 0.01 273.13);
	--discord-app-launcher-list-item-eye: oklch(80.5% 0.008 273.13);
	--discord-app-launcher-list-item-icon-bg: oklch(32% 0.01 264);
	--discord-app-launcher-list-item-wolfstar-bg: oklch(0% 0 0);
	--discord-app-launcher-list-item-promoted-bg: oklch(91.56% 0.004 272.93);
	--discord-app-launcher-list-item-promoted-text: oklch(26.65% 0.006 272.93);
	--discord-app-launcher-list-item-chevron: oklch(80.5% 0.008 273.13);

	@apply gap-3 rounded-lg px-2 py-2 font-whitney flex w-full cursor-pointer items-center border-0 bg-transparent text-left;
}

.discord-app-launcher-list-item:hover,
.discord-app-launcher-list-item:focus-visible {
	background-color: var(--discord-app-launcher-list-item-hover);
}

.discord-app-launcher-list-item:focus-visible {
	@apply outline-primary outline-2 outline-offset-1;
}

.discord-app-launcher-list-item-icon {
	@apply size-10 inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[10px];
	background-color: var(--discord-app-launcher-list-item-icon-bg);
}

.discord-app-launcher-list-item-icon--wolfstar {
	background-color: var(--discord-app-launcher-list-item-wolfstar-bg);
}

.discord-app-launcher-list-item-avatar {
	@apply size-full object-cover;
}

.discord-app-launcher-list-item-avatar--wolfstar {
	@apply p-1 object-contain;
}

.discord-app-launcher-list-item-glyph {
	@apply size-5 text-white;
}

.discord-app-launcher-list-item-body {
	@apply min-w-0 gap-0.5 flex flex-1 flex-col;
}

.discord-app-launcher-list-item-title-row {
	@apply min-w-0 gap-1.5 flex items-center;
}

.discord-app-launcher-list-item-name {
	@apply text-base leading-tight font-medium truncate;
	color: var(--discord-app-launcher-list-item-name);
}

.discord-app-launcher-list-item-eye {
	@apply size-[18px] shrink-0;
	color: var(--discord-app-launcher-list-item-eye);
}

.discord-app-launcher-list-item-promoted {
	@apply px-1.5 py-0.5 font-bold tracking-wide shrink-0 rounded-full text-[10px] leading-none uppercase;
	background-color: var(--discord-app-launcher-list-item-promoted-bg);
	color: var(--discord-app-launcher-list-item-promoted-text);
}

.discord-app-launcher-list-item-description {
	@apply text-sm leading-snug truncate;
	color: var(--discord-app-launcher-list-item-description);
}

.discord-app-launcher-list-item-chevron {
	@apply size-4 hidden shrink-0;
	color: var(--discord-app-launcher-list-item-chevron);
}

@media (width < 48rem) {
	.discord-app-launcher-list-item-eye {
		display: none;
	}

	.discord-app-launcher-list-item-chevron {
		display: block;
	}

	.discord-app-launcher-list-item-icon {
		@apply rounded-[10px];
	}

	.discord-app-launcher-list-item-name {
		@apply font-bold text-[15px];
	}

	.discord-app-launcher-list-item-description {
		@apply text-[13px];
	}
}
</style>
