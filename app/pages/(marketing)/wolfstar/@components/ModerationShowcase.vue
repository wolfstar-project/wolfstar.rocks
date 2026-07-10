<!-- oxlint-disable vue/no-template-shadow -->
<template>
	<div class="w-full">
		<div class="relative mx-auto min-h-100 w-full max-w-7xl">
			<div v-for="(feature, index) in features" :key="feature.id" class="animate-fade-in">
				<div v-if="activeFeature === index">
					<div :id="feature.id" class="scroll-mt-24">
						<div class="mb-8 text-left">
							<h3
								class="mb-4 flex items-center gap-3 text-2xl font-bold text-base-content"
							>
								<div
									class="flex size-10 items-center justify-center rounded-lg bg-primary/10"
								>
									<UIcon
										:name="feature.icon"
										class="size-5 text-primary"
										aria-hidden="true"
									/>
								</div>
								{{ feature.title }}
							</h3>
							<p
								class="mb-6 max-w-prose text-[15px] leading-relaxed text-base-content/80"
							>
								{{ feature.description }}
							</p>
							<UButton to="#" color="neutral" variant="outline" class="w-fit">
								Learn more about {{ feature.label }}
							</UButton>
						</div>

						<template v-if="feature.id === 'moderation-tools'">
							<section
								class="grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-12"
							>
								<div
									class="flex flex-col-reverse items-center gap-4 max-lg:order-last lg:flex-row"
								>
									<SurfaceCard
										padding="none"
										class="showcase-surface-shield w-full overflow-hidden shadow-glow"
									>
										<div class="showcase-channel-header">
											<UIcon
												name="ph:folder-fill"
												class="size-4.5 shrink-0 text-muted"
												aria-hidden="true"
											/>
											<span
												class="text-[15px] font-semibold text-base-content"
												>automod-demo</span
											>
											<span class="text-xs text-muted">— WolfStar HQ</span>
										</div>
										<div class="showcase-card-body p-5">
											<DiscordMessages
												class="showcase-discord-feed w-full text-left"
											>
												<template
													v-if="featureIndex === AutomodFeature.Spam"
												>
													<DiscordMessage
														v-for="n in 2"
														:key="n"
														name="baddie"
													>
														Guys look at me!
													</DiscordMessage>
												</template>
												<DiscordMessage
													:name="
														featureIndex === AutomodFeature.Reactions
															? 'stella'
															: 'baddie'
													"
													:class="{
														'text-error':
															featureIndex !==
															AutomodFeature.Reactions,
													}"
												>
													<template
														v-if="
															featureIndex ===
															AutomodFeature.Attachments
														"
													>
														Have you seen this????
														<div
															class="grid max-w-96 grid-cols-2 gap-2"
														>
															<div
																v-for="placeholder in 4"
																:key="placeholder"
																class="flex aspect-video w-full items-center justify-center card-glass rounded-lg"
															>
																<UIcon
																	name="ph:image-duotone"
																	class="size-16 animate-pulse text-base-content/20 sm:size-24"
																	aria-hidden="true"
																/>
															</div>
														</div>
													</template>
													<template
														v-else-if="
															featureIndex === AutomodFeature.Capitals
														"
													>
														I CAN TALK IN ALL UPPER CASES,
														<strong
															>AND WOLFSTAR WILL NOT STOP ME!</strong
														>
													</template>
													<template
														v-else-if="
															featureIndex === AutomodFeature.Invites
														"
													>
														Everyone join my server!
														<NuxtLink
															to="https://discord.gg/gqAnRyUXG8"
															class="text-info"
														>
															https://discord.gg/gqAnRyUXG8
														</NuxtLink>
														<LazyDiscordInvite
															link="https://discord.gg/gqAnRyUXG8"
														/>
													</template>
													<template
														v-else-if="
															featureIndex === AutomodFeature.Links
														"
													>
														Everyone check out those links!
														<ul class="ml-5 list-disc">
															<li>
																<span class="text-info"
																	>https://definitely-not-pishing.com</span
																>
															</li>
															<li>
																<span class="text-info"
																	>https://redundant-spam-links.net</span
																>
															</li>
															<li>
																<span class="text-info"
																	>https://too-many-links.com</span
																>
															</li>
															<li>
																<span class="text-info"
																	>https://trojan-horse.xyz</span
																>
															</li>
															<li>
																<span class="text-info"
																	>https://not-a-virus.com</span
																>
															</li>
														</ul>
													</template>
													<template
														v-else-if="
															featureIndex === AutomodFeature.Mentions
														"
													>
														Everyone notice me!
														<DiscordMention kind="mention"
															>everyone</DiscordMention
														>
														<DiscordMention kind="mention"
															>members</DiscordMention
														>{{ " "
														}}<DiscordMention kind="mention"
															>moderators</DiscordMention
														>
													</template>
													<template
														v-else-if="
															featureIndex === AutomodFeature.Newlines
														"
													>
														Hehehehe
														<br />
														<br />
														<br />
														<br />
														<br />
														<br />
														<br />
														So many lines!
													</template>
													<template
														v-else-if="
															featureIndex ===
															AutomodFeature.Reactions
														"
													>
														Hey folks! I have great news to share!
														<LazyDiscordReactions>
															<LazyDiscordReaction :count="7" self>
																<UIcon
																	name="ph:cheers-fill"
																	class="text-success"
																	aria-hidden="true"
																/>
															</LazyDiscordReaction>
															<LazyDiscordReaction
																:count="1"
																class="text-error"
															>
																<UIcon
																	name="ph:knife-fill"
																	aria-hidden="true"
																/>
															</LazyDiscordReaction>
														</LazyDiscordReactions>
													</template>
													<template
														v-else-if="
															featureIndex === AutomodFeature.Spam
														"
													>
														Guys look at me!
													</template>
													<template
														v-else-if="
															featureIndex === AutomodFeature.Words
														"
													>
														I would like to say that you're a
														<strong>disgusting</strong> person.
													</template>
												</DiscordMessage>
												<DiscordMessage name="wolfstar">
													Dear
													<DiscordMention kind="mention"
														>Baddie</DiscordMention
													>,
													{{ texts[featureIndex]!.alert }}
												</DiscordMessage>
											</DiscordMessages>
										</div>
									</SurfaceCard>

									<div class="flex flex-row items-center gap-1 lg:flex-col">
										<button
											type="button"
											class="radio-feature-arrow rotate-90 lg:rotate-180"
											aria-label="Previous automod feature"
											@click="advanceFeatureIndex(-1)"
										>
											<UIcon name="ph:caret-down-bold" aria-hidden="true" />
										</button>
										<label
											v-for="(text, automodIndex) of texts"
											:key="automodIndex"
											class="radio-feature-container"
											:data-tip="text.tooltip"
										>
											<input
												v-model="featureIndex"
												type="radio"
												name="automod-feature"
												class="radio-feature"
												:value="automodIndex"
											/>
											<span class="sr-only">{{ text.tooltip }}</span>
										</label>
										<button
											type="button"
											class="radio-feature-arrow -rotate-90 lg:rotate-0"
											aria-label="Next automod feature"
											@click="advanceFeatureIndex(1)"
										>
											<UIcon name="ph:caret-down-bold" aria-hidden="true" />
										</button>
									</div>
								</div>

								<div class="showcase-copy text-left">
									<h3
										class="mb-4 flex items-center gap-2 text-xl font-bold text-base-content"
									>
										<UIcon
											name="ph:shield-fill"
											class="size-6 text-primary"
											aria-hidden="true"
										/>
										WolfStar can act on
										<span
											class="text-primary underline decoration-primary/30 underline-offset-4"
											>{{ texts[featureIndex]!.title }}</span
										>
									</h3>

									<p class="text-[15px] leading-relaxed text-base-content/80">
										Enjoy the power of moderation with WolfStar, a fully
										customizable moderation bot for your server.
									</p>

									<p
										class="mt-4 text-[15px] leading-relaxed text-base-content/80"
									>
										You can define what WolfStar should do on every infraction:
									</p>
									<ul class="mt-3 space-y-2 text-[15px] text-base-content/80">
										<li class="flex items-start gap-2">
											<UIcon
												name="ph:arrow-u-up-left"
												class="mt-0.5 size-4 shrink-0"
												aria-hidden="true"
											/>
											<span
												><strong class="text-base-content"
													>Alert the user:</strong
												>
												send a message notifying the user of their
												infraction.</span
											>
										</li>
										<li class="flex items-start gap-2">
											<UIcon
												name="ph:flag-fill"
												class="mt-0.5 size-4 shrink-0 text-warning"
												aria-hidden="true"
											/>
											<span
												><strong class="text-base-content"
													>Post moderation log:</strong
												>
												send a message to the moderation log channel for
												moderators to see.</span
											>
										</li>
										<li class="flex items-start gap-2">
											<UIcon
												name="ph:trash-simple-fill"
												class="mt-0.5 size-4 shrink-0 text-error"
												aria-hidden="true"
											/>
											<span
												><strong class="text-base-content"
													>Delete the message:</strong
												>
												delete the message that triggered the infraction,
												keeping your channels clean.</span
											>
										</li>
									</ul>

									<p
										class="mt-4 text-[15px] leading-relaxed text-base-content/80"
									>
										And even what WolfStar should do after repeated infractions!
									</p>
									<ul class="mt-3 space-y-2 text-[15px] text-base-content/80">
										<li class="flex items-start gap-2">
											<UIcon
												name="ph:shield-check-duotone"
												class="mt-0.5 size-4 shrink-0 text-primary"
												aria-hidden="true"
											/>
											<span
												><strong class="text-base-content"
													>Define the punishment action:</strong
												>
												from a simple warning to a full ban, and everything
												in between, with a customizable
												<strong>punishment duration</strong> ranging from
												seconds to even years, or permanent.</span
											>
										</li>
										<li class="flex items-start gap-2">
											<UIcon
												name="ph:hourglass-duotone"
												class="mt-0.5 size-4 shrink-0"
												aria-hidden="true"
											/>
											<span
												><strong class="text-base-content"
													>Define the threshold:</strong
												>
												how many infractions are needed within a period of
												time before the punishment is applied.</span
											>
										</li>
									</ul>
								</div>
							</section>

							<ModerationLogsShowcase />
						</template>

						<template v-else-if="feature.id === 'advanced-logging'">
							<section
								class="grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-12"
							>
								<div class="flex flex-col items-center gap-4 lg:flex-row">
									<SurfaceCard
										padding="none"
										class="showcase-surface-shield w-full overflow-hidden shadow-glow"
									>
										<div class="showcase-channel-header">
											<UIcon
												name="ph:folder-fill"
												class="size-4.5 shrink-0 text-muted"
												aria-hidden="true"
											/>
											<span
												class="text-[15px] font-semibold text-base-content"
												>server-logs</span
											>
											<span class="text-xs text-muted">— WolfStar HQ</span>
										</div>
										<div class="showcase-card-body p-5">
											<DiscordMessages
												class="showcase-discord-feed w-full text-left"
											>
												<DiscordMessage name="wolfstar">
													<DiscordEmbed
														:color="loggingEvents[loggingIndex]!.color"
														:author="{
															icon: '/avatars/wolfstar.png',
															name: 'WolfStar#9286 (854714837388755004)',
														}"
														:footer="{
															icon: '/avatars/wolfstar.png',
															text: `Log #${123456 + loggingIndex}`,
														}"
														:timestamp
													>
														<span
															><strong>❯ Action:</strong>
															{{
																loggingEvents[loggingIndex]!.action
															}}</span
														><br />
														<span
															v-for="(detail, idx) in loggingEvents[
																loggingIndex
															]!.details"
															:key="idx"
														>
															<strong>❯ {{ detail.label }}:</strong>
															<span
																class="showcase-embed-detail-parts"
																><template
																	v-for="(
																		part, partIdx
																	) in detail.parts"
																	:key="partIdx"
																	><DiscordMention
																		v-if="
																			part.type === 'mention'
																		"
																		kind="mention"
																		>{{
																			part.name
																		}}</DiscordMention
																	><DiscordRole
																		v-else-if="
																			part.type === 'role'
																		"
																		:color="part.color"
																		>{{
																			part.name
																		}}</DiscordRole
																	><template
																		v-else-if="
																			part.type === 'roles'
																		"
																		><template
																			v-for="(
																				role, roleIdx
																			) in part.items"
																			:key="role.name"
																			><span
																				v-if="roleIdx > 0"
																				>, </span
																			><DiscordRole
																				:color="role.color"
																				>{{
																					role.name
																				}}</DiscordRole
																			></template
																		></template
																	><template v-else>{{
																		part.content
																	}}</template></template
																></span
															><br />
														</span>
													</DiscordEmbed>
												</DiscordMessage>
											</DiscordMessages>
										</div>
									</SurfaceCard>

									<div class="flex flex-row items-center gap-1 lg:flex-col">
										<button
											type="button"
											class="radio-feature-arrow rotate-90 lg:rotate-180"
											aria-label="Previous logging event"
											@click="advanceLoggingIndex(-1)"
										>
											<UIcon name="ph:caret-down-bold" aria-hidden="true" />
										</button>
										<label
											v-for="(event, loggingEventIndex) of loggingEvents"
											:key="loggingEventIndex"
											class="radio-feature-container"
											:data-tip="event.tooltip"
										>
											<input
												v-model="loggingIndex"
												type="radio"
												name="logging-feature"
												class="radio-feature"
												:value="loggingEventIndex"
											/>
											<span class="sr-only">{{ event.tooltip }}</span>
										</label>
										<button
											type="button"
											class="radio-feature-arrow -rotate-90 lg:rotate-0"
											aria-label="Next logging event"
											@click="advanceLoggingIndex(1)"
										>
											<UIcon name="ph:caret-down-bold" aria-hidden="true" />
										</button>
									</div>
								</div>

								<div class="showcase-copy text-left">
									<h3
										class="mb-4 flex items-center gap-2 text-xl font-bold text-base-content"
									>
										<UIcon
											:name="
												loggingEvents[loggingIndex]!.icon ??
												'ph:binoculars-duotone'
											"
											class="size-6 text-primary"
											aria-hidden="true"
										/>
										Keep track of
										<span
											class="text-primary underline decoration-primary/30 underline-offset-4"
											>{{ loggingEvents[loggingIndex]!.title }}</span
										>
									</h3>

									<p class="text-[15px] leading-relaxed text-base-content/80">
										WolfStar can log almost everything that happens in your
										server, from members joining and leaving, to channel and
										role updates, message edits and deletions, and much more.
									</p>

									<p
										class="mt-4 text-[15px] leading-relaxed text-base-content/80"
									>
										And even what WolfStar should be logging:
									</p>
									<ul class="mt-3 space-y-2 text-[15px] text-base-content/80">
										<li class="flex items-start gap-2">
											<UIcon
												name="ph:magnifying-glass-duotone"
												class="mt-0.5 size-4 shrink-0 text-primary"
												aria-hidden="true"
											/>
											<span
												>All logs are
												<strong class="text-base-content"
													>fully searchable</strong
												>
												and can be filtered by user, action, channel, and
												more. Keep a complete history of your server's
												activity.</span
											>
										</li>
										<li class="flex items-start gap-2">
											<UIcon
												name="ph:clock-duotone"
												class="mt-0.5 size-4 shrink-0 text-info"
												aria-hidden="true"
											/>
											<span
												>Logs are sent to your server
												<strong class="text-base-content"
													>in real-time</strong
												>, so you can stay up to date with everything that's
												happening.</span
											>
										</li>
									</ul>
								</div>
							</section>
						</template>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const activeFeature = defineModel<number>("activeFeature", { default: 0 });

