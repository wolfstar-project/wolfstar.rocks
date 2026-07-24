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
			<UIcon v-else-if="icon" :name="icon" class="discord-app-launcher-list-item-glyph" />
		</span>

		<span class="discord-app-launcher-list-item-body">
			<span class="discord-app-launcher-list-item-title-row">
				<span class="discord-app-launcher-list-item-name">{{ name }}</span>
				<UIcon
					v-if="showEye"
					name="ph:eye-bold"
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

		<UIcon
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
	/** Discord eye affordance next to the title (details / preview). */
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
@reference "@/assets/css/main.css";

.discord-app-launcher-list-item {
	--discord-app-launcher-list-item-hover: rgb(59 58 63);
	--discord-app-launcher-list-item-name: oklch(100% 0 0);
	--discord-app-launcher-list-item-description: oklch(68% 0.012 273);
	--discord-app-launcher-list-item-eye: oklch(68% 0.012 273);
	--discord-app-launcher-list-item-icon-bg: oklch(32% 0.01 264);
	--discord-app-launcher-list-item-wolfstar-bg: oklch(0% 0 0);
	--discord-app-launcher-list-item-promoted-bg: oklch(91.56% 0.004 272.93);
	--discord-app-launcher-list-item-promoted-text: oklch(26.65% 0.006 272.93);
	--discord-app-launcher-list-item-chevron: oklch(68% 0.012 273);

	@apply flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-2 text-left font-whitney;
}

.discord-app-launcher-list-item:hover,
.discord-app-launcher-list-item:focus-visible {
	background-color: var(--discord-app-launcher-list-item-hover);
}

.discord-app-launcher-list-item:focus-visible {
	@apply outline-2 outline-offset-1 outline-primary;
}

.discord-app-launcher-list-item-icon {
	@apply inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl;
	background-color: var(--discord-app-launcher-list-item-icon-bg);
}

.discord-app-launcher-list-item-icon--wolfstar {
	background-color: var(--discord-app-launcher-list-item-wolfstar-bg);
}

.discord-app-launcher-list-item-avatar {
	@apply size-full object-cover;
}

.discord-app-launcher-list-item-avatar--wolfstar {
	@apply object-contain p-1;
}

.discord-app-launcher-list-item-glyph {
	@apply size-5 text-white;
}

.discord-app-launcher-list-item-body {
	@apply flex min-w-0 flex-1 flex-col gap-0.5;
}

.discord-app-launcher-list-item-title-row {
	@apply flex min-w-0 items-center gap-1.5;
}

.discord-app-launcher-list-item-name {
	@apply truncate text-[15px] leading-tight font-semibold;
	color: var(--discord-app-launcher-list-item-name);
}

.discord-app-launcher-list-item-eye {
	@apply size-[18px] shrink-0;
	color: var(--discord-app-launcher-list-item-eye);
}

.discord-app-launcher-list-item-promoted {
	@apply shrink-0 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wide uppercase;
	background-color: var(--discord-app-launcher-list-item-promoted-bg);
	color: var(--discord-app-launcher-list-item-promoted-text);
}

.discord-app-launcher-list-item-description {
	@apply truncate text-[13px] leading-snug;
	color: var(--discord-app-launcher-list-item-description);
}

/* Mobile Discord list rows use a trailing chevron instead of the eye. */
.discord-app-launcher-list-item-chevron {
	@apply hidden size-4 shrink-0;
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
		@apply text-[15px] font-bold;
	}

	.discord-app-launcher-list-item-description {
		@apply text-[13px];
	}
}
</style>
