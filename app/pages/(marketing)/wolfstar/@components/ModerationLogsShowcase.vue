<template>
	<div>
		<SectionHeader
			eyebrow="In Action"
			title="Moderation that shows its work."
			description="Every action WolfStar takes is visible in the channel, and logged for later."
			heading-id="home-showcase-heading"
			class="mb-10"
		/>

		<section class="grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-12">
			<div class="flex flex-col-reverse items-center gap-4 max-lg:order-last lg:flex-row">
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
							<span class="text-[15px] font-semibold text-base-content">mod-log</span>
							<span class="text-xs text-muted">— WolfStar HQ</span>
						</div>
						<div class="showcase-card-body p-5">
							<DiscordMessages class="showcase-discord-feed w-full text-left">
								<DiscordMessage name="wolfstar">
									<DiscordEmbed
										:color="moderationActionRender.color"
										:author="{
											icon: '/avatars/wolfstar.png',
											name: 'WolfStar#9286 (854714837388755004)',
										}"
										:footer="{
											icon: '/avatars/wolfstar.png',
											text: 'Case 3',
										}"
										:timestamp
									>
										<span
											><strong>❯ Type:</strong>
											{{ moderationActionRender.name }}</span
										><br />
										<span
											><strong>❯ User:</strong> @baddie
											(541738403230777351)</span
										><br />
										<span><strong>❯ Reason:</strong> spam</span>
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
							Temporary
						</UButton>
						<UButton
							class="justify-center"
							:color="moderationUndo ? 'success' : 'neutral'"
							:variant="moderationUndo ? 'solid' : 'outline'"
							icon="ph:arrow-counter-clockwise-duotone"
							:disabled="moderationAction.undo === null"
							@click="
								((moderationUndo = !moderationUndo), (moderationTemporary = false))
							"
						>
							Undo
						</UButton>
					</UFieldGroup>
				</div>

				<div class="flex flex-row items-center gap-1 lg:flex-col">
					<button
						type="button"
						class="radio-feature-arrow rotate-90 lg:rotate-180"
						aria-label="Previous moderation action"
						@click="advanceModerationIndex(-1)"
					>
						<UIcon name="ph:caret-down-bold" aria-hidden="true" />
					</button>
					<label
						v-for="(action, moderationActionIndex) of moderationActions"
						:key="action.name"
						class="radio-feature-container"
						:data-tip="action.name"
						:for="`moderation-feature-${moderationActionIndex}`"
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
						aria-label="Next moderation action"
						@click="advanceModerationIndex(1)"
					>
						<UIcon name="ph:caret-down-bold" aria-hidden="true" />
					</button>
				</div>
			</div>

			<div class="showcase-copy text-left">
				<h3 class="mb-4 flex items-center gap-2 text-xl font-bold text-base-content">
					<UIcon name="ph:shield-fill" class="size-6 text-primary" aria-hidden="true" />
					A complete suite for
					<span class="text-primary underline decoration-primary/30 underline-offset-4"
						>moderation logs</span
					>
				</h3>

				<p class="text-[15px] leading-relaxed text-base-content/80">
					Easily searchable moderation logs, with a complete history of every action taken
					by WolfStar in your server, and with the ability to filter them later by user,
					action, and more!
				</p>

				<p class="mt-4 text-[15px] leading-relaxed text-base-content/80">
					<UIcon
						name="ph:binoculars-duotone"
						class="mr-1 inline size-4 text-primary"
						aria-hidden="true"
					/>
					WolfStar can also listen for external moderation actions. You prefer banning by
					hand than by bot? Good news, WolfStar can be configured to listen and log
					external bans, retrieving the reason from audit logs!
				</p>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { cast } from "@sapphire/utilities/cast";

const timestamp = ref(0);
const moderationTemporary = ref(false);
const moderationUndo = ref(false);
const moderationIndex = ref(0);

const moderationActions = Object.values(ModerationActions);

function advanceModerationIndex(value: -1 | 1) {
	moderationIndex.value =
		(moderationIndex.value + value + moderationActions.length) % moderationActions.length;
}

const moderationAction = cast<NonNullable<ComputedRef<ModerationAction>>>(
	computed(() => moderationActions[moderationIndex.value]),
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

onMounted(() => {
	timestamp.value = Date.now();
});
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

:deep(.brand-embed .discord-embed) {
	border-color: oklch(from var(--color-primary) l c h / 0.35);
	background-color: oklch(from var(--color-base-200) calc(l - 0.02) c h) !important;
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
</style>
