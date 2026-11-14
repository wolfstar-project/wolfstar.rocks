<template>
	<!-- newt/ui hardcodes an English aria-label; the fallthrough attribute replaces it. -->
	<SlashCommand
		class="discord-slash-command-composed"
		:aria-label="ariaLabel"
		:name="commandPath.commandName"
		:subcommand="commandPath.subcommand"
		:subcommand-group="commandPath.subcommandGroup"
		:options="options"
	/>
</template>

<script lang="ts">
interface SlashCommandProps extends SlashCommandInvocation {}
</script>

<script setup lang="ts">
import type {
	SlashCommandDisplayParts,
	SlashCommandInvocation,
} from "#shared/types/chat-input-command";
import { SlashCommand } from "~/components/ui/slash-command";

const { ts } = useI18n();

const { name, subcommand, subcommandGroup, options = [] } = defineProps<SlashCommandProps>();

const commandPath = computed((): SlashCommandDisplayParts => {
	try {
		return validateSlashCommandDisplayParts({
			commandName: name,
			subcommand,
			subcommandGroup,
		});
	} catch {
		return { commandName: name };
	}
});

const ariaLabel = computed(() => {
	// The validated parts: a group without a subcommand would throw here.
	const path = formatSlashCommandDisplayName(commandPath.value);
	const optionText = options
		.map((option) => {
			const valueText = option.value ?? option.description ?? option.name;
			return `${option.name}: ${valueText}`;
		})
		.join(" ");

	return ts("discord.command.label", {
		command: `/${path}${optionText ? ` ${optionText}` : ""}`,
	});
});
</script>
