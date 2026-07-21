<template>
	<div class="mx-auto w-full max-w-250">
		<div class="flex flex-col items-stretch gap-4">
			<SurfaceCard padding="none" class="commands-showcase-card overflow-hidden shadow-glow">
				<div class="showcase-discord-shell">
					<DiscordChannelHeader
						v-model:members-open="membersOpen"
						name="mod-commands"
						type="text"
						topic="WolfStar moderation commands — try a slash command below."
						search-placeholder="Search"
						:online-count="onlineMembers.length"
						:notification-count="48"
					/>

					<div class="showcase-discord-workspace">
						<div class="showcase-discord-main">
							<DiscordChat
								channel-name="mod-commands"
								:date="channelDateLabel"
								:date-time="channelDateTime"
								:messages="chatMessages"
							>
								<template #message="{ message }">
									<!-- Desktop: slash-command reply + text / embed / components response. -->
									<div
										class="showcase-desktop-command-response hidden md:contents"
									>
										<DiscordMessage
											:name="message.author"
											:timestamp="message.timestamp"
											:reply="{
												kind: 'command',
												user: activeDisplayCommand.invoker,
												commandName: activeDisplayCommand.name,
												subcommand: activeDisplayCommand.subcommand,
											}"
										>
											<DiscordEmbed
												v-if="activeDisplayCommand.responseType === 'embed'"
												:color="activeDisplayCommand.embedColor"
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
															>{{ part.name }}</DiscordMention
														><template v-else>{{
															part.content
														}}</template></template
													><br />
												</span>
											</DiscordEmbed>
											<span
												v-else-if="
													activeDisplayCommand.responseType === 'text'
												"
												class="showcase-desktop-text-response"
											>
												<ShowcaseTwemojiText
													:line="activeDisplayCommand.content"
												/>
												<DiscordMention kind="mention">{{
													activeDisplayCommand.mentionUser
												}}</DiscordMention>
											</span>
											<DiscordV2Container
												v-else
												:accent-color="activeDisplayCommand.accentColor"
											>
												<DiscordV2TextDisplay>
													<div
														v-for="(
															line, lineIdx
														) in activeDisplayCommand.lines"
														:key="lineIdx"
													>
														<ShowcaseTwemojiText :line="line" />
													</div>
												</DiscordV2TextDisplay>
												<DiscordV2Separator />
												<DiscordV2ActionRow>
													<DiscordV2StringSelectMenu
														:options="
															activeDisplayCommand.selectOptions
														"
														:placeholder="
															activeDisplayCommand.selectPlaceholder
														"
														aria-label="Server configuration category"
													/>
												</DiscordV2ActionRow>
												<DiscordV2Separator />
												<DiscordV2ActionRow>
													<DiscordV2Button
														variant="danger"
														icon="ph:stop-fill"
														:label="activeDisplayCommand.buttonLabel"
													/>
												</DiscordV2ActionRow>
											</DiscordV2Container>
										</DiscordMessage>
									</div>

									<!-- Mobile: Discord /commands-style markdown + Component V2 browser (no slash picker). -->
									<div class="showcase-mobile-command-browser md:hidden">
										<DiscordMessage
											name="wolfstar"
											timestamp="Today at 12:37"
											:reply="{
												kind: 'command',
												user: 'redstar',
												commandName: 'commands',
											}"
										>
											<div class="showcase-mobile-command-cards">
												<DiscordV2Container>
													<div class="showcase-mobile-browser-header">
														<div class="showcase-mobile-browser-title">
															<UIcon
																name="ph:command-bold"
																class="size-4 shrink-0"
																aria-hidden="true"
															/>
															<span>Command Browser</span>
														</div>
														<div
															class="showcase-mobile-browser-search"
															aria-hidden="true"
														>
															<UIcon
																name="ph:magnifying-glass"
																class="size-4"
															/>
														</div>
													</div>
													<DiscordV2TextDisplay>
														<p class="showcase-mobile-browser-subtitle">
															Select a category to view commands.
														</p>
													</DiscordV2TextDisplay>
													<button
														type="button"
														class="showcase-mobile-category-button"
														aria-label="All Commands category"
													>
														<span
															class="showcase-mobile-category-button-label"
														>
															<UIcon
																name="ph:list-bullets-bold"
																class="size-4 shrink-0"
																aria-hidden="true"
															/>
															All Commands
														</span>
														<UIcon
															name="ph:caret-right-bold"
															class="size-3.5 shrink-0"
															aria-hidden="true"
														/>
													</button>
												</DiscordV2Container>

												<DiscordV2Container>
													<div
														class="showcase-mobile-all-commands-header"
													>
														<UIcon
															name="ph:list-bullets-bold"
															class="size-4 shrink-0"
															aria-hidden="true"
														/>
														<span>All Commands</span>
													</div>
													<DiscordV2Separator />
													<ol
														class="showcase-mobile-command-list"
														aria-label="WolfStar commands"
													>
														<li
															v-for="(
																command, index
															) of showcaseCommands"
															:key="command.name"
														>
															<span
																class="showcase-mobile-command-index"
																aria-hidden="true"
																>{{ index + 1 }}.
															</span>
															<button
																type="button"
																class="showcase-mobile-command-link"
																:class="{
																	'showcase-mobile-command-link-active':
																		activeDisplayCommand.name ===
																		command.name,
																}"
																:aria-current="
																	activeDisplayCommand.name ===
																	command.name
																		? 'true'
																		: undefined
																"
																@click="
																	executeCommand(command.name)
																"
															>
																/{{ commandDisplayName(command) }}
															</button>
														</li>
													</ol>
												</DiscordV2Container>
											</div>
										</DiscordMessage>
									</div>
								</template>
							</DiscordChat>

							<div class="showcase-command-picker">
								<DiscordChatInputCommandSuggestions
									v-if="showCommandPicker"
									id="showcase-slash-suggestions"
									v-model:selected-app="selectedApp"
									:prefix="activeSearchPrefix"
								>
									<template #frequently-used>
										<DiscordChatInputCommandSuggestion
											v-for="command of frequentlyUsedCommands"
											:id="suggestionOptionId(command.name)"
											:key="`frequently-used-${command.name}`"
											:name="commandDisplayName(command)"
											:description="command.description"
											app-label="WolfStar Beta"
											:active="isSuggestionActive(command.name)"
											@select="executeCommand(command.name)"
										/>
									</template>

									<template v-if="matchedCommand" #matched>
										<DiscordChatInputCommandMatched
											:name="matchedCommand.name"
											:subcommand="matchedCommand.subcommand"
											:options="matchedCommand.options"
											active
											@select="executeCommand(matchedCommand.name)"
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
											:id="suggestionOptionId(command.name)"
											:key="`wolfstar-${command.name}`"
											:name="commandDisplayName(command)"
											:description="command.description"
											app-label="WolfStar Beta"
											:active="isSuggestionActive(command.name)"
											@select="executeCommand(command.name)"
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

								<DiscordChatMessageComposer
									v-model="composerText"
									channel-name="mod-commands"
									autocomplete
									:aria-controls="
										showCommandPicker ? 'showcase-slash-suggestions' : undefined
									"
									:aria-expanded="showCommandPicker"
									:aria-activedescendant="activeDescendantId"
									@open-apps="toggleCommandMode"
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
												class="discord-message-composer-input"
												:class="{
													'showcase-composer-slash-mirror':
														matchedCommand,
												}"
												:placeholder="
													matchedCommand
														? undefined
														: 'Message #mod-commands'
												"
												aria-label="Message #mod-commands"
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
				</div>
			</SurfaceCard>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { DiscordChatMessage, DiscordMemberListMember } from "~/types/discord";
