<template>
	<GuildAutoSection slug="autodelete">
		<template #notice>
			<UAlert
				color="neutral"
				variant="subtle"
				icon="ic:round-info"
				:title="ts('guild_settings.autodelete.restart_title')"
				:description="ts('guild_settings.autodelete.restart_body')"
			/>
		</template>

		<template #default="{ rows, edit, remove, channelName }">
			<!-- Scrolls sideways on a phone, so the keyboard can reach it too. -->
			<div
				class="overflow-x-auto"
				tabindex="0"
				role="region"
				:aria-label="ts('guild_settings.autodelete.table_aria')"
			>
				<table class="auto-table" :aria-label="ts('guild_settings.autodelete.table_aria')">
					<thead>
						<tr>
							<th scope="col">{{ ts("guild_settings.auto.columns.channel") }}</th>
							<th scope="col">
								{{ ts("guild_settings.autodelete.columns.delay") }}
							</th>
							<th scope="col">
								{{ ts("guild_settings.autodelete.columns.bots") }}
							</th>
							<th scope="col">
								{{ ts("guild_settings.autodelete.columns.kept") }}
							</th>
							<th scope="col">
								<span class="sr-only">{{
									ts("guild_settings.auto.columns.actions")
								}}</span>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="row in rows" :key="row.id">
							<td class="truncate text-sm font-semibold text-highlighted">
								{{ channelName(row.channelId) }}
							</td>
							<td class="font-mono text-[0.8125rem]">
								{{
									row.delay === 0
										? ts("guild_settings.autodelete.at_once")
										: compactSeconds(row.delay, locale)
								}}
							</td>
							<td>
								<GuildLogsPill :tone="row.bots ? 'error' : 'neutral'">
									{{
										row.bots
											? ts("guild_settings.autodelete.bots_deleted")
											: ts("guild_settings.autodelete.bots_kept")
									}}
								</GuildLogsPill>
							</td>
							<td>
								<span
									v-if="row.allow.length === 0"
									class="text-[0.8125rem] text-muted"
								>
									{{ ts("guild_settings.autodelete.nothing_kept") }}
								</span>
								<span v-else class="flex flex-wrap gap-1">
									<UBadge
										v-for="kind in row.allow"
										:key="kind"
										color="neutral"
										variant="subtle"
									>
										{{ ts(`guild_settings.auto.allow.${kind}`) }}
									</UBadge>
								</span>
							</td>
							<td>
								<span class="flex justify-end gap-1">
									<UButton
										color="neutral"
										variant="ghost"
										size="sm"
										icon="ic:round-edit"
										:aria-label="
											ts('guild_settings.autodelete.edit_aria', {
												channel: channelName(row.channelId),
											})
										"
										@click="edit(row)"
									/>
									<UButton
										color="neutral"
										variant="ghost"
										size="sm"
										icon="ic:round-close"
										:aria-label="
											ts('guild_settings.autodelete.remove_aria', {
												channel: channelName(row.channelId),
											})
										"
										@click="remove(row)"
									/>
								</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</template>

		<template #footnote>
			{{ ts("guild_settings.autodelete.footnote") }}
		</template>
	</GuildAutoSection>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const { locale } = useAppLocale();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.auto-table {
	@apply w-full min-w-155 border-collapse;
}

.auto-table th {
	@apply px-2.5 pb-2 text-left text-[0.6875rem] font-bold tracking-[0.06em] uppercase;
	color: var(--ui-text-muted);
}

.auto-table td {
	@apply h-12 px-2.5 py-2;
	border-top: 1px solid var(--home-border-subtle);
}

/* The first and last columns line up with the card's heading. */
.auto-table :is(th, td):first-child {
	@apply pl-0;
}

.auto-table :is(th, td):last-child {
	@apply pr-0;
}
</style>
