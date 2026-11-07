<template>
	<div class="w-full">
		<div class="relative mx-auto w-full max-w-7xl">
			<SectionHeader
				:eyebrow="ts('marketing.staryl.features.eyebrow')"
				:title="ts('marketing.staryl.features.title')"
				:description="ts('marketing.staryl.features.description')"
				heading-id="staryl-features-heading"
				align="start"
				class="mb-12"
			/>

			<div id="notifications" class="scroll-mt-24">
				<div class="mb-8 text-left">
					<h3 class="mb-4 flex items-center gap-3 text-2xl font-bold text-base-content">
						<span
							class="flex size-10 items-center justify-center rounded-lg bg-primary/10"
							aria-hidden="true"
						>
							<UIcon name="ph:broadcast-fill" class="size-5 text-primary" />
						</span>
						{{ ts("marketing.staryl.features.notifications_title") }}
					</h3>
					<p class="max-w-prose text-base leading-relaxed text-base-content/70">
						{{ ts("marketing.staryl.features.notifications_description") }}
					</p>
				</div>

				<div class="grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-12">
					<div
						class="flex flex-col-reverse items-center gap-4 max-lg:order-last lg:flex-row"
					>
						<SurfaceCard padding="none" class="w-full overflow-hidden shadow-glow">
							<div class="staryl-showcase-channel">
								<UIcon
									name="ph:hash-bold"
									class="size-4.5 shrink-0"
									aria-hidden="true"
								/>
								<span class="text-[15px] font-semibold">{{ CHANNEL_NAME }}</span>
							</div>
							<div class="staryl-showcase-body">
								<DiscordMessages class="staryl-showcase-feed w-full text-left">
									<DiscordMessage
										name="staryl"
										:timestamp="ts('marketing.staryl.notification.timestamp')"
									>
										<template v-if="active.id === 'live'">
											<StarylLiveNotification />
										</template>
										<template v-else-if="active.id === 'ping'">
											<p class="mb-1">
												<DiscordMention kind="mention">{{
													ts("marketing.staryl.features.ping_role")
												}}</DiscordMention>
												{{ ts("marketing.staryl.notification.message") }}
											</p>
											<StarylLiveNotification />
										</template>
										<!-- `buildOfflineMessage()`: the stored message, the time, the postfix. -->
										<p v-else-if="active.id === 'offline'">
											{{ ts("marketing.staryl.features.offline_message") }} |
											<time
												class="staryl-showcase-time"
												:datetime="ENDED_AT"
												>{{ endedAtLabel }}</time
											>
											| {{ ts("marketing.staryl.notification.footer") }}
										</p>
										<template v-else>
											<p class="mb-1">
												🧪
												<strong>{{
													ts(
														"marketing.staryl.features.test_notice_label",
													)
												}}</strong>
												— {{ ts("marketing.staryl.features.test_notice") }}
											</p>
											<StarylLiveNotification :live="false" />
										</template>
									</DiscordMessage>
								</DiscordMessages>
							</div>
						</SurfaceCard>

						<div class="flex flex-row items-center gap-1 lg:flex-col">
							<button
								type="button"
								class="staryl-radio-arrow rotate-90 lg:rotate-180"
								:aria-label="ts('marketing.staryl.features.previous')"
								@click="advance(-1)"
							>
								<UIcon name="ph:caret-down-bold" aria-hidden="true" />
							</button>
							<label
								v-for="(kind, kindIndex) of kinds"
								:key="kind.id"
								class="staryl-radio-container"
								:data-tip="kind.title"
							>
								<input
									:id="`staryl-notification-${kind.id}`"
									v-model="activeIndex"
									type="radio"
									name="staryl-notification"
									class="staryl-radio"
									:value="kindIndex"
								/>
								<span class="sr-only">{{ kind.title }}</span>
							</label>
							<button
								type="button"
								class="staryl-radio-arrow -rotate-90 lg:rotate-0"
								:aria-label="ts('marketing.staryl.features.next')"
								@click="advance(1)"
							>
								<UIcon name="ph:caret-down-bold" aria-hidden="true" />
							</button>
						</div>
					</div>

					<div class="text-left" aria-live="polite">
						<h3
							class="mb-4 flex items-center gap-2 text-xl font-bold text-base-content"
						>
							<UIcon
								:name="active.icon"
								class="size-6 text-primary"
								aria-hidden="true"
							/>
							<span
								class="text-primary underline decoration-primary/30 underline-offset-4"
								>{{ active.title }}</span
							>
						</h3>
						<p class="text-base leading-relaxed text-base-content/70">
							{{ active.body }}
						</p>
						<p class="mt-4 text-sm text-muted">
							<i18n-t keypath="marketing.staryl.features.command_hint" tag="span">
								<template #command>
									<code class="staryl-showcase-command">{{
										active.command
									}}</code>
								</template>
							</i18n-t>
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const CHANNEL_NAME = "stream-alerts";
// The end of the stream the live notification announced, formatted in UTC so
// the server and the browser print the same.
const ENDED_AT = "2026-10-26T21:12:00Z";

