<template>
	<div
		class="discord-slash-command-suggestion"
		:class="{
			'discord-slash-command-suggestion-active': active,
			'discord-slash-command-suggestion-disabled': disabled,
		}"
		role="option"
		:aria-selected="active"
		:aria-disabled="disabled || undefined"
		:aria-label="ariaLabel"
		:tabindex="disabled ? -1 : 0"
		@click="select()"
		@keydown.enter.prevent="select()"
		@keydown.space.prevent="select()"
	>
		<DiscordChatInputCommandAppIcon
			:app
			size="row"
			class="discord-slash-command-suggestion-avatar"
		/>
		<div class="discord-slash-command-suggestion-content">
			<span class="discord-slash-command-suggestion-name"
				>/<span class="discord-slash-command-suggestion-name-path">{{ name }}</span></span
			>
			<span v-if="description" class="discord-slash-command-suggestion-description">{{
				description
			}}</span>
		</div>
		<span class="discord-slash-command-suggestion-app">{{ resolvedAppLabel }}</span>
	</div>
</template>

<script lang="ts">
interface SlashCommandSuggestionProps {
	active?: boolean;
	app?: SlashCommandAppName;
	/** Overrides the registry label, e.g. "WolfStar Beta" for a beta build. */
	appLabel?: string;
	description?: string;
	/** Renders the row as a non-selectable listbox option (third-party apps in the mock menu). */
	disabled?: boolean;
	name: string;
}

interface SlashCommandSuggestionEmits {
	select: [];
}
</script>

<script setup lang="ts">
const {
	active = false,
	app = "wolfstar",
	appLabel,
	description,
	disabled = false,
	name,
} = defineProps<SlashCommandSuggestionProps>();

const resolvedAppLabel = computed(() => appLabel ?? SlashCommandApps[app].label);

const emit = defineEmits<SlashCommandSuggestionEmits>();

function select() {
	if (disabled) return;
	emit("select");
}

const ariaLabel = computed(() => {
	const parts = [`${resolvedAppLabel.value} slash command: /${name}`];
	if (description) parts.push(description);
	return parts.join(". ");
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-suggestion {
	/* Hover/active match Discord charcoal picker rows. */
	--discord-slash-command-suggestion-hover: oklch(33.68% 0.0092 268.39);
	--discord-slash-command-suggestion-active: oklch(37.98% 0.0122 273.09);
	--discord-slash-command-suggestion-name: oklch(100% 0 0);
	--discord-slash-command-suggestion-description: oklch(78.71% 0.0114 256.71);
	--discord-slash-command-suggestion-app: oklch(78.71% 0.0114 256.71);

	@apply grid min-h-12 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 py-1.5 max-md:items-start max-md:gap-x-2.5 max-md:gap-y-0 max-md:py-2;
}

.discord-slash-command-suggestion:not(.discord-slash-command-suggestion-disabled):hover,
.discord-slash-command-suggestion-active {
	background-color: var(--discord-slash-command-suggestion-hover);
}

.discord-slash-command-suggestion-active {
	background-color: var(--discord-slash-command-suggestion-active);
}

.discord-slash-command-suggestion-disabled {
	@apply cursor-default;
}

.discord-slash-command-suggestion-avatar {
	@apply shrink-0 max-md:mt-0.5;
}

.discord-slash-command-suggestion-content {
	@apply flex min-w-0 flex-col gap-0.5 max-md:gap-0;
}

.discord-slash-command-suggestion-name {
	@apply font-whitney text-[15px] leading-tight font-semibold;
	color: var(--discord-slash-command-suggestion-name);
}

/* Discord mobile/autocomplete inserts a gap between `/` and the command path. */
.discord-slash-command-suggestion-name-path::before {
	content: "\00a0";
}

.discord-slash-command-suggestion-description {
	@apply truncate font-whitney text-[13px] leading-snug;
	color: var(--discord-slash-command-suggestion-description);
}

.discord-slash-command-suggestion-app {
	@apply shrink-0 font-whitney text-[13px] max-md:self-start max-md:pt-0.5 max-md:text-[11px] max-md:leading-tight max-md:font-bold max-md:tracking-wide max-md:uppercase;
	color: var(--discord-slash-command-suggestion-app);
}
</style>
