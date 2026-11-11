<template>
	<template v-for="(part, index) in parts" :key="index">
		<component :is="FORMAT_TAGS[part.type]" v-if="'children' in part">
			<DashboardDiscordInline :parts="part.children" />
		</component>
		<InlineCode v-else-if="part.type === 'code'">{{ part.content }}</InlineCode>
		<a
			v-else-if="part.type === 'link'"
			:href="part.url"
			target="_blank"
			rel="noopener noreferrer"
			class="text-newt-text-link hover:underline"
			>{{ part.content }}</a
		>
		<img
			v-else-if="part.type === 'emoji'"
			:src="part.url"
			:alt="`:${part.name}:`"
			width="22"
			height="22"
			loading="lazy"
			class="discord-inline-emoji"
		/>
		<Timestamp
			v-else-if="part.type === 'time'"
			:value="new Date(part.at)"
			:format="TIME_STYLES[part.style]"
			:locale="timeLocale"
		/>
		<!-- Disabled: a mention here opens nothing, so it stays out of the tab order. -->
		<Mention
			v-else-if="part.type === 'mention'"
			:variant="part.kind === 'channel' ? 'channel' : 'user'"
			disabled
			class="disabled:cursor-default"
			>{{ part.kind === "channel" ? "#" : "@" }}{{ part.name }}</Mention
		>
		<template v-else>{{ part.content }}</template>
	</template>
</template>

<script lang="ts">
import type { TimestampStyle } from "~/components/ui/timestamp";
import type { DiscordFormat, DiscordInline, DiscordTimeStyle } from "~/utils/discord-markdown";

const FORMAT_TAGS: Record<DiscordFormat, string> = {
	bold: "strong",
	italic: "em",
	strike: "s",
	underline: "u",
};

/** Discord's `<t:…>` style letters, as newt/ui's timestamp names them. */
const TIME_STYLES: Record<DiscordTimeStyle, TimestampStyle> = {
	D: "longDate",
	F: "longDateTime",
	R: "relative",
	T: "longTime",
	d: "shortDate",
	f: "shortDateTime",
	t: "shortTime",
};
</script>

<script setup lang="ts">
import { InlineCode } from "~/components/ui/inline-code";
import { Mention } from "~/components/ui/mention";
import { Timestamp } from "~/components/ui/timestamp";

/** The formatted text of one line of Discord markdown, drawn with newt/ui. */
const { parts } = defineProps<{ parts: readonly DiscordInline[] }>();

const { timeLocale } = useAppLocale();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-inline-emoji {
	@apply inline-block size-5.5 align-text-bottom;
}
</style>
