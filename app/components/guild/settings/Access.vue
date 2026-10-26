<template>
	<DashboardPageHeader
		:title="ts('guild_settings.access.title')"
		:description="ts('guild_settings.access.subtitle')"
	/>

	<UAlert
		color="neutral"
		variant="subtle"
		icon="ic:round-info"
		:title="ts('guild_settings.access.default_title')"
		:description="defaultDescription"
	/>

	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.access.form_aria')"
		@error="onError"
	>
		<div class="flex flex-col gap-5">
			<section class="console-card space-y-5" :aria-labelledby="rolesHeadingId">
				<div>
					<h2 :id="rolesHeadingId" class="text-base font-bold">
						{{ ts("guild_settings.access.roles_title") }}
					</h2>
					<p class="mt-0.5 text-[0.8125rem] text-muted">
						{{ ts("guild_settings.access.roles_order") }}
					</p>
				</div>
				<SelectRoles
					:model-value="roles.allow"
					layout="chips"
					:label="ts('guild_settings.access.roles_allowed')"
					:tooltip-title="ts('guild_settings.access.allow_note')"
					:guild="guildData"
					@update:model-value="setRoles('allow', $event)"
				/>
				<SelectRoles
					:model-value="roles.deny"
					layout="chips"
					:label="ts('guild_settings.access.roles_denied')"
					:tooltip-title="ts('guild_settings.access.deny_note')"
					:guild="guildData"
					@update:model-value="setRoles('deny', $event)"
				/>
			</section>

			<section class="console-card space-y-5" :aria-labelledby="membersHeadingId">
				<div>
					<h2 :id="membersHeadingId" class="text-base font-bold">
						{{ ts("guild_settings.access.members_title") }}
					</h2>
					<p class="mt-0.5 text-[0.8125rem] text-muted">
						{{ ts("guild_settings.access.members_order") }}
					</p>
				</div>
				<GuildMemberPicker
					v-if="activeGuildId"
					:ids="users.allow"
					:guild-id="activeGuildId"
					:label="ts('guild_settings.access.members_allowed')"
					:description="ts('guild_settings.access.allow_note')"
					@update:ids="setUsers('allow', $event)"
				/>
				<GuildMemberPicker
					v-if="activeGuildId"
					:ids="users.deny"
					:guild-id="activeGuildId"
					:label="ts('guild_settings.access.members_denied')"
					:description="ts('guild_settings.access.deny_note')"
					@update:ids="setUsers('deny', $event)"
				/>
			</section>

			<section
				v-if="legacy.length > 0"
				class="console-card space-y-4"
				:aria-labelledby="legacyHeadingId"
			>
				<div>
					<h2 :id="legacyHeadingId" class="text-base font-bold">
						{{ ts("guild_settings.access.legacy_title") }}
					</h2>
					<p class="mt-0.5 text-[0.8125rem] text-muted">
						{{ ts("guild_settings.access.legacy_subtitle") }}
					</p>
				</div>

				<ul class="divide-y divide-(--home-border-subtle)">
					<li
						v-for="node in legacy"
						:key="`${node.column}:${node.entry.id}`"
						class="flex flex-wrap items-center gap-3 py-3"
					>
						<div class="min-w-0 flex-1">
							<p class="text-sm font-semibold">{{ node.name }}</p>
							<p class="font-mono text-xs text-muted">
								{{ ts("guild_settings.access.legacy_allow") }}
								{{ node.entry.allow.join(", ") || "—" }} ·
								{{ ts("guild_settings.access.legacy_deny") }}
								{{ node.entry.deny.join(", ") || "—" }}
							</p>
							<p
								v-if="node.classification.kind === 'importable'"
								class="mt-1 text-[0.8125rem]"
							>
								{{
									ts(
										node.classification.access === "allow"
											? "guild_settings.access.legacy_becomes_allow"
											: "guild_settings.access.legacy_becomes_deny",
									)
								}}
								<template v-if="node.classification.dropped.length > 0">
									{{
										ts("guild_settings.access.legacy_drops", {
											commands: node.classification.dropped.join(", "),
										})
									}}
								</template>
							</p>
							<p v-else class="mt-1 text-[0.8125rem] text-muted">
								{{ ts("guild_settings.access.legacy_not_convertible") }}
							</p>
						</div>
						<UButton
							v-if="node.classification.kind === 'importable'"
							size="sm"
							variant="soft"
							:data-import="node.entry.id"
							:aria-label="
								ts('guild_settings.access.legacy_import_aria', { name: node.name })
							"
							@click="importNode(node.column, node.entry.id)"
						>
							{{ ts("guild_settings.access.legacy_import") }}
						</UButton>
					</li>
				</ul>

				<div class="flex flex-wrap gap-2">
					<UButton
						v-if="hasImportable"
						size="sm"
						variant="soft"
						icon="ic:round-done-all"
						@click="importAll"
					>
						{{ ts("guild_settings.access.legacy_import_all") }}
					</UButton>
					<UButton
						size="sm"
						variant="outline"
						color="neutral"
						icon="ic:round-download"
						@click="downloadLegacy"
					>
						{{ ts("guild_settings.access.legacy_download") }}
					</UButton>
					<UButton
						v-if="isOwner"
						size="sm"
						variant="outline"
						color="error"
						icon="ic:round-delete-outline"
						@click="removeOpen = true"
					>
						{{ ts("guild_settings.access.legacy_remove") }}
					</UButton>
				</div>
			</section>
		</div>
	</GuildSettingsForm>

	<UModal
		v-model:open="removeOpen"
		:title="ts('guild_settings.access.legacy_remove_title')"
		:description="ts('guild_settings.access.legacy_remove_description')"
	>
		<template #body>
			<UFormField :label="ts('guild_settings.access.legacy_remove_confirm_label')">
				<UInput v-model="removeConfirm" autocomplete="off" class="w-full" />
			</UFormField>
		</template>
		<template #footer>
			<div class="flex w-full justify-end gap-2">
				<UButton variant="ghost" color="neutral" @click="removeOpen = false">
					{{ ts("guild_settings.access.legacy_remove_cancel") }}
				</UButton>
				<UButton
					color="error"
					:loading="removing"
					:disabled="removeConfirm !== 'REMOVE'"
					@click="removeLegacy"
				>
					{{ ts("guild_settings.access.legacy_remove_submit") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "@nuxt/ui";
import {
	classifyLegacyNode,
	createDashboardEntry,
	isDashboardEntry,
	stripLegacyNodes,
	type LegacyClassification,
	type LegacyPermissionNode,
	type PermissionEntry,
} from "#shared/utils/dashboard-access";
import { array, looseObject, object, string } from "valibot";
import { importLegacy, joinAccess, splitAccess } from "~/utils/dashboard-access-draft";

type Column = "permissionsRoles" | "permissionsUsers";
type FormState = Pick<GuildData, Column>;

const { ts } = useI18n();
const toast = useToast();
const { activeGuildId } = useActiveGuild();
const { guildData } = useGuildData();
const { guildSettings, originalGuildSettings, setGuildSettings } = useGuildSettings();
const { discordUser } = useDiscordAccount();

const rolesHeadingId = useId();
const membersHeadingId = useId();
const legacyHeadingId = useId();

const entrySchema = looseObject({ id: string() });
const schema = object({
	permissionsRoles: array(entrySchema),
	permissionsUsers: array(entrySchema),
});

// Plain copies: the form snapshots its state with `structuredClone`, which
// refuses the reactive proxies the settings hand out.
function plain(entries: readonly PermissionEntry[]): FormState[Column] {
	return entries.map((entry) =>
		isDashboardEntry(entry)
			? createDashboardEntry(entry.id, entry.dashboard)
			: { id: entry.id, allow: [...entry.allow], deny: [...entry.deny] },
	) as FormState[Column];
}

function readState(): FormState {
	return {
		permissionsRoles: plain(guildSettings.value?.permissionsRoles ?? []),
		permissionsUsers: plain(guildSettings.value?.permissionsUsers ?? []),
	};
}

const state = reactive(readState()) as FormState;

// As in `useSettingsForm`: only a column whose value differs is written back,
// synchronously, so the form's baseline and the state never drift apart.
watch(
	guildSettings,
	() => {
		const next = readState();
		for (const column of ["permissionsRoles", "permissionsUsers"] as const) {
			if (!isDeepEqual(state[column], next[column])) state[column] = next[column];
		}
	},
	{ deep: true, flush: "sync" },
);

function mapToGuildData(formState: FormState): Partial<GuildData> {
	return {
		permissionsRoles: formState.permissionsRoles,
		permissionsUsers: formState.permissionsUsers,
	};
}

const roles = computed(() => splitAccess(state.permissionsRoles));
const users = computed(() => splitAccess(state.permissionsUsers));

function setColumn(column: Column, list: "allow" | "deny", ids: string[]) {
	const current = splitAccess(state[column]);
	const other = list === "allow" ? "deny" : "allow";
	// An id moved to this list leaves the other one.
	const next = {
		...current,
		[list]: ids,
		[other]: current[other].filter((id) => !ids.includes(id)),
	};
	state[column] = plain(joinAccess(next.allow, next.deny, state[column]));
}

const setRoles = (list: "allow" | "deny", ids: string[]) =>
	setColumn("permissionsRoles", list, ids);
const setUsers = (list: "allow" | "deny", ids: string[]) =>
	setColumn("permissionsUsers", list, ids);

const defaultDescription = computed(() => {
	const admins = guildSettings.value?.rolesAdmin ?? [];
	if (admins.length === 0) return ts("guild_settings.access.default_permissions");
	const names = admins.map(
		(id) => guildData.value?.roles.find((role) => role.id === id)?.name ?? id,
	);
	return ts("guild_settings.access.default_roles", { roles: names.join(", ") });
});

interface LegacyRow {
	column: Column;
	entry: LegacyPermissionNode;
	name: string;
	classification: LegacyClassification;
}

function legacyName(column: Column, id: string): string {
	if (column === "permissionsRoles") {
		return guildData.value?.roles.find((role) => role.id === id)?.name ?? id;
	}
	return ts("guild_settings.access.legacy_member", { id });
}

const legacy = computed<LegacyRow[]>(() =>
	(["permissionsRoles", "permissionsUsers"] as const).flatMap((column) =>
		(state[column] as readonly PermissionEntry[])
			.filter((entry): entry is LegacyPermissionNode => !isDashboardEntry(entry))
			.map((entry) => ({
				column,
				entry,
				name: legacyName(column, entry.id),
				classification: classifyLegacyNode(entry),
			})),
	),
);

const hasImportable = computed(() =>
	legacy.value.some((node) => node.classification.kind === "importable"),
);

function importNode(column: Column, id: string) {
	state[column] = plain(importLegacy(state[column], id));
}

function importAll() {
	for (const node of legacy.value) {
		if (node.classification.kind === "importable") importNode(node.column, node.entry.id);
	}
}

function downloadLegacy() {
	const nodes = {
		roles: legacy.value
			.filter((node) => node.column === "permissionsRoles")
			.map((node) => node.entry),
		users: legacy.value
			.filter((node) => node.column === "permissionsUsers")
			.map((node) => node.entry),
	};
	const url = URL.createObjectURL(
		new Blob([JSON.stringify(nodes, null, "\t")], { type: "application/json" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = `legacy-permission-nodes-${activeGuildId.value}.json`;
	link.click();
	URL.revokeObjectURL(url);
}

const isOwner = computed(
	() => !!discordUser.value?.id && discordUser.value.id === guildData.value?.ownerId,
);

const removeOpen = ref(false);
const removeConfirm = ref("");
const removing = ref(false);

async function removeLegacy() {
	const guildId = activeGuildId.value;
	if (!guildId || removeConfirm.value !== "REMOVE") return;
	removing.value = true;
	try {
		const { removed } = await $fetch<{ removed: number }>(
			`/api/guilds/${guildId}/access/legacy`,
			{ method: "DELETE", body: { confirm: "REMOVE" } },
		);
		toast.add({
			color: "success",
			icon: "ic:round-check-circle",
			title: ts("guild_settings.access.legacy_removed", { count: removed }),
		});
		removeOpen.value = false;
		removeConfirm.value = "";
		// The server kept only the rules; the saved settings follow it.
		const saved = originalGuildSettings.value;
		if (saved) {
			setGuildSettings(
				{
					...saved,
					permissionsRoles: stripLegacyNodes(saved.permissionsRoles),
					permissionsUsers: stripLegacyNodes(saved.permissionsUsers),
				},
				guildId,
			);
		}
	} catch {
		toast.add({
			color: "error",
			icon: "heroicons:x-circle",
			title: ts("guild_settings.access.legacy_remove_failed"),
		});
	} finally {
		removing.value = false;
	}
}

function onError(event: FormErrorEvent) {
	toast.add({
		color: "error",
		description: event.errors[0]?.message ?? ts("guild_settings.please_try_again"),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.save_failed"),
	});
}
</script>
