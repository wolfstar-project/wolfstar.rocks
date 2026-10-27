<template>
	<div class="mx-auto w-full max-w-250">
		<div class="flex flex-col items-stretch gap-4">
			<SurfaceCard padding="none" class="commands-showcase-card overflow-hidden shadow-glow">
				<div class="showcase-discord-shell">
					<DiscordChannelHeader
						v-model:members-open="membersOpen"
						:name="CHANNEL_NAME"
						type="text"
						:topic="channelTopic"
						:search-placeholder="
							ts('marketing.wolfstar.commands_showcase.search_placeholder')
						"
						:online-count="onlineMembers.length"
						:notification-count="48"
						@open-channel-info="openChannelInfo"
					/>

					<div class="showcase-discord-workspace">
						<div
							class="showcase-discord-main"
							:class="{
								'showcase-discord-main-picker-open': showCommandPicker,
								'showcase-discord-main-apps-open': appLauncherOpen,
								'showcase-discord-main-apps-full': appLauncherSheetFull,
							}"
						>
							<DiscordChat
								:channel-name="CHANNEL_NAME"
								:date="channelDateLabel"
								:date-time="channelDateTime"
								:topic="channelTopic"
								:messages="chatMessages"
							>
								<template #message="{ message }">
									<!--
										Discord slash execution: interaction “used /command” reply on the
										bot message only — no separate plain `/command` user bubble.
									-->
									<!-- Desktop: slash-command reply + text / embed / components response. -->
									<div
										class="showcase-desktop-command-response hidden md:contents"
									>
										<DiscordMessage
											:name="message.author"
											:timestamp="message.timestamp"
											:ephemeral="activeDisplayCommand.ephemeral"
											:reply="{
												kind: 'command',
												user: activeDisplayCommand.invoker,
												commandName: activeDisplayCommand.name,
												subcommand: activeDisplayCommand.subcommand,
											}"
										>
											<!-- /case view: the moderator as author, the case in ❯ lines. -->
											<DiscordEmbed
												v-if="activeDisplayCommand.responseType === 'embed'"
												:color="activeDisplayCommand.embedColor"
												:author="activeDisplayCommand.embedAuthor"
												:footer="{
													icon: '/avatars/wolfstar.png',
													text: activeDisplayCommand.embedFooter,
												}"
												:timestamp
											>
												<span
													v-for="(
														line, lineIdx
													) in activeDisplayCommand.embedLines"
													:key="line.label"
												>
													<strong>❯ {{ line.label }}:</strong>{{ " "
													}}<template
														v-for="(part, partIdx) in line.parts"
														:key="`${lineIdx}-${partIdx}`"
														><DiscordMention
															v-if="part.type === 'mention'"
															kind="mention"
															:avatar="part.avatar"
															>{{ part.name }}</DiscordMention
														><template v-else>{{
															part.content
														}}</template></template
													><br />
												</span>
											</DiscordEmbed>
											<!-- A moderation action: the green embed, the target as inline code. -->
											<DiscordEmbed
												v-else-if="
													activeDisplayCommand.responseType ===
													'moderation'
												"
												:color="Colors.Green"
											>
												<img
													:src="EMOJIS.greenTick"
													alt=":greenTick:"
													class="showcase-custom-emoji"
													draggable="false"
												/>{{ " " }}{{ moderationReply.before
												}}<code class="showcase-inline-code">{{
													activeDisplayCommand.target
												}}</code
												>{{ moderationReply.after }}<br />{{
													ts(
														"marketing.wolfstar.fixtures.reply_moderation_reason",
														{
															reason: activeDisplayCommand.reason,
														},
													)
												}}
											</DiscordEmbed>
											<span
												v-else-if="
													activeDisplayCommand.responseType === 'text'
												"
												class="showcase-desktop-text-response"
											>
												<ShowcaseMarkdown
													:source="activeDisplayCommand.content"
												/>
											</span>
											<!-- An embed with a title: /whois, the lists of the Auto-* commands. -->
											<DiscordEmbed
												v-else-if="
													activeDisplayCommand.responseType === 'card'
												"
												:color="activeDisplayCommand.cardColor"
												:title="activeDisplayCommand.cardTitle"
												:footer="
													activeDisplayCommand.cardFooter
														? { text: activeDisplayCommand.cardFooter }
														: undefined
												"
											>
												<ShowcaseMarkdown
													:source="activeDisplayCommand.cardBody"
												/>
											</DiscordEmbed>
											<!-- Components V2 (/automod show, /commands): a heading over the
											     text, then a select menu or a button. -->
											<div
												v-else-if="
													activeDisplayCommand.responseType === 'panel'
												"
												class="showcase-settings-menu"
											>
												<DiscordV2Container
													:accent-color="activeDisplayCommand.accentColor"
												>
													<h3 class="showcase-settings-heading">
														{{ activeDisplayCommand.panelHeading }}
													</h3>
													<ShowcaseMarkdown
														:source="activeDisplayCommand.panelBody"
													/>
													<DiscordActionRow
														v-if="activeDisplayCommand.panelSelect"
													>
														<DiscordStringSelectMenu
															:options="[]"
															disabled
															:placeholder="
																activeDisplayCommand.panelSelect
															"
															:aria-label="
																activeDisplayCommand.panelSelect
															"
														/>
													</DiscordActionRow>
													<DiscordActionRow
														v-else-if="activeDisplayCommand.panelButton"
													>
														<DiscordButton
															:disabled="false"
															:label="
																activeDisplayCommand.panelButton
															"
														/>
													</DiscordActionRow>
												</DiscordV2Container>
											</div>
											<!-- /settings server: two Components V2 containers, sized as
											     Discord draws them (16px padding, 8px between components). -->
											<div v-else class="showcase-settings-menu">
												<DiscordV2Container
													:accent-color="activeDisplayCommand.accentColor"
												>
													<div class="showcase-settings-section">
														<div class="showcase-settings-text">
															<h3 class="showcase-settings-heading">
																{{ activeDisplayCommand.heading }}
															</h3>
															<p>{{ activeDisplayCommand.intro }}</p>
														</div>
														<DiscordButton
															:disabled="false"
															icon="twemoji:counterclockwise-arrows-button"
														/>
													</div>
													<DiscordActionRow>
														<DiscordStringSelectMenu
															v-model="settingsModule"
															:options="
																activeDisplayCommand.selectOptions
															"
															:placeholder="
																activeDisplayCommand.selectPlaceholder
															"
															:aria-label="
																ts(
																	'marketing.wolfstar.commands_showcase.select_aria',
																)
															"
														/>
													</DiscordActionRow>
												</DiscordV2Container>
												<DiscordV2Container
													:accent-color="activeDisplayCommand.accentColor"
												>
													<div
														v-for="row in activeDisplayCommand.rows"
														:key="row.label"
														class="showcase-settings-section"
													>
														<div class="showcase-settings-text">
															<strong>{{ row.label }}</strong>
															<p>
																<template v-if="row.value">{{
																	row.value
																}}</template
																><template
																	v-if="row.value && row.code"
																>
																	(</template
																><code
																	v-if="row.code"
																	class="showcase-inline-code"
																	>{{ row.code }}</code
																><template
																	v-if="row.value && row.code"
																	>)</template
																>
															</p>
														</div>
														<DiscordButton
															:disabled="false"
															:emoji="EMOJIS.edit"
															emoji-name="edit"
														/>
													</div>
													<DiscordV2Separator />
													<div class="showcase-settings-section">
														<div class="showcase-settings-text">
															<strong
																><img
																	:src="EMOJIS.warning"
																	alt=":warning:"
																	class="showcase-custom-emoji"
																	draggable="false"
																/>{{ " "
																}}{{
																	activeDisplayCommand.resetTitle
																}}</strong
															>
															<p>
																{{
																	activeDisplayCommand.resetDescription
																}}
															</p>
														</div>
														<DiscordButton
															:disabled="false"
															variant="danger"
															:label="activeDisplayCommand.resetLabel"
														/>
													</div>
													<p class="showcase-settings-expires">
														<img
															:src="EMOJIS.hourglass"
															alt=":hourglass:"
															class="showcase-custom-emoji"
															draggable="false"
														/>{{ " " }}{{ settingsExpires.before
														}}<span class="showcase-timestamp">{{
															activeDisplayCommand.expiresTime
														}}</span
														>{{ settingsExpires.after }}
													</p>
												</DiscordV2Container>
											</div>
										</DiscordMessage>
									</div>
								</template>
							</DiscordChat>

							<div
								class="showcase-command-picker"
								:class="{
									'showcase-command-picker-apps-open': appLauncherOpen,
									'showcase-command-picker-apps-full': appLauncherSheetFull,
								}"
							>
								<DiscordAppLauncher
									v-model:open="appLauncherOpen"
									v-model:sheet-snap="appLauncherSheetSnap"
									class="showcase-app-launcher"
									:commands="appLauncherCommands"
									@select="onAppLauncherSelect"
									@close="appLauncherOpen = false"
								/>

								<DiscordChatInputCommandSuggestions
									v-if="showCommandPicker"
									id="showcase-slash-suggestions"
									v-model:selected-app="selectedApp"
									:prefix="activeSearchPrefix"
								>
									<template #frequently-used>
										<DiscordChatInputCommandSuggestion
											v-for="command of frequentlyUsedCommands"
											:id="suggestionOptionId(commandDisplayName(command))"
											:key="`frequently-used-${commandDisplayName(command)}`"
											:name="commandDisplayName(command)"
											:description="command.description"
											app-label="WolfStar Beta"
											:active="
												isSuggestionActive(commandDisplayName(command))
											"
											@select="executeCommand(commandDisplayName(command))"
										/>
									</template>

									<template v-if="matchedCommand" #matched>
										<DiscordChatInputCommandMatched
											:name="matchedCommand.name"
											:subcommand="matchedCommand.subcommand"
											:options="matchedCommand.options"
											active
											@select="
												executeCommand(commandDisplayName(matchedCommand))
											"
										/>
									</template>

									<!-- WolfStar group only when that app is selected — avoids duplicating WolfStar under Frequently Used. -->
									<DiscordChatInputCommandGroup
										v-if="selectedApp === 'wolfstar'"
										app="wolfstar"
										label="WolfStar Beta"
									>
										<DiscordChatInputCommandSuggestion
											v-for="command of filteredShowcaseCommands"
											:id="suggestionOptionId(commandDisplayName(command))"
											:key="`wolfstar-${commandDisplayName(command)}`"
											:name="commandDisplayName(command)"
											:description="command.description"
											app-label="WolfStar Beta"
											:active="
												isSuggestionActive(commandDisplayName(command))
											"
											@select="executeCommand(commandDisplayName(command))"
										/>
									</DiscordChatInputCommandGroup>

									<!-- Bot-grouped full list (independent scroll under Frequently Used). -->
									<DiscordChatInputCommandGroup
										v-for="app of listedMockApps"
										:key="app"
										:app
									>
										<DiscordChatInputCommandSuggestion
											v-for="command of listedCommandsForMockApp(app)"
											:key="`${app}-${command.name}`"
											:app
											:name="command.name"
											:description="command.description"
											disabled
										/>
									</DiscordChatInputCommandGroup>
								</DiscordChatInputCommandSuggestions>

								<!-- Discord hides the message bar when the Apps sheet is fully expanded. -->
								<DiscordChatMessageComposer
									v-if="!appLauncherSheetFull"
									v-model="composerText"
									:channel-name="CHANNEL_NAME"
									autocomplete
									:apps-open="appLauncherOpen"
									:aria-controls="
										showCommandPicker ? 'showcase-slash-suggestions' : undefined
									"
									:aria-expanded="showCommandPicker"
									:aria-activedescendant="activeDescendantId"
									@open-apps="toggleAppLauncher"
									@submit="onComposerSubmit"
									@escape="onComposerEscape"
									@navigate="onComposerNavigate"
								>
									<!--
										Stable input so focus survives arming. When matched, Discord
										hides the raw path glyphs and shows composed slash chrome.
									-->
									<template #value>
										<div class="showcase-composer-slash-field">
											<DiscordChatInputCommand
												v-if="matchedCommand"
												class="showcase-composer-slash-composed"
												:name="matchedCommand.name"
												:subcommand="matchedCommand.subcommand"
												:options="matchedCommand.options"
											/>
											<input
												v-model="composerText"
												type="text"
												class="discord-message-composer-input w-full min-w-0 flex-1 outline-none"
												:class="{
													'showcase-composer-slash-mirror':
														matchedCommand,
												}"
												:placeholder="
													matchedCommand ? undefined : composerLabel
												"
												:aria-label="composerLabel"
												:aria-controls="
													showCommandPicker
														? 'showcase-slash-suggestions'
														: undefined
												"
												:aria-expanded="showCommandPicker"
												:aria-activedescendant="activeDescendantId"
												role="combobox"
												autocomplete="off"
												spellcheck="false"
												@keydown="onComposerInputKeydown"
											/>
										</div>
									</template>
								</DiscordChatMessageComposer>
							</div>
						</div>

						<DiscordMemberList
							v-if="membersOpen"
							class="showcase-discord-members hidden md:flex"
							:online="onlineMembers"
							:offline="offlineMembers"
							show-roles
						/>
					</div>

					<DiscordChannelInfo
						v-if="channelInfoOpen"
						class="showcase-discord-channel-info"
						:name="CHANNEL_NAME"
						:online="onlineMembers"
						:offline="offlineMembers"
						@close="channelInfoOpen = false"
					/>
				</div>
			</SurfaceCard>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ShowcaseCommand } from "~/types/constants";
