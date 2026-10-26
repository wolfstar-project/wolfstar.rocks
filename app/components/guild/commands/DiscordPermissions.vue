<template>
	<section class="space-y-4" :aria-labelledby="headingId">
		<div class="console-card">
			<h2 :id="headingId" class="text-xl font-bold tracking-[0.01em]">
				{{ ts("guild_settings.command_permissions.title") }}
			</h2>
			<p class="mt-1 text-[0.8125rem] leading-normal text-muted">
				{{ ts("guild_settings.command_permissions.subtitle") }}
			</p>
			<p class="mt-2 text-[0.8125rem] leading-normal text-muted">
				{{ ts("guild_settings.command_permissions.administrator_note") }}
			</p>
		</div>

		<div v-if="!data && pending" class="space-y-2">
			<USkeleton v-for="i in 4" :key="i" class="h-14 w-full" />
		</div>

		<UAlert
			v-else-if="!data"
			color="error"
			variant="subtle"
			icon="ic:round-error-outline"
			:title="ts('guild_settings.command_permissions.load_failed')"
		/>

		<div v-else-if="!data.authorization.scopeGranted" class="console-card space-y-3">
			<p class="text-sm">{{ ts("guild_settings.command_permissions.scope_needed") }}</p>
			<UButton :to="authorizeUrl" external icon="ic:round-lock-open">
				{{ ts("guild_settings.command_permissions.authorize") }}
			</UButton>
		</div>

		<template v-else>
			<UAlert
				v-if="missingPermission"
				color="warning"
				variant="subtle"
				icon="ic:round-warning-amber"
				:title="ts('guild_settings.command_permissions.missing_title')"
				:description="
					ts('guild_settings.command_permissions.missing', {
						permission: missingPermission,
					})
				"
			/>

			<UAlert
				v-if="failure"
				color="error"
				variant="subtle"
				icon="ic:round-error-outline"
				:title="failure.title"
				:description="failure.description"
			>
				<template v-if="failure.reload" #actions>
					<UButton size="sm" variant="soft" color="neutral" @click="reloadAfterConflict">
						{{ ts("guild_settings.command_permissions.reload") }}
					</UButton>
				</template>
			</UAlert>

			<div class="flex flex-wrap items-center gap-3">
				<UButton
					data-review
					icon="ic:round-preview"
					:disabled="!canReview"
					@click="previewOpen = true"
				>
					{{
						ts("guild_settings.command_permissions.review", {
							count: changedCommandIds.length,
						})
					}}
				</UButton>
				<span class="text-[0.8125rem] text-muted">
					{{
						ts("guild_settings.command_permissions.changed_count", {
							count: changedCommandIds.length,
						})
					}}
				</span>
			</div>

			<GuildCommandsPermissionCard
				v-if="activeGuildId"
				:command-id="data.applicationId"
				:title="ts('guild_settings.command_permissions.app_default')"
				app-default
				open
				:rows="rowsOf(data.applicationId)"
				:guild-id="activeGuildId"
				:guild="guildData"
				:disabled="!canEdit"
				@update:rows="setRows(data.applicationId, $event)"
			/>

			<template v-if="activeGuildId">
				<GuildCommandsPermissionCard
					v-for="command in registered"
					:key="command.id"
					:command-id="command.id"
					:title="`/${command.name}`"
					:description="command.description"
					:rows="rowsOf(command.id)"
					:guild-id="activeGuildId"
					:guild="guildData"
					:disabled="!canEdit"
					@update:rows="setRows(command.id, $event)"
					@reset="resetToDefault(command.id)"
				/>
			</template>

			<p v-if="unregistered.length > 0" class="text-[0.8125rem] text-muted">
				{{
					ts("guild_settings.command_permissions.not_registered", {
						commands: unregistered.map((command) => `/${command.name}`).join(", "),
					})
				}}
			</p>
		</template>

		<GuildCommandsChangesPreview
			v-model:open="previewOpen"
			:entries="previewEntries"
			:guild="guildData"
			:sending
			:progress
			@send="send"
		/>
	</section>
</template>

<script setup lang="ts">
import {
	COMMAND_PERMISSIONS_GRANT,
	MAXIMUM_COMMAND_OVERWRITES,
	normalizeOverwrites,
} from "#shared/utils/command-permissions";

const { ts } = useI18n();
const headingId = useId();
const { activeGuildId } = useActiveGuild();
const { guildData } = useGuildData();

