<template>
	<USlideover
		v-model:open="isNotificationsSlideoverOpen"
		title="Activity Log"
		:description="`${total} change${total === 1 ? '' : 's'} recorded`"
	>
		<template #body>
			<!-- Header with refresh button -->
			<div class="flex items-center justify-between border-b border-base-200 px-4 py-3">
				<h3 class="text-sm font-semibold">Recent Changes</h3>
			</div>
			<!-- Loading state -->
			<LoadingSpinner
				v-if="status === 'pending' && entries.length === 0"
				size="md"
				padding="py-12"
			/>

			<!-- Empty state -->
			<UEmpty
				v-else-if="entries.length === 0"
				icon="heroicons:clipboard-document-list"
				title="No changes recorded yet"
				class="py-12"
				:actions="[
					{
						icon: 'i-lucide-refresh-cw',
						label: 'Refresh',
						color: 'neutral',
						variant: 'subtle',
						onClick: () => refresh(),
					},
				]"
			/>

			<!-- Entries list -->
			<div v-else class="divide-y divide-base-200">
				<div
					v-for="entry in entries"
					:key="entry.id"
					class="flex gap-3 px-4 py-3 transition-colors hover:bg-base-200/50"
				>
					<div class="min-w-0 flex-1">
						<div class="flex items-start justify-between gap-2">
							<div class="flex items-center gap-2">
								<UUser
									:name="auditLogMemberName(entry.member)"
									:avatar="auditLogMemberAvatar(entry.member)"
									size="xs"
								/>
							</div>
							<time
								class="shrink-0 text-xs text-base-content/50"
								:datetime="entry.timestamp"
							>
								{{ formatTimeAgo(new Date(entry.timestamp)) }}
							</time>
						</div>
						<p class="text-sm text-base-content/70">
							{{ auditLogActionDescription(entry) }}
						</p>
						<div class="mt-1 flex flex-wrap gap-1">
							<UBadge
								v-if="
									Object.keys(entry.changes?.added ?? {}).length +
										Object.keys(entry.changes?.removed ?? {}).length +
										Object.keys(entry.changes?.changed ?? {}).length >
									3
								"
								color="neutral"
								variant="subtle"
								size="xs"
							>
								+{{
									Object.keys(entry.changes?.added ?? {}).length +
									Object.keys(entry.changes?.removed ?? {}).length +
									Object.keys(entry.changes?.changed ?? {}).length -
									3
								}}
								more
							</UBadge>
						</div>
					</div>
				</div>
			</div>
		</template>
	</USlideover>
</template>

<script setup lang="ts">
import { formatTimeAgo } from "@vueuse/core";

interface AuditLogProps {
	guildId: string;
}
const { guildId } = defineProps<AuditLogProps>();
const { isNotificationsSlideoverOpen } = useDashboardLayout();
const { entries, total, refresh, status } = useAuditLog({ guildId, immediate: false, limit: 30 });

watch(isNotificationsSlideoverOpen, (open) => {
	if (open) refresh();
});
</script>
