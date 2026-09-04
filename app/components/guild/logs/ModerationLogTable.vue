<template>
	<div class="w-full flex-1 divide-y divide-accented">
		<div class="flex items-center gap-2 overflow-x-auto px-4 py-3.5">
			<UInput
				v-model="q"
				icon="i-lucide-search"
				:placeholder="ts('guild_logs.search_placeholder')"
				:aria-label="ts('guild_logs.search_aria')"
				class="max-w-sm min-w-48"
			/>
			<USelect
				v-if="!warningsOnly"
				v-model="selectedTypeCode"
				:items="actionTypeItems"
				value-key="value"
				label-key="label"
				icon="i-lucide-filter"
				class="w-48"
				:aria-label="ts('guild_logs.filter_action')"
			/>
		</div>
		<ActivitySection
			:plain="true"
			:total="total"
			:status="status"
			:item-count="entries.length"
			:max-visible="total"
			empty-icon="i-lucide-gavel"
			:empty-title="
				warningsOnly ? ts('guild_logs.no_warnings') : ts('guild_logs.no_moderation_cases')
			"
			:empty-description="debouncedQ ? ts('guild_logs.no_filter_match') : undefined"
			:refresh-label="ts('guild_logs.refresh_moderation')"
			record-label="case"
			@refresh="refresh()"
		>
			<UTable
				:data="entries"
				:columns="columns"
				:loading="status === 'pending'"
				class="min-h-100"
			/>
			<div class="flex justify-end border-t border-accented px-4 py-3.5">
				<UPagination
					v-if="total > limit"
					v-model:page="page"
					:total="total"
					:page-size="limit"
				/>
			</div>
		</ActivitySection>
	</div>
</template>

<script setup lang="ts">
import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { TableColumn } from "@nuxt/ui";
import { MODERATION_TYPE_FILTER_VALUES } from "#shared/types/moderation-types";
import { formatTimeAgo } from "@vueuse/core";

const UBadge = resolveComponent("UBadge");
const UUser = resolveComponent("UUser");
const { guildData } = useGuildData();
const { ts } = useI18n();

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

const selectedTypeCode = ref<number | null>(null);
const actionTypeItems = computed(() => [
	{ label: ts("guild_logs.all_actions"), value: null },
	...MODERATION_TYPE_FILTER_VALUES,
]);

watch(selectedTypeCode, (val) => {
	filters.value.typeCode = val ?? undefined;
});

const q = ref("");
const debouncedQ = refDebounced(q, 300);
watch(debouncedQ, (val) => {
	filters.value.q = val || undefined;
});

const guildId = computed(() => guildData.value.id);
const { entries, total, status, refresh } = useModerationLog({
	guildId,
	limit,
	offset,
	filters,
});

const columns = computed<TableColumn<ModerationLogEntry>[]>(() => [
	{
		accessorKey: "caseId",
		header: ts("guild_logs.columns.case"),
		cell: ({ row }) => h("span", { class: "text-sm font-medium" }, `#${row.original.caseId}`),
	},
	{
		accessorKey: "typeName",
		header: ts("guild_logs.columns.action"),
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
		header: ts("guild_logs.columns.user"),
		cell: ({ row }) => {
			const member = row.original.targetMember;
			return h(UUser, {
				name: member ? auditLogMemberName(member) : ts("guild_logs.unknown"),
				avatar: member ? auditLogMemberAvatar(member) : undefined,
				size: "sm",
			});
		},
	},
	{
		id: "moderator",
		header: ts("guild_logs.columns.moderator"),
		cell: ({ row }) => {
			const member = row.original.moderatorMember;
			return h(UUser, {
				name: member ? auditLogMemberName(member) : ts("guild_logs.unknown"),
				avatar: member ? auditLogMemberAvatar(member) : undefined,
				size: "sm",
			});
		},
	},
	{
		accessorKey: "reason",
		header: ts("guild_logs.columns.reason"),
		cell: ({ row }) => {
			const reason = row.original.reason ?? ts("guild_logs.no_reason");
			return h(
				"span",
				{
					class: "line-clamp-1 max-w-xs text-sm text-muted",
					title: reason,
				},
				reason,
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: ts("guild_logs.columns.date"),
		cell: ({ row }) =>
			h(
				"time",
				{
					datetime: row.original.createdAt ?? "",
					title: row.original.createdAt
						? new Date(row.original.createdAt).toLocaleString()
						: "",
					class: "whitespace-nowrap text-sm text-muted",
				},
				row.original.createdAt ? formatTimeAgo(new Date(row.original.createdAt)) : "—",
			),
	},
]);

watch(
	[filters],
	() => {
		page.value = 1;
	},
	{ deep: true },
);
</script>
