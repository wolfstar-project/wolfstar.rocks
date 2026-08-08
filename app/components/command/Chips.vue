<template>
	<div
		v-if="hasChips"
		class="animate-fade-in gap-3 flex flex-wrap"
		role="list"
		aria-label="Command properties"
	>
		<StarBadge
			v-if="command.permissionLevel > 0"
			color="warning"
			variant="outline"
			size="md"
			role="listitem"
			:aria-label="`Permission level: ${permissionLevelLabel}`"
			class="border-warning-300 bg-warning-50 text-warning-800 dark:border-warning-700 dark:bg-warning-950/30 dark:text-warning-200 font-semibold"
		>
			<template #leading>
				<StarIcon name="i-heroicons-chevron-double-up" class="size-4" aria-hidden="true" />
			</template>
			{{ permissionLevelLabel }}
		</StarBadge>

		<StarBadge
			v-if="isGuildOnly"
			color="info"
			variant="outline"
			size="md"
			role="listitem"
			:aria-label="`Server requirement: ${guildOnlyLabel}`"
			class="border-info-300 bg-info-50 text-info-800 dark:border-info-700 dark:bg-info-950/30 dark:text-info-200 font-semibold"
		>
			<template #leading>
				<StarIcon name="i-custom-discord" class="size-4" aria-hidden="true" />
			</template>
			{{ guildOnlyLabel }}
		</StarBadge>

		<StarBadge
			v-if="command.guarded"
			color="error"
			variant="outline"
			size="md"
			role="listitem"
			aria-label="This command cannot be disabled"
			class="border-error-300 bg-error-50 text-error-800 dark:border-error-700 dark:bg-error-950/30 dark:text-error-200 font-semibold"
		>
			<template #leading>
				<StarIcon name="i-heroicons-lock-closed" class="size-4" aria-hidden="true" />
			</template>
			Cannot be disabled
		</StarBadge>
	</div>
</template>

<script lang="ts" setup>
const { command } = defineProps<{
	command: FlattenedCommand;
}>();

const GUILD_ONLY_PRECONDITIONS = new Set([
	"Administrator",
	"DJ",
	"GuildOnly",
	"Moderator",
	"NewsOnly",
	"NSFW",
	"TextOnly",
]);

const PERMISSION_TITLES: Record<number, string> = {
	4: "This can only be ran by staff members.",
	5: "This can only be ran by moderators and administrators.",
	6: "This can only be ran by administrators.",
};

const MOBILE_TITLES: Record<number, string> = {
	4: "Staff members only",
	5: "Moderators & administrators only",
	6: "Administrators only",
};

const isGuildOnly = computed(() =>
	command.preconditions.entries
		.flatMap((preconditionEntry) => preconditionEntry.entries)
		.filter(Boolean)
		.map((entry) => entry.name)
		.some((predicate) => GUILD_ONLY_PRECONDITIONS.has(predicate)),
);

const permissionLevelLabel = computed(() =>
	isSmallScreen.value
		? MOBILE_TITLES[command.permissionLevel]
		: PERMISSION_TITLES[command.permissionLevel],
);

const guildOnlyLabel = computed(() =>
	isSmallScreen.value ? "Usable in servers only." : "This can only be used in servers.",
);

const hasChips = computed(
	() => command.permissionLevel > 0 || isGuildOnly.value || command.guarded,
);
</script>