import ShowcaseTwemojiText from "./ShowcaseTwemojiText.vue";

const selectedCommandIndex = ref(0);
const selectedApp = ref<SlashCommandAppName | null>(null);
const highlightedIndex = ref(0);
const timestamp = ref(0);
/** Desktop member list open — matches Discord default (members panel visible). */
const membersOpen = ref(true);
/** Slash-menu open state mirrors Discord (`/` in the composer while suggestions are visible). */
const composerText = ref("/");

const channelNow = new Date();
const channelDateLabel = new Intl.DateTimeFormat("en-US", {
	month: "long",
	day: "numeric",
	year: "numeric",
}).format(channelNow);
const channelDateTime = [
	String(channelNow.getFullYear()),
	String(channelNow.getMonth() + 1).padStart(2, "0"),
	String(channelNow.getDate()).padStart(2, "0"),
].join("-");

/** Picker stays open while the composer is in slash-command mode (leading `/`). */
const showCommandPicker = computed(() => composerText.value.startsWith("/"));

const slashQuery = computed(() => {
	if (!composerText.value.startsWith("/")) return "";
	return composerText.value.slice(1).trimStart().toLowerCase();
});

const activeDisplayCommand = computed(() => {
	const command = showcaseCommands[selectedCommandIndex.value];
	return command ?? showcaseCommands[0]!;
});

