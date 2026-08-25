<template>
	<div class="mx-auto w-full max-w-250">
		<SurfaceCard padding="none" class="staryl-showcase-card overflow-hidden shadow-glow">
			<div class="staryl-discord-shell">
				<DiscordChannelHeader
					:name="CHANNEL_NAME"
					type="text"
					:topic="channelTopic"
					:search-placeholder="t('marketing.staryl.showcase.search_placeholder')"
					:online-count="0"
				/>

				<div class="staryl-discord-workspace">
					<div
						class="staryl-discord-main"
						:class="{ 'staryl-discord-main-picker-open': showCommandPicker }"
					>
						<DiscordChat
							:channel-name="CHANNEL_NAME"
							:date="channelDateLabel"
							:date-time="channelDateTime"
							:topic="channelTopic"
							:messages="chatMessages"
						>
							<template #message="{ message }">
								<DiscordMessage
									:name="message.author"
									:timestamp="message.timestamp"
									ephemeral
									:reply="{
										kind: 'command',
										user: activeCommand.invoker,
										commandName: activeCommand.name,
										subcommandGroup: activeCommand.subcommandGroup,
										subcommand: activeCommand.subcommand,
									}"
								>
									<DiscordEmbed
										v-if="activeCommand.response.type === 'embed'"
										:title="activeCommand.response.title"
									>
										<span
											v-for="line of activeCommand.response.lines"
											:key="line"
										>
											{{ line }}<br />
										</span>
									</DiscordEmbed>
									<p v-else class="staryl-command-response">
										{{ activeCommand.response.content }}
									</p>
								</DiscordMessage>
							</template>
						</DiscordChat>

						<div class="staryl-command-picker">
							<DiscordChatInputCommandSuggestions
								v-if="showCommandPicker"
								id="staryl-slash-suggestions"
								:prefix="activeSearchPrefix"
							>
								<template #frequently-used>
									<DiscordChatInputCommandSuggestion
										v-for="command of filteredCommands"
										:id="suggestionOptionId(command)"
										:key="commandDisplayName(command)"
										:name="commandDisplayName(command)"
										:description="command.description"
										app-label="Staryl"
										:active="isSuggestionActive(command)"
										@select="executeCommand(command)"
									/>
								</template>

								<template v-if="matchedCommand" #matched>
									<DiscordChatInputCommandMatched
										:name="matchedCommand.name"
										:subcommand-group="matchedCommand.subcommandGroup"
										:subcommand="matchedCommand.subcommand"
										:options="matchedCommand.options"
										active
										@select="executeCommand(matchedCommand)"
									/>
								</template>
							</DiscordChatInputCommandSuggestions>

							<DiscordChatMessageComposer
								v-model="composerText"
								:channel-name="CHANNEL_NAME"
								autocomplete
								:aria-controls="
									showCommandPicker ? 'staryl-slash-suggestions' : undefined
								"
								:aria-expanded="showCommandPicker"
								:aria-activedescendant="activeDescendantId"
								@submit="onComposerSubmit"
								@escape="onComposerEscape"
								@navigate="onComposerNavigate"
							>
								<template #value>
									<div class="staryl-composer-slash-field">
										<DiscordChatInputCommand
											v-if="matchedCommand"
											class="staryl-composer-slash-composed"
											:name="matchedCommand.name"
											:subcommand-group="matchedCommand.subcommandGroup"
											:subcommand="matchedCommand.subcommand"
											:options="matchedCommand.options"
										/>
										<input
											v-model="composerText"
											type="text"
											class="discord-message-composer-input w-full min-w-0 flex-1 outline-none"
											:class="{
												'staryl-composer-slash-mirror': matchedCommand,
											}"
											:placeholder="
												matchedCommand ? undefined : composerLabel
											"
											:aria-label="composerLabel"
											:aria-controls="
												showCommandPicker
													? 'staryl-slash-suggestions'
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
				</div>
			</div>
		</SurfaceCard>
	</div>
</template>

<script setup lang="ts">
import type { SlashCommandOption } from "#shared/types/chat-input-command";
import type { DiscordChatMessage } from "~/types/discord";

interface StarylShowcaseCommand {
	name: string;
	subcommandGroup?: string;
	subcommand?: string;
	description: string;
	invoker: ProfileName;
	options: SlashCommandOption[];
	response: { type: "embed"; title: string; lines: string[] } | { type: "text"; content: string };
}

const { t } = useI18n();

const CHANNEL_NAME = "staryl-notifications";

