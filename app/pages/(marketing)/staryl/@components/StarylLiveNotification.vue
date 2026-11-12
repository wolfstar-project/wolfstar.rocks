<template>
	<!-- What `buildOnlineComponents()` sends (staryl, src/lib/utilities/twitch/notifications.ts). -->
	<DiscordV2Container accent-color="var(--twitch-brand)">
		<DiscordV2Section>
			<DiscordV2TextDisplay>
				<strong>{{ liveHeader }}</strong>
			</DiscordV2TextDisplay>
			<DiscordV2TextDisplay>
				<a
					class="staryl-live-notification-title"
					:href="STREAM_URL"
					target="_blank"
					rel="noopener noreferrer"
					>{{ title }}</a
				>
			</DiscordV2TextDisplay>
			<DiscordV2TextDisplay v-if="live">
				<strong>{{ ts("marketing.staryl.notification.game_label") }}</strong
				>{{ "\n" }}{{ ts("marketing.staryl.notification.game") }}
			</DiscordV2TextDisplay>
			<template #accessory>
				<!-- The game's box art; the streamer's avatar when there is no stream to describe. -->
				<DiscordV2Thumbnail
					v-if="live"
					src="/showcase/staryl/box-art.svg"
					:alt="ts('marketing.staryl.notification.box_art_alt')"
				/>
				<DiscordV2Thumbnail v-else src="/avatars/stella.png" />
			</template>
		</DiscordV2Section>
		<DiscordV2MediaGallery v-if="live" :items="previewItems" />
		<DiscordV2TextDisplay class="staryl-live-notification-footer">
			{{ ts("marketing.staryl.notification.footer") }} •
			<time :datetime="STARTED_AT">{{ startedAtLabel }}</time>
		</DiscordV2TextDisplay>
	</DiscordV2Container>
	<DiscordActionRow class="mt-2">
		<!-- Discord draws a link button grey, with the launch arrow. -->
		<DiscordButton
			variant="secondary"
			:disabled="false"
			:url="STREAM_URL"
			:label="ts('marketing.staryl.notification.watch')"
		/>
	</DiscordActionRow>
</template>

<script setup lang="ts">
import type { MediaGalleryItem } from "~/components/discord/v2/media-gallery.vue";

const { live = true } = defineProps<{
	/**
	 * Whether the streamer is live. A `/subscriptions twitch test` on a streamer who is not has
	 * no stream to describe: a placeholder title, the avatar, no game and no preview.
	 */
	live?: boolean;
}>();

const STREAMER = "Stella";
const STREAM_URL = "https://twitch.tv/stella";
// A fixed moment, formatted in UTC, so the server and the browser print the same.
const STARTED_AT = "2026-10-26T17:48:00Z";

const { ts } = useI18n();
const { locale } = useAppLocale();

const liveHeader = computed(() =>
	ts("marketing.staryl.notification.live_header", { name: STREAMER }),
);

const title = computed(() =>
	live
		? ts("marketing.staryl.notification.stream_title")
		: ts("marketing.staryl.notification.test_title"),
);

const startedAtLabel = computed(() =>
	new Intl.DateTimeFormat(locale.value, {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(STARTED_AT)),
);

const previewItems = computed<MediaGalleryItem[]>(() => [
	{
		src: "/showcase/staryl/stream-preview.svg",
		alt: ts("marketing.staryl.notification.preview_alt"),
		width: 1280,
		height: 720,
	},
]);
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* `### [title](url)`: a heading-sized link, in Discord's link colour. */
.staryl-live-notification-title {
	@apply text-base leading-snug font-bold hover:underline;
	color: var(--discord-link);
}

.staryl-live-notification-footer {
	@apply text-xs;
	color: var(--discord-chrome-muted);
}
</style>