enum AutomodFeature {
	Attachments,
	Capitals,
	Invites,
	Links,
	Mentions,
	Newlines,
	Reactions,
	Spam,
	Words,
}

const features = [
	{
		description:
			"WolfStar's auto-moderation system is a powerful tool that can help you keep your server safe and clean. It can automatically detect and remove unwanted content, such as spam, bad words, and more.",
		icon: "ph:shield-fill",
		id: "moderation-tools",
		label: "Automod",
		title: "Advanced Auto Moderator",
	},
	{
		description:
			"WolfStar not only comes with a very complete moderation suite, but also advanced logging capabilities to keep track of everything that happens in your server.",
		icon: "ph:binoculars-duotone",
		id: "advanced-logging",
		label: "Logging",
		title: "Advanced Logging",
	},
] satisfies {
	id: string;
	title: string;
	label: string;
	description: string;
	icon: string;
}[];

const texts = [
	{
		alert: "file attachments aren't allowed in this channel.",
		title: "attachments",
		tooltip: "Attachments",
	},
	{
		alert: "please reduce your use of capital letters.",
		title: "capital letters",
		tooltip: "Capitals",
	},
	{
		alert: "invite links aren't allowed in this channel.",
		title: "invites",
		tooltip: "Invites",
	},
	{
		alert: "you sent links that aren't allowed here.",
		title: "bad links",
		tooltip: "Links",
	},
	{
		alert: "you mentioned too many people.",
		title: "excessive mentions",
		tooltip: "Mentions",
	},
	{
		alert: "your message contains too many lines.",
		title: "excessive lines",
		tooltip: "Lines",
	},
	{
		alert: "you cannot react with that emoji.",
		title: "bad reactions",
		tooltip: "Reactions",
	},
	{
		alert: "please refrain from reposting the same message multiple times.",
		title: "spam",
		tooltip: "Spam",
	},
	{
		alert: "you said something that is not allowed in this server.",
		title: "bad words",
		tooltip: "Words",
	},
] satisfies {
	tooltip: string;
	title: string;
	alert: string;
}[];

