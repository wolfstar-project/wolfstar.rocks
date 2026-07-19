<template>
	<div class="mx-auto w-full max-w-250">
		<div class="flex flex-col items-stretch gap-4">
			<SurfaceCard padding="none" class="commands-showcase-card overflow-hidden shadow-glow">
				<div class="showcase-discord-shell">
					<DiscordChannelHeader
						name="mod-commands"
						type="text"
						search-placeholder="Search WolfStar Laboratory"
					/>

					<div class="showcase-discord-workspace">
						<div class="showcase-discord-main">
							<DiscordChat
								channel-name="mod-commands"
								date="July 16, 2026"
								date-time="2026-07-16"
								:messages="chatMessages"
							>
								<template #message="{ message }">
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
													:options="activeDisplayCommand.selectOptions"
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
								</template>
							</DiscordChat>

							<div class="showcase-command-picker">
								<DiscordSlashCommandSuggestions
									v-model:selected-app="selectedApp"
									:prefix="activeSearchPrefix"
								>
									<template #frequently-used>
										<DiscordSlashCommandSuggestion
											v-for="command of frequentlyUsedCommands"
											:key="`frequently-used-${command.name}`"
											:name="frequentlyUsedDisplayName(command)"
											:description="command.description"
											app-label="WolfStar Beta"
											:active="activeDisplayCommand.name === command.name"
											@select="selectCommand(command.name)"
										/>
									</template>

									<!-- WolfStar group only when that app is selected — avoids duplicating WolfStar under Frequently Used. -->
									<DiscordSlashCommandSuggestionGroup
										v-if="selectedApp === 'wolfstar'"
										app="wolfstar"
										label="WolfStar Beta"
									>
										<DiscordSlashCommandSuggestion
											v-for="command of showcaseCommands"
											:key="`wolfstar-${command.name}`"
											:name="frequentlyUsedDisplayName(command)"
											:description="command.description"
											app-label="WolfStar Beta"
											:active="activeDisplayCommand.name === command.name"
											@select="selectCommand(command.name)"
										/>
									</DiscordSlashCommandSuggestionGroup>

									<!-- On Frequently Used, show Staryl (first command) where the WolfStar duplicate used to be. -->
									<DiscordSlashCommandSuggestionGroup
										v-for="app of listedMockApps"
										:key="app"
										:app
									>
										<DiscordSlashCommandSuggestion
											v-for="command of listedCommandsForMockApp(app)"
											:key="`${app}-${command.name}`"
											:app
											:name="command.name"
											:description="command.description"
											disabled
										/>
									</DiscordSlashCommandSuggestionGroup>
								</DiscordSlashCommandSuggestions>

								<DiscordSlashCommandInput
									:name="activeDisplayCommand.name"
									:subcommand="activeDisplayCommand.subcommand"
									:options="activeDisplayCommand.options"
									channel-name="mod-commands"
								/>
							</div>
						</div>

						<DiscordMemberList
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
const timestamp = ref(0);

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

const onlineMembers = [
	{
		id: "wolfstar",
		name: "WolfStar",
		avatar: "/avatars/wolfstar.png",
		role: "Moderation",
		description: "/help",
		app: true,
		verified: true,
	},
	{
		id: "staryl",
		name: "Staryl",
		avatar: "/avatars/staryl.png",
		role: "Social notifications",
		description: "sb!help",
		app: true,
		verified: true,
	},
	{
		id: "astro",
		name: "Astro",
		icon: "ph:planet-fill",
		role: "Applications",
		description: "/help | astro-bot.space",
		app: true,
		verified: true,
	},
	{
		id: "dyno",
		name: "Dyno",
		icon: "ph:diamond-fill",
		role: "Applications",
		description: "dyno.gg | ?help",
		app: true,
		verified: true,
	},
	{
		id: "fire",
		name: "Fire",
		icon: "ph:fire-fill",
		role: "Applications",
		description: "getfire.bot | 4/4",
		app: true,
		verified: true,
	},
	{
		id: "green-bot",
		name: "Green-bot",
		icon: "ph:robot-fill",
		role: "Music",
		description: "/help | green-bot.app",
		app: true,
		verified: true,
	},
	{
		id: "redstar",
		name: "RedStar",
		icon: "ph:shooting-star-fill",
		role: "WolfStar Team",
		description: "Am I stuck in a rut?",
	},
] as const satisfies readonly DiscordMemberListMember[];

const offlineMembers = [
	{
		id: "flamey",
		name: "Flamey",
		icon: "ph:flame-fill",
		role: "Applications",
		app: true,
		verified: true,
	},
	{
		id: "skyra",
		name: "Skyra",
		icon: "ph:cloud-fill",
		role: "Applications",
		description: "Skyra, help",
		app: true,
		verified: true,
	},
] as const satisfies readonly DiscordMemberListMember[];

const activeSearchPrefix = computed(() => {
	const name = activeDisplayCommand.value.name;
	return `/${name.length > 3 ? name.slice(0, 3) : name}`;
});

/** Cap Frequently Used at 5 rows so the picker viewport shows a full page of commands. */
const FREQUENTLY_USED_VISIBLE_COUNT = 5;

const frequentlyUsedCommands = computed(() =>
	showcaseCommands
		.filter((command) => command.frequentlyUsed)
		.slice(0, FREQUENTLY_USED_VISIBLE_COUNT),
);

/** Discord autocomplete shows command + subcommand as a single path (e.g. `conf menu`). */
function frequentlyUsedDisplayName(command: (typeof showcaseCommands)[number]) {
	return command.subcommand ? `${command.name} ${command.subcommand}` : command.name;
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

const listedMockApps = computed<Exclude<SlashCommandAppName, "wolfstar">[]>(() => {
	if (selectedApp.value === null) return ["staryl"];
	if (selectedApp.value === "wolfstar") return [];
	return [selectedApp.value];
});

/** On the Frequently Used rail, only surface Staryl's first command (replaces the old WolfStar duplicate block). */
function listedCommandsForMockApp(app: Exclude<SlashCommandAppName, "wolfstar">) {
	const commands = mockAppCommands[app];
	if (selectedApp.value === null && app === "staryl") {
		return commands.slice(0, 1);
	}
	return commands;
}

function selectCommand(name: string) {
	const index = showcaseCommands.findIndex((command) => command.name === name);
	if (index !== -1) {
		selectedCommandIndex.value = index;
	}
}

onMounted(() => {
	timestamp.value = Date.now();
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.showcase-discord-shell {
	@apply flex flex-col overflow-hidden;
	background-color: var(--color-base-300);
}

.showcase-discord-workspace {
	@apply flex min-h-0;
	height: 38rem;
}

.showcase-discord-main {
	@apply flex min-h-0 min-w-0 flex-1 flex-col;
	background-color: var(--color-base-300);
}

.showcase-discord-members {
	@apply min-h-0 self-stretch;
}

.showcase-command-picker {
	@apply shrink-0;
	position: relative;
	z-index: 1;
	background-color: var(--color-base-300);
}

@media (width < 48rem) {
	.showcase-discord-workspace {
		height: 32rem;
	}
}
</style>
