<template>
	<div class="discord-markdown">
		<template v-for="(segment, segmentIndex) in segments" :key="segmentIndex">
			<ul v-if="Array.isArray(segment)" class="discord-markdown-list">
				<li v-for="(item, itemIndex) in segment" :key="itemIndex">
					<DashboardDiscordInline :parts="item.inline" />
				</li>
			</ul>
			<component
				:is="BLOCK_TAGS[segment.type]"
				v-else-if="segment.inline.length > 0"
				:class="`discord-markdown-${segment.type}`"
			>
				<DashboardDiscordInline :parts="segment.inline" />
			</component>
			<span v-else class="discord-markdown-gap" aria-hidden="true"></span>
		</template>
	</div>
</template>

<script lang="ts">
import type { DiscordBlock, DiscordBlockType } from "~/utils/discord-markdown";

// Every post heading is one level under the thread's name, whatever its size:
// a post's `###` alone must not skip a level.
const BLOCK_TAGS: Record<Exclude<DiscordBlockType, "bullet">, string> = {
	heading: "h3",
	line: "p",
	quote: "blockquote",
	subheading: "h3",
	subtext: "small",
	title: "h3",
};

type Segment = (DiscordBlock & { type: Exclude<DiscordBlockType, "bullet"> }) | DiscordBlock[];

/** The blocks, with each run of list items gathered into one list. */
function toSegments(blocks: readonly DiscordBlock[]): Segment[] {
	const segments: Segment[] = [];
	for (const block of blocks) {
		const last = segments.at(-1);
		if (block.type !== "bullet") segments.push(block as Exclude<Segment, DiscordBlock[]>);
		else if (Array.isArray(last)) last.push(block);
		else segments.push([block]);
	}
	return segments;
}
</script>

<script setup lang="ts">
/** A post's Discord markdown. Nothing in it is read as HTML. */
const { source } = defineProps<{
	/** Discord markdown, as `parseDiscordMarkdown()` reads it. */
	source: string;
}>();

const segments = computed(() => toSegments(parseDiscordMarkdown(source.trim())));
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-markdown {
	@apply flex flex-col gap-0.5 text-sm leading-normal break-words;
}

.discord-markdown-title {
	@apply mt-1 text-2xl font-bold;
}

.discord-markdown-heading {
	@apply mt-1 text-xl font-bold;
}

.discord-markdown-subheading {
	@apply mt-1 text-base font-bold;
}

.discord-markdown-list {
	@apply ms-5 list-disc;
}

.discord-markdown-quote {
	@apply border-s-4 border-default ps-3;
}

.discord-markdown-subtext {
	@apply text-xs text-muted;
}

.discord-markdown-gap {
	@apply block h-2;
}
</style>
