<template>
	<div
		class="discord-embed"
		:class="{ 'discord-embed--light': !isDarkTheme }"
		role="complementary"
		:aria-label="embedAriaLabel"
	>
		<div
			class="discord-embed-left-border"
			:style="{ backgroundColor: color ?? 'var(--discord-embed-default-border)' }"
		/>
		<div class="discord-embed-wrapper">
			<div class="discord-embed-grid">
				<div v-if="author" class="discord-embed-author">
					<NuxtImg
						v-if="author.icon"
						:src="author.icon"
						class="discord-embed-author-image"
						width="24"
						height="24"
						:alt="`${author.name} avatar`"
						decoding="async"
					/>
					<span class="discord-embed-author-name">{{ author.name }}</span>
				</div>

				<div v-if="title" class="discord-embed-title">{{ title }}</div>

				<div v-if="$slots.default" class="discord-embed-description">
					<slot />
				</div>

				<div v-if="footer || timestamp" class="discord-embed-footer">
					<NuxtImg
						v-if="footer?.icon"
						:src="footer.icon"
						class="discord-embed-footer-image"
						width="16"
						height="16"
						:alt="`Footer icon for ${footer.text}`"
						decoding="async"
					/>
					<span class="discord-embed-footer-content">
						<span v-if="footer">{{ footer.text }}</span>
						<span
							v-if="footer && timestamp"
							class="discord-embed-footer-separator"
							aria-hidden="true"
							>•</span
						>
						<time v-if="timestamp" :datetime="timestampIso">{{
							formattedTimestamp
						}}</time>
					</span>
				</div>
			</div>
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

const timestampDate = computed(() => {
	if (timestamp === undefined) return undefined;
	return timestamp instanceof Date ? timestamp : new Date(timestamp);
});

const timestampIso = computed(() => timestampDate.value?.toISOString());

const dtf = new Intl.DateTimeFormat("en-US", {
	dateStyle: "short",
	timeStyle: "short",
});

const formattedTimestamp = computed(() => {
	const date = timestampDate.value;
	if (!date || Number.isNaN(date.getTime())) return "";
	return dtf.format(date);
});

