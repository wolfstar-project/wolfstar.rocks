<template>
	<Embed :color class="discord-embed" role="complementary" :aria-label="embedAriaLabel">
		<EmbedAuthor v-if="author">
			<EmbedAuthorIcon
				v-if="author.icon"
				:src="author.icon"
				:alt="`${author.name} avatar`"
				width="24"
				height="24"
				decoding="async"
			/>
			<EmbedAuthorName>{{ author.name }}</EmbedAuthorName>
		</EmbedAuthor>

		<EmbedTitle v-if="title">{{ title }}</EmbedTitle>

		<EmbedDescription v-if="$slots.default">
			<slot />
		</EmbedDescription>

		<EmbedFooter v-if="footer || timestampDate">
			<EmbedFooterIcon
				v-if="footer?.icon"
				:src="footer.icon"
				:alt="ts('discord.embed.footer_icon', { text: footer.text })"
				width="16"
				height="16"
				decoding="async"
			/>
			<span v-if="footer">{{ footer.text }}</span>
			<EmbedFooterSeparator v-if="footer && timestampDate" />
			<!-- The slot, since the part formats in `en-US` only. -->
			<EmbedTimestamp v-if="timestampDate" :date="timestampDate">{{
				formattedTimestamp
			}}</EmbedTimestamp>
		</EmbedFooter>
	</Embed>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface EmbedAuthorData {
	icon?: string;
	name: string;
}

interface EmbedFooterData {
	icon?: string;
	text: string;
}

interface EmbedProps {
	title?: string;
	color?: string;
	author?: EmbedAuthorData;
	footer?: EmbedFooterData;
	timestamp?: number | Date;
}

interface EmbedSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import {
	Embed,
	EmbedAuthor,
	EmbedAuthorIcon,
	EmbedAuthorName,
	EmbedDescription,
	EmbedFooter,
	EmbedFooterIcon,
	EmbedFooterSeparator,
	EmbedTimestamp,
	EmbedTitle,
} from "~/components/ui/embed";

const { ts } = useI18n();
defineSlots<EmbedSlots>();

const { title, color, author, footer, timestamp } = defineProps<EmbedProps>();

const timestampDate = computed(() => {
	if (timestamp === undefined) return undefined;
	return timestamp instanceof Date ? timestamp : new Date(timestamp);
});

const { timeLocale } = useAppLocale();

const formattedTimestamp = computed(() => {
	const date = timestampDate.value;
	if (!date || Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat(timeLocale.value, {
		dateStyle: "short",
		timeStyle: "short",
	}).format(date);
});

const embedAriaLabel = computed(() => {
	if (title) return ts("discord.embed.titled", { title });
	if (author?.name) return ts("discord.embed.from", { name: author.name });
	if (footer?.text) return ts("discord.embed.titled", { title: footer.text });
	return ts("discord.embed.generic");
});
</script>
