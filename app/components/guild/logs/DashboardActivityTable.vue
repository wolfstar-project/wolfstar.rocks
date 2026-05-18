<template>
	<div class="w-full flex-1 divide-y divide-accented">
		<div class="flex items-center justify-between gap-2 overflow-x-auto px-4 py-3.5">
			<UInput
				v-model="debouncedQ"
				icon="i-lucide-search"
				placeholder="Search logs..."
				aria-label="Search logs"
				class="max-w-sm min-w-48"
			/>
		</div>
		<UTable
			ref="table"
			:data="entries"
			:columns="columns"
			:loading="status === 'pending' || status === 'idle'"
			:pagination-options="{
				getPaginationRowModel: getPaginationRowModel(),
			}"
			class="min-h-100 shrink-0"
			:ui="{
				base: 'table-fixed border-separate border-spacing-0',
				thead: '[&>tr]:bg-base-200/50 [&>tr]:after:content-none',
				tbody: '[&>tr]:last:[&>td]:border-b-0',
				th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
				td: 'border-b border-default',
				separator: 'h-0',
			}"
		>
			<template #empty>
				<UEmpty
					v-if="status !== 'pending' && status !== 'idle'"
					icon="i-lucide-activity"
					title="No logs found"
					:description="
						debouncedQ ? 'No activity matches the current filters.' : undefined
					"
				/>
			</template>
		</UTable>
		<div
			v-if="total > page"
			class="mt-4 flex items-center justify-between border-t border-default pt-4"
		>
			<p class="text-sm text-muted">
				Showing
				{{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
				{{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} entries
			</p>
			<UPagination
				:default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
				:items-per-page="table?.tableApi?.getState().pagination.pageSize"
				:total="table?.tableApi?.getFilteredRowModel().rows.length"
				@update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/table-core";
import { formatTimeAgo } from "@vueuse/core";

const UAvatar = resolveComponent("UAvatar");
const table = useTemplateRef("table");
const { guildData } = useGuildData();

const page = ref(1);
const limit = ref(20);
const filters = ref<{ q?: string }>({});
const query = ref("");

const debouncedQ = refDebounced(query, 300);
const offset = computed(() => (page.value - 1) * limit.value);

const guildId = computed(() => guildData.value.id);

const { entries, total, status } = useAuditLog({
	guildId,
	limit,
	offset,
	filters,
});

const columns: TableColumn<DashboardAuditEntry>[] = [
	{
		id: "actor",
		header: "User",
		cell: ({ row }) => {
			return h("div", { class: "flex items-center gap-3" }, [
				h(UAvatar, {
					...auditLogMemberAvatar(row.original.member),
					size: "lg",
				}),
				h("div", undefined, [
					h(
						"p",
						{ class: "font-medium text-highlighted" },
						auditLogMemberName(row.original.member),
					),
					h("p", { class: "" }, `@${row.original.member.user.username}`),
				]),
			]);
		},
	},
	{
		id: "description",
		header: "Action",
		cell: ({ row }) => h("span", { class: "text-sm" }, auditLogActionDescription(row.original)),
	},
	{
		accessorKey: "timestamp",
		header: "When",
		cell: ({ row }) =>
			h(
				"time",
				{
					datetime: row.original.timestamp,
					title: new Date(row.original.timestamp).toLocaleString(),
					class: "whitespace-nowrap text-sm text-muted",
				},
				formatTimeAgo(new Date(row.original.timestamp)),
			),
	},
];

watch(debouncedQ, (val) => {
	filters.value.q = val || undefined;
});

watch(
	[filters],
	() => {
		page.value = 1;
	},
	{ deep: true },
);
</script>
