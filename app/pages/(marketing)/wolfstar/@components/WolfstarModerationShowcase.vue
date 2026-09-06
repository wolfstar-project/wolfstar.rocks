<!-- oxlint-disable vue/no-template-shadow -->
<template>
	<div class="w-full">
		<div class="relative mx-auto min-h-100 w-full max-w-7xl">
			<SectionHeader
				:eyebrow="ts('marketing.wolfstar.showcase.header_eyebrow')"
				:title="ts('marketing.wolfstar.showcase.header_title')"
				:description="ts('marketing.wolfstar.showcase.header_description')"
				heading-id="home-showcase-heading"
				align="start"
				class="mb-12"
			/>
			<div
				v-for="(feature, index) in features"
				:key="feature.id"
				class="animate-fade-in"
				:class="{ 'mt-12': index > 0 }"
			>
				<div :id="feature.id" class="scroll-mt-24">
					<div class="mb-8 text-left">
						<h3
							class="mb-4 flex items-center gap-3 text-2xl font-bold text-base-content"
						>
							<span
								class="flex size-10 items-center justify-center rounded-lg bg-primary/10"
								aria-hidden="true"
							>
								<UIcon :name="feature.icon" class="size-5 text-primary" />
							</span>
							{{ feature.title }}
						</h3>
						<p class="max-w-prose text-base leading-relaxed text-base-content/70">
							{{ feature.description }}
						</p>
					</div>

					<template v-if="feature.id === 'moderation-tools'">
						<div class="grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-12">
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
										<span class="text-[15px] font-semibold text-base-content">{{
											ts("marketing.wolfstar.showcase.channel_automod")
										}}</span>
										<span class="text-xs text-muted">{{
											ts("marketing.wolfstar.showcase.server_suffix")
										}}</span>
									</div>
									<div class="showcase-card-body p-5">
										<DiscordMessages
											class="showcase-discord-feed w-full text-left"
										>
											<template v-if="featureIndex === AutomodFeature.Spam">
												<DiscordMessage
													v-for="n in 2"
													:key="n"
													name="baddie"
												>
													{{ ts("marketing.wolfstar.showcase.msg_spam") }}
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
														featureIndex !== AutomodFeature.Reactions,
												}"
											>
												<template
													v-if="
														featureIndex === AutomodFeature.Attachments
													"
												>
													{{
														ts(
															"marketing.wolfstar.showcase.msg_attachments",
														)
													}}
													<div class="grid max-w-96 grid-cols-2 gap-2">
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
													{{
														ts(
															"marketing.wolfstar.showcase.msg_capitals",
														)
													}}
													<strong>{{
														ts(
															"marketing.wolfstar.showcase.msg_capitals_strong",
														)
													}}</strong>
												</template>
												<template
													v-else-if="
														featureIndex === AutomodFeature.Invites
													"
												>
													{{
														ts(
															"marketing.wolfstar.showcase.msg_invites",
														)
													}}
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
													{{
														ts("marketing.wolfstar.showcase.msg_links")
													}}
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
													{{
														ts(
															"marketing.wolfstar.showcase.msg_mentions",
														)
													}}
													<DiscordMention kind="mention"
														>everyone</DiscordMention
													><DiscordMention kind="mention"
														>members</DiscordMention
													><DiscordMention kind="mention"
														>moderators</DiscordMention
													>
												</template>
												<template
													v-else-if="
														featureIndex === AutomodFeature.Newlines
													"
												>
													{{
														ts(
															"marketing.wolfstar.showcase.msg_newlines",
														)
													}}
													<br />
													<br />
													<br />
													<br />
													<br />
													<br />
													<br />
													{{
														ts(
															"marketing.wolfstar.showcase.msg_newlines_end",
														)
													}}
												</template>
												<template
													v-else-if="
														featureIndex === AutomodFeature.Reactions
													"
												>
													{{
														ts(
															"marketing.wolfstar.showcase.msg_reactions",
														)
													}}
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
													v-else-if="featureIndex === AutomodFeature.Spam"
												>
													{{ ts("marketing.wolfstar.showcase.msg_spam") }}
												</template>
												<template
													v-else-if="
														featureIndex === AutomodFeature.Words
													"
												>
													<i18n-t
														keypath="marketing.wolfstar.showcase.msg_words"
														tag="span"
													>
														<template #word>
															<strong>{{
																ts(
																	"marketing.wolfstar.showcase.msg_words_strong",
																)
															}}</strong>
														</template>
													</i18n-t>
												</template>
											</DiscordMessage>
											<DiscordMessage name="wolfstar">
												<i18n-t
													keypath="marketing.wolfstar.showcase.alert"
													tag="span"
												>
													<template #user>
														<DiscordMention
															kind="mention"
															avatar="/avatars/baddie.png"
															>Baddie</DiscordMention
														>
													</template>
													<template #reason>
														{{ texts[featureIndex]!.alert }}
													</template>
												</i18n-t>
											</DiscordMessage>
										</DiscordMessages>
									</div>
								</SurfaceCard>

								<div class="flex flex-row items-center gap-1 lg:flex-col">
									<button
										type="button"
										class="radio-feature-arrow rotate-90 lg:rotate-180"
										:aria-label="ts('marketing.wolfstar.showcase.prev_automod')"
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
											:id="`automod-feature-${automodIndex}`"
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
										:aria-label="ts('marketing.wolfstar.showcase.next_automod')"
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
									<i18n-t
										keypath="marketing.wolfstar.showcase.act_on"
										tag="span"
										class="contents"
									>
										<template #subject>
											<span
												class="text-primary underline decoration-primary/30 underline-offset-4"
												>{{ texts[featureIndex]!.title }}</span
											>
										</template>
									</i18n-t>
								</h3>

								<p class="text-base leading-relaxed text-base-content/70">
									{{ ts("marketing.wolfstar.showcase.automod_intro") }}
								</p>

								<p class="mt-4 text-base leading-relaxed text-base-content/70">
									{{ ts("marketing.wolfstar.showcase.automod_actions_intro") }}
								</p>
								<ul class="mt-3 space-y-2 text-base text-base-content/70">
									<li class="flex items-start gap-2">
										<UIcon
											name="ph:arrow-u-up-left"
											class="mt-0.5 size-4 shrink-0"
											aria-hidden="true"
										/>
										<span
											><strong class="text-base-content">{{
												ts("marketing.wolfstar.showcase.action_alert_label")
											}}</strong>
											{{
												ts("marketing.wolfstar.showcase.action_alert_body")
											}}</span
										>
									</li>
									<li class="flex items-start gap-2">
										<UIcon
											name="ph:flag-fill"
											class="mt-0.5 size-4 shrink-0 text-warning"
											aria-hidden="true"
										/>
										<span
											><strong class="text-base-content">{{
												ts("marketing.wolfstar.showcase.action_log_label")
											}}</strong>
											{{
												ts("marketing.wolfstar.showcase.action_log_body")
											}}</span
										>
									</li>
									<li class="flex items-start gap-2">
										<UIcon
											name="ph:trash-simple-fill"
											class="mt-0.5 size-4 shrink-0 text-error"
											aria-hidden="true"
										/>
										<span
											><strong class="text-base-content">{{
												ts(
													"marketing.wolfstar.showcase.action_delete_label",
												)
											}}</strong>
											{{
												ts("marketing.wolfstar.showcase.action_delete_body")
											}}</span
										>
									</li>
								</ul>

								<p class="mt-4 text-base leading-relaxed text-base-content/70">
									{{ ts("marketing.wolfstar.showcase.escalation_intro") }}
								</p>
								<ul class="mt-3 space-y-2 text-base text-base-content/70">
									<li class="flex items-start gap-2">
										<UIcon
											name="ph:shield-check-duotone"
											class="mt-0.5 size-4 shrink-0 text-primary"
											aria-hidden="true"
										/>
										<span>
											<strong class="text-base-content">{{
												ts(
													"marketing.wolfstar.showcase.escalation_action_label",
												)
											}}</strong>
											{{
												ts(
													"marketing.wolfstar.showcase.escalation_action_body",
												)
											}}
										</span>
									</li>
									<li class="flex items-start gap-2">
										<UIcon
											name="ph:hourglass-duotone"
											class="mt-0.5 size-4 shrink-0"
											aria-hidden="true"
										/>
										<span>
											<strong class="text-base-content">{{
												ts(
													"marketing.wolfstar.showcase.escalation_threshold_label",
												)
											}}</strong>
											{{
												ts(
													"marketing.wolfstar.showcase.escalation_threshold_body",
												)
											}}
										</span>
									</li>
								</ul>
							</div>
						</div>
					</template>

					<template v-else-if="feature.id === 'advanced-logging'">
						<div class="grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-12">
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
										<span class="text-[15px] font-semibold text-base-content">{{
											ts("marketing.wolfstar.showcase.channel_logs")
										}}</span>
										<span class="text-xs text-muted">{{
											ts("marketing.wolfstar.showcase.server_suffix")
										}}</span>
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
														text: ts(
															'marketing.wolfstar.showcase.embed_log',
															{ id: 123456 + loggingIndex },
														),
													}"
													:timestamp
												>
													<span
														><strong
															>❯
															{{
																ts(
																	"marketing.wolfstar.showcase.embed_action",
																)
															}}:</strong
														>{{ " "
														}}{{
															loggingEvents[loggingIndex]!.action
														}}</span
													><br />
													<span
														v-for="(detail, idx) in loggingEvents[
															loggingIndex
														]!.details"
														:key="idx"
													>
														<strong>❯ {{ detail.label }}:</strong
														>{{ " "
														}}<template
															v-for="(part, partIdx) in detail.parts"
															:key="partIdx"
															><DiscordMention
																v-if="part.type === 'mention'"
																kind="mention"
																:avatar="part.avatar"
																>{{ part.name }}</DiscordMention
															><DiscordRole
																v-else-if="part.type === 'role'"
																:color="part.color"
																>{{ part.name }}</DiscordRole
															><template
																v-else-if="part.type === 'roles'"
																><template
																	v-for="(
																		role, roleIdx
																	) in part.items"
																	:key="role.name"
																	><span v-if="roleIdx > 0"
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
										:aria-label="ts('marketing.wolfstar.showcase.prev_logging')"
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
											:id="`logging-feature-${loggingEventIndex}`"
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
										:aria-label="ts('marketing.wolfstar.showcase.next_logging')"
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
									<i18n-t
										keypath="marketing.wolfstar.showcase.keep_track_of"
										tag="span"
										class="contents"
									>
										<template #subject>
											<span
												class="text-primary underline decoration-primary/30 underline-offset-4"
												>{{ loggingEvents[loggingIndex]!.title }}</span
											>
										</template>
									</i18n-t>
								</h3>

								<p class="text-base leading-relaxed text-base-content/70">
									{{ ts("marketing.wolfstar.showcase.logging_intro") }}
								</p>

								<p class="mt-4 text-base leading-relaxed text-base-content/70">
									{{ ts("marketing.wolfstar.showcase.logging_dashboard_intro") }}
								</p>
								<ul class="mt-3 space-y-2 text-base text-base-content/70">
									<li class="flex items-start gap-2">
										<UIcon
											name="ph:magnifying-glass-duotone"
											class="mt-0.5 size-4 shrink-0 text-primary"
											aria-hidden="true"
										/>
										<span>
											{{
												ts(
													"marketing.wolfstar.showcase.logging_item_filter",
												)
											}}
										</span>
									</li>
									<li class="flex items-start gap-2">
										<UIcon
											name="ph:clock-duotone"
											class="mt-0.5 size-4 shrink-0 text-info"
											aria-hidden="true"
										/>
										<span>
											{{
												ts("marketing.wolfstar.showcase.logging_item_views")
											}}
										</span>
									</li>
								</ul>
							</div>
						</div>
					</template>

					<template v-else-if="feature.id === 'moderation-logs'">
						<div class="grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-12">
							<div
								class="flex flex-col-reverse items-center gap-4 max-lg:order-last lg:flex-row"
							>
								<div class="flex w-full flex-col items-start">
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
												>{{
													ts("marketing.wolfstar.showcase.channel_modlog")
												}}</span
											>
											<span class="text-xs text-muted">{{
												ts("marketing.wolfstar.showcase.server_suffix")
											}}</span>
										</div>
										<div class="showcase-card-body p-5">
											<DiscordMessages
												class="showcase-discord-feed w-full text-left"
											>
												<DiscordMessage
													name="wolfstar"
													:timestamp="moderationMessageTime"
												>
													<DiscordEmbed
														:color="moderationActionRender.color"
														:footer="{
															icon: '/avatars/wolfstar.png',
															text: ts(
																'marketing.wolfstar.showcase.embed_case',
																{
																	id: 3,
																},
															),
														}"
														:timestamp
													>
														<span
															><strong
																>❯
																{{
																	ts(
																		"marketing.wolfstar.showcase.embed_type",
																	)
																}}:</strong
															>{{ " "
															}}{{
																moderationActionRender.name
															}}</span
														><br />
														<span>
															<strong
																>❯
																{{
																	ts(
																		"marketing.wolfstar.showcase.embed_user",
																	)
																}}:</strong
															>{{ " "
															}}<DiscordMention
																kind="mention"
																avatar="/avatars/baddie.png"
																>baddie</DiscordMention
															>{{ " " }}(541738403230777351) </span
														><br />
														<span
															><strong
																>❯
																{{
																	ts(
																		"marketing.wolfstar.showcase.embed_reason",
																	)
																}}:</strong
															>{{ " "
															}}{{
																ts(
																	"marketing.wolfstar.showcase.embed_reason_value",
																)
															}}</span
														>
													</DiscordEmbed>
												</DiscordMessage>
											</DiscordMessages>
										</div>
									</SurfaceCard>

									<UFieldGroup class="mt-4 self-start md:self-center">
										<UButton
											class="justify-center"
											:color="moderationTemporary ? 'info' : 'neutral'"
											:variant="moderationTemporary ? 'solid' : 'outline'"
											icon="ph:hourglass-duotone"
											:disabled="moderationAction.temporary === null"
											@click="
												((moderationTemporary = !moderationTemporary),
												(moderationUndo = false))
											"
										>
											{{ ts("marketing.wolfstar.showcase.btn_temporary") }}
										</UButton>
										<UButton
											class="justify-center"
											:color="moderationUndo ? 'success' : 'neutral'"
											:variant="moderationUndo ? 'solid' : 'outline'"
											icon="ph:arrow-counter-clockwise-duotone"
											:disabled="moderationAction.undo === null"
											@click="
												((moderationUndo = !moderationUndo),
												(moderationTemporary = false))
											"
										>
											{{ ts("marketing.wolfstar.showcase.btn_undo") }}
										</UButton>
									</UFieldGroup>
								</div>

								<div class="flex flex-row items-center gap-1 lg:flex-col">
									<button
										type="button"
										class="radio-feature-arrow rotate-90 lg:rotate-180"
										:aria-label="
											ts('marketing.wolfstar.showcase.prev_moderation')
										"
										@click="advanceModerationIndex(-1)"
									>
										<UIcon name="ph:caret-down-bold" aria-hidden="true" />
									</button>
									<label
										v-for="(action, moderationActionIndex) of moderationActions"
										:key="action.name"
										class="radio-feature-container"
										:data-tip="action.name"
									>
										<input
											:id="`moderation-feature-${moderationActionIndex}`"
											v-model="moderationIndex"
											type="radio"
											name="moderation-log"
											class="radio-feature"
											:value="moderationActionIndex"
										/>
										<span class="sr-only">{{ action.name }}</span>
									</label>
									<button
										type="button"
										class="radio-feature-arrow -rotate-90 lg:rotate-0"
										:aria-label="
											ts('marketing.wolfstar.showcase.next_moderation')
										"
										@click="advanceModerationIndex(1)"
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
									<i18n-t
										keypath="marketing.wolfstar.showcase.suite_for"
										tag="span"
										class="contents"
									>
										<template #subject>
											<span
												class="text-primary underline decoration-primary/30 underline-offset-4"
												>{{
													ts("marketing.wolfstar.showcase.suite_subject")
												}}</span
											>
										</template>
									</i18n-t>
								</h3>

								<p class="text-base leading-relaxed text-base-content/70">
									{{ ts("marketing.wolfstar.showcase.mod_copy_search") }}
								</p>

								<p class="mt-4 text-base leading-relaxed text-base-content/70">
									<UIcon
										name="ph:binoculars-duotone"
										class="mr-1 inline size-4 text-primary"
										aria-hidden="true"
									/>
									{{ ts("marketing.wolfstar.showcase.mod_copy_audit") }}
								</p>
							</div>
						</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { cast } from "@sapphire/utilities/cast";

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

