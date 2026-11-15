<template>
	<SlashCommandSuggestionMatched
		class="discord-slash-command-suggestion-matched"
		:active
		:aria-label="ariaLabel"
		tabindex="0"
		@click="emit('select')"
		@keydown.enter.prevent="emit('select')"
		@keydown.space.prevent="emit('select')"
	>
		<DiscordChatInputCommand
			:name="name"
			:subcommand="subcommand"
			:subcommand-group="subcommandGroup"
			:options="options"
		/>
	</SlashCommandSuggestionMatched>
</template>

<script lang="ts">
interface SlashCommandSuggestionMatchedProps extends SlashCommandInvocation {
	active?: boolean;
}

interface SlashCommandSuggestionMatchedEmits {
	select: [];
}
</script>

<script setup lang="ts">
import type { SlashCommandInvocation } from "#shared/types/chat-input-command";
import { SlashCommandSuggestionMatched } from "~/components/ui/slash-command-suggestions";

const { ts } = useI18n();
const {
	active = false,
	name,
	subcommand,
	subcommandGroup,
	options = [],
} = defineProps<SlashCommandSuggestionMatchedProps>();

const emit = defineEmits<SlashCommandSuggestionMatchedEmits>();

const ariaLabel = computed(() => {
	const path = formatSlashCommandDisplayName({
		commandName: name,
		subcommand,
		subcommandGroup,
	});
	const optionText = options
		.map((option) => {
			const valueText = option.value ?? option.description ?? option.name;
			return `${option.name}: ${valueText}`;
		})
		.join(" ");
	return ts("discord.command.matched", {
		command: `/${path}${optionText ? ` ${optionText}` : ""}`,
	});
});
</script>
