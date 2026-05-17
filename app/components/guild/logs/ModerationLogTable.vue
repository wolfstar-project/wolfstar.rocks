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
						icon="i-lucide-gavel"
						title="No moderation cases found"
						:description="
							debouncedQ ? 'No cases match the current filters.' : undefined
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
import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { TableColumn } from "@nuxt/ui";
import { moderationActionVariant } from "~/utils/constants";

const UBadge = resolveComponent("UBadge");
const UUser = resolveComponent("UUser");
const { guildData } = useGuildData();

const { warningsOnly } = defineProps<{
	warningsOnly?: boolean;
}>();

const page = ref(1);
const limit = ref(20);
const offset = computed(() => (page.value - 1) * limit.value);

const filters = ref<{ q?: string; typeCode?: number }>({});
if (warningsOnly) {
	filters.value.typeCode = 1;
}

const q = ref("");
const debouncedQ = refDebounced(q, 300);
watch(debouncedQ, (val) => {
	filters.value.q = val || undefined;
});

const guildId = computed(() => guildData.value.id);
const { entries, total, status } = useModerationLog({
	guildId,
	limit,
	offset,
	filters,
});

const columns: TableColumn<ModerationLogEntry>[] = [
	{
		accessorKey: "caseId",
		header: "Case",
		cell: ({ row }) => h("span", { class: "text-sm font-medium" }, `#${row.original.caseId}`),
	},
	{
		accessorKey: "typeName",
		header: "Action",
		cell: ({ row }) =>
			h(
				UBadge,
				{
					color: moderationActionVariant(row.original.typeName),
					variant: "subtle",
					size: "sm",
				},
				() => row.original.typeName,
			),
	},
	{
		id: "target",
		header: "User",
		cell: ({ row }) => {
			const member = row.original.targetMember;
			return h(UUser, {
				name: member ? auditLogMemberName(member) : "Unknown",
				avatar: member ? auditLogMemberAvatar(member) : undefined,
				size: "sm",
			});
		},
	},
	{
		id: "moderator",
		header: "Moderator",
		cell: ({ row }) => {
			const member = row.original.moderatorMember;
			return h(UUser, {
				name: member ? auditLogMemberName(member) : "Unknown",
				avatar: member ? auditLogMemberAvatar(member) : undefined,
				size: "sm",
			});
		},
	},
	{
		accessorKey: "reason",
		header: "Reason",
		cell: ({ row }) =>
			h(
				"span",
				{
					class: "line-clamp-1 max-w-xs text-sm text-muted",
					title: row.original.reason ?? "No reason provided",
				},
				row.original.reason ?? "No reason provided",
			),
	},
	{
		accessorKey: "createdAt",
		header: "Date",
		cell: ({ row }) =>
			h(
				"time",
				{ datetime: row.original.createdAt ?? "", class: "text-sm text-muted" },
				row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : "—",
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
