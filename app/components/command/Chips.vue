<template>
	<div
		v-if="hasChips"
		class="flex animate-fade-in flex-wrap gap-3"
		role="list"
		aria-label="Command properties"
	>
		<UBadge
			v-if="command.permissionLevel > 0"
			color="warning"
			variant="outline"
			size="md"
			role="listitem"
			:aria-label="`Permission level: ${permissionLevelLabel}`"
			class="hover-lift border-warning-300 bg-warning-50 font-semibold text-warning-800 focus:ring-2 focus:ring-warning-500 focus:ring-offset-2 focus:outline-none dark:border-warning-700 dark:bg-warning-950/30 dark:text-warning-200"
		>
			<template #leading>
				<UIcon name="i-heroicons-chevron-double-up" class="size-4" aria-hidden="true" />
			</template>
			{{ permissionLevelLabel }}
		</UBadge>

		<UBadge
			v-if="isGuildOnly"
			color="info"
			variant="outline"
			size="md"
			role="listitem"
			:aria-label="`Server requirement: ${guildOnlyLabel}`"
			class="border-info-300 bg-info-50 font-semibold text-info-800 transition-all hover:scale-105 focus:ring-2 focus:ring-info-500 focus:ring-offset-2 focus:outline-none dark:border-info-700 dark:bg-info-950/30 dark:text-info-200"
		>
			<template #leading>
				<UIcon name="i-custom-discord" class="size-4" aria-hidden="true" />
			</template>
			{{ guildOnlyLabel }}
		</UBadge>

		<UBadge
			v-if="command.guarded"
			color="error"
			variant="outline"
			size="md"
			role="listitem"
			aria-label="This command cannot be disabled"
			class="border-error-300 bg-error-50 font-semibold text-error-800 transition-all hover:scale-105 focus:ring-2 focus:ring-error-500 focus:ring-offset-2 focus:outline-none dark:border-error-700 dark:bg-error-950/30 dark:text-error-200"
		>
			<template #leading>
				<UIcon name="i-heroicons-lock-closed" class="size-4" aria-hidden="true" />
			</template>
			Cannot be disabled
		</UBadge>
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