// After the sign-in, the legacy route records the server and the section and
// the dashboard opens this tab from the query.
const authorizeUrl = computed(() => {
	const back = `/guilds/${activeGuildId.value}/manage/commands?tab=discord`;
	return `/oauth/login?grant=${COMMAND_PERMISSIONS_GRANT}&next=${encodeURIComponent(back)}`;
});

const {
	baseRows,
	changedCommandIds,
	data,
	discard,
	pending,
	refresh,
	resetToDefault,
	rowsOf,
	saveAll,
	setRows,
} = useCommandPermissions(activeGuildId);

const registered = computed(() =>
	(data.value?.commands ?? []).filter(
		(command): command is typeof command & { id: string } => command.id !== null,
	),
);
const unregistered = computed(() =>
	(data.value?.commands ?? []).filter((command) => command.id === null),
);

const missingPermission = computed(() => {
	const authorization = data.value?.authorization;
	if (!authorization) return null;
	if (!authorization.manageGuild) return "Manage Server";
	if (!authorization.manageRoles) return "Manage Roles";
	return null;
});

const canEdit = computed(
	() => !!data.value?.authorization.scopeGranted && missingPermission.value === null,
);

const allCommandIds = computed(() => [
	...(data.value ? [data.value.applicationId] : []),
	...registered.value.map((command) => command.id),
]);

const overLimit = computed(() =>
	allCommandIds.value.some(
		(commandId) => normalizeOverwrites(rowsOf(commandId)).length > MAXIMUM_COMMAND_OVERWRITES,
	),
);

const conflictCommandId = ref<string | null>(null);

const canReview = computed(
	() =>
		canEdit.value &&
		changedCommandIds.value.length > 0 &&
		!overLimit.value &&
		// A command that changed in Discord is reloaded before anything is sent again.
		conflictCommandId.value === null,
);

function titleOf(commandId: string): string {
	if (commandId === data.value?.applicationId) {
		return ts("guild_settings.command_permissions.app_default");
	}
	const command = registered.value.find((entry) => entry.id === commandId);
	return command ? `/${command.name}` : commandId;
}

const previewEntries = computed(() =>
	changedCommandIds.value.map((commandId) => ({
		commandId,
		title: titleOf(commandId),
		before: baseRows(commandId),
		after: rowsOf(commandId),
		appDefault: commandId === data.value?.applicationId,
	})),
);

const previewOpen = ref(false);
const sending = ref(false);
const progress = ref<string | undefined>(undefined);
const failure = ref<{ title: string; description: string; reload: boolean } | null>(null);

const FAILURE_KEYS: Record<string, string> = {
	"scope-missing": "guild_settings.command_permissions.error_scope",
	"manage-guild": "guild_settings.command_permissions.error_permissions",
	"manage-roles": "guild_settings.command_permissions.error_permissions",
	"command-unavailable": "guild_settings.command_permissions.error_command",
	"role-above": "guild_settings.command_permissions.error_role_above",
	"channel-hidden": "guild_settings.command_permissions.error_channel",
	"unknown-role": "guild_settings.command_permissions.error_unknown_role",
	"unknown-channel": "guild_settings.command_permissions.error_unknown_channel",
	"discord-refused": "guild_settings.command_permissions.error_refused",
	"rate-limited": "guild_settings.command_permissions.error_rate_limited",
	"unknown-command": "guild_settings.command_permissions.error_unknown_command",
};

async function send() {
	sending.value = true;
	failure.value = null;
	const total = changedCommandIds.value.length;
	progress.value = ts("guild_settings.command_permissions.sending", { total });
	const outcome = await saveAll();
	sending.value = false;
	progress.value = undefined;
	previewOpen.value = false;

	if (!outcome.failed) return;
	const name = titleOf(outcome.failed.commandId);
	const sent = ts("guild_settings.command_permissions.sent_before_stop", {
		count: outcome.sent.length,
	});
	if (outcome.failed.code === "conflict") {
		conflictCommandId.value = outcome.failed.commandId;
		failure.value = {
			title: ts("guild_settings.command_permissions.conflict_title", { command: name }),
			description: `${ts("guild_settings.command_permissions.conflict")} ${sent}`,
			reload: true,
		};
		return;
	}
	failure.value = {
		title: ts("guild_settings.command_permissions.failed_title", { command: name }),
		description: `${ts(FAILURE_KEYS[outcome.failed.code] ?? "guild_settings.please_try_again")} ${sent}`,
		reload: false,
	};
}

// The draft was made on rows Discord no longer has: it is dropped with the reload.
async function reloadAfterConflict() {
	if (conflictCommandId.value) discard(conflictCommandId.value);
	conflictCommandId.value = null;
	failure.value = null;
	await refresh();
}
</script>
