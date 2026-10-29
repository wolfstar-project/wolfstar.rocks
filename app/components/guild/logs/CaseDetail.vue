<template>
	<div class="flex flex-col gap-5">
		<div class="flex flex-wrap items-center gap-2">
			<GuildLogsPill :tone="moderationCaseTone(entry)">{{ actionLabel }}</GuildLogsPill>
			<GuildLogsPill :tone="MODERATION_CASE_STATUS_TONE[entry.status]">
				{{ ts(MODERATION_CASE_STATUS_KEY[entry.status]) }}
			</GuildLogsPill>
		</div>

		<dl class="case-fields">
			<div class="case-field">
				<dt class="console-label">{{ ts("guild_logs.case.user") }}</dt>
				<dd>
					<div class="case-member">
						<UAvatar v-bind="auditLogMemberAvatar(entry.targetMember)" size="sm" />
						<div class="min-w-0">
							<p class="truncate text-sm font-semibold text-highlighted">
								{{ targetName }}
							</p>
							<p class="font-mono text-xs text-muted">{{ entry.userId ?? "–" }}</p>
						</div>
					</div>
					<UButton
						v-if="entry.userId"
						color="neutral"
						variant="link"
						size="sm"
						class="px-0"
						icon="ic:round-filter-list"
						@click="emit('filterMember', entry.userId, targetName)"
					>
						{{ ts("guild_logs.case.show_member_cases") }}
					</UButton>
				</dd>
			</div>

			<div class="case-field">
				<dt class="console-label">{{ ts("guild_logs.case.moderator") }}</dt>
				<dd>
					<div class="case-member">
						<UAvatar v-bind="auditLogMemberAvatar(entry.moderatorMember)" size="sm" />
						<div class="min-w-0">
							<p class="truncate text-sm font-semibold text-highlighted">
								{{ moderatorName }}
							</p>
							<p class="font-mono text-xs text-muted">{{ entry.moderatorId }}</p>
						</div>
					</div>
					<UButton
						color="neutral"
						variant="link"
						size="sm"
						class="px-0"
						icon="ic:round-filter-list"
						@click="emit('filterModerator', entry.moderatorId, moderatorName)"
					>
						{{ ts("guild_logs.case.show_moderator_cases") }}
					</UButton>
				</dd>
			</div>

			<div class="case-field">
				<dt class="console-label">{{ ts("guild_logs.case.reason") }}</dt>
				<dd class="text-sm leading-[1.55] wrap-break-word whitespace-pre-line text-default">
					{{ entry.reason ?? ts("guild_logs.no_reason") }}
				</dd>
			</div>

			<div class="case-field">
				<dt class="console-label">{{ ts("guild_logs.case.created") }}</dt>
				<dd class="text-sm text-default">
					<time v-if="created" :datetime="entry.createdAt ?? undefined">
						{{ created.toLocaleString(timeLocale) }}
					</time>
					<template v-else>&ndash;</template>
				</dd>
			</div>

			<div class="case-field">
				<dt class="console-label">{{ ts("guild_logs.case.duration") }}</dt>
				<dd class="text-sm text-default">{{ durationLabel }}</dd>
			</div>

			<div v-if="expires" class="case-field">
				<dt class="console-label">
					{{ expired ? ts("guild_logs.case.ended") : ts("guild_logs.case.ends") }}
				</dt>
				<dd class="text-sm text-default">
					<time :datetime="expires.toISOString()">
						{{ expires.toLocaleString(timeLocale) }}
					</time>
				</dd>
			</div>

			<div v-if="roles.length > 0" class="case-field">
				<dt class="console-label">
					{{
						entry.extra?.kind === "roles"
							? ts("guild_logs.case.roles_had")
							: ts("guild_logs.case.role")
					}}
				</dt>
				<dd>
					<ul class="flex flex-wrap gap-1.5">
						<li v-for="role in roles" :key="role.id" class="case-role">
							<template v-if="role.name">@{{ role.name }}</template>
							<template v-else>
								{{ ts("guild_logs.case.unknown_role") }}
								<span class="font-mono text-muted">{{ role.id }}</span>
							</template>
						</li>
					</ul>
				</dd>
			</div>

			<div v-if="entry.extra?.kind === 'nickname'" class="case-field">
				<dt class="console-label">{{ ts("guild_logs.case.previous_nickname") }}</dt>
				<dd class="text-sm text-default">
					{{ entry.extra.previous ?? ts("guild_logs.case.no_nickname") }}
				</dd>
			</div>

			<div v-if="messageUrl" class="case-field">
				<dt class="console-label">{{ ts("guild_logs.case.message") }}</dt>
				<dd>
					<UButton
						:to="messageUrl"
						target="_blank"
						rel="noopener noreferrer"
						external
						color="neutral"
						variant="outline"
						size="sm"
						trailing-icon="ic:round-open-in-new"
						:aria-label="ts('guild_logs.case.open_message_aria', { id: entry.caseId })"
					>
						{{ ts("guild_logs.case.open_message") }}
					</UButton>
				</dd>
			</div>
		</dl>

		<p class="text-xs leading-[1.55] text-muted">{{ ts("guild_logs.case.edit_hint") }}</p>
	</div>
</template>

<script setup lang="ts">
import type { ModerationLogEntry } from "#shared/types/moderation-log";
import { discordMessageUrl, moderationCaseExpiresAt } from "#shared/utils/moderation-case";

const { entry } = defineProps<{
	entry: ModerationLogEntry;
}>();

const emit = defineEmits<{
	filterMember: [userId: string, name: string];
	filterModerator: [moderatorId: string, name: string];
}>();

const { ts } = useI18n();
const { timeLocale } = useAppLocale();
const { guildData } = useGuildData();

function memberName(member: ModerationLogEntry["targetMember"]): string {
	return member ? auditLogMemberName(member) : ts("guild_logs.unknown");
}

const targetName = computed(() => memberName(entry.targetMember));
const moderatorName = computed(() => memberName(entry.moderatorMember));

const actionLabel = computed(() =>
	entry.metadata.undo ? ts("guild_logs.undo_action", { action: entry.typeName }) : entry.typeName,
);

const created = computed(() => (entry.createdAt ? new Date(entry.createdAt) : null));
const expires = computed(() => moderationCaseExpiresAt(entry.createdAt, entry.duration));
const expired = computed(() => (expires.value ? expires.value.getTime() < Date.now() : false));

const durationLabel = computed(() => {
	const duration = moderationCaseDuration(entry);
	if (duration.kind === "timed") return duration.label;
	return duration.kind === "permanent" ? ts("guild_logs.permanent") : "–";
});

// The guild's roles are already loaded with the dashboard; a role deleted
// since the case was opened keeps its id and is named as unknown.
const roles = computed(() => {
	const { extra } = entry;
	let ids: string[] = [];
	if (extra?.kind === "roles") ids = extra.roleIds;
	else if (extra?.kind === "role") ids = [extra.roleId];
	const known = new Map((guildData.value?.roles ?? []).map((role) => [role.id, role.name]));
	return ids.map((id) => ({ id, name: known.get(id) ?? null }));
});

const messageUrl = computed(() =>
	entry.message ? discordMessageUrl(entry.guildId, entry.message) : null,
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.case-fields {
	@apply flex flex-col gap-4;
}

.case-field {
	@apply flex flex-col gap-1.5;
}

.case-field dd {
	@apply m-0 flex flex-col items-start gap-1;
}

.case-member {
	@apply flex min-w-0 items-center gap-2.5;
}

.case-role {
	@apply rounded-[4px] border border-default px-2 py-0.5 text-[0.8125rem] text-default;
}
</style>
