<template>
	<div class="flex flex-col gap-4">
		<LogsFilterBar v-model="filters.q">
			<USelect
				v-model="filters.success"
				:items="[
					{ label: 'All', value: 'all' },
					{ label: 'Success', value: 'success' },
					{ label: 'Failed', value: 'failure' },
				]"
				label="Status"
			/>
		</LogsFilterBar>
		<div :aria-busy="status === 'pending'" class="relative">
			<UTable :data="entries" :columns="columns" class="min-h-100">
				<template #empty>
					<UEmpty
						icon="i-lucide-terminal"
						title="No commands found"
						description="Command logging requires WolfStar bot integration. Contact your server owner."
					/>
				</template>
			</UTable>
			<div
				v-if="status === 'pending'"
				class="absolute inset-0 flex items-center justify-center bg-base-100/50 backdrop-blur-sm"
			>
				<LoadingSpinner size="lg" />
			</div>
		</div>
		<div class="flex justify-end border-t border-base-200 pt-4">
			<UPagination
				v-if="total > limit"
				v-model:page="page"
				:total="total"
				:page-size="limit"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { CommandLogEntry } from "#shared/types/command-log";
import type { TableColumn } from "@nuxt/ui";

const UBadge = resolveComponent("UBadge");
const UUser = resolveComponent("UUser");

const props = defineProps<{
	guildId: string;
}>();

const page = ref(1);
const limit = ref(20);
const offset = computed(() => (page.value - 1) * limit.value);

const filters = ref<{ q?: string; success?: "all" | "success" | "failure" }>({ success: "all" });

const { entries, total, status } = useCommandLog({
	guildId: computed(() => props.guildId),
	limit,
	offset,
	filters,
});

const columns: TableColumn<CommandLogEntry>[] = [
	{
		accessorKey: "executedAt",
		header: "Time",
		cell: ({ row }) =>
			h(
				"time",
				{
					datetime: row.original.executedAt,
					class: "whitespace-nowrap text-sm text-muted",
				},
				new Date(row.original.executedAt).toLocaleString(),
			),
	},
	{
		id: "actor",
		header: "User",
		cell: ({ row }) => {
			const member = row.original.member;
			return h(UUser, {
				name: member ? auditLogMemberName(member) : row.original.userId,
				avatar: member
					? auditLogMemberAvatar(member)
					: { alt: row.original.userId, src: undefined },
				size: "sm",
			});
		},
	},
	{
		accessorKey: "commandName",
		header: "Command",
		cell: ({ row }) => {
			const label = row.original.subcommand
				? `/${row.original.commandName} ${row.original.subcommand}`
				: `/${row.original.commandName}`;
			return h("span", { class: "font-mono text-sm" }, label);
		},
	},
	{
		accessorKey: "success",
		header: "Status",
		cell: ({ row }) =>
			h(
				UBadge,
				{
					color: row.original.success ? "success" : "error",
					variant: "subtle",
					size: "sm",
				},
				() => (row.original.success ? "Success" : "Failed"),
			),
	},
	{
		accessorKey: "latencyMs",
		header: "Latency",
		cell: ({ row }) =>
			h(
				"span",
				{ class: "text-sm text-muted" },
				row.original.latencyMs !== null ? `${row.original.latencyMs}ms` : "—",
			),
	},
];

watch(
	[filters],
	() => {
		page.value = 1;
	},
	{ deep: true },
);
</script>