const channelTopic = computed(() => t("marketing.staryl.showcase.channel_topic"));
const composerLabel = computed(() =>
	t("marketing.staryl.showcase.composer_placeholder", { channel: CHANNEL_NAME }),
);

const twitchOptions = computed<SlashCommandOption[]>(() => [
	{ name: "streamer", value: "shroud" },
	{ name: "channel", value: `#${CHANNEL_NAME}` },
	{ name: "type", value: "Stream Online", focused: true },
]);

const starylCommands = computed<StarylShowcaseCommand[]>(() => [
	{
		name: "subscriptions",
		subcommandGroup: "twitch",
		subcommand: "add",
		description: t("marketing.staryl.showcase.add_description"),
		invoker: "redstar",
		options: twitchOptions.value,
		response: {
			type: "text",
			content: t("marketing.staryl.showcase.add_response"),
		},
	},
	{
		name: "subscriptions",
		subcommandGroup: "twitch",
		subcommand: "remove",
		description: t("marketing.staryl.showcase.remove_description"),
		invoker: "redstar",
		options: twitchOptions.value,
		response: {
			type: "text",
			content: t("marketing.staryl.showcase.remove_response"),
		},
	},
	{
		name: "subscriptions",
		subcommandGroup: "twitch",
		subcommand: "reset",
		description: t("marketing.staryl.showcase.reset_description"),
		invoker: "redstar",
		options: [],
		response: {
			type: "text",
			content: t("marketing.staryl.showcase.reset_response"),
		},
	},
	{
		name: "subscriptions",
		subcommandGroup: "twitch",
		subcommand: "show",
		description: t("marketing.staryl.showcase.show_description"),
		invoker: "redstar",
		options: [],
		response: {
			type: "embed",
			title: t("marketing.staryl.showcase.show_embed_title"),
			lines: [
				t("marketing.staryl.showcase.show_embed_online"),
				t("marketing.staryl.showcase.show_embed_offline"),
			],
		},
	},
	{
		name: "subscriptions",
		subcommandGroup: "twitch",
		subcommand: "test",
		description: t("marketing.staryl.showcase.test_description"),
		invoker: "redstar",
		options: twitchOptions.value,
		response: {
			type: "text",
			content: t("marketing.staryl.showcase.test_response"),
		},
	},
]);

type StarylCommand = StarylShowcaseCommand;

const selectedCommandIndex = ref(0);
const highlightedIndex = ref(0);
const timestamp = ref(0);
/** Start empty so SSR and mobile hydrate idle; desktop arms `/` on mount. */
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

const showCommandPicker = computed(() => composerText.value.startsWith("/"));

const slashQuery = computed(() => {
	if (!composerText.value.startsWith("/")) return "";
	return composerText.value.slice(1).trimStart().toLowerCase();
});

const activeCommand = computed(
	() => starylCommands.value[selectedCommandIndex.value] ?? starylCommands.value[0]!,
);

const chatMessages = computed<DiscordChatMessage[]>(() => {
	const command = activeCommand.value;
	return [
		{
			id: `response-${commandDisplayName(command).replaceAll(" ", "-")}`,
			author: "staryl",
			timestamp: t("marketing.staryl.showcase.timestamp"),
		},
	];
});

const activeSearchPrefix = computed(() =>
	composerText.value.startsWith("/") ? composerText.value : "/",
);

function commandDisplayName(command: StarylCommand) {
	return formatSlashCommandDisplayName(toSlashCommandDisplayInput(command));
}

function matchesSlashQuery(displayName: string, query: string) {
	if (!query) return true;
	return displayName.toLowerCase().startsWith(query);
}

const filteredCommands = computed(() =>
	starylCommands.value.filter((command) =>
		matchesSlashQuery(commandDisplayName(command), slashQuery.value),
	),
);

const matchedCommand = computed(() => {
	const query = slashQuery.value;
	if (!query) return undefined;

	const exact = filteredCommands.value.find(
		(command) => commandDisplayName(command).toLowerCase() === query,
	);
	if (exact) return exact;

	if (filteredCommands.value.length === 1) return filteredCommands.value[0];

	return undefined;
});

/** Keyed on the full command path — `name` alone is ambiguous across subcommands. */
function suggestionOptionId(command: StarylCommand) {
	return `staryl-slash-option-${commandDisplayName(command).replace(/\s+/g, "-")}`;
}

const activeDescendantId = computed(() => {
	if (!showCommandPicker.value) return undefined;
	const command = filteredCommands.value[highlightedIndex.value];
	return command ? suggestionOptionId(command) : undefined;
});

function isSuggestionActive(command: StarylCommand) {
	const highlighted = filteredCommands.value[highlightedIndex.value];
	if (highlighted) return highlighted === command;
	return activeCommand.value === command;
}

