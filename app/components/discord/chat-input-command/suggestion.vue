<template>
	<SlashCommandSuggestion
		class="discord-slash-command-suggestion"
		:class="{ 'discord-slash-command-suggestion-disabled': disabled }"
		:name
		:description
		:app-label="resolvedAppLabel"
		:active
		:disabled
		:aria-label="ariaLabel"
		:tabindex="disabled ? -1 : 0"
		@click="select()"
		@keydown.enter.prevent="select()"
		@keydown.space.prevent="select()"
	>
		<template #icon>
			<DiscordChatInputCommandAppIcon :app size="row" />
		</template>
	</SlashCommandSuggestion>
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
import { SlashCommandSuggestion } from "~/components/ui/slash-command-suggestions";

const { ts } = useI18n();
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
	const parts = [
		ts("discord.command.suggestion", { app: resolvedAppLabel.value, command: `/${name}` }),
	];
	if (description) parts.push(description);
	return parts.join(". ");
});
</script>
