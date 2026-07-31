<template>
	<div class="w-full overflow-x-auto">
		<table class="table w-full" :class="ui?.base">
			<thead :class="ui?.thead">
				<tr v-for="headerGroup in tableApi.getHeaderGroups()" :key="headerGroup.id">
					<th v-for="header in headerGroup.headers" :key="header.id" :class="ui?.th">
						<FlexRender
							v-if="!header.isPlaceholder"
							:render="header.column.columnDef.header"
							:props="header.getContext()"
						/>
					</th>
				</tr>
			</thead>
			<tbody :class="ui?.tbody">
				<template v-if="loading">
					<tr v-for="n in 5" :key="`skeleton-${n}`">
						<td v-for="col in columns.length || 3" :key="col" :class="ui?.td">
							<StarSkeleton class="h-4 w-full" />
						</td>
					</tr>
				</template>
				<template v-else>
					<tr v-for="row in tableApi.getRowModel().rows" :key="row.id">
						<td v-for="cell in row.getVisibleCells()" :key="cell.id" :class="ui?.td">
							<FlexRender
								:render="cell.column.columnDef.cell"
								:props="cell.getContext()"
							/>
						</td>
					</tr>
					<tr v-if="tableApi.getRowModel().rows.length === 0">
						<td
							:colspan="Math.max(columns.length, 1)"
							class="py-8 text-muted text-center"
						>
							No results
						</td>
					</tr>
				</template>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts" generic="T extends object">
import type { ColumnDef, TableOptions } from "@tanstack/vue-table";
import { FlexRender, getCoreRowModel, useVueTable } from "@tanstack/vue-table";

const props = withDefaults(
	defineProps<{
		data?: T[];
		columns?: ColumnDef<T, unknown>[];
		loading?: boolean;
		paginationOptions?: Partial<TableOptions<T>>;
		ui?: Record<string, string>;
	}>(),
	{
		data: () => [],
		columns: () => [],
		loading: false,
	},
);

const tableApi = useVueTable({
	get data() {
		return props.data ?? [];
	},
	get columns() {
		return props.columns ?? [];
	},
	getCoreRowModel: getCoreRowModel(),
	...props.paginationOptions,
});

defineExpose({ tableApi });
</script>