import type {
	DiscordAppLauncherEntry,
	DiscordAppLauncherSheetSnap,
	DiscordChatMessage,
} from "~/types/discord";
import { Colors } from "~/types/constants";
import ShowcaseMarkdown from "./WolfstarShowcaseMarkdown.vue";

const { ts } = useI18n();

const CHANNEL_NAME = "mod-commands";

const commands = useShowcaseCommands();

/**
 * WolfStar's own emojis, exported from the brand's icon file in Figma
 * ("Icons (Brand WolfStar)", Emoji Collection) and Discord's icon kit, the
 * glyphs only; the hourglass is not in either, so it comes from the bot's emoji
 * on Discord's CDN. The menu's refresh button is the Unicode 🔄, as in the bot.
 */
const EMOJIS = {
	edit: "/emojis/edit.svg",
	greenTick: "/emojis/green-tick.svg",
	hourglass: "https://cdn.discordapp.com/emojis/1262391693823578245.webp?size=44",
	warning: "/emojis/warning.svg",
} as const;

/** The settings menu opens on its root module, General, as the bot's does. */
const settingsModule = ref<string | undefined>("general");

/** "This menu closes `in 15 minutes` if it is not used.": the time is a timestamp chip. */
const settingsExpires = computed(() => {
	const command = activeDisplayCommand.value;
	if (command.responseType !== "components") return { after: "", before: "" };
	const [before = "", after = ""] = command.expires.split(command.expiresTime);
	return { after, before };
});

