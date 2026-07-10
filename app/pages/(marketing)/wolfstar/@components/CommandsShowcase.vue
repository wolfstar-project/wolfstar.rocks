<template>
	<div class="mx-auto w-full max-w-250">
		<div class="flex flex-col items-stretch gap-4">
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
								:command="{
									user: activeCommand.invoker,
									name: activeCommand.name,
								}"
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
										<strong>❯ {{ line.label }}:</strong>
										<span class="showcase-embed-detail-parts"
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
									@select="selectFrequentlyUsedCommand(command.name)"
								/>
							</template>
							<template v-if="pickerMode === 'matched'" #matched>
								<DiscordSlashCommandSuggestionMatched
									:name="activeCommand.name"
									:options="activeCommand.options"
									active
								/>
							</template>
						</DiscordSlashCommandSuggestions>

						<DiscordSlashCommandInput
							v-if="pickerMode === 'matched'"
							:name="activeCommand.name"
							:options="activeCommand.options"
						/>
						<DiscordSlashCommandInput v-else :value="commandInputValue" />
					</div>
				</div>
			</SurfaceCard>

			<div class="flex items-center justify-center gap-1">
				<button
					type="button"
					class="radio-feature-arrow rotate-90"
					aria-label="Previous matched command"
					@click="selectMatchedCommand(-1)"
				>
					<UIcon name="ph:caret-down-bold" aria-hidden="true" />
				</button>
				<label
					v-for="(command, index) of showcaseCommands"
					:key="command.name"
					class="radio-feature-container"
					:data-tip="command.tooltip"
				>
					<input
						v-model="commandIndex"
						type="radio"
						name="matched-command"
						class="radio-feature"
						:value="index"
						@change="pickerMode = 'matched'"
					/>
					<span class="sr-only">{{ command.tooltip }}</span>
				</label>
				<button
					type="button"
					class="radio-feature-arrow -rotate-90"
					aria-label="Next matched command"
					@click="selectMatchedCommand(1)"
				>
					<UIcon name="ph:caret-down-bold" aria-hidden="true" />
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
type PickerMode = "frequently-used" | "matched";

const commandIndex = ref(0);
const pickerMode = ref<PickerMode>("frequently-used");
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

const frequentlyUsedCommands = computed(() =>
	showcaseCommands.filter((command) => command.frequentlyUsed),
);

function selectFrequentlyUsedCommand(name: string) {
	const index = showcaseCommands.findIndex((command) => command.name === name);
	if (index !== -1) {
		commandIndex.value = index;
		pickerMode.value = "frequently-used";
	}
}

function selectMatchedCommand(value: -1 | 1) {
	commandIndex.value =
		(commandIndex.value + value + showcaseCommands.length) % showcaseCommands.length;
	pickerMode.value = "matched";
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
