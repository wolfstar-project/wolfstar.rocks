<template>
	<GuildAutoSection slug="autopurge">
		<template #default="{ rows, edit, remove, channelName }">
			<section class="console-card" :aria-labelledby="headingId">
				<div class="auto-heading">
					<h2 :id="headingId">{{ ts("guild_settings.autopurge.schedules_title") }}</h2>
					<span class="auto-rule" aria-hidden="true"></span>
				</div>

				<!-- Scrolls sideways on a phone, so the keyboard can reach it too. -->
				<div
					class="mt-3 overflow-x-auto"
					tabindex="0"
					role="region"
					:aria-label="ts('guild_settings.autopurge.table_aria')"
				>
					<table
						class="auto-table"
						:aria-label="ts('guild_settings.autopurge.table_aria')"
					>
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

				<p class="mt-3 text-[0.8125rem] text-muted">
					{{ ts("guild_settings.autopurge.footnote") }}
				</p>
			</section>
		</template>
	</GuildAutoSection>
</template>

<script setup lang="ts">
import { compactSeconds, formatNextRun } from "~/utils/auto-channels";

const { ts } = useI18n();
const { locale, timeLocale } = useAppLocale();
const headingId = useId();
const clock = useNow({ interval: 60_000 });

function fullDate(iso: string): string {
	return new Intl.DateTimeFormat(timeLocale.value, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(iso));
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.auto-heading {
	@apply flex items-center gap-3;
}

.auto-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.auto-rule {
	@apply h-px flex-1;
	background-color: var(--console-border);
}

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
</style>