const timestamp = ref(0);
const featureIndex = ref(0);
const loggingIndex = ref(0);

function advanceFeatureIndex(value: -1 | 1) {
	featureIndex.value = (featureIndex.value + value + texts.length) % texts.length;
}

function advanceLoggingIndex(value: -1 | 1) {
	loggingIndex.value = (loggingIndex.value + value + loggingEvents.length) % loggingEvents.length;
}

const location = useBrowserLocation();

function handleHashChange() {
	const hash = location.value.hash?.slice(1);
	if (!hash) {
		return;
	}
	const featureIndexFromHash = features.findIndex((f) => f.id === hash);
	if (featureIndexFromHash !== -1) {
		activeFeature.value = featureIndexFromHash;
		setTimeout(() => {
			const element = document.getElementById(hash);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}, 100);
	}
}

onMounted(() => {
	timestamp.value = Date.now();
});

const cleanup = useEventListener("hashchange", handleHashChange);

onUnmounted(cleanup);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.showcase-surface-shield {
	position: relative;
	z-index: 1;
	isolation: isolate;
}

.showcase-channel-header {
	@apply flex items-center gap-2.5 border-b px-5 py-3.5;
	border-color: var(--home-border-subtle);
}

.showcase-card-body {
	background-color: var(--color-base-300);
}

