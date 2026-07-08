<template>
	<div
		v-if="variant === 'composed'"
		class="discord-slash-command-composed"
		role="group"
		:aria-label="`Slash command /${name}`"
	>
		<span class="discord-slash-command-composed-name">/{{ name }}</span>
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
	</div>

	<div
		v-else
		class="discord-slash-command"
		:class="{ 'discord-slash-command-active': active }"
		role="option"
		:aria-selected="active"
		:aria-label="ariaLabel"
	>
		<DiscordAvatar :user="bot" size="tiny" class="discord-slash-command-avatar" />
		<div class="discord-slash-command-content">
			<span class="discord-slash-command-name">/{{ name }}</span>
			<span v-if="description" class="discord-slash-command-description">{{
				description
			}}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
export interface SlashCommandOption {
	name: string;
	value?: string;
	description?: string;
	focused?: boolean;
	required?: boolean;
}

const {
	bot = "wolfstar",
	name,
	description,
	active = false,
	variant = "suggestion",
	options = [],
} = defineProps<{
	bot?: ProfileName;
	name: string;
	description?: string;
	active?: boolean;
	variant?: "suggestion" | "composed";
	options?: SlashCommandOption[];
}>();

const ariaLabel = computed(() => {
	const profile = Profiles[bot];
	const parts = [`${profile.name} slash command: /${name}`];
	if (description) parts.push(description);
	return parts.join(". ");
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command {
	--discord-slash-command-hover: hsla(223, 6.7%, 20.6%, 1);
	--discord-slash-command-active: hsla(220, 6.5%, 24%, 1);
	--discord-slash-command-name: hsl(0, 0%, 100%, 1);
	--discord-slash-command-description: hsla(220, 2.7%, 66.1%, 1);

	@apply flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5;
}

.discord-slash-command:hover,
.discord-slash-command-active {
	background-color: var(--discord-slash-command-hover);
}

.discord-slash-command-active {
	background-color: var(--discord-slash-command-active);
}

.discord-slash-command-avatar {
	@apply shrink-0;
}

.discord-slash-command-content {
	@apply flex min-w-0 flex-1 items-baseline gap-2;
}

.discord-slash-command-name {
	@apply shrink-0 font-whitney font-semibold;
	color: var(--discord-slash-command-name);
}

.discord-slash-command-description {
	@apply truncate text-sm;
	color: var(--discord-slash-command-description);
}

.discord-slash-command-composed {
	--discord-slash-command-composed-bg: hsla(223, 6.7%, 20.6%, 1);
	--discord-slash-command-composed-border: hsla(0, 0%, 100%, 0.06);
	--discord-slash-command-composed-name: hsl(0, 0%, 100%, 1);
	--discord-slash-command-option-name: hsla(220, 2.7%, 66.1%, 1);
	--discord-slash-command-option-value: hsl(0, 0%, 100%, 1);
	--discord-slash-command-option-focused: hsla(235, 85.6%, 64.7%, 0.35);
	--discord-slash-command-option-placeholder: hsla(220, 2.7%, 50%, 1);

	@apply flex flex-wrap items-center gap-1 rounded-lg border px-3 py-2 font-whitney text-sm;
	background-color: var(--discord-slash-command-composed-bg);
	border-color: var(--discord-slash-command-composed-border);
}

.discord-slash-command-composed-name {
	@apply font-semibold;
	color: var(--discord-slash-command-composed-name);
}

.discord-slash-command-option {
	@apply inline-flex items-center gap-1 rounded px-1 py-0.5;
}

.discord-slash-command-option-focused {
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

.discord-slash-command-option-placeholder {
	@apply italic;
	color: var(--discord-slash-command-option-placeholder);
}
</style>
