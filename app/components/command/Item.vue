<template>
	<UCollapsible
		v-model:open="open"
		class="overflow-hidden rounded-[12px] border border-(--home-border-subtle) bg-base-content/8"
	>
		<button
			type="button"
			class="flex w-full cursor-pointer items-center gap-4 px-4.5 py-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
		>
			<span class="shrink-0 font-mono text-sm font-bold text-default">
				{{ command.name }}
			</span>
			<span class="min-w-0 flex-1 truncate text-[0.8125rem] text-toned">
				{{ command.description || ts("marketing.commands.no_description") }}
			</span>
			<UIcon
				name="i-heroicons-chevron-down-20-solid"
				class="size-4 shrink-0 text-muted transition-transform duration-200"
				:class="{ 'rotate-180': open }"
				aria-hidden="true"
			/>
		</button>

		<template #content>
			<CommandBase :command class="border-t border-(--home-border-subtle)" />
		</template>
	</UCollapsible>
</template>

<script lang="ts" setup>
const { command } = defineProps<{
	command: FlattenedCommand;
}>();

const { ts } = useI18n();

const open = ref(false);
</script>