const { ts } = useI18n();

const features = computed(() => [
	{
		description: ts("marketing.wolfstar.showcase.feature_automod_description"),
		icon: "ph:shield-fill",
		id: "moderation-tools",
		title: ts("marketing.wolfstar.showcase.feature_automod_title"),
	},
	{
		description: ts("marketing.wolfstar.showcase.feature_logging_description"),
		icon: "ph:binoculars-duotone",
		id: "advanced-logging",
		title: ts("marketing.wolfstar.showcase.feature_logging_title"),
	},
	{
		description: ts("marketing.wolfstar.showcase.feature_moderation_description"),
		icon: "ph:shield-fill",
		id: "moderation-logs",
		title: ts("marketing.wolfstar.showcase.feature_moderation_title"),
	},
]);

const texts = computed(() => [
	{
		alert: ts("marketing.wolfstar.showcase.automod_attachments_alert"),
		title: ts("marketing.wolfstar.showcase.automod_attachments_title"),
		tooltip: ts("marketing.wolfstar.showcase.automod_attachments_tooltip"),
	},
	{
		alert: ts("marketing.wolfstar.showcase.automod_capitals_alert"),
		title: ts("marketing.wolfstar.showcase.automod_capitals_title"),
		tooltip: ts("marketing.wolfstar.showcase.automod_capitals_tooltip"),
	},
	{
		alert: ts("marketing.wolfstar.showcase.automod_invites_alert"),
		title: ts("marketing.wolfstar.showcase.automod_invites_title"),
		tooltip: ts("marketing.wolfstar.showcase.automod_invites_tooltip"),
	},
	{
		alert: ts("marketing.wolfstar.showcase.automod_links_alert"),
		title: ts("marketing.wolfstar.showcase.automod_links_title"),
		tooltip: ts("marketing.wolfstar.showcase.automod_links_tooltip"),
	},
	{
		alert: ts("marketing.wolfstar.showcase.automod_mentions_alert"),
		title: ts("marketing.wolfstar.showcase.automod_mentions_title"),
		tooltip: ts("marketing.wolfstar.showcase.automod_mentions_tooltip"),
	},
	{
		alert: ts("marketing.wolfstar.showcase.automod_newlines_alert"),
		title: ts("marketing.wolfstar.showcase.automod_newlines_title"),
		tooltip: ts("marketing.wolfstar.showcase.automod_newlines_tooltip"),
	},
	{
		alert: ts("marketing.wolfstar.showcase.automod_reactions_alert"),
		title: ts("marketing.wolfstar.showcase.automod_reactions_title"),
		tooltip: ts("marketing.wolfstar.showcase.automod_reactions_tooltip"),
	},
	{
		alert: ts("marketing.wolfstar.showcase.automod_spam_alert"),
		title: ts("marketing.wolfstar.showcase.automod_spam_title"),
		tooltip: ts("marketing.wolfstar.showcase.automod_spam_tooltip"),
	},
	{
		alert: ts("marketing.wolfstar.showcase.automod_words_alert"),
		title: ts("marketing.wolfstar.showcase.automod_words_title"),
		tooltip: ts("marketing.wolfstar.showcase.automod_words_tooltip"),
	},
]);