/**
 * "Created case 3 | `baddie`." around the target, which is set as inline code:
 * the sentence is translated whole, then cut where the name goes.
 */
const moderationReply = computed(() => {
	const command = activeDisplayCommand.value;
	const marker = "\u0000";
	const sentence = ts("marketing.wolfstar.fixtures.reply_moderation", {
		id: command.responseType === "moderation" ? command.caseId : 0,
		user: marker,
	});
	const [before = "", after = ""] = sentence.split(marker);
	return { after, before };
});

/** Shared channel topic for header chrome and welcome start copy. */
const channelTopic = computed(() => ts("marketing.wolfstar.commands_showcase.channel_topic"));
const composerLabel = computed(() =>
	ts("marketing.wolfstar.commands_showcase.composer_placeholder", { channel: CHANNEL_NAME }),
);

const selectedCommandIndex = ref(0);
const selectedApp = ref<SlashCommandAppName | null>(null);
const highlightedIndex = ref(0);
const timestamp = ref(0);
/** Discord App Launcher popover above the composer (Apps toolbar button). */
const appLauncherOpen = ref(false);
/** Mobile sheet snap — `full` hides the message composer like Discord. */
const appLauncherSheetSnap = ref<DiscordAppLauncherSheetSnap>("half");
/** Desktop member list open — matches Discord default (members panel visible). */
const membersOpen = ref(true);
/** Mobile channel-info overlay (Members / Media / Pins / …). Desktop keeps the side list. */
const channelInfoOpen = ref(false);
/**
 * Slash-menu text. Start empty so SSR + mobile hydrate idle (no picker).
 * Desktop arms `/` in onMounted — avoids picker-open / empty-input hydration mismatch.
 */
const composerText = ref("");

/** True while the mobile Apps sheet covers the message bar. */
const appLauncherSheetFull = computed(
	() => appLauncherOpen.value && appLauncherSheetSnap.value === "full",
);

