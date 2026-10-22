<template>
	<GuildAutoSection slug="automessage">
		<template #default="{ rows, edit, remove, channelName }">
			<ul
				class="flex flex-col gap-3"
				:aria-label="ts('guild_settings.automessage.list_aria')"
			>
				<li v-for="row in rows" :key="row.id" class="console-card">
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
						<h2 class="text-[0.9375rem] font-bold">{{ channelName(row.channelId) }}</h2>
						<UBadge color="neutral" variant="subtle" class="font-mono">
							{{
								ts("guild_settings.automessage.every", {
									duration: spellSeconds(row.interval, locale),
								})
							}}
						</UBadge>
						<time
							class="text-xs text-muted"
							:datetime="row.nextRunAt"
							:title="fullDate(row.nextRunAt)"
						>
							{{
								ts("guild_settings.automessage.next", {
									when: formatNextRun(row.nextRunAt, clock, locale),
								})
							}}
						</time>
						<span class="flex-1"></span>
						<UButton
							color="neutral"
							variant="ghost"
							size="sm"
							icon="ic:round-edit"
							:aria-label="
								ts('guild_settings.automessage.edit_aria', {
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
								ts('guild_settings.automessage.remove_aria', {
									channel: channelName(row.channelId),
								})
							"
							@click="remove(row)"
						/>
					</div>

					<p class="auto-message-content">{{ row.content }}</p>

					<div class="mt-3 flex items-center gap-2.5">
						<USwitch
							:model-value="row.mentions"
							:loading="pending === row.channelId"
							:disabled="pending !== null"
							:aria-label="
								ts('guild_settings.automessage.mentions_aria', {
									channel: channelName(row.channelId),
								})
							"
							@update:model-value="
								toggleMentions(row, $event, channelName(row.channelId))
							"
						/>
						<span class="text-[0.8125rem] text-muted">
							{{
								row.mentions
									? ts("guild_settings.automessage.mentions_on")
									: ts("guild_settings.automessage.mentions_off")
							}}
						</span>
					</div>
				</li>
			</ul>
		</template>
	</GuildAutoSection>
</template>

<script setup lang="ts">
import type { AutoMessage } from "#shared/utils/auto-channels";
import { formatNextRun, spellSeconds } from "~/utils/auto-channels";

const { ts } = useI18n();
const toast = useToast();
const { locale, timeLocale } = useAppLocale();
const { activeGuildId } = useActiveGuild();
// The same rows the section reads: both share the cache of the guild's list.
const { setRow } = useAutoChannels("automessage", activeGuildId);
const clock = useNow({ interval: 60_000 });

function fullDate(iso: string): string {
	return new Intl.DateTimeFormat(timeLocale.value, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(iso));
}

const pending = ref<string | null>(null);

// Whether the mentions ping is one switch: it is written at once, as the rest
// of the row is from the editor.
async function toggleMentions(row: AutoMessage, mentions: boolean, channel: string) {
	pending.value = row.channelId;
	const result = await setRow(row.channelId, {
		content: row.content,
		interval: row.interval,
		mentions,
	});
	pending.value = null;

	if (!result.ok) {
		toast.add({
			color: "error",
			description: ts("guild_settings.please_try_again"),
			icon: "heroicons:x-circle",
			title: ts("guild_settings.save_failed"),
		});
		return;
	}
	toast.add({
		color: "success",
		description: mentions
			? ts("guild_settings.automessage.mentions_saved_on", { channel })
			: ts("guild_settings.automessage.mentions_saved_off", { channel }),
		icon: "heroicons:check",
		title: ts("guild_settings.auto.saved_title"),
	});
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.auto-message-content {
	@apply mt-3 rounded-md px-3 py-2.5 text-sm break-words whitespace-pre-wrap;
	background-color: var(--field-surface);
	border-left: 4px solid var(--color-primary);
}
</style>
