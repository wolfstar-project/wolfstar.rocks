<template>
	<UCollapsible
		:open
		class="overflow-hidden rounded-[16px] border border-(--home-border-subtle) bg-base-100 theme-dark:bg-base-content/5"
		@update:open="(value) => emit('update:open', value)"
	>
		<button
			type="button"
			class="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
		>
			<span class="flex min-w-0 items-center gap-3">
				<span class="truncate text-[1.0625rem] font-bold text-default">{{ name }}</span>
				<span
					class="rounded-full bg-base-content/8 px-2.25 py-0.5 text-xs font-semibold text-muted"
				>
					<span aria-hidden="true">{{ commands.length }}</span>
					<span class="sr-only">
						{{ tc("marketing.commands.category_count", commands.length) }}
					</span>
				</span>
			</span>
			<UIcon
				name="i-heroicons-chevron-down-20-solid"
				class="size-4.5 shrink-0 text-muted transition-transform duration-200"
				:class="{ 'rotate-180': open }"
				aria-hidden="true"
			/>
		</button>

		<template #content>
			<ul class="flex flex-col gap-2 px-4 pt-1 pb-4">
				<li v-for="command in commands" :key="command.name">
					<CommandItem :command />
				</li>
			</ul>
		</template>
	</UCollapsible>
</template>

<script lang="ts" setup>
const { name, commands, open } = defineProps<{
	name: string;
	commands: FlattenedCommand[];
	open: boolean;
}>();

const emit = defineEmits<{
	"update:open": [open: boolean];
}>();

const { tc } = useI18n();
</script>
