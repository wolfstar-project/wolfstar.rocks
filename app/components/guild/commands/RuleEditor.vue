<template>
	<UModal
		v-model:open="open"
		:description="subtitle"
		:dismissible="!saving"
		:content="{ onCloseAutoFocus: returnFocus }"
		:ui="{ content: 'sm:max-w-140' }"
	>
		<template #title>
			{{ ts("guild_settings.command_rules.editor.title") }}
			(<span class="font-mono">{{ command?.label }}</span
			>)
		</template>

		<template #body>
			<div v-if="loadFailed" role="alert" class="space-y-3">
				<p class="text-sm">
					{{ ts("guild_settings.command_rules.editor.load_failed", { name }) }}
				</p>
				<UButton color="neutral" variant="outline" @click="load(stagedEnabled)">
					{{ ts("guild_settings.command_rules.editor.retry") }}
				</UButton>
			</div>

			<div v-else-if="loading" class="space-y-5" aria-busy="true">
				<USkeleton class="h-18 w-full" />
				<USkeleton v-for="i in 4" :key="i" class="h-16 w-full" />
			</div>

			<form v-else :id="formId" class="space-y-5" novalidate @submit.prevent="save">
				<div class="rule-enabled">
					<div class="min-w-0 flex-1">
						<label :for="enabledId" class="text-[0.9375rem] font-semibold">
							{{ ts("guild_settings.command_rules.editor.enabled") }}
						</label>
						<p :id="enabledHintId" class="text-[0.8125rem] text-muted">
							{{ enabledHint }}
						</p>
					</div>
					<USwitch
						:id="enabledId"
						v-model="draft.enabled"
						:disabled="saving"
						:aria-describedby="enabledHintId"
					/>
				</div>

				<p v-if="disabledByLabel" class="text-[0.8125rem] text-muted">
					{{
						ts("guild_settings.command_rules.editor.disabled_by", {
							target: disabledByLabel,
						})
					}}
				</p>

				<template v-if="draft.enabled">
					<div class="rule-enabled">
						<div class="min-w-0 flex-1">
							<label :for="onlyAllowedId" class="text-[0.9375rem] font-semibold">
								{{ ts("guild_settings.command_rules.editor.only_allowed") }}
							</label>
							<p :id="onlyAllowedHintId" class="text-[0.8125rem] text-muted">
								{{ ts("guild_settings.command_rules.editor.only_allowed_hint") }}
							</p>
						</div>
						<USwitch
							:id="onlyAllowedId"
							v-model="draft.onlyAllowed"
							:disabled="saving"
							:aria-describedby="onlyAllowedHintId"
						/>
					</div>

					<SelectChannels
						class="rule-allowed"
						:model-value="draft.allowedChannels"
						:guild="guildData"
						:channel-types="channelTypes"
						:disabled="saving"
						:label="ts('guild_settings.command_rules.editor.allowed_channels')"
						:empty-label="ts('select.pick_channel')"
						:option-notes="notesFrom('ignoredChannels')"
						:tooltip-title="
							ts('guild_settings.command_rules.editor.allowed_channels_hint')
						"
						@update:model-value="pick('allowedChannels', $event)"
					/>
					<SelectChannels
						class="rule-ignored"
						:model-value="draft.ignoredChannels"
						:guild="guildData"
						:channel-types="channelTypes"
						:disabled="saving"
						:label="ts('guild_settings.command_rules.editor.ignored_channels')"
						:empty-label="ts('select.pick_channel')"
						:option-notes="notesFrom('allowedChannels')"
						:tooltip-title="
							ts('guild_settings.command_rules.editor.ignored_channels_hint')
						"
						@update:model-value="pick('ignoredChannels', $event)"
					/>
					<SelectRoles
						class="rule-allowed"
						:model-value="draft.allowedRoles"
						:guild="guildData"
						:disabled="saving"
						:label="ts('guild_settings.command_rules.editor.allowed_roles')"
						:empty-label="ts('select.pick_role')"
						:option-notes="notesFrom('ignoredRoles')"
						:tooltip-title="
							ts('guild_settings.command_rules.editor.allowed_roles_hint')
						"
						@update:model-value="pick('allowedRoles', $event)"
					/>
					<SelectRoles
						class="rule-ignored"
						:model-value="draft.ignoredRoles"
						:guild="guildData"
						:disabled="saving"
						:label="ts('guild_settings.command_rules.editor.ignored_roles')"
						:empty-label="ts('select.pick_role')"
						:option-notes="notesFrom('allowedRoles')"
						:tooltip-title="
							ts('guild_settings.command_rules.editor.ignored_roles_hint')
						"
						@update:model-value="pick('ignoredRoles', $event)"
					/>

					<p v-if="keptMembers > 0" class="text-[0.8125rem] text-muted">
						{{ tc("guild_settings.command_rules.editor.members_kept", keptMembers) }}
					</p>

					<section v-if="alsoApplying.length > 0" :aria-labelledby="alsoApplyingId">
						<p :id="alsoApplyingId" class="console-label">
							{{ ts("guild_settings.command_rules.editor.also_applies") }}
						</p>
						<p class="mt-1 mb-3 text-[0.8125rem] text-muted">
							{{ ts("guild_settings.command_rules.order") }}
						</p>
						<GuildCommandsRuleList :rules="alsoApplying" />
					</section>
				</template>
				<p v-else class="text-[0.8125rem] text-muted">
					{{ ts("guild_settings.command_rules.editor.off_note") }}
				</p>
			</form>
		</template>

		<template #footer>
			<div class="flex w-full flex-wrap items-center gap-2.5">
				<span v-if="stored" class="text-xs text-muted">{{ summary }}</span>
				<span class="grow"></span>
				<UButton color="neutral" variant="outline" :disabled="saving" @click="open = false">
					{{ ts("guild_settings.command_rules.editor.cancel") }}
				</UButton>
				<UButton
					type="submit"
					:form="formId"
					color="primary"
					:loading="saving"
					:disabled="loading || loadFailed"
				>
					{{ ts("guild_settings.command_rules.editor.save") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { DisableableCommand } from "~/utils/command-settings";
import {
	applyCommandRuleEdit,
	countCommandRuleEntries,
	resolveCommandRules,
	type CommandRule,
	type CommandRuleSaved,
	type CommandRuleState,
	type EditableCommandRuleList,
} from "#shared/utils/command-rules";
import { ChannelType } from "discord-api-types/v10";
import { commandTargetLabel } from "~/utils/command-settings";

const open = defineModel<boolean>("open", { required: true });

const {
	command,
	// Left out, a boolean prop would read as `false`: a staged "off".
	stagedEnabled = undefined,
	opener = null,
	inherited = [],
	disabledBy,
} = defineProps<{
	/** The command to edit; the editor stays closed without one. */
	command: DisableableCommand | null;
	/** The other rules that match the command, which only `/commands` edits. */
	inherited?: readonly CommandRule[];
	/** The group in `commandsDisabled` that turns the command off, whatever its status. */
	disabledBy?: string;
	/**
	 * A status toggled where the editor opens from and not saved yet. Without
	 * one the editor shows the stored status, which someone else may have
	 * changed since the page loaded.
	 */
	stagedEnabled?: boolean;
	/** What focus goes back to when the editor closes. */
	opener?: HTMLElement | null;
}>();

const emit = defineEmits<{
	/** The command was saved for the guild of `guildId`. */
	saved: [saved: CommandRuleSaved, guildId: string];
}>();

type Draft = { enabled: boolean; onlyAllowed: boolean } & Record<EditableCommandRuleList, string[]>;

const { ts, tc } = useI18n();
const toast = useToast();
const { activeGuildId } = useActiveGuild();
const { guildData } = useGuildData();

const formId = useId();
const enabledId = useId();
const enabledHintId = useId();
const onlyAllowedId = useId();
const onlyAllowedHintId = useId();
const alsoApplyingId = useId();

// The bot's `/commands` offers these: a command can run in a voice channel's
// chat and in the threads of a forum, which are ruled as their forum.
const channelTypes: readonly ChannelType[] = [
	ChannelType.GuildText,
	ChannelType.GuildAnnouncement,
	ChannelType.GuildVoice,
	ChannelType.GuildStageVoice,
	ChannelType.GuildForum,
	ChannelType.GuildMedia,
];

const draft = reactive<Draft>(emptyDraft());
const stored = ref<CommandRuleState | null>(null);
const loading = ref(false);
const loadFailed = ref(false);
const saving = ref(false);

const name = computed(() => command?.label ?? "");
const subtitle = computed(() =>
	command ? `${command.category} · ${command.description}` : undefined,
);
const keptMembers = computed(() =>
	stored.value
		? stored.value.rule.allowedUsers.length + stored.value.rule.ignoredUsers.length
		: 0,
);
const guildId = computed(() => activeGuildId.value ?? "");
// The rule as a save would store it, and what that leaves of the others: the
// command's tile counts the same, the members included.
const applying = computed(() =>
	stored.value
		? resolveCommandRules([
				applyCommandRuleEdit(stored.value.rule, draft, guildId.value),
				...inherited,
			])
		: [],
);
const count = computed(() => countCommandRuleEntries(applying.value, guildId.value));
const alsoApplying = computed(() =>
	applying.value.filter((rule) => rule.command !== command?.name),
);
const disabledByLabel = computed(() =>
	disabledBy
		? commandTargetLabel(disabledBy, ts("guild_settings.command_rules.every_command"))
		: undefined,
);
const enabledHint = computed(() =>
	draft.enabled
		? ts("guild_settings.command_rules.editor.enabled_hint", { name: name.value })
		: ts("guild_settings.command_rules.editor.enabled_hint_off", { name: name.value }),
);
const summary = computed(() => {
	if (!draft.enabled) return ts("guild_settings.command_rules.editor.summary_off");
	if (count.value === 0) return ts("guild_settings.command_rules.editor.summary_none");
	return tc("guild_settings.command_rules.editor.count", count.value);
});

// An id is allowed or ignored, not both: picking it in one list takes it out of the other.
const OPPOSITE_LIST: Record<EditableCommandRuleList, EditableCommandRuleList> = {
	allowedChannels: "ignoredChannels",
	ignoredChannels: "allowedChannels",
	allowedRoles: "ignoredRoles",
	ignoredRoles: "allowedRoles",
};

function pick(list: EditableCommandRuleList, ids: string[]) {
	const opposite = OPPOSITE_LIST[list];
	draft[list] = ids;
	draft[opposite] = draft[opposite].filter((id) => !ids.includes(id));
}

/** The note on the options of the field opposite `list`: where each one is now. */
function notesFrom(list: EditableCommandRuleList): ReadonlyMap<string, string> {
	const note = list.startsWith("allowed")
		? ts("guild_settings.command_rules.editor.note_allowed")
		: ts("guild_settings.command_rules.editor.note_ignored");
	return new Map(draft[list].map((id) => [id, note]));
}

function emptyDraft(): Draft {
	return {
		enabled: true,
		onlyAllowed: false,
		allowedChannels: [],
		ignoredChannels: [],
		allowedRoles: [],
		ignoredRoles: [],
	};
}

function fill({ onlyAllowed, rule }: CommandRuleState, isEnabled: boolean) {
	Object.assign(draft, {
		enabled: isEnabled,
		onlyAllowed,
		allowedChannels: [...rule.allowedChannels],
		ignoredChannels: [...rule.ignoredChannels],
		allowedRoles: [...rule.allowedRoles],
		ignoredRoles: [...rule.ignoredRoles],
	});
}

/**
 * Reads the command's rule and revision as stored now. `isEnabled` is the
 * status to show, `undefined` for the stored one.
 */
async function load(isEnabled?: boolean) {
	const guildId = activeGuildId.value;
	const commandName = command?.name;
	if (!guildId || !commandName) return;

	loading.value = true;
	loadFailed.value = false;
	try {
		const state = await $fetch<CommandRuleState>(
			`/api/guilds/${guildId}/command-rules/${encodeURIComponent(commandName)}`,
		);
		// The editor may have been closed, or opened on another command, meanwhile.
		if (!open.value || command?.name !== commandName) return;
		stored.value = state;
		fill(state, isEnabled ?? state.enabled);
	} catch {
		loadFailed.value = true;
	} finally {
		loading.value = false;
	}
}

function errorCode(error: unknown): string | undefined {
	const data = (error as { data?: { code?: unknown; data?: { code?: unknown } } } | null)?.data;
	const code = data?.code ?? data?.data?.code;
	return typeof code === "string" ? code : undefined;
}

async function save() {
	const guildId = activeGuildId.value;
	const commandName = command?.name;
	if (!guildId || !commandName || !stored.value || saving.value) return;

	saving.value = true;
	try {
		const saved = await $fetch<CommandRuleSaved>(
			`/api/guilds/${guildId}/command-rules/${encodeURIComponent(commandName)}`,
			{
				method: "PUT",
				body: {
					revision: stored.value.revision,
					enabled: draft.enabled,
					onlyAllowed: draft.onlyAllowed,
					allowedChannels: draft.allowedChannels,
					ignoredChannels: draft.ignoredChannels,
					allowedRoles: draft.allowedRoles,
					ignoredRoles: draft.ignoredRoles,
				},
			},
		);
		emit("saved", saved, guildId);
		toast.add({
			color: "success",
			icon: "heroicons:check-circle",
			title: ts("guild_settings.command_rules.editor.saved_title"),
			description: ts("guild_settings.command_rules.editor.saved_description", {
				name: name.value,
			}),
		});
		open.value = false;
	} catch (error) {
		if (errorCode(error) === "conflict") {
			toast.add({
				color: "warning",
				icon: "heroicons:arrow-path",
				title: ts("guild_settings.command_rules.editor.conflict_title", {
					name: name.value,
				}),
				description: ts("guild_settings.command_rules.editor.conflict_description"),
			});
			await load();
		} else {
			toast.add({
				color: "error",
				icon: "heroicons:x-circle",
				title: ts("guild_settings.command_rules.editor.save_failed_title"),
				description: ts("guild_settings.command_rules.editor.save_failed_description", {
					name: name.value,
					message: ts("guild_settings.please_try_again"),
				}),
			});
		}
	} finally {
		saving.value = false;
	}
}

// Filled when it opens, so reopening it after a cancel never shows the
// abandoned edit, and with what is stored now rather than when the page loaded.
watch(
	open,
	(isOpen) => {
		if (!isOpen) return;
		stored.value = null;
		Object.assign(draft, emptyDraft());
		void load(stagedEnabled);
	},
	{ immediate: true },
);

function returnFocus(event: Event) {
	if (!opener?.isConnected) return;
	event.preventDefault();
	opener.focus();
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.rule-enabled {
	@apply flex items-center gap-4 rounded-lg px-4 py-3.5;
	border: 1px solid var(--home-border-subtle);
	background-color: var(--console-input);
}

/* What the command allows and what it ignores read apart. */
.rule-allowed :deep(.select-chip) {
	background-color: oklch(from var(--color-primary) l c h / 0.16);
}

.rule-ignored :deep(.select-chip) {
	background-color: oklch(from var(--color-error) l c h / 0.16);
}
</style>
