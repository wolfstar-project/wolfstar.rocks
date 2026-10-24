<template>
	<!-- Single-line children: newlines between tags become text nodes inside the pill. -->
	<button
		class="discord-mention tag"
		type="button"
		:class="{ 'tag--with-avatar': Boolean(avatar) }"
	>
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
	/** User avatar URL. Shown on desktop (≥48rem) and hidden on mobile. */
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
	 * Mentions sit in the line like Discord's: an inline box as tall as the
	 * line it is in, on the text's baseline, with 2px of padding at the sides
	 * only. A taller chip (the old 22px inline-flex one) opened a gap above and
	 * below every embed row holding a mention and lifted its text off the
	 * baseline. Do not add margin-inline-start: callers already space with
	 * text / {{ " " }}, and DiscordEmbed restores gaps after bold labels via
	 * strong::after.
	 */
	@apply font-whitney font-medium;
	display: inline-block;
	vertical-align: baseline;
	margin: 0;
	padding: 0 0.125rem;
	border: 0;
	border-radius: 3px;
	outline: none;
	box-shadow: none;
	font-size: inherit;
	line-height: inherit;
	white-space: nowrap;
	--discord-mention-bg: oklch(57.7% 0.209 273.88 / 0.3);
	--discord-mention-text: oklch(83% 0.08 275);
	--discord-mention-hover-bg: oklch(57.74% 0.2091 273.85);
	--discord-mention-hover-text: oklch(100% 0 0);
	--discord-mention-focus: oklch(83% 0.08 275);

	background-color: var(--discord-mention-bg);
	color: var(--discord-mention-text);
}

:global([data-theme="light"] .discord-mention) {
	--discord-mention-bg: oklch(57.7% 0.209 273.88 / 0.25);
	--discord-mention-text: oklch(45.08% 0.281 265.53);
	--discord-mention-focus: oklch(45.08% 0.281 265.53);
}

.tag:focus {
	background-color: var(--discord-mention-bg);
	color: var(--discord-mention-text);
	outline: none;
	box-shadow: none;
}

@media (hover: hover) and (pointer: fine) {
	.tag:hover {
		background-color: var(--discord-mention-hover-bg);
		color: var(--discord-mention-hover-text);
	}
}

.tag:focus-visible {
	/*
	 * Keep the pill color stable (color/background inherit from :focus above),
	 * but restore a visible keyboard focus ring for WCAG 2.4.7.
	 */
	outline: 2px solid var(--discord-mention-focus);
	outline-offset: 2px;
}

/* The member's avatar, as Discord draws it in a mention: a small round
   picture set on the text, not a taller pill around it. */
.tag > .avatar {
	display: none;
	width: 1em;
	height: 1em;
	border-radius: 9999px;
	object-fit: cover;
}

@media (width >= 48rem) {
	.tag > .avatar {
		display: inline-block;
		margin-inline-end: 0.25em;
		vertical-align: -0.15em;
	}
}

.tag > .icon {
	@apply mr-0.5 inline-block h-3 w-3 -translate-y-0.5;
}
</style>