.showcase-discord-feed {
	@apply rounded-none shadow-none;
	background-color: transparent;
}

:deep(.showcase-discord-feed .discord-message) {
	@apply rounded-lg px-0 py-2 sm:px-1 sm:py-2.5;
	background-color: transparent;
}

:deep(.showcase-discord-feed .discord-message:hover) {
	background-color: oklch(from var(--color-base-content) l c h / 0.04);
}

.showcase-embed-detail-parts {
	@apply inline;
}

.showcase-embed-detail-parts :deep(.tag) {
	@apply inline-flex align-baseline;
	margin: 0;
}

:deep(.brand-embed .discord-embed) {
	border-color: oklch(from var(--color-primary) l c h / 0.35);
	background-color: oklch(from var(--color-base-200) calc(l - 0.02) c h) !important;
}

.radio-feature-container {
	@apply tooltip tooltip-top lg:tooltip-right;
	display: inherit;
}

.radio-feature {
	@apply size-3.5 cursor-pointer appearance-none rounded-full bg-base-content/15 sm:size-4;
}

.radio-feature-arrow {
	@apply inline-flex size-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-muted transition-colors hover:text-base-content sm:size-4;
}

@media not (hover: hover) {
	.radio-feature {
		@apply size-5;
	}

	.radio-feature-arrow {
		@apply size-5;
	}
}

.radio-feature:not(:checked):hover {
	@apply bg-base-content/30;
}

.radio-feature:checked {
	@apply bg-primary shadow-glow;
}

.radio-feature:checked:hover {
	@apply bg-primary;
}

.radio-feature {
	transition: background-color 0.25s linear;
}

.animate-fade-in {
	animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
	from {
		transform: translateY(10px);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}
</style>
