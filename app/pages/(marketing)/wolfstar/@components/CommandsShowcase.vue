<template>
	<div class="mx-auto w-full max-w-250">
		<div class="flex flex-col items-stretch gap-4">
			<SurfaceCard padding="none" class="commands-showcase-card overflow-hidden shadow-glow">
				<div class="showcase-discord-shell">
					<DiscordChannelHeader
						v-model:members-open="membersOpen"
						name="mod-commands"
						type="text"
						:topic="CHANNEL_TOPIC"
						search-placeholder="Search Wolfstar HQ"
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
							}"
						>
							<DiscordChat
								channel-name="mod-commands"
								:date="channelDateLabel"
								:date-time="channelDateTime"
								:topic="CHANNEL_TOPIC"
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
															:avatar="part.avatar"
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
												<DiscordMention
													kind="mention"
													:avatar="activeDisplayCommand.mentionAvatar"
													>{{
														activeDisplayCommand.mentionUser
													}}</DiscordMention
												>
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
												<DiscordActionRow>
													<DiscordStringSelectMenu
														:options="
															activeDisplayCommand.selectOptions
														"
														:placeholder="
															activeDisplayCommand.selectPlaceholder
														"
														aria-label="Server configuration category"
													/>
												</DiscordActionRow>
												<DiscordV2Separator />
												<DiscordActionRow>
													<DiscordButton
														variant="danger"
														icon="ph:stop-fill"
														:label="activeDisplayCommand.buttonLabel"
													/>
												</DiscordActionRow>
											</DiscordV2Container>
										</DiscordMessage>
									</div>
								</template>
							</DiscordChat>

							<div class="showcase-command-picker">
								<DiscordAppLauncher
									v-model:open="appLauncherOpen"
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

					<DiscordChannelInfo
						v-if="channelInfoOpen"
						class="showcase-discord-channel-info"
						name="mod-commands"
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
import type {
	DiscordAppLauncherEntry,
	DiscordChatMessage,
	DiscordMemberListMember,
} from "~/types/discord";
import ShowcaseTwemojiText from "./ShowcaseTwemojiText.vue";

/** Shared channel topic for header chrome and welcome start copy. */
const CHANNEL_TOPIC = "WolfStar moderation commands — try a slash command below.";

const selectedCommandIndex = ref(0);
const selectedApp = ref<SlashCommandAppName | null>(null);
const highlightedIndex = ref(0);
const timestamp = ref(0);
/** Discord App Launcher popover above the composer (Apps toolbar button). */
const appLauncherOpen = ref(false);
/** Desktop member list open — matches Discord default (members panel visible). */
const membersOpen = ref(true);
/** Mobile channel-info overlay (Members / Media / Pins / …). Desktop keeps the side list. */
const channelInfoOpen = ref(false);
/**
 * Slash-menu text. Start empty so SSR + mobile hydrate idle (no picker).
 * Desktop arms `/` in onMounted — avoids picker-open / empty-input hydration mismatch.
 */
const composerText = ref("");

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

/** Picker is open only while the composer still has a leading `/` (Discord closes it when `/` is removed). */
const showCommandPicker = computed(() => composerText.value.startsWith("/"));

const slashQuery = computed(() => {
	if (!composerText.value.startsWith("/")) return "";
	return composerText.value.slice(1).trimStart().toLowerCase();
});

const activeDisplayCommand = computed(() => {
	const command = showcaseCommands[selectedCommandIndex.value];
	return command ?? showcaseCommands[0]!;
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
			timestamp: "Today at 15:49",
		},
	];
});
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

/** Real WolfStar support-server member list (hoisted roles + Offline section). */
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

/** Offline — 2 (Ko-fi Bot, Patreon). Kept in the showcase; shell height + compact
 *  member-list spacing are sized so this section fits without forcing scroll. */
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

/**
 * Slash commands for App Launcher search only — selecting one runs `executeCommand`
 * (interactive send). No `/commands` page or static listing when the launcher is idle.
 */
const appLauncherCommands = computed<readonly DiscordAppLauncherEntry[]>(() =>
	showcaseCommands.map((command) => ({
		id: `command-${command.name}`,
		kind: "command" as const,
		commandName: command.name,
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
	highlightedIndex.value = 0;
	// Discord closes the slash autocomplete after send so the channel response is visible.
	composerText.value = "";
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
	if (!window.matchMedia("(width < 48rem)").matches) {
		composerText.value = "/";
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

	/*
	 * Neutralize DaisyUI / Nuxt UI theme surfaces inside the mock so embeds,
	 * containers, messages, and chat never inherit a warm/red page tint via
	 * --color-base-* or --discord-surface.
	 */
	--color-base-100: var(--showcase-discord-chrome);
	--color-base-200: var(--showcase-discord-sidebar);
	--color-base-300: var(--showcase-discord-chrome);
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
	--discord-message-composer-add-bg: oklch(100% 0 0 / 0.1);
	--discord-message-composer-pill-bg: oklch(100% 0 0 / 0.12);
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

	.showcase-command-picker {
		/* Solid bar behind flush mobile picker + composer (no channel peek gap). */
		@apply z-3;
		background-color: var(--showcase-discord-composer-bar);
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
@media (width >= 48rem) {
	.showcase-discord-shell :deep(.showcase-discord-channel-info) {
		display: none;
	}
}
</style>