const embedAriaLabel = computed(() => {
	if (title) return `Embed: ${title}`;
	if (author?.name) return `Embed from ${author.name}`;
	if (footer?.text) return `Embed: ${footer.text}`;
	return "Discord embed";
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

/*
 * Structure mirrors skyra-project/discord-components DiscordEmbed:
 * left 4px accent bar + rounded content card (max 520px).
 * Colors use Discord brand tokens as oklch CSS vars (allow-listed under discord/).
 */
.discord-embed {
	/* Discord dark embed chrome */
	--discord-embed-default-border: oklch(24% 0.005 264);
	--discord-embed-bg: oklch(26.5% 0.006 264);
	--discord-embed-border: oklch(27% 0.006 264 / 0.6);
	--discord-embed-text: oklch(89% 0.005 264);
	--discord-embed-title: oklch(100% 0 0);
	--discord-embed-author: oklch(100% 0 0);
	--discord-embed-footer: oklch(74% 0.01 264);
	--discord-embed-footer-separator: oklch(89% 0.005 264);
	--discord-embed-code-bg: oklch(21% 0.005 264);
	--discord-embed-code-text: oklch(89% 0.005 264);
	--discord-embed-quote-bar: oklch(42% 0.01 264);
	--discord-embed-link: oklch(72% 0.14 230);

	/*
	 * Discord sits the embed flush under the author row (≈0–2px). Avoid
	 * skyra’s my-2 (8px) outer gap — keep only a small bottom margin for
	 * “(edited)” / stacked content under the card.
	 */
	@apply mt-0 mb-1 flex max-w-[520px] font-whitney;
	color: var(--discord-embed-text);
	font-size: 0.875rem;
	line-height: 1.125rem;
}

.discord-embed--light {
	--discord-embed-default-border: oklch(91% 0.005 264);
	--discord-embed-bg: oklch(96% 0.003 264);
	--discord-embed-border: oklch(80% 0 0 / 0.3);
	--discord-embed-text: oklch(28% 0.01 264);
	--discord-embed-title: oklch(12% 0.005 264);
	--discord-embed-author: oklch(12% 0.005 264);
	--discord-embed-footer: oklch(52% 0.02 250);
	--discord-embed-footer-separator: oklch(42% 0.01 264);
	--discord-embed-code-bg: oklch(94% 0.005 264);
	--discord-embed-code-text: oklch(28% 0.01 264);
	--discord-embed-quote-bar: oklch(82% 0.01 250);
	--discord-embed-link: oklch(62% 0.16 230);
}

.discord-embed-left-border {
	flex-shrink: 0;
	width: 4px;
	border-radius: 4px 0 0 4px;
	background-color: var(--discord-embed-default-border);
}

.discord-embed-wrapper {
	display: grid;
	max-width: 520px;
	justify-self: start;
	align-self: start;
	box-sizing: border-box;
	border: 1px solid var(--discord-embed-border);
	border-radius: 0 4px 4px 0;
	background-color: var(--discord-embed-bg);
}

.discord-embed-grid {
	display: inline-grid;
	grid-template-columns: auto;
	grid-template-rows: auto;
	grid-auto-flow: row;
	row-gap: 0;
	min-width: 0;
	min-height: 0;
	padding: 0.5rem 1rem 1rem 0.75rem;
	text-indent: 0;
}

.discord-embed-author {
	display: flex;
	align-items: center;
	grid-column: 1 / 1;
	min-width: 0;
	margin-top: 8px;
	color: var(--discord-embed-author);
	font-size: 0.875rem;
	font-weight: 600;
	line-height: 1.375rem;
}

.discord-embed-author-image {
	flex-shrink: 0;
	width: 24px;
	height: 24px;
	margin-right: 8px;
	border-radius: 50%;
	object-fit: cover;
}

.discord-embed-author-name {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.discord-embed-title {
	display: inline-block;
	grid-column: 1 / 1;
	min-width: 0;
	margin-top: 8px;
	color: var(--discord-embed-title);
	font-size: 1rem;
	font-weight: 600;
	line-height: 1.375rem;
}

.discord-embed-description {
	grid-column: 1 / 1;
	min-width: 0;
	margin-top: 8px;
	font-size: 0.875rem;
	font-weight: 400;
	line-height: 1.125rem;
	overflow-wrap: break-word;
	word-wrap: break-word;
}

.discord-embed-footer {
	display: flex;
	align-items: center;
	grid-column: 1 / 1;
	min-width: 0;
	margin-top: 8px;
	color: var(--discord-embed-footer);
	font-size: 0.75rem;
	font-weight: 500;
	line-height: 1rem;
}

.discord-embed-footer-image {
	flex-shrink: 0;
	width: 16px;
	height: 16px;
	margin-right: 8px;
	border-radius: 50%;
	object-fit: cover;
}

.discord-embed-footer-content {
	display: inline-flex;
	flex-wrap: wrap;
	align-items: center;
	min-width: 0;
}

/* Middle dot — Discord footer separator (not a vertical bar) */
.discord-embed-footer-separator {
	display: inline-block;
	margin: 0 4px;
	color: var(--discord-embed-footer-separator);
	font-weight: 500;
}

/* Description markdown chrome (slot content keeps caller scope) */
.discord-embed-description :deep(a) {
	color: var(--discord-embed-link);
	font-weight: 400;
	text-decoration: none;
}

.discord-embed-description :deep(a:hover) {
	text-decoration: underline;
}

.discord-embed-description :deep(strong),
.discord-embed-description :deep(b) {
	font-weight: 600;
}

.discord-embed-description :deep(em),
.discord-embed-description :deep(i) {
	font-style: italic;
}

/* Discord inline code pill */
.discord-embed-description :deep(code) {
	padding: 0.2em;
	border-radius: 3px;
	background-color: var(--discord-embed-code-bg);
	color: var(--discord-embed-code-text);
	font-family:
		Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter",
		"DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco,
		"Courier New", Courier, monospace;
	font-size: 0.85em;
	line-height: 1.125rem;
	white-space: pre-wrap;
}

/* Discord blockquote: 4px bar + padded content (skyra discord-quote) */
.discord-embed-description :deep(blockquote) {
	display: flex;
	margin: 0;
	padding: 0;
}

.discord-embed-description :deep(blockquote)::before {
	flex-shrink: 0;
	width: 4px;
	margin: 0;
	border-radius: 4px;
	background-color: var(--discord-embed-quote-bar);
	content: "";
}

.discord-embed-description :deep(blockquote > *) {
	padding: 0 8px 0 12px;
}
</style>

<!--
  Unscoped on purpose: slot content keeps the caller scope id, so a scoped
  :deep(strong)::after does not always win in DevTools / cascade. Vue's
  whitespace:condense also drops spaces between </strong> and following nodes.
-->
<style>
.discord-embed .discord-embed-description strong::after {
	content: " ";
}
</style>
