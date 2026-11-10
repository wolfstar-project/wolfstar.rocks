<template>
	<template v-for="(part, index) in parts" :key="index">
		<strong v-if="part.type === 'bold'">{{ part.content }}</strong>
		<em v-else-if="part.type === 'italic'">{{ part.content }}</em>
		<u v-else-if="part.type === 'underline'">{{ part.content }}</u>
		<s v-else-if="part.type === 'strike'">{{ part.content }}</s>
		<code v-else-if="part.type === 'code'" class="discord-inline-code">{{ part.content }}</code>
		<ULink
			v-else-if="part.type === 'link'"
			:to="part.url"
			external
			target="_blank"
			rel="noopener noreferrer"
			class="text-primary underline-offset-2 hover:underline"
			>{{ part.content }}</ULink
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
		<time v-else-if="part.type === 'time'" :datetime="part.at" class="discord-inline-time">{{
			formatTime(part.at, part.style)
		}}</time>
		<UBadge
			v-else-if="part.type === 'mention'"
			color="primary"
			variant="soft"
			size="sm"
			class="discord-inline-mention"
			>{{ part.kind === "channel" ? "#" : "@" }}{{ part.name }}</UBadge
		>
		<template v-else>{{ part.content }}</template>
	</template>
</template>

<script lang="ts">
import type { DiscordInline, DiscordTimeStyle } from "~/utils/discord-markdown";

const TIME_STYLES: Record<Exclude<DiscordTimeStyle, "R">, Intl.DateTimeFormatOptions> = {
	D: { dateStyle: "long" },
	F: { dateStyle: "full", timeStyle: "short" },
	T: { timeStyle: "medium" },
	d: { dateStyle: "short" },
	f: { dateStyle: "long", timeStyle: "short" },
	t: { timeStyle: "short" },
};
</script>

<script setup lang="ts">
/** The formatted text of one line of Discord markdown. */
const { parts } = defineProps<{ parts: readonly DiscordInline[] }>();

const { timeLocale } = useAppLocale();
const now = useNow({ scheduler: (cb) => useIntervalFn(cb, 60_000) });

function formatTime(at: string, style: DiscordTimeStyle): string {
	if (style === "R") return formatActivityTime(at, now.value, timeLocale.value);
	return new Date(at).toLocaleString(timeLocale.value, TIME_STYLES[style]);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-inline-code {
	@apply rounded-[4px] bg-elevated px-1 py-px font-mono text-[0.8125rem];
}

.discord-inline-emoji {
	@apply inline-block size-5.5 align-text-bottom;
}

.discord-inline-time {
	@apply rounded-[4px] bg-elevated px-1;
}

.discord-inline-mention {
	@apply align-baseline font-semibold;
}
</style>
