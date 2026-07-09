<template>
	<div class="mx-auto w-full max-w-250">
		<SurfaceCard padding="none" class="overflow-hidden shadow-glow">
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
				<div class="showcase-discord-messages p-5 pb-3">
					<DiscordMessages class="showcase-discord-feed w-full text-left">
						<DiscordMessage
							name="wolfstar"
							:command="{ user: activeCommand.invoker, name: activeCommand.name }"
						>
							<DiscordEmbed
								:color="activeCommand.embedColor"
								:footer="{
									icon: '/avatars/wolfstar.png',
									text: activeCommand.embedFooter,
								}"
								:timestamp
							>
								<span
									v-for="(line, lineIdx) in activeCommand.embedLines"
									:key="line.label"
								>
									<strong>❯ {{ line.label }}:</strong
									><span class="showcase-embed-detail-parts"
										><template
											v-for="(part, partIdx) in line.parts"
											:key="`${lineIdx}-${partIdx}`"
											><DiscordMention
												v-if="part.type === 'mention'"
												kind="mention"
												>{{ part.name }}</DiscordMention
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

				<div class="showcase-command-picker border-t">
					<DiscordSlashCommandSuggestions :prefix="commandSearchPrefix">
						<template #frequently-used>
							<DiscordSlashCommandSuggestion
								v-for="command of frequentlyUsedCommands"
								:key="`frequently-used-${command.name}`"
								:name="command.name"
								:description="command.description"
								:active="activeCommand.name === command.name"
								@select="selectCommand(command.name)"
							/>
						</template>
						<template #matched>
							<DiscordSlashCommandSuggestion
								v-for="command of matchedCommands"
								:key="`matched-${command.name}`"
								:name="command.name"
								:description="command.description"
								:active="activeCommand.name === command.name"
								@select="selectCommand(command.name)"
							/>
						</template>
					</DiscordSlashCommandSuggestions>

					<div class="px-3 pt-2">
						<DiscordSlashCommand
							:name="activeCommand.name"
							:options="activeCommand.options"
						/>
					</div>

					<DiscordSlashCommandInput :value="commandInputValue" />
				</div>
			</div>
		</SurfaceCard>

		<div
			class="showcase-command-scroll no-scrollbar mt-4 overflow-x-auto"
			role="tablist"
			aria-label="Browse commands"
		>
			<div class="flex w-max min-w-full gap-2 px-1 pb-1">
				<button
					v-for="(command, index) of showcaseCommands"
					:key="command.name"
					:ref="(element) => setCommandChipRef(command.name, element)"
					type="button"
					role="tab"
					class="showcase-command-chip"
					:class="{ 'showcase-command-chip-active': commandIndex === index }"
					:aria-selected="commandIndex === index"
					:aria-label="command.tooltip"
					@click="commandIndex = index"
				>
					/{{ command.name }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const commandIndex = ref(0);
const timestamp = ref(0);
const commandChipElements = new Map<string, HTMLButtonElement>();

const activeCommand = computed(() => {
	const command = showcaseCommands[commandIndex.value];
	return command ?? showcaseCommands[0]!;
});

const commandSearchPrefix = computed(() => {
	const name = activeCommand.value.name;
	return `/${name.length > 3 ? name.slice(0, 3) : name}`;
});

const frequentlyUsedCommands = computed(() =>
	showcaseCommands.filter((command) => command.frequentlyUsed),
);

const matchedCommands = computed(() => {
	const prefix = commandSearchPrefix.value.slice(1).toLowerCase();
	return showcaseCommands.filter((command) => command.name.startsWith(prefix));
});

const commandInputValue = computed(() => `/${activeCommand.value.name}`);

function setCommandChipRef(name: string, element: Element | ComponentPublicInstance | null) {
	if (element instanceof HTMLButtonElement) {
		commandChipElements.set(name, element);
		return;
	}

	commandChipElements.delete(name);
}

function selectCommand(name: string) {
	const index = showcaseCommands.findIndex((command) => command.name === name);
	if (index !== -1) {
		commandIndex.value = index;
	}
}

watch(commandIndex, async () => {
	await nextTick();
	commandChipElements
		.get(activeCommand.value.name)
		?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
});

onMounted(() => {
	timestamp.value = Date.now();
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.showcase-channel-header {
	@apply flex items-center gap-2.5 border-b px-5 py-3.5;
	border-color: var(--home-border-subtle);
}

.showcase-card-body {
	background-color: var(--color-base-300);
}

.showcase-card-body > .border-t,
.showcase-command-picker {
	border-color: var(--home-border-subtle);
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

.showcase-embed-detail-parts {
	@apply inline;
}

.showcase-embed-detail-parts :deep(.tag) {
	@apply inline-flex align-baseline;
	margin: 0;
}

.showcase-command-scroll {
	scroll-snap-type: x proximity;
}

.showcase-command-chip {
	@apply shrink-0 rounded-full border border-base-content/10 bg-base-content/5 px-3 py-1.5 text-sm font-medium text-muted transition-colors;
	scroll-snap-align: center;
}

.showcase-command-chip:hover {
	@apply text-base-content;
}

.showcase-command-chip-active {
	@apply border-primary/30 bg-primary/15 text-primary shadow-glow;
}

.showcase-command-chip-active:hover {
	@apply text-primary;
}
</style>