const chatMessages = computed<DiscordChatMessage[]>(() => [
	{
		id: `${activeDisplayCommand.value.name}-${activeDisplayCommand.value.subcommand ?? ""}`,
		author: "wolfstar",
		timestamp: "Today at 15:49",
	},
]);
/**
 * Support-server role colors (oklch) — Discord-true, no maroon.
 * Pink / scarlet / salmon match Developers + External Bots name tints.
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

/** Real WolfStar support-server member list (hoisted roles + offline). */
const onlineMembers = [
	{
		id: "ring",
		name: "Ring",
		icon: "ph:discord-logo-fill",
		role: "Star Network",
		app: true,
		verified: false,
		http: true,
		pinned: true,
	},
	{
		id: "staryl",
		name: "Staryl",
		avatar: "/avatars/staryl.png",
		role: "Star Network",
		app: true,
		verified: true,
		http: true,
		pinned: true,
	},
	{
		id: "wolfstar",
		name: "WolfStar",
		avatar: "/avatars/wolfstar.png",
		role: "Star Network",
		description: "WolfStar, help",
		app: true,
		verified: true,
		presence: "online",
		pinned: true,
	},
	{
		id: "wolfstar-beta",
		name: "WolfStar Beta",
		avatar: "/avatars/wolfstar.png",
		role: "Star Network",
		description: "WolfStar, help",
		app: true,
		verified: true,
		presence: "online",
		pinned: true,
	},
	{
		id: "lory",
		name: "RVG|lory",
		avatar: "/avatars/lory.png",
		role: "Developers",
		description: "🐺 Are you sure? 🐺",
		presence: "dnd",
		color: DISCORD_ROLE_PINK,
		pinned: true,
		rowBackground: DEVELOPER_ROW_BG,
	},
	{
		id: "redstar",
		name: "RedStar",
		avatar: "/avatars/redstar.png",
		role: "Developers",
		description: "🎮+1 • Am I stuck in a rut, doi...",
		presence: "dnd",
		color: DISCORD_ROLE_SCARLET,
		pinned: true,
		rowBackground: DEVELOPER_ROW_BG,
	},
	{
		id: "discohook-utils",
		name: "Discohook Utils",
		icon: "ph:link-simple-horizontal-bold",
		role: "External Bots",
		description: "discohook.app/guide",
		app: true,
		verified: true,
		presence: "online",
		color: DISCORD_ROLE_SALMON,
		pinned: true,
	},
	{
		id: "linear",
		name: "Linear",
		icon: "ph:line-segments-bold",
		role: "External Bots",
		app: true,
		verified: true,
		http: true,
		color: DISCORD_ROLE_SALMON,
		pinned: true,
	},
	{
		id: "teryl",
		name: "Teryl",
		icon: "ph:user-circle-fill",
		role: "External Bots",
		app: true,
		verified: true,
		http: true,
		color: DISCORD_ROLE_SALMON,
		pinned: true,
	},
	{
		id: "topgg",
		name: "Top.gg",
		icon: "ph:chart-bar-fill",
		role: "External Bots",
		app: true,
		verified: true,
		presence: "online",
		color: DISCORD_ROLE_SALMON,
		pinned: true,
	},
] as const satisfies readonly DiscordMemberListMember[];

