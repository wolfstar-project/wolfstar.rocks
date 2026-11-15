<template>
	<!-- What `buildSocialComponents()` sends (staryl, src/lib/utilities/social/notifications.ts). -->
	<DiscordV2Container :accent-color="card.accentColor">
		<!-- An account's card carries its avatar; a feed has none, so its lines stand alone. -->
		<DiscordV2Section v-if="card.avatar">
			<DiscordV2TextDisplay>
				<strong>{{ card.header }}</strong>
			</DiscordV2TextDisplay>
			<DiscordV2TextDisplay>{{ card.body }}</DiscordV2TextDisplay>
			<template #accessory>
				<DiscordV2Thumbnail :src="card.avatar" />
			</template>
		</DiscordV2Section>
		<template v-else>
			<DiscordV2TextDisplay>
				<strong>{{ card.header }}</strong>
			</DiscordV2TextDisplay>
			<DiscordV2TextDisplay v-if="card.title">
				<a
					class="staryl-social-notification-title"
					:href="card.url"
					target="_blank"
					rel="noopener noreferrer"
					>{{ card.title }}</a
				>
			</DiscordV2TextDisplay>
			<DiscordV2TextDisplay>{{ card.body }}</DiscordV2TextDisplay>
		</template>
		<DiscordV2TextDisplay class="staryl-social-notification-footer">
			{{ card.footer }} •
			<time :datetime="PUBLISHED_AT">{{ publishedAtLabel }}</time>
		</DiscordV2TextDisplay>
	</DiscordV2Container>
	<DiscordActionRow class="mt-2">
		<DiscordButton
			variant="secondary"
			:disabled="false"
			:url="card.url"
			:label="card.linkLabel"
		/>
	</DiscordActionRow>
</template>

<script setup lang="ts">
const { kind } = defineProps<{
	/** `feed`: an item of an RSS or Atom feed. `post`: a post of a Bluesky account. */
	kind: "feed" | "post";
}>();

// A fixed moment, formatted in UTC, so the server and the browser print the same.
const PUBLISHED_AT = "2026-10-26T16:30:00Z";
// The site's own feed (`server/routes/blog/rss.xml.ts`) and one of its articles.
const FEED_NAME = "The WolfStar Blog";
const ARTICLE_TITLE = "WolfStar v7";
const ARTICLE_URL = "https://wolfstar.rocks/blog/wolfstar-v7";
const ACCOUNT_NAME = "Stella";
const POST_URL = "https://bsky.app/profile/stella.bsky.social";

const { ts } = useI18n();
const { locale } = useAppLocale();

const card = computed(() =>
	kind === "feed"
		? {
				accentColor: "var(--rss-brand)",
				avatar: null,
				body: ts("marketing.staryl.notification.feed_body"),
				footer: ts("marketing.staryl.notification.feed_footer"),
				header: ts("marketing.staryl.notification.feed_header", { name: FEED_NAME }),
				linkLabel: ts("marketing.staryl.notification.feed_read"),
				title: ARTICLE_TITLE,
				url: ARTICLE_URL,
			}
		: {
				accentColor: "var(--bluesky-brand)",
				avatar: "/avatars/stella.png",
				body: ts("marketing.staryl.notification.post_body"),
				footer: ts("marketing.staryl.notification.post_footer"),
				header: ts("marketing.staryl.notification.post_header", { name: ACCOUNT_NAME }),
				linkLabel: ts("marketing.staryl.notification.post_view"),
				title: null,
				url: POST_URL,
			},
);

const publishedAtLabel = computed(() =>
	new Intl.DateTimeFormat(locale.value, {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(PUBLISHED_AT)),
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* `### [title](url)`: a heading-sized link, in Discord's link colour. */
.staryl-social-notification-title {
	@apply text-base leading-snug font-bold hover:underline;
	color: var(--discord-link);
}

.staryl-social-notification-footer {
	@apply text-xs;
	color: var(--discord-chrome-muted);
}
</style>
