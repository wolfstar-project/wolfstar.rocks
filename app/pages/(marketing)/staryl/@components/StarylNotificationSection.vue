<template>
	<Section
		id="staryl-notification"
		labelled-by="staryl-notification-heading"
		scroll-margin
		spacing="none"
		class="pb-28"
	>
		<div class="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
			<SectionHeader
				:eyebrow="ts('marketing.staryl.notification.eyebrow')"
				:title="ts('marketing.staryl.notification.title')"
				:description="ts('marketing.staryl.notification.description')"
				heading-id="staryl-notification-heading"
				align="start"
			/>

			<SurfaceCard padding="none" class="w-full overflow-hidden shadow-glow">
				<div class="staryl-notification-channel">
					<UIcon name="ph:hash-bold" class="size-4.5 shrink-0" aria-hidden="true" />
					<span class="text-[15px] font-semibold">{{ CHANNEL_NAME }}</span>
				</div>
				<div class="staryl-notification-body">
					<DiscordMessages class="staryl-notification-feed w-full text-left">
						<DiscordMessage
							name="staryl"
							:timestamp="ts('marketing.staryl.notification.timestamp')"
						>
							<p class="mb-1">{{ ts("marketing.staryl.notification.message") }}</p>
							<!-- What `buildOnlineComponents()` sends (staryl, src/lib/utilities/twitch/notifications.ts). -->
							<DiscordV2Container accent-color="var(--twitch-brand)">
								<DiscordV2Section>
									<DiscordV2TextDisplay>
										<strong>{{ liveHeader }}</strong>
									</DiscordV2TextDisplay>
									<DiscordV2TextDisplay>
										<a
											class="staryl-notification-title"
											:href="STREAM_URL"
											target="_blank"
											rel="noopener noreferrer"
											>{{
												ts("marketing.staryl.notification.stream_title")
											}}</a
										>
									</DiscordV2TextDisplay>
									<DiscordV2TextDisplay>
										<strong>{{
											ts("marketing.staryl.notification.game_label")
										}}</strong
										>{{ "\n" }}{{ ts("marketing.staryl.notification.game") }}
									</DiscordV2TextDisplay>
									<template #accessory>
										<DiscordV2Thumbnail
											src="/showcase/staryl/box-art.svg"
											:alt="ts('marketing.staryl.notification.box_art_alt')"
										/>
									</template>
								</DiscordV2Section>
								<DiscordV2MediaGallery :items="previewItems" />
								<DiscordV2TextDisplay class="staryl-notification-footer">
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
						</DiscordMessage>
					</DiscordMessages>
				</div>
			</SurfaceCard>
		</div>
	</Section>
</template>

<script setup lang="ts">
import type { MediaGalleryItem } from "~/components/discord/v2/media-gallery.vue";

const CHANNEL_NAME = "stream-alerts";
const STREAMER = "Stella";
const STREAM_URL = "https://twitch.tv/stella";
// A fixed moment, formatted in UTC, so the server and the browser print the same.
const STARTED_AT = "2026-10-26T17:48:00Z";

const { ts } = useI18n();
const { locale } = useAppLocale();

const liveHeader = computed(() =>
	ts("marketing.staryl.notification.live_header", { name: STREAMER }),
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

.staryl-notification-channel {
	@apply flex items-center gap-2.5 border-b px-5 py-3.5;
	background-color: var(--discord-chrome);
	border-color: var(--discord-chrome-border);
	box-shadow: 0 1px 0 var(--discord-chrome-edge);
	color: var(--discord-chrome-text);
}

.staryl-notification-body {
	@apply p-5;
	--discord-surface: var(--discord-chrome);
	background-color: var(--discord-chrome);
}

/* No card inside the card: the message sits straight on the channel. */
.staryl-notification-body .staryl-notification-feed {
	@apply rounded-none;
	background-color: transparent;
	filter: none;
}

:deep(.staryl-notification-feed .discord-message) {
	@apply rounded-lg px-0 py-2 sm:px-1;
	background-color: transparent;
}

/* `### [title](url)`: a heading-sized link, in Discord's link colour. */
.staryl-notification-title {
	@apply text-base leading-snug font-bold hover:underline;
	color: var(--discord-link);
}

.staryl-notification-footer {
	@apply text-xs;
	color: var(--discord-chrome-muted);
}
</style>
