<template>
	<div
		class="my-2 flex max-w-130 text-sm leading-relaxed"
		:class="[isDarkTheme ? 'text-discord-light' : 'text-discord-dark']"
	>
		<div
			class="discord-embed"
			:style="{ 'border-color': color ?? 'var(--discord-embed-default-border)' }"
		>
			<div v-if="title" class="mb-2 text-base font-bold">{{ title }}</div>
			<div v-if="author" class="mt-2 flex items-center gap-2 text-base font-semibold">
				<nuxt-img
					v-if="author.icon"
					:src="author.icon"
					class="mr-2 h-6 w-6 rounded-full"
					:alt="`${author.name} avatar`"
				/>
				<span>{{ author.name }}</span>
			</div>
			<slot></slot>
			<div v-if="footer" class="mt-2 flex items-center gap-2 text-sm">
				<nuxt-img
					v-if="footer.icon"
					src="/avatars/wolfstar.png"
					width="16"
					height="16"
					class="h-4 w-4 rounded-full"
					alt="WolfStar footer icon"
				/>
				<span class="text-sm">
					{{ footer.text }}
					<span v-if="timestamp">• {{ dtf.format(timestamp) }}</span>
				</span>
			</div>
			<span v-else-if="timestamp" class="mt-2 text-sm">{{ dtf.format(timestamp) }}</span>
		</div>
	</div>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface EmbedAuthor {
	icon?: string;
	name: string;
}

interface EmbedFooter {
	icon?: string;
	text: string;
}

interface EmbedProps {
	title?: string;
	color?: string;
	author?: EmbedAuthor;
	footer?: EmbedFooter;
	timestamp?: number | Date;
	theme?: "light" | "dark";
}

interface EmbedSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<EmbedSlots>();

const { title, color, author, footer, timestamp, theme = "dark" } = defineProps<EmbedProps>();

const isDarkTheme = computed(() => theme !== "light");
const dtf = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "short" });
</script>

<style scoped>
@reference "@/assets/css/main.css";
.discord-embed {
	--discord-embed-default-border: #1e1f22;
	@apply mt-1 max-w-fit border-l-4 p-3 font-whitney;
	border-radius: 0.25rem;
	background-color: var(--color-base-200);
	background-color: oklch(from var(--color-base-200) calc(l - 0.02) c h);
}

/* Media features */
.discord-embed-media {
	@apply mt-4 max-h-75 max-w-75 rounded;
}

.discord-embed-text.light .discord-embed-media-video {
	@apply h-[225px];
}

.discord-embed-custom-emoji {
	@apply inline-block;
}

.discord-embed-custom-emoji-image {
	@apply h-4.5 w-4.5 align-bottom;
}
</style>
