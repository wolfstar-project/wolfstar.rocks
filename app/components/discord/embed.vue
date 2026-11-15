<template>
	<Embed :color class="discord-embed" role="complementary" :aria-label="embedAriaLabel">
		<EmbedAuthor v-if="author">
			<EmbedAuthorIcon
				v-if="author.icon"
				:as="NuxtImg"
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

		<EmbedFooter v-if="footer || timestamp !== undefined">
			<EmbedFooterIcon
				v-if="footer?.icon"
				:as="NuxtImg"
				:src="footer.icon"
				:alt="ts('discord.embed.footer_icon', { text: footer.text })"
				width="16"
				height="16"
				decoding="async"
			/>
			<span v-if="footer">{{ footer.text }}</span>
			<EmbedFooterSeparator v-if="footer && timestamp !== undefined" />
			<!-- In UTC on the server and in the browser, so hydration writes the same text. -->
			<EmbedTimestamp
				v-if="timestamp !== undefined"
				:date="timestamp"
				:locale="timeLocale"
				time-zone="UTC"
			/>
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
// The `as` prop takes a component, and `#components` types NuxtImg as a generic one.
const NuxtImg = resolveComponent("NuxtImg");
defineSlots<EmbedSlots>();

const { title, author, footer } = defineProps<EmbedProps>();

const { timeLocale } = useAppLocale();

const embedAriaLabel = computed(() => {
	if (title) return ts("discord.embed.titled", { title });
	if (author?.name) return ts("discord.embed.from", { name: author.name });
	if (footer?.text) return ts("discord.embed.titled", { title: footer.text });
	return ts("discord.embed.generic");
});
</script>
