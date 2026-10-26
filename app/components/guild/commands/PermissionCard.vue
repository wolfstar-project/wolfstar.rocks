<template>
	<details class="group console-card" :open="open">
		<summary class="permission-card-summary">
			<span class="min-w-0 flex-1">
				<span data-card-title class="block truncate text-base font-bold">{{ title }}</span>
				<span v-if="description" class="block truncate text-[0.8125rem] text-muted">
					{{ description }}
				</span>
			</span>
			<span
				v-if="!appDefault"
				:data-status="commandId"
				class="permission-card-chip"
				:class="custom ? 'bg-primary/15 text-primary' : 'bg-base-content/8 text-muted'"
			>
				{{
					custom
						? ts("guild_settings.command_permissions.status_custom")
						: ts("guild_settings.command_permissions.status_default")
				}}
			</span>
			<span
				class="font-mono text-xs"
				:class="overLimit ? 'font-bold text-error' : 'text-muted'"
				:aria-label="
					ts('guild_settings.command_permissions.count_aria', {
						count,
						max: MAXIMUM_COMMAND_OVERWRITES,
					})
				"
			>
				{{ count }}/{{ MAXIMUM_COMMAND_OVERWRITES }}
			</span>
		</summary>

		<div class="mt-4 space-y-5">
			<p v-if="appDefault" class="text-[0.8125rem] text-muted">
				{{ ts("guild_settings.command_permissions.app_default_note") }}
			</p>
			<p v-if="overLimit" class="text-[0.8125rem] font-semibold text-error" role="alert">
				{{
					ts("guild_settings.command_permissions.over_limit", {
						max: MAXIMUM_COMMAND_OVERWRITES,
					})
				}}
			</p>

			<section :aria-labelledby="`${idBase}-roles`" class="space-y-3">
				<h3 :id="`${idBase}-roles`" class="console-label">
					{{ ts("guild_settings.command_permissions.roles") }}
				</h3>
				<UFormField :label="ts('guild_settings.command_permissions.everyone')">
					<USelect
						:model-value="triState(lists.everyone)"
						:items="triStateItems"
						:disabled
						class="w-56"
						@update:model-value="update({ everyone: fromTriState($event) })"
					/>
				</UFormField>
				<SelectRoles
					:model-value="lists.roles.allow"
					layout="chips"
					:label="ts('guild_settings.command_permissions.allowed')"
					:guild
					:disabled
					@update:model-value="update({ roles: moved(lists.roles, 'allow', $event) })"
				/>
				<SelectRoles
					:model-value="lists.roles.deny"
					layout="chips"
					:label="ts('guild_settings.command_permissions.denied')"
					:guild
					:disabled
					@update:model-value="update({ roles: moved(lists.roles, 'deny', $event) })"
				/>
			</section>

			<section :aria-labelledby="`${idBase}-members`" class="space-y-3">
				<h3 :id="`${idBase}-members`" class="console-label">
					{{ ts("guild_settings.command_permissions.members") }}
				</h3>
				<GuildMemberPicker
					:ids="lists.users.allow"
					:guild-id="guildId"
					:label="ts('guild_settings.command_permissions.allowed')"
					:disabled
					@update:ids="update({ users: moved(lists.users, 'allow', $event) })"
				/>
				<GuildMemberPicker
					:ids="lists.users.deny"
					:guild-id="guildId"
					:label="ts('guild_settings.command_permissions.denied')"
					:disabled
					@update:ids="update({ users: moved(lists.users, 'deny', $event) })"
				/>
			</section>

			<section :aria-labelledby="`${idBase}-channels`" class="space-y-3">
				<h3 :id="`${idBase}-channels`" class="console-label">
					{{ ts("guild_settings.command_permissions.channels") }}
				</h3>
				<UFormField :label="ts('guild_settings.command_permissions.all_channels')">
					<USelect
						:model-value="triState(lists.allChannels)"
						:items="triStateItems"
						:disabled
						class="w-56"
						@update:model-value="update({ allChannels: fromTriState($event) })"
					/>
				</UFormField>
				<SelectChannels
					:model-value="lists.channels.allow"
					layout="chips"
					:label="ts('guild_settings.command_permissions.allowed')"
					:guild
					:disabled
					@update:model-value="
						update({ channels: moved(lists.channels, 'allow', $event) })
					"
				/>
				<SelectChannels
					:model-value="lists.channels.deny"
					layout="chips"
					:label="ts('guild_settings.command_permissions.denied')"
					:guild
					:disabled
					@update:model-value="
						update({ channels: moved(lists.channels, 'deny', $event) })
					"
				/>
			</section>

			<UButton
				v-if="!appDefault && custom"
				size="sm"
				variant="outline"
				color="neutral"
				icon="ic:round-restart-alt"
				:data-reset="commandId"
				:disabled
				@click="emit('reset')"
			>
				{{ ts("guild_settings.command_permissions.use_app_default") }}
			</UButton>
		</div>
	</details>
</template>

<script setup lang="ts">
import type { DeepReadonly } from "@sapphire/utilities";
import {
	MAXIMUM_COMMAND_OVERWRITES,
	normalizeOverwrites,
	usesAppDefault,
	type Overwrite,
} from "#shared/utils/command-permissions";
import { listsToRows, rowsToLists, type PermissionLists } from "~/utils/command-permissions-run";

const {
	commandId,
	title,
	description,
	appDefault = false,
	rows,
	guildId,
	guild,
	disabled = false,
	open = false,
} = defineProps<{
	commandId: string;
	title: string;
	description?: string;
	/** The card of the app default, which every command without rows of its own uses. */
	appDefault?: boolean;
	rows: readonly Overwrite[];
	guildId: string;
	guild:
		| DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>
		| undefined;
	disabled?: boolean;
	open?: boolean;
}>();

const emit = defineEmits<{ "update:rows": [rows: Overwrite[]]; "reset": [] }>();

const { ts } = useI18n();
const idBase = useId();

const lists = computed(() => rowsToLists(rows, guildId));
const count = computed(() => normalizeOverwrites(rows).length);
const overLimit = computed(() => count.value > MAXIMUM_COMMAND_OVERWRITES);
const custom = computed(() => !usesAppDefault(rows));

type TriState = "unset" | "allow" | "deny";

const triStateItems = computed(() => [
	{ label: ts("guild_settings.command_permissions.not_set"), value: "unset" },
	{ label: ts("guild_settings.command_permissions.allow"), value: "allow" },
	{ label: ts("guild_settings.command_permissions.deny"), value: "deny" },
]);

function triState(value: boolean | null): TriState {
	if (value === null) return "unset";
	return value ? "allow" : "deny";
}

function fromTriState(value: unknown): boolean | null {
	if (value === "allow") return true;
	if (value === "deny") return false;
	return null;
}

// An id picked on one side leaves the other one.
function moved(
	current: PermissionLists["roles"],
	side: "allow" | "deny",
	ids: string[],
): PermissionLists["roles"] {
	const others = (list: readonly string[]) => list.filter((id) => !ids.includes(id));
	return side === "allow"
		? { allow: ids, deny: others(current.deny) }
		: { allow: others(current.allow), deny: ids };
}

function update(patch: Partial<PermissionLists>) {
	emit("update:rows", listsToRows({ ...lists.value, ...patch }, guildId));
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.permission-card-summary {
	@apply flex cursor-pointer list-none items-center gap-3;
}

.permission-card-summary::-webkit-details-marker {
	display: none;
}

.permission-card-summary:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.permission-card-chip {
	@apply shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold;
}
</style>
