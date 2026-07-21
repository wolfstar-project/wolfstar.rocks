<template>
	<!-- Single-line children: newlines between tags become text nodes inside the pill. -->
	<button class="tag" type="button" :class="{ 'tag--with-avatar': Boolean(avatar) }">
		<img
			v-if="avatar"
			class="avatar"
			:src="avatar"
			alt=""
			width="16"
			height="16"
			aria-hidden="true"
			decoding="async"
		/><span v-if="kind === 'mention'" aria-hidden="true">@</span
		><LazyIconsApp
			v-else-if="kind === 'app' && !avatar"
			class="icon"
			aria-hidden="true"
		/><slot></slot>
	</button>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface MentionProps {
	kind?: "mention" | "app";
	/** User avatar URL. Shown on desktop (≥48rem) only; hidden on mobile. */
	avatar?: string;
}

interface MentionSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<MentionSlots>();

const { kind = "mention", avatar } = defineProps<MentionProps>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
.tag {
	/*
	 * Mentions are inline-flex chips. Do not add margin-inline-start here:
	 * callers already space with text / {{ " " }}, and DiscordEmbed restores
	 * gaps after bold labels via strong::after. A leading margin double-spaces
	 * showcase copy like "Dear @Baddie" and "❯ User: @baddie".
	 *
	 * Stable Discord mention look: no hover/focus lighten or white outline.
	 */
	@apply inline-flex items-baseline gap-0 rounded-sm px-1 py-0.5 font-whitney font-medium;
	vertical-align: baseline;
	margin: 0;
	border: 0;
	outline: none;
	box-shadow: none;
	background-color: oklch(57.7% 0.209 273.88 / 0.3);
	color: oklch(83% 0.08 275);

	@media (prefers-color-scheme: light) {
		background-color: oklch(57.7% 0.209 273.88 / 0.15);
		color: oklch(45.08% 0.281 265.53);
	}
}

.tag:hover,
.tag:focus,
.tag:focus-visible {
	/* Keep mention colors stable — Discord does not bleach the pill on hover. */
	background-color: oklch(57.7% 0.209 273.88 / 0.3);
	color: oklch(83% 0.08 275);
	outline: none;
	box-shadow: none;

	@media (prefers-color-scheme: light) {
		background-color: oklch(57.7% 0.209 273.88 / 0.15);
		color: oklch(45.08% 0.281 265.53);
	}
}

.tag--with-avatar {
	@apply items-center;
}

/*
 * Avatar is desktop-only (same 48rem breakpoint as channel header / message).
 * Kept in the DOM on mobile but visually hidden so layout stays CSS-driven.
 */
.tag > .avatar {
	display: none;
	flex-shrink: 0;
	width: 1rem;
	height: 1rem;
	border-radius: 9999px;
	object-fit: cover;
}

@media (width >= 48rem) {
	.tag > .avatar {
		display: block;
		/* ~4px gap between avatar and @Username */
		margin-inline-end: 0.25rem;
	}

	.tag--with-avatar {
		/* Avatar flush/near-flush with left pill edge; keep right padding after text. */
		padding-inline-start: 0;
		padding-inline-end: 0.25rem;
		padding-block: 0;
	}
}

.tag > .icon {
	@apply mr-0.5 inline-block h-3 w-3 -translate-y-0.5;
}
</style>
