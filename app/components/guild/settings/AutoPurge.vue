<template>
	<GuildAutoSection slug="autopurge">
		<template #default="{ rows, edit, remove, channelName }">
			<!-- Scrolls sideways on a phone, so the keyboard can reach it too. -->
			<div
				class="overflow-x-auto"
				tabindex="0"
				role="region"
				:aria-label="ts('guild_settings.autopurge.table_aria')"
			>
				<table class="auto-table" :aria-label="ts('guild_settings.autopurge.table_aria')">
					<thead>
						<tr>
							<th scope="col">{{ ts("guild_settings.auto.columns.channel") }}</th>
							<th scope="col">
								{{ ts("guild_settings.autopurge.columns.every") }}
							</th>
							<th scope="col">
								{{ ts("guild_settings.autopurge.columns.filter") }}
							</th>
							<th scope="col">
								{{ ts("guild_settings.autopurge.columns.next") }}
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
								{{ compactSeconds(row.interval, locale) }}
							</td>
							<td class="text-[0.8125rem]">
								{{ ts(`guild_settings.auto.filters.${row.filter}`) }}
								<span v-if="row.value" class="text-muted">
									· <span class="font-mono">{{ row.value }}</span>
								</span>
							</td>
							<td>
								<time
									class="font-mono text-xs whitespace-nowrap text-muted"
									:datetime="row.nextRunAt"
									:title="fullDate(row.nextRunAt)"
								>
									{{ formatNextRun(row.nextRunAt, clock, locale) }}
								</time>
							</td>
							<td>
								<span class="flex justify-end gap-1">
									<UButton
										color="neutral"
										variant="ghost"
										size="sm"
										icon="ic:round-edit"
										:aria-label="
											ts('guild_settings.autopurge.edit_aria', {
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
											ts('guild_settings.autopurge.remove_aria', {
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
			{{ ts("guild_settings.autopurge.footnote") }}
		</template>
	</GuildAutoSection>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const { locale, timeLocale } = useAppLocale();
const clock = useNow({ scheduler: (cb) => useIntervalFn(cb, 60_000) });

function fullDate(iso: string): string {
	return new Intl.DateTimeFormat(timeLocale.value, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(iso));
}
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