const offlineMembers = [
	{
		id: "kofi-bot",
		name: "Ko-fi Bot",
		icon: "ph:coffee-fill",
		app: true,
		verified: true,
		presence: "offline",
	},
	{
		id: "patreon",
		name: "Patreon",
		icon: "ph:handshake-fill",
		app: true,
		verified: true,
		presence: "offline",
	},
] as const satisfies readonly DiscordMemberListMember[];

const activeSearchPrefix = computed(() => {
	if (composerText.value.startsWith("/")) return composerText.value;
	return "/";
});

/** Discord autocomplete shows command + subcommand as a single path (e.g. `conf menu`). */
function commandDisplayName(command: (typeof showcaseCommands)[number]) {
	return command.subcommand ? `${command.name} ${command.subcommand}` : command.name;
}

function matchesSlashQuery(displayName: string, query: string) {
	if (!query) return true;
	return displayName.toLowerCase().startsWith(query);
}

const filteredShowcaseCommands = computed(() =>
	showcaseCommands.filter((command) =>
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
	return command ? suggestionOptionId(command.name) : undefined;
});

function suggestionOptionId(name: string) {
	return `showcase-slash-option-${name}`;
}

function isSuggestionActive(name: string) {
	const highlighted = selectableCommands.value[highlightedIndex.value];
	if (highlighted) return highlighted.name === name;
	return activeDisplayCommand.value.name === name;
}

interface MockAppCommand {
	name: string;
	description: string;
}

const mockAppCommands: Record<Exclude<SlashCommandAppName, "wolfstar">, MockAppCommand[]> = {
	catbot: [{ name: "cat", description: "Send a random cat picture." }],
	dyno: [{ name: "modlogs", description: "View moderation logs for a member." }],
	fmbot: [
		{ name: "fm", description: "Show what you are listening to right now." },
		{ name: "addfriend", description: "Add a friend to your .fmbot friends." },
	],
	utilsbot: [{ name: "poll", description: "Start a poll in this channel." }],
	staryl: [
		{
			name: "twitch-subscriptions show",
			description: "Show all Twitch subscriptions for this server.",
		},
		{
			name: "twitch-subscriptions add",
			description: "Add a new Twitch subscription for a streamer.",
		},
	],
	ring: [{ name: "info", description: "Get information about the bot." }],
};

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
	return mockAppCommands[app].filter((command) =>
		matchesSlashQuery(command.name, slashQuery.value),
	);
}

/** Click / Enter: run the showcase command and refresh the chat mock response. */
function executeCommand(name: string) {
	const index = showcaseCommands.findIndex((command) => command.name === name);
	const command = index !== -1 ? showcaseCommands[index] : undefined;
	if (command === undefined) return;

	selectedCommandIndex.value = index;
	selectedApp.value = null;
	composerText.value = "/";
	highlightedIndex.value = 0;
}

/** Type-ahead arm: fill the composer path so matched-command chrome appears before send. */
function armCommand(command: (typeof showcaseCommands)[number]) {
	composerText.value = `/${commandDisplayName(command)}`;
}

function onComposerSubmit() {
	if (!composerText.value.startsWith("/")) return;

	if (matchedCommand.value) {
		executeCommand(matchedCommand.value.name);
		return;
	}

	const highlighted = selectableCommands.value[highlightedIndex.value];
	if (highlighted) {
		armCommand(highlighted);
	}
}