const { ts } = useI18n();
const { locale } = useAppLocale();

// The four ways a notification reaches the channel, each with the command that sets it up.
const kinds = computed(() => [
	{
		id: "live",
		icon: "ph:broadcast-fill",
		title: ts("marketing.staryl.features.live_title"),
		body: ts("marketing.staryl.features.live_body"),
		command: "/subscriptions twitch add type:Stream Online",
	},
	{
		id: "ping",
		icon: "ph:at-bold",
		title: ts("marketing.staryl.features.ping_title"),
		body: ts("marketing.staryl.features.ping_body"),
		command: "/subscriptions twitch add message:",
	},
	{
		id: "offline",
		icon: "ph:moon-stars-fill",
		title: ts("marketing.staryl.features.offline_title"),
		body: ts("marketing.staryl.features.offline_body"),
		command: "/subscriptions twitch add type:Stream Offline",
	},
	{
		id: "test",
		icon: "ph:flask-fill",
		title: ts("marketing.staryl.features.test_title"),
		body: ts("marketing.staryl.features.test_body"),
		command: "/subscriptions twitch test",
	},
]);

const activeIndex = ref(0);
const active = computed(() => kinds.value[activeIndex.value] ?? kinds.value[0]!);

function advance(step: -1 | 1) {
	activeIndex.value = (activeIndex.value + step + kinds.value.length) % kinds.value.length;
}

const endedAtLabel = computed(() =>
	new Intl.DateTimeFormat(locale.value, {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(ENDED_AT)),
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.staryl-showcase-channel {
	@apply flex items-center gap-2.5 border-b px-5 py-3.5;
	background-color: var(--discord-chrome);
	border-color: var(--discord-chrome-border);
	box-shadow: 0 1px 0 var(--discord-chrome-edge);
	color: var(--discord-chrome-text);
}

.staryl-showcase-body {
	@apply p-5;
	--discord-surface: var(--discord-chrome);
	background-color: var(--discord-chrome);
}

/* No card inside the card: the message sits straight on the channel. */
.staryl-showcase-body .staryl-showcase-feed {
	@apply rounded-none;
	background-color: transparent;
	filter: none;
}

:deep(.staryl-showcase-feed .discord-message) {
	@apply rounded-lg px-0 py-2 sm:px-1;
	background-color: transparent;
}

/* Discord's timestamp chip, as `<t:…:f>` renders. */
.staryl-showcase-time {
	@apply rounded px-0.5;
	background-color: oklch(from var(--discord-chrome-muted) l c h / 0.15);
}

.staryl-showcase-command {
	@apply rounded px-1.5 py-0.5 font-mono text-[0.8125rem];
	background-color: oklch(from var(--color-base-content) l c h / 0.08);
}

/* The switcher of the WolfStar showcase: one dot per kind, with arrows. */
.staryl-radio-container {
	@apply tooltip tooltip-top lg:tooltip-right;
	display: inherit;
}

.staryl-radio {
	@apply size-3.5 cursor-pointer appearance-none rounded-full bg-base-content/15 sm:size-4;
	transition: background-color 0.25s linear;
}

.staryl-radio:not(:checked):hover {
	@apply bg-base-content/30;
}

.staryl-radio:checked {
	@apply bg-primary shadow-glow;
}

.staryl-radio-arrow {
	@apply inline-flex size-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-muted transition-colors hover:text-base-content;
}

@media not (hover: hover) {
	.staryl-radio,
	.staryl-radio-arrow {
		@apply size-5;
	}
}
</style>
