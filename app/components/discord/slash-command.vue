<template>
	<span class="discord-slash-command-composed" role="group" :aria-label="ariaLabel">
		<span class="discord-slash-command-composed-name">/{{ name }}</span>
		<span v-if="commandPath.subcommandGroup" class="discord-slash-command-composed-segment">
			{{ commandPath.subcommandGroup }}
		</span>
		<span v-if="commandPath.subcommand" class="discord-slash-command-composed-segment">
			{{ commandPath.subcommand }}
		</span>
		<template v-for="option in options" :key="option.name">
			<span
				class="discord-slash-command-option"
				:class="{ 'discord-slash-command-option-focused': option.focused }"
			>
				<span class="discord-slash-command-option-name">{{ option.name }}</span>
				<span v-if="option.value" class="discord-slash-command-option-value">{{
					option.value
				}}</span>
				<span v-else class="discord-slash-command-option-placeholder">{{
					option.description ?? option.name
				}}</span>
			</span>
		</template>
		<slot />
	</span>
</template>

<script lang="ts">
import type { SlashCommandInvocation } from "#shared/types/slash-command";
import type { VNode } from "vue";

interface SlashCommandProps extends SlashCommandInvocation {}

interface SlashCommandSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import {
	formatSlashCommandDisplayName,
	validateSlashCommandDisplayParts,
} from "#shared/utils/format-slash-command-display-name";

defineSlots<SlashCommandSlots>();

const props = withDefaults(defineProps<SlashCommandProps>(), {
	options: () => [],
});

const commandPath = computed(() => {
	try {
		return validateSlashCommandDisplayParts({
			commandName: props.name,
			subcommand: props.subcommand,
			subcommandGroup: props.subcommandGroup,
		});
	} catch {
		return { commandName: props.name };
	}
});

const ariaLabel = computed(() => {
	const path = formatSlashCommandDisplayName({
		commandName: props.name,
		subcommand: props.subcommand,
		subcommandGroup: props.subcommandGroup,
	});
	const optionText = props.options
		.map((option) => {
			const valueText = option.value ?? option.description ?? option.name;
			return `${option.name}: ${valueText}`;
		})
		.join(" ");

	return `Slash command /${path}${optionText ? ` ${optionText}` : ""}`;
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-composed {
	--discord-slash-command-composed-name: hsl(0, 0%, 100%, 1);
	--discord-slash-command-option-name: hsla(220, 2.7%, 66.1%, 1);
	--discord-slash-command-option-value: hsl(0, 0%, 100%, 1);
	--discord-slash-command-option-focused: hsla(235, 85.6%, 64.7%, 0.35);
	--discord-slash-command-option-placeholder: hsla(220, 2.7%, 50%, 1);

	@apply inline font-whitney text-sm whitespace-nowrap;
}

.discord-slash-command-composed-name,
.discord-slash-command-composed-segment {
	@apply font-semibold;
	color: var(--discord-slash-command-composed-name);
}

.discord-slash-command-composed-segment::before {
	content: " ";
}

.discord-slash-command-option {
	@apply inline;
}

.discord-slash-command-option::before {
	content: " ";
}

.discord-slash-command-option-focused {
	@apply rounded-sm px-0.5;
	background-color: var(--discord-slash-command-option-focused);
}

.discord-slash-command-option-name {
	color: var(--discord-slash-command-option-name);
}

.discord-slash-command-option-name::after {
	content: ":";
}

.discord-slash-command-option-value {
	@apply font-medium;
	color: var(--discord-slash-command-option-value);
}

.discord-slash-command-option-value::before {
	content: " ";
}

.discord-slash-command-option-placeholder {
	@apply italic;
	color: var(--discord-slash-command-option-placeholder);
}

.discord-slash-command-option-placeholder::before {
	content: " ";
}
</style>
