<template>
	<div class="w-full flex-1 divide-y divide-accented">
		<div class="flex items-center gap-2 overflow-x-auto px-4 py-3.5">
			<UInput
				v-model="q"
				icon="i-lucide-search"
				placeholder="Search logs..."
				aria-label="Search logs"
				class="max-w-sm min-w-48"
			/>
		</div>
		<div :aria-busy="status === 'pending'" class="relative">
			<UTable :data="entries" :columns="columns" class="min-h-100">
				<template #empty>
					<UEmpty
						icon="i-lucide-activity"
						title="No logs found"
						:description="
							debouncedQ ? 'No activity matches the current filters.' : undefined
						"
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
		<div class="flex justify-end px-4 py-3.5">
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
import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { TableColumn } from "@nuxt/ui";

const UUser = resolveComponent("UUser");
const { guildData } = useGuildData();

const page = ref(1);
const limit = ref(20);
const offset = computed(() => (page.value - 1) * limit.value);

const filters = ref<{ q?: string }>({});

const q = ref("");
const debouncedQ = refDebounced(q, 300);
watch(debouncedQ, (val) => {
	filters.value.q = val || undefined;
});

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
		cell: ({ row }) =>
			h(UUser, {
				name: auditLogMemberName(row.original.member),
				avatar: auditLogMemberAvatar(row.original.member),
				size: "sm",
			}),
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
				{ datetime: row.original.timestamp, class: "whitespace-nowrap text-sm text-muted" },
				new Date(row.original.timestamp).toLocaleString(),
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
