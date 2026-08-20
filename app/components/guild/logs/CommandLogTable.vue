<template>
	<div class="w-full flex-1 divide-y divide-accented">
		<div class="flex items-center gap-2 overflow-x-auto px-4 py-3.5">
			<UInput
				v-model="query"
				icon="i-lucide-search"
				:placeholder="t('guild_logs.search_placeholder')"
				:aria-label="t('guild_logs.search_aria')"
				class="max-w-sm min-w-48"
			/>
			<span class="text-sm text-muted">{{ t("guild_logs.status_label") }}</span>
			<USelect
				v-model="filters.success"
				:items="statusItems"
				:aria-label="t('guild_logs.filter_status')"
			/>
		</div>
		<ActivitySection
			:plain="true"
			:total="total"
			:status="status"
			:item-count="entries.length"
			:max-visible="total"
			empty-icon="i-lucide-terminal"
			:empty-title="t('guild_logs.no_logs')"
			:empty-description="debouncedQ ? t('guild_logs.no_commands_filter_match') : undefined"
			:refresh-label="t('guild_logs.refresh_command')"
			record-label="command"
			@refresh="refresh()"
		>
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
			/>
			<div
				v-if="total > page"
				class="mt-4 flex items-center justify-between border-t border-default pt-4"
			>
				<p class="text-sm text-muted">
					{{
						t("guild_logs.showing_entries", {
							shown: table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0,
							total: table?.tableApi?.getFilteredRowModel().rows.length || 0,
						})
					}}
				</p>
				<UPagination
					:default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
					:items-per-page="table?.tableApi?.getState().pagination.pageSize"
					:total="table?.tableApi?.getFilteredRowModel().rows.length"
					@update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
				/>
			</div>
		</ActivitySection>
	</div>
</template>

<script setup lang="ts">
import type { CommandLogData } from "#server/database";
import type { TableColumn } from "@nuxt/ui";
import type { APIGuildMember } from "discord-api-types/v10";
import { getPaginationRowModel } from "@tanstack/table-core";
import { formatTimeAgo } from "@vueuse/core";

const UBadge = resolveComponent("UBadge");
const UAvatar = resolveComponent("UAvatar");
const table = useTemplateRef("table");
const { guildData } = useGuildData();
const { t } = useI18n();

const page = ref(1);
const limit = ref(20);
const filters = ref<{ q?: string; success?: "all" | "success" | "failure" }>({ success: "all" });
const query = ref("");

const debouncedQ = refDebounced(query, 300);
const offset = computed(() => (page.value - 1) * limit.value);

const guildId = computed(() => guildData.value.id);

const statusItems = computed(() => [
	{ label: t("guild_logs.status_all"), value: "all" },
	{ label: t("guild_logs.status_success"), value: "success" },
	{ label: t("guild_logs.status_failed"), value: "failure" },
]);

const { entries, total, status, refresh } = useCommandLog({
	guildId,
	limit,
	offset,
	filters,
});

const columns = computed<TableColumn<CommandLogData>[]>(() => [
	{
		accessorKey: "executedAt",
		header: t("guild_logs.columns.time"),
		cell: ({ row }) =>
			h(
				"time",
				{
					datetime: row.original.executedAt,
					title: new Date(row.original.executedAt).toLocaleString(),
					class: "whitespace-nowrap text-sm text-muted",
				},
				formatTimeAgo(new Date(row.original.executedAt)),
			),
	},
	{
		id: "actor",
		header: t("guild_logs.columns.user"),
		cell: ({ row }) => {
			const metadata = row.original.metadata as { member: APIGuildMember } | null;
			const member = metadata?.member;
			return h("div", { class: "flex items-center gap-3" }, [
				h(UAvatar, {
					...(member ? auditLogMemberAvatar(member) : { src: undefined }),
					size: "lg",
				}),
				h("div", undefined, [
					h(
						"p",
						{ class: "font-medium text-highlighted" },
						member ? auditLogMemberName(member) : row.original.userId,
					),
					h("p", { class: "" }, `@${member?.user?.username ?? row.original.userId}`),
				]),
			]);
		},
	},
	{
		accessorKey: "commandName",
		header: t("guild_logs.columns.command"),
		cell: ({ row }) => {
			const label = row.original.subcommand
				? `/${row.original.commandName} ${row.original.subcommand}`
				: `/${row.original.commandName}`;
			return h("span", { class: "font-mono text-sm" }, label);
		},
	},
	{
		accessorKey: "success",
		header: t("guild_logs.columns.status"),
		cell: ({ row }) =>
			h(
				UBadge,
				{
					color: row.original.success ? "success" : "error",
					variant: "subtle",
					size: "sm",
				},
				() =>
					row.original.success
						? t("guild_logs.status_success")
						: t("guild_logs.status_failed"),
			),
	},
	{
		accessorKey: "latencyMs",
		header: t("guild_logs.columns.latency"),
		cell: ({ row }) =>
			h(
				"span",
				{ class: "text-sm text-muted" },
				row.original.latencyMs !== null ? `${row.original.latencyMs}ms` : "—",
			),
	},
]);

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
