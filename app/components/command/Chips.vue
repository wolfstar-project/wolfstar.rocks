<template>
	<ul
		v-if="hasChips"
		class="flex flex-wrap gap-2"
		:aria-label="ts('marketing.commands.properties_label')"
	>
		<li
			v-if="permissionLabel"
			class="inline-flex h-7 items-center gap-1.5 rounded-full border border-warning/55 bg-warning/12 px-3 text-xs font-semibold text-warning theme-light:text-highlighted"
		>
			<UIcon name="i-heroicons-chevron-double-up" class="size-3.25" aria-hidden="true" />
			{{ permissionLabel }}
		</li>

		<li
			v-if="isGuildOnly"
			class="inline-flex h-7 items-center gap-1.5 rounded-full border border-(--home-blurple-soft) bg-primary/8 px-3 text-xs font-semibold text-primary"
		>
			<UIcon name="i-custom-discord" class="size-3" aria-hidden="true" />
			{{ ts("marketing.commands.server_only") }}
		</li>

		<li
			v-if="command.guarded"
			class="inline-flex h-7 items-center gap-1.5 rounded-full border border-error/55 bg-error/12 px-3 text-xs font-semibold text-error theme-light:text-highlighted"
		>
			<UIcon name="i-heroicons-lock-closed" class="size-3" aria-hidden="true" />
			{{ ts("marketing.commands.guarded") }}
		</li>
	</ul>
</template>

<script lang="ts" setup>
const { command } = defineProps<{
	command: FlattenedCommand;
}>();

const { ts } = useI18n();

const GUILD_ONLY_PRECONDITIONS = new Set([
	"Administrator",
	"DJ",
	"GuildOnly",
	"Moderator",
	"NewsOnly",
	"NSFW",
	"TextOnly",
]);

const isGuildOnly = computed(() =>
	command.preconditions.entries
		.flatMap((preconditionEntry) => preconditionEntry.entries)
		.filter(Boolean)
		.map((entry) => entry.name)
		.some((predicate) => GUILD_ONLY_PRECONDITIONS.has(predicate)),
);

const permissionLabel = computed(() => {
	switch (command.permissionLevel) {
		case 4:
			return ts("marketing.commands.permission_staff");
		case 5:
			return ts("marketing.commands.permission_moderator");
		case 6:
			return ts("marketing.commands.permission_administrator");
		default:
			return undefined;
	}
});

const hasChips = computed(
	() => Boolean(permissionLabel.value) || isGuildOnly.value || command.guarded,
);
</script>
