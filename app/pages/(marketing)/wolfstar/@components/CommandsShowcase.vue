<template>
	<div class="mx-auto w-full max-w-250">
		<div class="flex flex-col items-stretch gap-4">
			<SurfaceCard padding="none" class="commands-showcase-card overflow-hidden shadow-glow">
				<div class="showcase-channel-header">
					<UIcon
						name="discord:text-channel"
						class="size-4.5 shrink-0 text-muted"
						aria-hidden="true"
					/>
					<span class="text-[15px] font-semibold text-base-content">mod-commands</span>
					<span class="text-xs text-muted">— WolfStar HQ</span>
				</div>

				<div class="showcase-card-body flex flex-col">
					<div class="showcase-discord-messages p-5 pb-0">
						<DiscordMessages class="showcase-discord-feed w-full text-left">
							<DiscordMessage
								name="wolfstar"
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
										v-for="(line, lineIdx) in activeDisplayCommand.embedLines"
										:key="line.label"
									>
										<strong>❯ {{ line.label }}:</strong>
										<template
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
											v-for="(line, lineIdx) in activeDisplayCommand.lines"
											:key="lineIdx"
										>
											<ShowcaseTwemojiText :line="line" />
										</div>
									</DiscordV2TextDisplay>
									<DiscordV2Separator />
									<DiscordV2ActionRow>
										<DiscordV2StringSelectMenu
											:options="activeDisplayCommand.selectOptions"
											:placeholder="activeDisplayCommand.selectPlaceholder"
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
						</DiscordMessages>
					</div>

					<div class="showcase-command-picker">
						<DiscordSlashCommandSuggestions
							v-model:selected-app="selectedApp"
							:prefix="activeSearchPrefix"
						>
							<template #frequently-used>
								<DiscordSlashCommandSuggestion
									v-for="command of frequentlyUsedCommands"
									:key="`frequently-used-${command.name}`"
									:name="command.name"
									:description="command.description"
									:active="activeDisplayCommand.name === command.name"
									@select="selectCommand(command.name)"
								/>
							</template>

							<DiscordSlashCommandSuggestionGroup
								v-if="selectedApp === null || selectedApp === 'wolfstar'"
								app="wolfstar"
							>
								<DiscordSlashCommandSuggestion
									v-for="command of listedWolfstarCommands"
									:key="`wolfstar-${command.name}`"
									:name="command.name"
									:description="command.description"
									:active="activeDisplayCommand.name === command.name"
									@select="selectCommand(command.name)"
								/>
							</DiscordSlashCommandSuggestionGroup>

							<DiscordSlashCommandSuggestionGroup
								v-for="app of listedMockApps"
								:key="app"
								:app
							>
								<DiscordSlashCommandSuggestion
									v-for="command of mockAppCommands[app]"
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
						/>
					</div>
				</div>
			</SurfaceCard>
		</div>
	</div>
</template>

<script setup lang="ts">
import ShowcaseTwemojiText from "./ShowcaseTwemojiText.vue";

const selectedCommandIndex = ref(0);
const selectedApp = ref<SlashCommandAppName | null>(null);
const timestamp = ref(0);

const activeDisplayCommand = computed(() => {
	const command = showcaseCommands[selectedCommandIndex.value];
	return command ?? showcaseCommands[0]!;
});

const activeSearchPrefix = computed(() => {
	const name = activeDisplayCommand.value.name;
	return `/${name.length > 3 ? name.slice(0, 3) : name}`;
});

const frequentlyUsedCommands = computed(() =>
	showcaseCommands.filter((command) => command.frequentlyUsed),
);

const otherCommands = computed(() => showcaseCommands.filter((command) => !command.frequentlyUsed));

/** Picking WolfStar in the app rail lists every command, not just the ones outside "Frequently Used". */
const listedWolfstarCommands = computed(() =>
	selectedApp.value === "wolfstar" ? showcaseCommands : otherCommands.value,
);

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

.showcase-channel-header {
	@apply flex items-center gap-2.5 border-b px-5 py-3.5;
	border-color: var(--home-border-subtle);
	background-color: var(--color-base-300);
}

.showcase-discord-messages {
	background-color: var(--color-base-300);
}

.showcase-command-picker {
	--showcase-command-picker-bg: hsl(220, 7%, 12%);

	position: relative;
	z-index: 1;
	background-color: var(--showcase-command-picker-bg);
}

.showcase-discord-messages :deep(.discord-messages) {
	@apply rounded-none shadow-none;
	background-color: transparent;
}

.showcase-discord-feed {
	@apply rounded-none shadow-none;
	background-color: transparent;
}

:deep(.showcase-discord-feed .discord-message) {
	@apply rounded-lg px-2 py-2 sm:px-4 sm:py-2.5;
	background-color: transparent;
}

:deep(.showcase-discord-feed .discord-message:hover) {
	background-color: oklch(from var(--color-base-content) l c h / 0.04);
}
</style>
