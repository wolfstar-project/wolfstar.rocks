<template>
	<div class="showcase-markdown">
		<component
			:is="BLOCK_TAGS[block.type]"
			v-for="(block, blockIndex) in blocks"
			:key="blockIndex"
			:class="`showcase-markdown-${block.type}`"
		>
			<template v-for="(part, partIndex) in block.inline" :key="partIndex">
				<strong v-if="part.type === 'bold'">{{ part.content }}</strong>
				<code v-else-if="part.type === 'code'" class="showcase-markdown-code">{{
					part.content
				}}</code>
				<DiscordMention
					v-else-if="part.type === 'mention'"
					:kind="part.kind === 'channel' ? 'channel' : 'mention'"
					>{{ part.name }}</DiscordMention
				>
				<template v-else>
					<template
						v-for="(piece, pieceIndex) in splitEmoji(part.content)"
						:key="pieceIndex"
						><UIcon
							v-if="piece.icon"
							:name="piece.icon"
							class="showcase-markdown-emoji"
							aria-hidden="true"
						/><template v-else>{{ piece.text }}</template></template
					>
				</template>
			</template>
		</component>
	</div>
</template>

<script lang="ts">
import type { DiscordBlockType } from "~/utils/discord-markdown";

interface ShowcaseMarkdownProps {
	/** Discord markdown, as `parseDiscordMarkdown()` reads it. */
	source: string;
}

const BLOCK_TAGS: Record<DiscordBlockType, string> = {
	bullet: "p",
	heading: "h3",
	line: "p",
	subtext: "small",
};

/** The emojis the replies use, drawn as Twemoji like Discord does. */
const EMOJI_ICONS: Record<string, string> = {
	"✅": "twemoji:check-mark-button",
	"📎": "twemoji:paperclip",
	"🏷️": "twemoji:label",
};

const EMOJI_PATTERN = /(✅|📎|🏷️)/;
</script>

<script setup lang="ts">
import { parseDiscordMarkdown } from "~/utils/discord-markdown";

const { source } = defineProps<ShowcaseMarkdownProps>();

const blocks = computed(() => parseDiscordMarkdown(source));

function splitEmoji(text: string) {
	return text
		.split(EMOJI_PATTERN)
		.filter((piece) => piece.length > 0)
		.map((piece) => ({ icon: EMOJI_ICONS[piece], text: piece }));
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.showcase-markdown {
	@apply flex flex-col;
}

.showcase-markdown > * {
	@apply m-0;
}

.showcase-markdown-heading {
	@apply text-xl leading-6 font-bold;
}

.showcase-markdown-bullet {
	@apply relative pl-4;
}

.showcase-markdown-bullet::before {
	@apply absolute left-1;
	content: "•";
}

.showcase-markdown-subtext {
	@apply text-[0.8125rem] leading-4;
	color: var(--discord-chrome-muted);
}

/* Discord's inline code: a slightly blue chip on the channel, without a border. */
.showcase-markdown-code {
	@apply rounded px-1 py-0.5 font-mono text-[0.85em] leading-none;
	--showcase-code-surface: oklch(
		from var(--discord-chrome) calc(l + 0.05 * var(--discord-raise)) calc(c + 0.02) 280
	);
	background-color: var(--showcase-code-surface);
}

.showcase-markdown-emoji {
	@apply mx-0.5 inline-block size-[1.1em] align-[-0.15em];
}
</style>