function onComposerEscape() {
	composerText.value = "";
	selectedApp.value = null;
	highlightedIndex.value = 0;
}

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

/** Apps/grid control toggles Discord slash-command mode (idle ↔ `/` + picker). */
function toggleCommandMode() {
	if (composerText.value.startsWith("/")) {
		composerText.value = "";
		selectedApp.value = null;
		highlightedIndex.value = 0;
		return;
	}

	composerText.value = "/";
	highlightedIndex.value = 0;
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
	// Mobile opens like Discord idle: empty composer, Command Browser in chat, no slash panel.
	if (window.matchMedia("(width < 48rem)").matches) {
		composerText.value = "";
	}
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* SurfaceCard defaults to theme --color-base-300; pin Discord charcoal so the card never reads red/warm. */
:deep(.commands-showcase-card.home-surface-card) {
	--commands-showcase-card-bg: oklch(26.65% 0.006 272.93);
	--commands-showcase-card-border: oklch(19.34% 0.004 273.16);
	background-color: var(--commands-showcase-card-bg);
	border-color: var(--commands-showcase-card-border);
}

.showcase-discord-shell {
	/* Authentic Discord desktop dark theme (chat / sidebar / server / input surfaces). */
	--showcase-discord-chrome: oklch(26.65% 0.006 272.93);
	--showcase-discord-sidebar: oklch(23.47% 0.005 272.95);
	--showcase-discord-server: oklch(19.34% 0.004 273.16);
	--showcase-discord-chrome-border: oklch(19.34% 0.004 273.16);
	--showcase-discord-composer: oklch(28.84% 0.007 272.93);
	--showcase-discord-composer-muted: oklch(71.01% 0.01 273.13);
	--showcase-discord-composer-text: oklch(91.56% 0.004 272.93);
	--showcase-discord-composer-hover: oklch(100% 0 0 / 0.06);
	--showcase-discord-header-edge: oklch(0% 0 0 / 0.2);
	--showcase-discord-message-hover: oklch(100% 0 0 / 0.03);
	--showcase-discord-primary-text: oklch(91.56% 0.004 272.93);
	--showcase-discord-muted-text: oklch(71.01% 0.01 273.13);
	--showcase-mobile-command-link: oklch(64.78% 0.154 262.35);
	--showcase-mobile-card-bg: oklch(23.47% 0.005 272.95);
	--showcase-mobile-card-button: oklch(28.84% 0.007 272.93);

	/*
	 * Neutralize DaisyUI / Nuxt UI theme surfaces inside the mock so embeds,
	 * containers, messages, and chat never inherit a warm/red page tint via
	 * --color-base-* or --discord-surface.
	 */
	--color-base-100: var(--showcase-discord-chrome);
	--color-base-200: var(--showcase-discord-sidebar);
	--color-base-300: var(--showcase-discord-chrome);
	--discord-surface: var(--showcase-discord-chrome);

	@apply flex flex-col overflow-hidden;
	background-color: var(--showcase-discord-chrome);
	color: var(--showcase-discord-primary-text);
}

.showcase-discord-workspace {
	@apply flex min-h-0;
	height: 38rem;
}

.showcase-discord-main {
	@apply flex min-h-0 min-w-0 flex-1 flex-col;
	background-color: var(--showcase-discord-chrome);
}

.showcase-discord-shell :deep(.discord-channel-header) {
	--discord-channel-header-bg: var(--showcase-discord-chrome);
	--discord-channel-header-border: var(--showcase-discord-chrome-border);
	--discord-channel-header-edge: var(--showcase-discord-header-edge);
	--discord-channel-header-text: var(--showcase-discord-primary-text);
	--discord-channel-header-muted: var(--showcase-discord-muted-text);
	--discord-channel-header-search-bg: var(--showcase-discord-server);
	--discord-channel-header-search-border: var(--showcase-discord-composer);
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
	@apply shrink-0;
	position: relative;
	z-index: 1;
	/* Shared bar behind picker + composer (flush stack; no channel peek gap). */
	background-color: var(--showcase-discord-chrome);
}

.showcase-command-picker :deep(.discord-message-composer) {
	--discord-message-composer-bg: var(--showcase-discord-composer);
	--discord-message-composer-text: var(--showcase-discord-composer-text);
	--discord-message-composer-muted: var(--showcase-discord-composer-muted);
	--discord-message-composer-hover: var(--showcase-discord-composer-hover);
	--discord-message-composer-add-bg: oklch(100% 0 0 / 0.1);
	--discord-message-composer-pill-bg: oklch(100% 0 0 / 0.12);
}

.showcase-composer-slash-field {
	@apply relative flex h-full min-w-0 flex-1 items-center;
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

.showcase-mobile-command-cards {
	@apply flex flex-col gap-2;
}

.showcase-mobile-command-browser :deep(.discord-v2-container) {
	border-left-width: 0;
	border-radius: 0.75rem;
	background-color: var(--showcase-mobile-card-bg);
}

.showcase-mobile-browser-header,
.showcase-mobile-all-commands-header {
	@apply flex items-center gap-2 font-whitney text-sm font-semibold text-base-content;
}

.showcase-mobile-browser-header {
	@apply justify-between;
}

.showcase-mobile-browser-title,
.showcase-mobile-all-commands-header {
	@apply flex min-w-0 items-center gap-1.5;
}

.showcase-mobile-browser-search {
	@apply inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted;
	background-color: var(--showcase-mobile-card-button);
}

.showcase-mobile-browser-subtitle {
	@apply m-0 text-[13px] text-muted;
}

.showcase-mobile-category-button {
	@apply mt-1 flex w-full items-center justify-between gap-2 rounded-full border-0 px-3 py-2 text-left font-whitney text-sm font-medium text-base-content;
	background-color: var(--showcase-mobile-card-button);
}

.showcase-mobile-category-button-label {
	@apply inline-flex min-w-0 items-center gap-2;
}

.showcase-mobile-command-list {
	@apply m-0 flex list-none flex-col gap-1.5 p-0 font-whitney text-sm;
}

.showcase-mobile-command-list > li {
	@apply flex min-w-0 items-baseline gap-0;
}

.showcase-mobile-command-index {
	@apply shrink-0 text-base-content;
}

.showcase-mobile-command-link {
	@apply cursor-pointer border-0 bg-transparent p-0 font-whitney text-sm font-medium;
	color: var(--showcase-mobile-command-link);
}

.showcase-mobile-command-link:hover,
.showcase-mobile-command-link:focus-visible {
	text-decoration: underline;
	text-underline-offset: 2px;
}

.showcase-mobile-command-link:focus-visible {
	@apply outline-2 outline-offset-2 outline-primary;
}

.showcase-mobile-command-link-active {
	text-decoration: underline;
	text-underline-offset: 2px;
}

@media (width < 48rem) {
	.showcase-discord-shell {
		/* Same Discord-true dark palette on mobile; composer bar matches input field. */
		--showcase-discord-composer-bar: oklch(26.65% 0.006 272.93);
		--showcase-discord-composer-add-bg: oklch(19.34% 0.004 273.16);
		--showcase-discord-composer-pill-bg: oklch(28.84% 0.007 272.93);
	}

	/* Scoped .discord-member-list { display: flex } beats Tailwind `hidden`. */
	.showcase-discord-shell :deep(.showcase-discord-members.discord-member-list) {
		display: none;
	}

	.showcase-discord-workspace {
		height: 32rem;
	}

	.showcase-command-picker {
		background-color: var(--showcase-discord-composer-bar);
	}

	.showcase-command-picker :deep(.discord-slash-command-suggestions) {
		/* Full-bleed against the shell; composer sits flush below. */
		@apply mx-0 mb-0;
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
</style>