function executeCommand(command: StarylCommand) {
	const index = starylCommands.value.indexOf(command);
	if (index === -1) return;

	selectedCommandIndex.value = index;
	highlightedIndex.value = 0;
	composerText.value = "";
}

function armCommand(command: StarylCommand) {
	composerText.value = `/${commandDisplayName(command)}`;
}

function onComposerSubmit() {
	if (!composerText.value.startsWith("/")) return;

	if (matchedCommand.value) {
		executeCommand(matchedCommand.value);
		return;
	}

	const highlighted = filteredCommands.value[highlightedIndex.value];
	if (highlighted) armCommand(highlighted);
}

function onComposerEscape() {
	composerText.value = "";
	highlightedIndex.value = 0;

	const active = document.activeElement;
	if (
		active instanceof HTMLInputElement &&
		active.classList.contains("discord-message-composer-input")
	) {
		active.blur();
	}
}

function onComposerNavigate(direction: "up" | "down") {
	const total = filteredCommands.value.length;
	if (total === 0) return;

	if (direction === "down") {
		highlightedIndex.value = (highlightedIndex.value + 1) % total;
		return;
	}

	highlightedIndex.value = (highlightedIndex.value - 1 + total) % total;
}

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

watch(slashQuery, () => {
	highlightedIndex.value = 0;
});

watch(filteredCommands, (commands) => {
	if (highlightedIndex.value >= commands.length) {
		highlightedIndex.value = Math.max(0, commands.length - 1);
	}
});