const channelNow = new Date();
const { locale: appLocale } = useAppLocale();
// The channel's first day, in the language on screen.
const channelDateLabel = computed(() =>
	new Intl.DateTimeFormat(appLocale.value, {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(channelNow),
);
const channelDateTime = [
	String(channelNow.getFullYear()),
	String(channelNow.getMonth() + 1).padStart(2, "0"),
	String(channelNow.getDate()).padStart(2, "0"),
].join("-");

/** Picker is open only while the composer still has a leading `/` (Discord closes it when `/` is removed). */
const showCommandPicker = computed(() => composerText.value.startsWith("/"));

const slashQuery = computed(() => {
	if (!composerText.value.startsWith("/")) return "";
	return composerText.value.slice(1).trimStart().toLowerCase();
});

const activeDisplayCommand = computed(() => {
	const command = commands.value[selectedCommandIndex.value];
	return command ?? commands.value[0]!;
});

const chatMessages = computed<DiscordChatMessage[]>(() => {
	// Discord keeps the bot response (with “User used /command” reply) visible
	// behind the slash picker — the picker overlays the composer, it does not
	// clear channel history. No separate plain `/command` user bubble.
	const command = activeDisplayCommand.value;
	return [
		{
			id: `response-${command.name}-${command.subcommand ?? ""}`,
			author: "wolfstar",
			timestamp: ts("marketing.wolfstar.commands_showcase.timestamp"),
		},
	];
});
/**
 * Support-server role colors (oklch) — Discord-true, no maroon.
 * Pink / scarlet / salmon match Developers + External Bots name tints.
 * (Discord Role.color is an RGB int; showcase uses semantic oklch via `uiColor`.)
 */
const DISCORD_ROLE_PINK = "oklch(68.42% 0.214 350.12)";
const DISCORD_ROLE_SCARLET = "oklch(63.72% 0.208 25.33)";
const DISCORD_ROLE_SALMON = "oklch(74.18% 0.128 38.42)";

/** Shared nebula decoration for Developers rows (Discord profile banner look). */
const DEVELOPER_ROW_BG = [
	"linear-gradient(90deg, oklch(42% 0.16 305 / 0.55), oklch(38% 0.1 265 / 0.28) 45%, transparent 78%)",
	"radial-gradient(ellipse 90% 140% at 12% 50%, oklch(58% 0.2 320 / 0.42), transparent 58%)",
	"radial-gradient(ellipse 70% 120% at 88% 40%, oklch(48% 0.14 250 / 0.28), transparent 52%)",
].join(", ");

const SHOWCASE_ROLE_IDS = {
	starNetwork: "1000000000000000001",
	developers: "1000000000000000002",
	externalBots: "1000000000000000003",
} as const;

/** Hoisted roles for the support-server mock (Role object + showcase uiColor). */
const showcaseRoles = [
	{
		id: SHOWCASE_ROLE_IDS.starNetwork,
		name: "Star Network",
		color: 0,
		hoist: true,
		position: 30,
	},
	{
		id: SHOWCASE_ROLE_IDS.developers,
		name: "Developers",
		color: 0,
		hoist: true,
		position: 20,
		uiColor: DISCORD_ROLE_PINK,
	},
	{
		id: SHOWCASE_ROLE_IDS.externalBots,
		name: "External Bots",
		color: 0,
		hoist: true,
		position: 10,
		uiColor: DISCORD_ROLE_SALMON,
	},
] as const satisfies readonly DiscordMemberListRoleFixture[];

const JOINED_AT = "2020-01-01T00:00:00.000+00:00";

/**
 * Guild Member + User + optional Presence Update fixtures (Discord API shape).
 * Mapped to `DiscordMemberListMember` for the UI via `mapDiscordMemberListMembers`.
 */
const onlineMemberFixtures = [
	{
		user: {
			id: "2000000000000000001",
			username: "Ring",
			discriminator: "0",
			global_name: "Ring",
			avatar: null,
			bot: true,
			public_flags: MEMBER_LIST_USER_FLAGS.httpInteractions,
		},
		roles: [SHOWCASE_ROLE_IDS.starNetwork],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		showcase: { icon: "ph:discord-logo-fill" },
	},
	{
		user: {
			id: "2000000000000000002",
			username: "Staryl",
			discriminator: "0",
			global_name: "Staryl",
			avatar: null,
			bot: true,
			public_flags: MEMBER_LIST_USER_FLAGS.verifiedHttpBot,
		},
		roles: [SHOWCASE_ROLE_IDS.starNetwork],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		showcase: { avatarUrl: "/avatars/staryl.png" },
	},
	{
		user: {
			id: "2000000000000000003",
			username: "WolfStar",
			discriminator: "0",
			global_name: "WolfStar",
			avatar: null,
			bot: true,
			public_flags: MEMBER_LIST_USER_FLAGS.verifiedBot,
		},
		roles: [SHOWCASE_ROLE_IDS.starNetwork],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		presence: {
			status: "online",
			activities: [
				{
					name: "Custom Status",
					type: ActivityType.Custom,
					state: "WolfStar, help",
				},
			],
		},
		showcase: { avatarUrl: "/avatars/wolfstar.png" },
	},
	{
		user: {
			id: "2000000000000000004",
			username: "WolfStarBeta",
			discriminator: "0",
			global_name: "WolfStar Beta",
			avatar: null,
			bot: true,
			public_flags: MEMBER_LIST_USER_FLAGS.verifiedBot,
		},
		roles: [SHOWCASE_ROLE_IDS.starNetwork],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		presence: {
			status: "online",
			activities: [
				{
					name: "Custom Status",
					type: ActivityType.Custom,
					state: "WolfStar, help",
				},
			],
		},
		showcase: { avatarUrl: "/avatars/wolfstar.png" },
	},
	{
		user: {
			id: "2000000000000000005",
			username: "lory",
			discriminator: "0",
			global_name: "RVG|lory",
			avatar: null,
		},
		roles: [SHOWCASE_ROLE_IDS.developers],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		presence: {
			status: "dnd",
			activities: [
				{
					name: "Custom Status",
					type: ActivityType.Custom,
					state: "🐺 Are you sure? 🐺",
				},
			],
		},
		showcase: {
			avatarUrl: "/avatars/lory.png",
			rowBackground: DEVELOPER_ROW_BG,
		},
	},
	{
		user: {
			id: "2000000000000000006",
			username: "RedStar",
			discriminator: "0",
			global_name: "RedStar",
			avatar: null,
		},
		roles: [SHOWCASE_ROLE_IDS.developers],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		presence: {
			status: "dnd",
			activities: [
				{
					name: "Custom Status",
					type: ActivityType.Custom,
					// Emoji kept in `state` so the secondary line matches the live server copy.
					state: "🎮+1 • Am I stuck in a rut, doi...",
				},
			],
		},
		showcase: {
			avatarUrl: "/avatars/redstar.png",
			nameColor: DISCORD_ROLE_SCARLET,
			rowBackground: DEVELOPER_ROW_BG,
		},
	},
	{
		user: {
			id: "2000000000000000007",
			username: "DiscohookUtils",
			discriminator: "0",
			global_name: "Discohook Utils",
			avatar: null,
			bot: true,
			public_flags: MEMBER_LIST_USER_FLAGS.verifiedBot,
		},
		roles: [SHOWCASE_ROLE_IDS.externalBots],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		presence: {
			status: "online",
			activities: [
				{
					name: "Custom Status",
					type: ActivityType.Custom,
					state: "discohook.app/guide",
				},
			],
		},
		showcase: { icon: "ph:link-simple-horizontal-bold" },
	},
	{
		user: {
			id: "2000000000000000008",
			username: "Linear",
			discriminator: "0",
			global_name: "Linear",
			avatar: null,
			bot: true,
			public_flags: MEMBER_LIST_USER_FLAGS.verifiedHttpBot,
		},
		roles: [SHOWCASE_ROLE_IDS.externalBots],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		showcase: { icon: "ph:line-segments-bold" },
	},
	{
		user: {
			id: "2000000000000000009",
			username: "Teryl",
			discriminator: "0",
			global_name: "Teryl",
			avatar: null,
			bot: true,
			public_flags: MEMBER_LIST_USER_FLAGS.verifiedHttpBot,
		},
		roles: [SHOWCASE_ROLE_IDS.externalBots],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		showcase: { icon: "ph:user-circle-fill" },
	},
	{
		user: {
			id: "2000000000000000010",
			username: "topgg",
			discriminator: "0",
			global_name: "Top.gg",
			avatar: null,
			bot: true,
			public_flags: MEMBER_LIST_USER_FLAGS.verifiedBot,
		},
		roles: [SHOWCASE_ROLE_IDS.externalBots],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		presence: { status: "online" },
		showcase: { icon: "ph:chart-bar-fill" },
	},
] as const satisfies readonly DiscordMemberListApiFixture[];

/** Offline — 2 (Ko-fi Bot, Patreon). Kept in the showcase; shell height + compact
 *  member-list spacing are sized so this section fits without forcing scroll. */
const offlineMemberFixtures = [
	{
		user: {
			id: "2000000000000000011",
			username: "KoFiBot",
			discriminator: "0",
			global_name: "Ko-fi Bot",
			avatar: null,
			bot: true,
			public_flags: MEMBER_LIST_USER_FLAGS.verifiedBot,
		},
		roles: [],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		presence: { status: "offline" },
		showcase: { icon: "ph:coffee-fill" },
	},
	{
		user: {
			id: "2000000000000000012",
			username: "Patreon",
			discriminator: "0",
			global_name: "Patreon",
			avatar: null,
			bot: true,
			public_flags: MEMBER_LIST_USER_FLAGS.verifiedBot,
		},
		roles: [],
		joined_at: JOINED_AT,
		deaf: false,
		mute: false,
		flags: 0,
		presence: { status: "offline" },
		showcase: { icon: "ph:handshake-fill" },
	},
] as const satisfies readonly DiscordMemberListApiFixture[];

const onlineMembers = mapDiscordMemberListMembers(onlineMemberFixtures, showcaseRoles);
const offlineMembers = mapDiscordMemberListMembers(offlineMemberFixtures, showcaseRoles);

const activeSearchPrefix = computed(() => {
	if (composerText.value.startsWith("/")) return composerText.value;
	return "/";
});

/** Discord autocomplete shows command + subcommand as a single path (e.g. `conf menu`). */
function commandDisplayName(command: ShowcaseCommand) {
	return command.subcommand ? `${command.name} ${command.subcommand}` : command.name;
}

/**
 * Slash commands for App Launcher search only — selecting one runs `executeCommand`
 * (interactive send). No `/commands` page or static listing when the launcher is idle.
 */
const appLauncherCommands = computed<readonly DiscordAppLauncherEntry[]>(() =>
	commands.value.map((command) => ({
		id: `command-${commandDisplayName(command).replaceAll(" ", "-")}`,
		kind: "command" as const,
		commandName: commandDisplayName(command),
		name: `/${commandDisplayName(command)}`,
		description: command.description,
		avatar: "/avatars/wolfstar.png",
	})),
);

function matchesSlashQuery(displayName: string, query: string) {
	if (!query) return true;
	return displayName.toLowerCase().startsWith(query);
}

const filteredShowcaseCommands = computed(() =>
	commands.value.filter((command) =>
		matchesSlashQuery(commandDisplayName(command), slashQuery.value),
	),
);

const frequentlyUsedCommands = computed(() =>
	filteredShowcaseCommands.value.filter((command) => command.frequentlyUsed),
);

/**
 * Matched-command chrome: exact path, or a unique prefix match — Discord’s
 * “armed” state before Enter sends the invocation.
 */
const matchedCommand = computed(() => {
	const query = slashQuery.value;
	if (!query) return undefined;

	const exact = filteredShowcaseCommands.value.find(
		(command) => commandDisplayName(command).toLowerCase() === query,
	);
	if (exact) return exact;

	if (filteredShowcaseCommands.value.length === 1) {
		return filteredShowcaseCommands.value[0];
	}

	return undefined;
});

const selectableCommands = computed(() => {
	if (selectedApp.value === "wolfstar") return filteredShowcaseCommands.value;
	if (selectedApp.value === null) return frequentlyUsedCommands.value;
	return [];
});

const activeDescendantId = computed(() => {
	if (!showCommandPicker.value) return undefined;
	const command = selectableCommands.value[highlightedIndex.value];
	return command ? suggestionOptionId(commandDisplayName(command)) : undefined;
});

function suggestionOptionId(name: string) {
	return `showcase-slash-option-${name}`;
}

function isSuggestionActive(displayName: string) {
	const highlighted = selectableCommands.value[highlightedIndex.value];
	if (highlighted) return commandDisplayName(highlighted) === displayName;
	return commandDisplayName(activeDisplayCommand.value) === displayName;
}

interface MockAppCommand {
	name: string;
	description: string;
}

const mockAppCommands = computed<
	Record<Exclude<SlashCommandAppName, "wolfstar">, MockAppCommand[]>
>(() => ({
	catbot: [
		{ name: "cat", description: ts("marketing.wolfstar.commands_showcase.mock_catbot_cat") },
	],
	dyno: [
		{
			name: "modlogs",
			description: ts("marketing.wolfstar.commands_showcase.mock_dyno_modlogs"),
		},
	],
	fmbot: [
		{ name: "fm", description: ts("marketing.wolfstar.commands_showcase.mock_fmbot_fm") },
		{
			name: "addfriend",
			description: ts("marketing.wolfstar.commands_showcase.mock_fmbot_addfriend"),
		},
	],
	utilsbot: [
		{
			name: "poll",
			description: ts("marketing.wolfstar.commands_showcase.mock_utilsbot_poll"),
		},
	],
	staryl: [
		{
			name: "subscriptions twitch show",
			description: ts("marketing.staryl.showcase.show_description"),
		},
		{
			name: "subscriptions twitch add",
			description: ts("marketing.staryl.showcase.add_description"),
		},
	],
	ring: [
		{ name: "info", description: ts("marketing.wolfstar.commands_showcase.mock_ring_info") },
	],
}));

/** Rail order for the bot-grouped pane under Frequently Used (WolfStar lives in FU). */
const MOCK_APP_RAIL_ORDER = [
	"staryl",
	"ring",
	"fmbot",
	"utilsbot",
	"catbot",
	"dyno",
] as const satisfies readonly Exclude<SlashCommandAppName, "wolfstar">[];

const listedMockApps = computed<Exclude<SlashCommandAppName, "wolfstar">[]>(() => {
	if (selectedApp.value === null) return [...MOCK_APP_RAIL_ORDER];
	if (selectedApp.value === "wolfstar") return [];
	return [selectedApp.value];
});

function listedCommandsForMockApp(app: Exclude<SlashCommandAppName, "wolfstar">) {
	return mockAppCommands.value[app].filter((command) =>
		matchesSlashQuery(command.name, slashQuery.value),
	);
}

/** Click / Enter: run the showcase command and refresh the chat mock response. */
function executeCommand(displayName: string) {
	const index = commands.value.findIndex(
		(command) => commandDisplayName(command) === displayName,
	);
	const command = index !== -1 ? commands.value[index] : undefined;
	if (command === undefined) return;

	selectedCommandIndex.value = index;
	selectedApp.value = null;
	highlightedIndex.value = 0;
	// Discord closes the slash autocomplete after send so the channel response is visible.
	composerText.value = "";
}

/** Type-ahead arm: fill the composer path so matched-command chrome appears before send. */
function armCommand(command: ShowcaseCommand) {
	composerText.value = `/${commandDisplayName(command)}`;
}

function onComposerSubmit() {
	if (!composerText.value.startsWith("/")) return;

	if (matchedCommand.value) {
		executeCommand(commandDisplayName(matchedCommand.value));
		return;
	}

	const highlighted = selectableCommands.value[highlightedIndex.value];
	if (highlighted) {
		armCommand(highlighted);
	}
}

/**
 * Esc exits slash mode (closes picker) without touching channel history.
 * Blur the slotted input so browsers drop the keyboard `:focus-visible` ring —
 * scoped composer styles do not reach the nested `#value` slot input via
 * `:slotted()`, which previously left a white outline hugging the placeholder.
 */
function onComposerEscape() {
	composerText.value = "";
	selectedApp.value = null;
	highlightedIndex.value = 0;

	const active = document.activeElement;
	if (
		active instanceof HTMLInputElement &&
		active.classList.contains("discord-message-composer-input")
	) {
		active.blur();
	}
}

/** Any path that clears the leading `/` (Esc, backspace, apps toggle) resets picker chrome. */
watch(showCommandPicker, (open) => {
	if (!open) {
		selectedApp.value = null;
		highlightedIndex.value = 0;
		return;
	}
	// Slash autocomplete and App Launcher are mutually exclusive.
	appLauncherOpen.value = false;
});

watch(appLauncherOpen, (open) => {
	if (open && composerText.value.startsWith("/")) {
		composerText.value = "";
		selectedApp.value = null;
		highlightedIndex.value = 0;
	}
});

function onComposerNavigate(direction: "up" | "down") {
	const total = selectableCommands.value.length;
	if (total === 0) return;

	if (direction === "down") {
		highlightedIndex.value = (highlightedIndex.value + 1) % total;
		return;
	}

	highlightedIndex.value = (highlightedIndex.value - 1 + total) % total;
}

/** Mirror DiscordChatMessageComposer keyboard handling for the custom value slot. */
function onComposerInputKeydown(event: KeyboardEvent) {
	if (event.key === "Enter") {
		event.preventDefault();
		onComposerSubmit();
		return;
	}

	if (event.key === "Escape") {
		event.preventDefault();
		onComposerEscape();
		return;
	}

	if (event.key === "ArrowDown") {
		event.preventDefault();
		onComposerNavigate("down");
		return;
	}

	if (event.key === "ArrowUp") {
		event.preventDefault();
		onComposerNavigate("up");
	}
}

/** Apps toolbar control toggles the Discord App Launcher popover. */
function toggleAppLauncher() {
	if (appLauncherOpen.value) {
		appLauncherOpen.value = false;
		return;
	}

	// Close slash autocomplete when opening the launcher (Discord treats them separately).
	if (composerText.value.startsWith("/")) {
		composerText.value = "";
		selectedApp.value = null;
		highlightedIndex.value = 0;
	}
	appLauncherOpen.value = true;
}

function onAppLauncherSelect(entry: DiscordAppLauncherEntry) {
	appLauncherOpen.value = false;
	// Commands execute through the same interactive send path as the slash picker.
	if (entry.kind === "command" && entry.commandName) {
		executeCommand(entry.commandName);
	}
}

/** Opens Discord mobile channel-info overlay (CSS hides it at desktop breakpoints). */
function openChannelInfo() {
	channelInfoOpen.value = true;
}

watch([slashQuery, selectedApp], () => {
	highlightedIndex.value = 0;
});

watch(selectableCommands, (commands) => {
	if (highlightedIndex.value >= commands.length) {
		highlightedIndex.value = Math.max(0, commands.length - 1);
	}
});

onMounted(() => {
	timestamp.value = Date.now();
	// Desktop opens in slash-command mode; mobile stays idle until the user types `/`.
	if (!window.matchMedia("(max-width: 767.98px)").matches) {
		composerText.value = "/";
	}
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* SurfaceCard defaults to theme --color-base-300; draw it in Discord's channel colour instead. */
:deep(.commands-showcase-card.home-surface-card) {
	background-color: var(--discord-chrome);
	border-color: var(--discord-chrome-border);
}

.showcase-discord-shell {
	/*
	 * Discord's desktop surfaces in the page's theme (Light, Ash, Dark or Onyx;
	 * see the `--discord-*` tokens in main.css). Hovers and veils are the text
	 * colour at a low alpha, so they darken on Light and lighten on the others.
	 */
	--showcase-discord-chrome: var(--discord-chrome);
	--showcase-discord-sidebar: var(--discord-sidebar);
	--showcase-discord-server: var(--discord-server);
	--showcase-discord-chrome-border: var(--discord-chrome-border);
	--showcase-discord-composer: var(--discord-composer);
	--showcase-discord-composer-muted: var(--discord-chrome-muted);
	--showcase-discord-composer-text: var(--discord-chrome-text);
	--showcase-discord-composer-hover: oklch(from var(--discord-chrome-text) l c h / 0.06);
	--showcase-discord-header-edge: var(--discord-chrome-edge);
	--showcase-discord-message-hover: oklch(from var(--discord-chrome-text) l c h / 0.03);
	--showcase-discord-primary-text: var(--discord-chrome-text);
	--showcase-discord-muted-text: var(--discord-chrome-muted);
	--showcase-mobile-command-link: var(--discord-link);

	/*
	 * Neutralize DaisyUI / Nuxt UI theme surfaces inside the mock so embeds,
	 * containers, messages, and chat take Discord's colours and never a warm
	 * page tint via --color-base-* or --discord-surface; the text follows them.
	 */
	--color-base-100: var(--showcase-discord-chrome);
	--color-base-200: var(--showcase-discord-sidebar);
	--color-base-300: var(--showcase-discord-chrome);
	--color-base-content: var(--showcase-discord-primary-text);
	--discord-surface: var(--showcase-discord-chrome);

	@apply relative flex flex-col overflow-hidden;
	background-color: var(--showcase-discord-chrome);
	color: var(--showcase-discord-primary-text);
}

.showcase-discord-workspace {
	/*
	 * Tall enough for the full member list — including Offline (Ko-fi Bot,
	 * Patreon) — without needing a scrollbar. 12 rows + 4 section headings
	 * (Star Network / Developers / External Bots / Offline) + compact padding.
	 * DiscordScrollbar stays for overflow; this height avoids forcing it.
	 */
	@apply flex min-h-0;
	height: 46rem;
}

.showcase-discord-main {
	@apply relative flex min-h-0 min-w-0 flex-1 flex-col;
	background-color: var(--showcase-discord-chrome);
}

/* Chat fills the column; composer (+ picker) overlays the bottom like Discord. */
.showcase-discord-main > :deep(.discord-chat) {
	@apply min-h-0 flex-1;
	/* Idle messages clear the desktop composer (h-11 + hairline); no extra mb. */
	padding-bottom: 2.75rem;
}

.showcase-discord-main-picker-open > :deep(.discord-chat) {
	/* Picker covers the lower channel; no need to reserve composer padding. */
	padding-bottom: 0;
}

.showcase-discord-shell :deep(.discord-channel-header) {
	--discord-channel-header-bg: var(--showcase-discord-chrome);
	--discord-channel-header-border: var(--showcase-discord-chrome-border);
	--discord-channel-header-edge: var(--showcase-discord-header-edge);
	--discord-channel-header-text: var(--showcase-discord-primary-text);
	--discord-channel-header-muted: var(--showcase-discord-muted-text);
	--discord-channel-header-search-bg: var(--showcase-discord-server);
	--discord-channel-header-search-border: var(--showcase-discord-composer);
	--discord-channel-header-search-placeholder: var(--showcase-discord-muted-text);
	--discord-channel-header-search-icon: var(--showcase-discord-primary-text);
	background-color: var(--discord-channel-header-bg);
	border-color: var(--discord-channel-header-border);
	box-shadow: 0 1px 0 var(--discord-channel-header-edge);
}

.showcase-discord-shell :deep(.discord-chat) {
	--discord-chat-bg: var(--showcase-discord-chrome);
	background-color: var(--discord-chat-bg);
}

.showcase-discord-shell :deep(.discord-chat-messages .discord-message:hover) {
	background-color: var(--showcase-discord-message-hover);
}

.showcase-discord-members {
	@apply min-h-0 self-stretch;
}

.showcase-discord-shell :deep(.showcase-discord-members.discord-member-list) {
	--discord-member-list-bg: var(--showcase-discord-sidebar);
	--discord-member-list-border: var(--showcase-discord-server);
	--discord-member-list-text: var(--showcase-discord-primary-text);
	--discord-member-list-muted: var(--showcase-discord-muted-text);
	--discord-member-list-presence-ring: var(--showcase-discord-sidebar);
	background-color: var(--showcase-discord-sidebar);
	border-color: var(--showcase-discord-server);
}

.showcase-command-picker {
	@apply absolute inset-x-0 bottom-0 z-2;
	/*
	 * Transparent on desktop so the picker↔composer gap (~8px) reveals the
	 * channel background. Mobile keeps a solid bar behind the flush stack.
	 */
	background-color: transparent;
}

.showcase-app-launcher {
	@apply relative z-2 mr-3 mb-2 ml-auto;
	width: min(31.5rem, calc(100% - 1.5rem));
}

.showcase-command-picker :deep(.discord-message-composer) {
	--discord-message-composer-bg: var(--showcase-discord-composer);
	--discord-message-composer-text: var(--showcase-discord-composer-text);
	--discord-message-composer-muted: var(--showcase-discord-composer-muted);
	--discord-message-composer-hover: var(--showcase-discord-composer-hover);
	--discord-message-composer-add-bg: oklch(from var(--discord-chrome-text) l c h / 0.1);
	--discord-message-composer-pill-bg: oklch(from var(--discord-chrome-text) l c h / 0.12);
}

.showcase-composer-slash-field {
	@apply relative flex h-full min-w-0 flex-1 items-center;
	flex-basis: 0;
}

/*
 * Input lives in this parent’s `#value` slot — composer scoped CSS may not reach it.
 * Pin Discord field chrome here so Esc/idle never shows a browser focus ring hugging
 * the placeholder, and the field fills the pill like Discord mobile.
 */
.showcase-composer-slash-field .discord-message-composer-input {
	@apply h-full min-w-0 flex-1 border-0 bg-transparent py-0 pr-2 pl-1 text-base leading-none outline-none;
	appearance: none;
	flex-basis: 0;
	width: 100%;
	color: var(--showcase-discord-composer-text);
}

.showcase-composer-slash-field .discord-message-composer-input:focus,
.showcase-composer-slash-field .discord-message-composer-input:focus-visible {
	outline: none;
	box-shadow: none;
}

.showcase-composer-slash-field .discord-message-composer-input::placeholder {
	color: var(--showcase-discord-composer-muted);
	opacity: 1;
}

.showcase-composer-slash-composed {
	@apply pointer-events-none absolute inset-y-0 left-1 z-0 flex items-center;
}

.showcase-composer-slash-mirror {
	position: relative;
	z-index: 1;
	color: transparent;
	caret-color: var(--showcase-discord-composer-text);
}

@media (max-width: 767.98px) {
	.showcase-discord-shell {
		/* The same surfaces on mobile; the composer bar is the channel. */
		--showcase-discord-composer-bar: var(--showcase-discord-chrome);
		--showcase-discord-composer-add-bg: var(--showcase-discord-server);
		--showcase-discord-composer-pill-bg: var(--showcase-discord-composer);
	}

	/* Scoped .discord-member-list { display: flex } beats Tailwind `hidden`. */
	.showcase-discord-shell :deep(.showcase-discord-members.discord-member-list) {
		display: none;
	}

	.showcase-discord-workspace {
		height: 36rem;
	}

	/* Mobile bar is taller (py-2 + pill row); keep messages clear of the flush stack. */
	.showcase-discord-main > :deep(.discord-chat) {
		padding-bottom: 3.5rem;
	}

	.showcase-discord-main-apps-open {
		/* Let the half/full sheet stack above messages without clipping under chrome. */
		overflow: visible;
	}

	.showcase-discord-main-apps-open > :deep(.discord-chat) {
		/* Sheet covers the lower messages; reserve only the composer bar. */
		padding-bottom: 3.5rem;
	}

	.showcase-discord-main-apps-full > :deep(.discord-chat) {
		/* Full sheet owns the column under the header — no composer gutter. */
		padding-bottom: 0;
	}

	.showcase-command-picker {
		/* Solid bar behind flush mobile picker + composer (no channel peek gap). */
		@apply z-3;
		background-color: var(--showcase-discord-composer-bar);
	}

	/*
	 * Match the sheet fill so rounded-corner AA on the launcher does not reveal
	 * a lighter composer-bar fringe (the “hairline” over the channel).
	 */
	.showcase-command-picker-apps-open {
		--showcase-discord-composer-bar: var(--showcase-discord-sidebar);
		@apply flex flex-col;
		background-color: var(--showcase-discord-composer-bar);
	}

	/* Discord keeps the composer above the Apps sheet, which owns the bottom edge. */
	.showcase-command-picker-apps-open :deep(.discord-message-composer) {
		order: 1;
	}

	.showcase-command-picker-apps-open :deep(.discord-app-launcher) {
		order: 2;
	}

	/*
	 * Full snap: sheet fills the channel column under the header and the
	 * message bar is unmounted (v-if on the composer).
	 */
	.showcase-command-picker-apps-full {
		@apply inset-y-0;
	}

	.showcase-command-picker-apps-full :deep(.discord-app-launcher) {
		height: 100%;
		max-height: none;
	}

	.showcase-app-launcher {
		@apply relative z-3 mx-0 mb-0 w-full max-w-none;
	}

	.showcase-command-picker :deep(.discord-slash-command-suggestions) {
		/* Full-bleed against the shell; composer sits flush below (no desktop gap/border). */
		@apply mx-0 mb-0;
		border: none;
	}

	.showcase-command-picker :deep(.discord-message-composer) {
		--discord-message-composer-text: var(--showcase-discord-composer-text);
		--discord-message-composer-muted: var(--showcase-discord-composer-muted);
		--discord-message-composer-hover: var(--showcase-discord-composer-hover);
		--discord-message-composer-add-bg: var(--showcase-discord-composer-add-bg);
		--discord-message-composer-pill-bg: var(--showcase-discord-composer-pill-bg);
	}

	.showcase-discord-shell :deep(.discord-channel-welcome-edit) {
		background-color: transparent;
		color: var(--showcase-mobile-command-link);
		@apply px-0;
	}
}

/* Channel info is a mobile Discord pattern; never show over the desktop layout. */
@media (min-width: 768px) {
	.showcase-discord-shell :deep(.showcase-discord-channel-info) {
		display: none;
	}
}

/* Custom emojis sit on the text line at its height, as in Discord. */
.showcase-custom-emoji {
	@apply inline-block size-[1.375em] object-contain align-[-0.3em];
}

/* Discord's inline code: a lighter, slightly blue chip without a border. */
.showcase-inline-code {
	/* line-height 1 keeps the mono chip from making its line taller. */
	@apply rounded px-1 py-0.5 font-mono text-[0.85em] leading-none;
	--showcase-code-surface: oklch(
		from var(--showcase-discord-chrome) calc(l + 0.05 * var(--discord-raise)) calc(c + 0.02) 280
	);
	background-color: var(--showcase-code-surface);
}

/*
 * The settings menu, measured on Discord (Components V2, 100% zoom): containers
 * 8px apart, 16px padding behind a 4px accent and 8px corners, 8px between
 * components; a section is two 20px lines beside a 60×32 button. The surfaces
 * are the channel made lighter as Discord does (OKLCH lightness): the container
 * +0.035, the select +0.022, the buttons +0.083, the separator and timestamp +0.1;
 * darker by as much on the light theme (`--discord-raise`).
 */
.showcase-settings-menu {
	--showcase-v2-container: oklch(
		from var(--showcase-discord-chrome) calc(l + 0.035 * var(--discord-raise)) c h
	);
	--showcase-v2-select: oklch(
		from var(--showcase-discord-chrome) calc(l + 0.022 * var(--discord-raise)) c h
	);
	--showcase-v2-button: oklch(
		from var(--showcase-discord-chrome) calc(l + 0.083 * var(--discord-raise)) c h
	);
	--showcase-v2-line: oklch(
		from var(--showcase-discord-chrome) calc(l + 0.1 * var(--discord-raise)) c h
	);

	@apply mt-1 flex max-w-125 flex-col gap-2;
}

.showcase-settings-menu :deep(.discord-v2-container) {
	@apply m-0 max-w-none gap-2 p-4 text-base leading-5;
	border-left-width: 4px;
	border-radius: 8px;
	background-color: var(--showcase-v2-container);
}

/* A section: its text on the left, its button as the accessory. */
.showcase-settings-section {
	@apply flex items-center justify-between gap-3;
}

.showcase-settings-text {
	@apply min-w-0 flex-1 leading-5;
}

.showcase-settings-text p {
	@apply m-0;
}

/* Discord's "## heading": 20px bold on a 24px line. */
.showcase-settings-heading {
	@apply m-0 mb-1 text-xl leading-6 font-bold;
	color: var(--showcase-discord-primary-text);
}

.showcase-settings-menu :deep(.discord-button) {
	@apply m-0 h-8 min-w-15 shrink-0 rounded-[8px] px-4;
}

.showcase-settings-menu :deep(.discord-button-secondary) {
	background-color: var(--showcase-v2-button);
	color: var(--showcase-discord-primary-text);
}

.showcase-settings-menu :deep(.discord-button-emoji) {
	@apply mr-0 size-5;
}

.showcase-settings-menu :deep(.discord-action-row) {
	@apply gap-0;
}

.showcase-settings-menu :deep(.discord-string-select-menu-trigger) {
	@apply h-10 min-h-10 rounded-[8px] px-3 text-base font-normal;
	--discord-string-select-menu-bg: var(--showcase-v2-select);
	--discord-string-select-menu-border: var(--showcase-v2-line);
}

.showcase-settings-menu :deep(.discord-string-select-menu-value-emoji) {
	@apply size-6;
}

.showcase-settings-menu :deep(.discord-v2-separator) {
	@apply py-0;
}

.showcase-settings-menu :deep(.discord-v2-separator-line) {
	border-color: var(--showcase-v2-line);
}

/* "-# ⏳ This menu closes in 15 minutes if it is not used.": Discord's subtext. */
.showcase-settings-expires {
	@apply m-0 text-[0.8125rem] leading-4;
	color: var(--showcase-discord-muted-text);
}

.showcase-settings-expires .showcase-custom-emoji {
	@apply size-4 align-[-0.2em];
}

/* A <t:…:R> timestamp: the time on a faint chip. */
.showcase-timestamp {
	@apply rounded-[3px] px-0.5;
	background-color: var(--showcase-v2-line);
}
</style>
