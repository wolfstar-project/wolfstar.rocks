<template>
	<SlashCommand
		class="discord-slash-command-composed"
		:name="commandPath.commandName"
		:subcommand="commandPath.subcommand"
		:subcommand-group="commandPath.subcommandGroup"
		:options="options"
		:format-label="formatLabel"
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
import type { SlashCommandLabelState } from "~/components/ui/slash-command";
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

/** The chip's name. The path comes from the validated parts, so a lone group never reaches it. */
function formatLabel({ path, options: chipOptions }: SlashCommandLabelState) {
	const optionText = chipOptions
		.map((option) => `${option.name}: ${option.value ?? option.description ?? option.name}`)
		.join(" ");

	return ts("discord.command.label", {
		command: `/${path}${optionText ? ` ${optionText}` : ""}`,
	});
}
</script>
