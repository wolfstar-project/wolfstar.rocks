<template>
	<Markdown
		class="post-markdown text-newt-text-message"
		:content="keyed.content"
		:heading-offset="postHeadingOffset(keyed.content)"
		:resolve-mention="mentionName"
		:resolve-emoji="emojiURL"
		:locale="timeLocale"
		:labels="labels"
		:link-warning="false"
	/>
</template>

<script setup lang="ts">
import { Markdown, type MarkdownLabels } from "~/components/ui/markdown";

/**
 * The Discord markdown of a post or of an embed, drawn with newt/ui's
 * `Markdown`. Nothing in it is read as HTML.
 */
const { source } = defineProps<{
	/** Discord markdown, its mentions already resolved to names by the server. */
	source: string;
}>();

const { ts } = useI18n();
const { timeLocale } = useAppLocale();

const keyed = computed(() => keyMentions(blankEmptyFormatting(source.trim())));

function mentionName(_kind: string, id: string) {
	const name = keyed.value.names.get(id);
	return name === undefined ? undefined : { name };
}

// The words newt/ui's markdown writes itself, translated. Its warning before a
// masked link stays off: a masked link opens in a new tab, with its address as
// its title, as it did before.
const labels = computed<Partial<MarkdownLabels>>(() => ({
	spoiler: ts("dashboard.dm.markdown.spoiler"),
	unknownChannel: ts("dashboard.dm.markdown.unknown_channel"),
	unknownRole: ts("dashboard.dm.markdown.unknown_role"),
	unknownUser: ts("dashboard.dm.markdown.unknown_user"),
}));

/** A server emoji's image on Discord's CDN: newt/ui fetches none itself. */
function emojiURL(emoji: { id: string; animated: boolean }): string {
	return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "webp"}?size=48`;
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* Mentions and commands sit in the line as Discord draws them: the text's own
   size and height, a little padding and 3px corners, where the registry's chip
   is a taller box of its own. */
.post-markdown
	:deep(
		:is(
			[data-variant="user"],
			[data-variant="channel"],
			[data-variant="role"],
			[data-variant="app"]
		)
	) {
	@apply inline min-h-0 rounded-[3px] px-0.5 py-0 align-baseline;
	font-size: inherit;
	line-height: inherit;
}
</style>
