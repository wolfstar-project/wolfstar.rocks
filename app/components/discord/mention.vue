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
	 * Mentions are inline-flex chips. Do not add margin-inline-start here:
	 * callers already space with text / {{ " " }}, and DiscordEmbed restores
	 * gaps after bold labels via strong::after. A leading margin double-spaces
	 * showcase copy like "Dear @Baddie" and "❯ User: @baddie".
	 *
	 * The compact shape and solid hover state mirror Discord's user pills.
	 */
	@apply inline-flex items-center gap-0 font-whitney font-medium;
	/*
	 * `middle`, not `baseline`: this is an inline-flex box, so a `baseline`
	 * alignment is resolved from the first flex item. With an avatar that item
	 * is the <img>, whose synthesized baseline is its bottom edge, so the pill
	 * gets pushed ~5px above the text baseline and inflates the line box —
	 * embed rows with an avatar mention ended up taller than rows without one.
	 * `middle` aligns against the parent's x-height instead of the pill's own
	 * contents, so both variants occupy exactly the same line box.
	 */
	vertical-align: middle;
	margin: 0;
	min-height: 1.375rem;
	padding: 0 0.1875rem;
	border: 0;
	border-radius: 3px;
	outline: none;
	box-shadow: none;
	--discord-mention-bg: oklch(57.7% 0.209 273.88 / 0.3);
	--discord-mention-text: oklch(83% 0.08 275);
	--discord-mention-hover-bg: oklch(57.74% 0.2091 273.85);
	--discord-mention-hover-text: oklch(100% 0 0);
	--discord-mention-focus: oklch(83% 0.08 275);

	background-color: var(--discord-mention-bg);
	color: var(--discord-mention-text);
	line-height: 1.25rem;
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

.tag--with-avatar {
	@apply items-center;
}

.tag > .avatar {
	display: none;
	flex-shrink: 0;
	width: 1.25rem;
	height: 1.25rem;
	border-radius: 9999px;
	object-fit: cover;
}

@media (width >= 48rem) {
	.tag > .avatar {
		display: block;
		margin-inline-end: 0.1875rem;
	}

	.tag--with-avatar {
		padding: 0.0625rem 0.1875rem 0.0625rem 0.0625rem;
	}
}

.tag > .icon {
	@apply mr-0.5 inline-block h-3 w-3 -translate-y-0.5;
}
</style>