const timestamp = ref(0);
const featureIndex = ref(0);
const loggingIndex = ref(0);
const moderationTemporary = ref(false);
const moderationUndo = ref(false);
const moderationIndex = ref(0);

const loggingEvents = useLoggingEvents();
const moderationActions = useModerationActions();

function advanceFeatureIndex(value: -1 | 1) {
	featureIndex.value = (featureIndex.value + value + texts.value.length) % texts.value.length;
}

function advanceLoggingIndex(value: -1 | 1) {
	loggingIndex.value =
		(loggingIndex.value + value + loggingEvents.value.length) % loggingEvents.value.length;
}

function advanceModerationIndex(value: -1 | 1) {
	moderationIndex.value =
		(moderationIndex.value + value + moderationActions.value.length) %
		moderationActions.value.length;
}

const moderationAction = cast<NonNullable<ComputedRef<ModerationAction>>>(
	computed(() => moderationActions.value[moderationIndex.value]),
);

const moderationActionRender = computed(() => {
	const action = moderationAction.value;
	if (moderationTemporary.value && action.temporary !== null) {
		return { color: action.temporary, name: `Temporary ${action.name}` };
	}

	if (moderationUndo.value && action.undo !== null) {
		return { color: action.undo, name: `Remove ${action.name}` };
	}

	return { color: action.color, name: action.name };
});

const moderationMessageTime = computed(() => {
	if (!timestamp.value) {
		return undefined;
	}
	return new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(timestamp.value);
});

const location = useBrowserLocation();

function handleHashChange() {
	const hash = location.value.hash?.slice(1);
	if (!hash) {
		return;
	}
	const featureIndexFromHash = features.value.findIndex((f) => f.id === hash);
	if (featureIndexFromHash !== -1) {
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
	handleHashChange();
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