onMounted(() => {
	timestamp.value = Date.now();
	if (!window.matchMedia("(max-width: 767.98px)").matches) {
		composerText.value = "/";
	}
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* SurfaceCard defaults to theme --color-base-300; pin Discord charcoal so the card never reads warm. */
:deep(.staryl-showcase-card.home-surface-card) {
	--staryl-showcase-card-bg: oklch(26.65% 0.006 272.93);
	--staryl-showcase-card-border: oklch(19.34% 0.004 273.16);
	background-color: var(--staryl-showcase-card-bg);
	border-color: var(--staryl-showcase-card-border);
}

:global([data-theme="light"]) :deep(.staryl-showcase-card.home-surface-card) {
	--staryl-showcase-card-bg: oklch(97.31% 0.003 264);
	--staryl-showcase-card-border: oklch(89.75% 0.008 264);
}

.staryl-discord-shell {
	--staryl-discord-chrome: oklch(26.65% 0.006 272.93);
	--staryl-discord-sidebar: oklch(23.47% 0.005 272.95);
	--staryl-discord-server: oklch(19.34% 0.004 273.16);
	--staryl-discord-composer: oklch(28.84% 0.007 272.93);
	--staryl-discord-composer-muted: oklch(71.01% 0.01 273.13);
	--staryl-discord-composer-text: oklch(91.56% 0.004 272.93);
	--staryl-discord-composer-hover: oklch(100% 0 0 / 0.06);
	--staryl-discord-header-edge: oklch(0% 0 0 / 0.2);
	--staryl-discord-message-hover: oklch(100% 0 0 / 0.03);
	--staryl-discord-primary-text: oklch(91.56% 0.004 272.93);
	--staryl-discord-muted-text: oklch(71.01% 0.01 273.13);
	--staryl-discord-composer-add: oklch(19.34% 0.004 273.16);
	--staryl-discord-composer-pill: oklch(28.84% 0.007 272.93);

	/* Neutralize DaisyUI / Nuxt UI theme surfaces inside the mock. */
	--color-base-100: var(--staryl-discord-chrome);
	--color-base-200: var(--staryl-discord-sidebar);
	--color-base-300: var(--staryl-discord-chrome);
	--discord-surface: var(--staryl-discord-chrome);

	@apply relative flex flex-col overflow-hidden;
	background-color: var(--staryl-discord-chrome);
	color: var(--staryl-discord-primary-text);
}

/* Discord's light client: a cool off-white canvas, distinct side surfaces, and near-black copy. */
:global([data-theme="light"]) .staryl-discord-shell {
	--staryl-discord-chrome: oklch(98.17% 0.002 264);
	--staryl-discord-sidebar: oklch(95.74% 0.004 264);
	--staryl-discord-server: oklch(92.64% 0.006 264);
	--staryl-discord-composer: oklch(93.74% 0.005 264);
	--staryl-discord-composer-muted: oklch(47.12% 0.012 264);
	--staryl-discord-composer-text: oklch(21.15% 0.009 264);
	--staryl-discord-composer-hover: oklch(21.15% 0.009 264 / 0.08);
	--staryl-discord-header-edge: oklch(21.15% 0.009 264 / 0.08);
	--staryl-discord-message-hover: oklch(21.15% 0.009 264 / 0.035);
	--staryl-discord-primary-text: oklch(21.15% 0.009 264);
	--staryl-discord-muted-text: oklch(47.12% 0.012 264);
	--staryl-discord-composer-add: var(--staryl-discord-composer-muted);
	--staryl-discord-composer-pill: var(--staryl-discord-chrome);
}

.staryl-discord-workspace {
	@apply flex min-h-0;
	height: 32rem;
}

.staryl-discord-main {
	@apply relative flex min-h-0 min-w-0 flex-1 flex-col;
	background-color: var(--staryl-discord-chrome);
}

.staryl-discord-main > :deep(.discord-chat) {
	@apply min-h-0 flex-1;
	padding-bottom: 2.75rem;
}

.staryl-discord-main-picker-open > :deep(.discord-chat) {
	padding-bottom: 0;
}

.staryl-discord-shell :deep(.discord-channel-header) {
	--discord-channel-header-bg: var(--staryl-discord-chrome);
	--discord-channel-header-border: var(--staryl-discord-server);
	--discord-channel-header-edge: var(--staryl-discord-header-edge);
	--discord-channel-header-text: var(--staryl-discord-primary-text);
	--discord-channel-header-muted: var(--staryl-discord-muted-text);
	--discord-channel-header-search-bg: var(--staryl-discord-server);
	--discord-channel-header-search-border: var(--staryl-discord-composer);
	--discord-channel-header-search-placeholder: var(--staryl-discord-muted-text);
	--discord-channel-header-search-icon: var(--staryl-discord-primary-text);
	background-color: var(--discord-channel-header-bg);
	border-color: var(--discord-channel-header-border);
	box-shadow: 0 1px 0 var(--discord-channel-header-edge);
}

.staryl-discord-shell :deep(.discord-chat) {
	--discord-chat-bg: var(--staryl-discord-chrome);
	background-color: var(--discord-chat-bg);
}

.staryl-discord-shell :deep(.discord-chat-messages .discord-message:hover) {
	background-color: var(--staryl-discord-message-hover);
}

.staryl-command-picker {
	@apply absolute inset-x-0 bottom-0 z-2;
	background-color: transparent;
}

.staryl-command-picker :deep(.discord-message-composer) {
	--discord-message-composer-bg: var(--staryl-discord-composer);
	--discord-message-composer-text: var(--staryl-discord-composer-text);
	--discord-message-composer-muted: var(--staryl-discord-composer-muted);
	--discord-message-composer-hover: var(--staryl-discord-composer-hover);
	--discord-message-composer-add-bg: var(--staryl-discord-composer-add);
	--discord-message-composer-pill-bg: var(--staryl-discord-composer-pill);
}

.staryl-composer-slash-field {
	@apply relative flex h-full min-w-0 flex-1 items-center;
	flex-basis: 0;
}

.staryl-composer-slash-field .discord-message-composer-input {
	@apply h-full min-w-0 flex-1 border-0 bg-transparent py-0 pr-2 pl-1 text-base leading-none outline-none;
	appearance: none;
	flex-basis: 0;
	width: 100%;
	color: var(--staryl-discord-composer-text);
}

.staryl-composer-slash-field .discord-message-composer-input:focus,
.staryl-composer-slash-field .discord-message-composer-input:focus-visible {
	outline: none;
	box-shadow: none;
}

.staryl-composer-slash-field .discord-message-composer-input::placeholder {
	color: var(--staryl-discord-composer-muted);
	opacity: 1;
}

.staryl-composer-slash-composed {
	@apply pointer-events-none absolute inset-y-0 left-1 z-0 flex items-center;
}

.staryl-composer-slash-mirror {
	position: relative;
	z-index: 1;
	color: transparent;
	caret-color: var(--staryl-discord-composer-text);
}

.staryl-command-response {
	@apply m-0 text-base;
	color: var(--staryl-discord-primary-text);
}

@media (max-width: 767.98px) {
	.staryl-discord-workspace {
		height: 28rem;
	}

	.staryl-discord-main > :deep(.discord-chat) {
		padding-bottom: 3.5rem;
	}

	.staryl-command-picker {
		@apply z-3;
		background-color: var(--staryl-discord-chrome);
	}

	.staryl-command-picker :deep(.discord-slash-command-suggestions) {
		@apply mx-0 mb-0;
		border: none;
	}
}
</style>
