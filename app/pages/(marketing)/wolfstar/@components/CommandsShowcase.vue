<template>
	<div class="mx-auto w-full max-w-250">
		<SurfaceCard padding="none" class="overflow-hidden shadow-glow">
			<div class="showcase-channel-header">
				<UIcon
					name="ph:folder-fill"
					class="size-4.5 shrink-0 text-muted"
					aria-hidden="true"
				/>
				<span class="text-[15px] font-semibold text-base-content">mod-commands</span>
				<span class="text-xs text-muted">— WolfStar HQ</span>
			</div>

			<div class="showcase-card-body">
				<div class="showcase-command-picker border-b">
					<DiscordSlashCommandSuggestions :prefix="commandSearchPrefix">
						<DiscordSlashCommandSuggestion
							v-for="(command, index) of showcaseCommands"
							:key="command.name"
							:name="command.name"
							:description="command.description"
							:active="commandIndex === index"
						/>
					</DiscordSlashCommandSuggestions>

					<DiscordSlashCommandInput :value="commandInputValue" />
				</div>

				<div class="border-b px-5 py-4">
					<DiscordSlashCommand
						:name="activeCommand.name"
						:options="activeCommand.options"
					/>
				</div>

				<div class="p-5">
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
			</div>
		</SurfaceCard>

		<div class="mt-4 flex items-center justify-center gap-1">
			<button
				type="button"
				class="radio-feature-arrow rotate-90"
				aria-label="Previous command"
				@click="advanceCommandIndex(-1)"
			>
				<UIcon name="ph:caret-down-bold" aria-hidden="true" />
			</button>
			<label
				v-for="(command, index) of showcaseCommands"
				:key="command.name"
				class="radio-feature-container"
				:data-tip="command.tooltip"
				:for="`command-feature-${index}`"
			>
				<input
					:id="`command-feature-${index}`"
					v-model="commandIndex"
					type="radio"
					name="command-feature"
					class="radio-feature"
					:value="index"
				/>
				<span class="sr-only">{{ command.tooltip }}</span>
			</label>
			<button
				type="button"
				class="radio-feature-arrow -rotate-90"
				aria-label="Next command"
				@click="advanceCommandIndex(1)"
			>
				<UIcon name="ph:caret-down-bold" aria-hidden="true" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
const commandIndex = ref(0);
const timestamp = ref(0);

const activeCommand = computed(() => {
	const command = showcaseCommands[commandIndex.value];
	return command ?? showcaseCommands[0]!;
});

const commandSearchPrefix = computed(() => {
	const name = activeCommand.value.name;
	return `/${name.length > 3 ? name.slice(0, 3) : name}`;
});

const commandInputValue = computed(() => `/${activeCommand.value.name}`);

function advanceCommandIndex(value: -1 | 1) {
	commandIndex.value =
		(commandIndex.value + value + showcaseCommands.length) % showcaseCommands.length;
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
}

.showcase-card-body {
	background-color: var(--color-base-300);
}

.showcase-card-body > .border-b {
	border-color: var(--home-border-subtle);
}

.showcase-command-picker {
	border-color: var(--home-border-subtle);
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

.radio-feature-container {
	@apply tooltip tooltip-top;
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
</style>
