<template>
	<UModal
		v-model:open="open"
		:description="subtitle"
		:dismissible="!saving"
		:content="{ onCloseAutoFocus: returnFocus }"
		:ui="{ content: contentClass }"
	>
		<template #title>
			<template v-if="isEvery">{{
				ts("guild_settings.command_rules.editor.every_title")
			}}</template>
			<template v-else>
				{{ ts("guild_settings.command_rules.editor.title") }}
				(<span class="font-mono">{{ name }}</span
				>)
			</template>
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

			<form
				v-else
				:id="formId"
				:aria-label="ts('guild_settings.command_rules.editor.form_aria', { name })"
				class="flex flex-col gap-4.5"
				novalidate
				@submit.prevent="save"
			>
				<div v-if="!isEvery" class="rule-box">
					<div class="min-w-0 flex-1">
						<label :for="enabledId" class="text-sm font-bold">
							{{ ts("guild_settings.command_rules.editor.enabled") }}
						</label>
						<p :id="enabledHintId" class="mt-0.5 text-xs leading-normal text-muted">
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

				<UAlert
					v-if="disabledByLabel"
					color="warning"
					variant="subtle"
					icon="ic:round-warning-amber"
					:description="
						ts('guild_settings.command_rules.editor.disabled_by', {
							target: disabledByLabel,
						})
					"
				/>

				<div v-if="isEvery || draft.enabled" class="flex flex-col gap-4">
					<div class="rule-box">
						<div class="min-w-0 flex-1">
							<label :for="onlyAllowedId" class="text-sm font-bold">
								{{ ts("guild_settings.command_rules.editor.only_allowed") }}
							</label>
							<p
								:id="onlyAllowedHintId"
								class="mt-0.5 text-xs leading-normal text-muted"
							>
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

					<div class="rule-pair">
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
					</div>

					<div class="rule-pair">
						<GuildMemberPicker
							class="rule-allowed"
							field
							:ids="draft.allowedUsers"
							:guild-id="guildId"
							:disabled="saving"
							:label="ts('guild_settings.command_rules.editor.allowed_users')"
							:description="
								ts('guild_settings.command_rules.editor.allowed_users_hint')
							"
							@update:ids="pick('allowedUsers', $event)"
						/>
						<GuildMemberPicker
							class="rule-ignored"
							field
							:ids="draft.ignoredUsers"
							:guild-id="guildId"
							:disabled="saving"
							:label="ts('guild_settings.command_rules.editor.ignored_users')"
							:description="
								ts('guild_settings.command_rules.editor.ignored_users_hint')
							"
							@update:ids="pick('ignoredUsers', $event)"
						/>
					</div>

					<div class="rule-pair">
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
					</div>

					<section v-if="alsoApplying.length > 0" :aria-labelledby="alsoApplyingId">
						<p :id="alsoApplyingId" class="console-label">
							{{ ts("guild_settings.command_rules.editor.also_applies") }}
						</p>
						<p class="mt-1.5 mb-1 text-xs leading-normal text-toned">
							{{ ts("guild_settings.command_rules.order") }}
						</p>
						<GuildCommandsRuleList :rules="alsoApplying" />
					</section>
				</div>
				<p v-else class="text-[0.8125rem] leading-relaxed text-muted">
					{{ ts("guild_settings.command_rules.editor.off_note") }}
				</p>

				<!-- Out of the block above: a save writes Discord's permissions with the
				     command off too, and its refusals and failures show here. -->
				<GuildCommandsRuleDiscord
					v-model:on="discordOn"
					:name="discordName"
					:every="isEvery"
					:state="discord"
					:count="discordRows.length"
					:role-order-gap="roleOrderGap"
					:disabled="saving"
					:authorize-url="authorizeUrl"
					:failure="discordFailure"
					@retry="discordPermissions.refresh()"
				/>
			</form>
		</template>

		<template #footer>
			<div class="flex w-full flex-wrap items-center gap-2">
				<span v-if="stored" class="min-w-0 flex-auto text-xs text-muted">{{
					summary
				}}</span>
				<span v-else class="grow"></span>
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
import type { Overwrite } from "#shared/utils/command-permissions";
import type {
	CommandRule,
	CommandRuleList,
	CommandRuleSaved,
	CommandRuleState,
} from "#shared/utils/command-rules";
import type { RuleDiscordState } from "~/components/guild/commands/RuleDiscord.vue";
import type { DisableableCommand } from "~/utils/command-settings";
import { ChannelType } from "discord-api-types/v10";

const open = defineModel<boolean>("open", { required: true });

const {
	command,
	// Left out, a boolean prop would read as `false`: a staged "off".
	stagedEnabled = undefined,
	opener = null,
	inherited = [],
	disabledBy,
} = defineProps<{
	/**
	 * The command to edit, or `*` for the rule every command follows besides
	 * its own; the editor stays closed without one.
	 */
	command: DisableableCommand | typeof EVERY_COMMAND | null;
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

type Draft = { enabled: boolean; onlyAllowed: boolean } & Record<CommandRuleList, string[]>;

const { ts, tc } = useI18n();
const toast = useToast();
const { activeGuildId } = useActiveGuild();
const { guildData } = useGuildData();
const discordPermissions = useCommandPermissions(activeGuildId);

const formId = useId();
const enabledId = useId();
const enabledHintId = useId();
const onlyAllowedId = useId();
const onlyAllowedHintId = useId();
const alsoApplyingId = useId();

// A sheet from the bottom on a phone, as the dashboard's other panels are there.
const contentClass =
	"sm:max-w-155 max-sm:top-auto max-sm:bottom-0 max-sm:w-full max-sm:max-w-none max-sm:translate-y-0 max-sm:rounded-b-none max-sm:max-h-[94dvh]";

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
/** Whether the rules go to Discord too: `null` until the switch is touched, which follows Discord. */
const discordPicked = ref<boolean | null>(null);
const discordFailure = ref<string | null>(null);

const isEvery = computed(() => command === EVERY_COMMAND);
const target = computed(() =>
	command === EVERY_COMMAND ? EVERY_COMMAND : (command?.name ?? null),
);
const name = computed(() => {
	if (command === EVERY_COMMAND) return ts("guild_settings.command_rules.editor.every_name");
	return command?.label ?? "";
});
const discordName = computed(() => (isEvery.value ? name.value : `/${name.value}`));
const subtitle = computed(() => {
	if (command === EVERY_COMMAND) return ts("guild_settings.command_rules.editor.every_subtitle");
	return command ? `${command.category} · ${command.description}` : undefined;
});
const guildId = computed(() => activeGuildId.value ?? "");

/** The rule a save would store, `@everyone` included. */
const edited = computed(() =>
	stored.value ? applyCommandRuleEdit(stored.value.rule, draft, guildId.value) : null,
);
// What a save leaves of the others: the command's tile counts the same.
const applying = computed(() =>
	edited.value ? resolveCommandRules([edited.value, ...inherited]) : [],
);
const count = computed(() => countCommandRuleEntries(applying.value, guildId.value));
const alsoApplying = computed(() =>
	isEvery.value ? [] : applying.value.filter((rule) => rule.command !== target.value),
);
const disabledByLabel = computed(() =>
	disabledBy && !isEvery.value
		? commandTargetLabel(disabledBy, ts("guild_settings.command_rules.every_command"))
		: undefined,
);
const enabledHint = computed(() =>
	draft.enabled
		? ts("guild_settings.command_rules.editor.enabled_hint", { name: name.value })
		: ts("guild_settings.command_rules.editor.enabled_hint_off", { name: name.value }),
);

// Discord's side: the command's permissions as read, and what the rule makes of them.
const discordId = computed(() =>
	target.value ? discordPermissions.commandIdOf(target.value) : null,
);
const discordRead = computed(() => Boolean(discordPermissions.data.value));
const storedRows = computed(() =>
	discordId.value ? discordPermissions.rowsOf(discordId.value) : [],
);
/** How Discord's permissions stood against the rule as stored when they were read. */
const foundState = computed(() =>
	stored.value && discordId.value
		? commandDiscordState(
				storedRows.value,
				applyCommandRuleEdit(
					stored.value.rule,
					{ ...stored.value.rule, onlyAllowed: stored.value.onlyAllowed },
					guildId.value,
				),
				guildId.value,
			)
		: "off",
);
const discordOn = computed({
	get: () => discordPicked.value ?? foundState.value !== "off",
	set: (value: boolean) => {
		discordPicked.value = value;
		discordFailure.value = null;
	},
});
const discordRows = computed(() =>
	edited.value ? commandRuleOverwrites(edited.value, guildId.value) : [],
);
/** What a save writes to Discord, `null` when it leaves Discord as it is. */
const discordWrite = computed(() => {
	if (!discordRead.value || !discordId.value) return null;
	const rows = discordOn.value ? discordRows.value : [];
	return overwritesEqual(rows, storedRows.value) ? null : rows;
});
const missingPermission = computed(() => {
	const authorization = discordPermissions.data.value?.authorization;
	if (!authorization) return null;
	if (!authorization.manageGuild) return "Manage Server";
	if (!authorization.manageRoles) return "Manage Roles";
	return null;
});
const discord = computed((): RuleDiscordState => {
	if (!discordRead.value) {
		return discordPermissions.error.value ? { kind: "failed" } : { kind: "reading" };
	}
	if (!discordId.value) return { kind: "unregistered" };
	const writes = discordWrite.value !== null;
	return {
		kind: "registered",
		different: foundState.value === "different",
		scopeMissing: writes && !discordPermissions.data.value?.authorization.scopeGranted,
		missingPermission: writes ? missingPermission.value : null,
	};
});
// Discord lets a member in when any of their roles is allowed, whatever their order.
const roleOrderGap = computed(() =>
	edited.value
		? edited.value.allowedRoles.length > 0 &&
			withoutEveryone(edited.value, guildId.value).ignoredRoles.length > 0
		: false,
);
// What the copy claims: Discord holds permissions for the command once this is
// saved. A rule with nothing in it translates to none, so a switch left on over
// it writes nothing and must not say Discord applies the rules.
const alsoInDiscord = computed(
	() =>
		discord.value.kind === "registered" && (discordWrite.value ?? storedRows.value).length > 0,
);

const summary = computed(() => {
	const rules =
		!isEvery.value && !draft.enabled
			? ts("guild_settings.command_rules.editor.summary_off")
			: tc("guild_settings.command_rules.editor.count", count.value);
	return alsoInDiscord.value
		? ts("guild_settings.command_rules.editor.summary_discord", { summary: rules })
		: rules;
});
const authorizeUrl = computed(() => {
	const back = `/guilds/${guildId.value}/manage/commands?rules=${encodeURIComponent(target.value ?? "")}`;
	return `/oauth/login?next=${encodeURIComponent(back)}`;
});

// An id is allowed or ignored, not both: picking it in one list takes it out of the other.
const OPPOSITE_LIST: Record<CommandRuleList, CommandRuleList> = {
	allowedChannels: "ignoredChannels",
	ignoredChannels: "allowedChannels",
	allowedRoles: "ignoredRoles",
	ignoredRoles: "allowedRoles",
	allowedUsers: "ignoredUsers",
	ignoredUsers: "allowedUsers",
};

function pick(list: CommandRuleList, ids: string[]) {
	const opposite = OPPOSITE_LIST[list];
	draft[list] = ids;
	draft[opposite] = draft[opposite].filter((id) => !ids.includes(id));
	discordFailure.value = null;
}

/** The note on the options of the field opposite `list`: where each one is now. */
function notesFrom(list: CommandRuleList): ReadonlyMap<string, string> {
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
		allowedUsers: [],
		ignoredUsers: [],
	};
}

function fill({ onlyAllowed, rule }: CommandRuleState, isEnabled: boolean) {
	const lists = Object.fromEntries(COMMAND_RULE_LISTS.map((list) => [list, [...rule[list]]]));
	Object.assign(draft, { ...lists, enabled: isEnabled, onlyAllowed });
}

/** Whether the draft differs from what WolfStar stores, the status of `*` aside. */
function changedInWolfStar(state: CommandRuleState): boolean {
	const same = (a: readonly string[], b: readonly string[]) =>
		a.length === b.length && a.every((id) => b.includes(id));
	return (
		(!isEvery.value && draft.enabled !== state.enabled) ||
		draft.onlyAllowed !== state.onlyAllowed ||
		COMMAND_RULE_LISTS.some((list) => !same(draft[list], state.rule[list]))
	);
}

let loads = 0;

/**
 * Reads the command's rule and revision as stored now. `isEnabled` is the
 * status to show, `undefined` for the stored one.
 */
async function load(isEnabled?: boolean) {
	const guild = activeGuildId.value;
	const ruled = target.value;
	if (!guild || !ruled) return;

	// Only the newest read fills the draft: the same command, reopened, starts another.
	const read = ++loads;
	loading.value = true;
	loadFailed.value = false;
	try {
		const state = await $fetch<CommandRuleState>(
			`/api/guilds/${guild}/command-rules/${encodeURIComponent(ruled)}`,
		);
		// The editor may have been closed, or opened on another command, meanwhile.
		if (read !== loads || !open.value || target.value !== ruled) return;
		stored.value = state;
		fill(state, isEvery.value ? true : (isEnabled ?? state.enabled));
	} catch {
		if (read === loads) loadFailed.value = true;
	} finally {
		if (read === loads) loading.value = false;
	}
}

function errorCode(error: unknown): string | undefined {
	const data = (error as { data?: { code?: unknown; data?: { code?: unknown } } } | null)?.data;
	const code = data?.code ?? data?.data?.code;
	return typeof code === "string" ? code : undefined;
}

function refuse(description: string) {
	toast.add({
		color: "warning",
		icon: "ic:round-warning-amber",
		title: ts("guild_settings.command_rules.discord.refused_title"),
		description,
	});
}

/** Why Discord's side cannot be saved as it is, or `null`. */
function discordRefusal(): string | null {
	const state = discord.value;
	if (discordWrite.value === null || state.kind !== "registered") return null;
	if (discordOn.value && discordRows.value.length > MAXIMUM_COMMAND_OVERWRITES) {
		return ts("guild_settings.command_rules.discord.over_toast", {
			max: MAXIMUM_COMMAND_OVERWRITES,
		});
	}
	if (state.scopeMissing) return ts("guild_settings.command_rules.discord.scope_toast");
	if (state.missingPermission) {
		return ts("guild_settings.command_rules.discord.missing", {
			permission: state.missingPermission,
		});
	}
	return null;
}

/** Says the rule changed since it was read, and reads it again. */
async function reportConflict() {
	toast.add({
		color: "warning",
		icon: "heroicons:arrow-path",
		title: ts("guild_settings.command_rules.editor.conflict_title", { name: name.value }),
		description: ts("guild_settings.command_rules.editor.conflict_description"),
	});
	await load();
}

/**
 * Whether WolfStar's rule is still the one this editor read. A save that only
 * sends Discord's side makes no request that checks the revision, and Discord's
 * own check covers Discord's permissions only, so without this another
 * administrator's change to the rule would be replaced by the old one in Discord.
 */
async function ruleIsCurrent(guild: string, ruled: string, state: CommandRuleState) {
	try {
		const now = await $fetch<CommandRuleState>(
			`/api/guilds/${guild}/command-rules/${encodeURIComponent(ruled)}`,
		);
		if (now.revision === state.revision) return true;
		await reportConflict();
	} catch {
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
	return false;
}

/** Saves WolfStar's rule; `false` when it was refused, which says why. */
async function saveInWolfStar(guild: string, ruled: string, state: CommandRuleState) {
	try {
		const saved = await $fetch<CommandRuleSaved>(
			`/api/guilds/${guild}/command-rules/${encodeURIComponent(ruled)}`,
			{
				method: "PUT",
				body: {
					revision: state.revision,
					// Every command's status is `/commands`'s, which the server keeps.
					enabled: isEvery.value ? state.enabled : draft.enabled,
					onlyAllowed: draft.onlyAllowed,
					...Object.fromEntries(COMMAND_RULE_LISTS.map((list) => [list, draft[list]])),
				},
			},
		);
		stored.value = saved;
		emit("saved", saved, guild);
		return true;
	} catch (error) {
		if (errorCode(error) === "conflict") {
			await reportConflict();
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
		return false;
	}
}

/** Writes Discord's side; `false` when Discord's was refused, which the editor shows. */
async function saveInDiscord(commandId: string, rows: Overwrite[]) {
	try {
		await discordPermissions.write(commandId, rows);
		return true;
	} catch (error) {
		const code = errorCode(error);
		discordFailure.value = discordFailureMessage(code);
		// Discord's set changed since it was read: read it again, so a save replaces it.
		if (code === "conflict") await discordPermissions.refresh();
		return false;
	}
}

// Literal keys, one per code the write answers with, so the i18n report sees each.
function discordFailureMessage(code: string | undefined): string {
	switch (code) {
		case "conflict":
			return ts("guild_settings.command_rules.discord.error_conflict", {
				name: discordName.value,
			});
		case "scope-missing":
			return ts("guild_settings.command_rules.discord.error_scope");
		case "manage-guild":
		case "manage-roles":
			return ts("guild_settings.command_rules.discord.error_permissions");
		case "command-unavailable":
			return ts("guild_settings.command_rules.discord.error_command");
		case "role-above":
			return ts("guild_settings.command_rules.discord.error_role_above");
		case "channel-hidden":
			return ts("guild_settings.command_rules.discord.error_channel");
		case "unknown-role":
			return ts("guild_settings.command_rules.discord.error_unknown_role");
		case "unknown-channel":
			return ts("guild_settings.command_rules.discord.error_unknown_channel");
		case "discord-refused":
			return ts("guild_settings.command_rules.discord.error_refused");
		case "rate-limited":
			return ts("guild_settings.command_rules.discord.error_rate_limited");
		case "unknown-command":
			return ts("guild_settings.command_rules.discord.error_unknown_command");
		default:
			return ts("guild_settings.please_try_again");
	}
}

function savedDescription(): string {
	if (isEvery.value) {
		return alsoInDiscord.value
			? ts("guild_settings.command_rules.editor.saved_every_description_discord")
			: ts("guild_settings.command_rules.editor.saved_every_description");
	}
	return alsoInDiscord.value
		? ts("guild_settings.command_rules.editor.saved_description_discord", { name: name.value })
		: ts("guild_settings.command_rules.editor.saved_description", { name: name.value });
}

/**
 * Saves WolfStar's rule, then, when it goes to Discord too or stops going, the
 * command's permissions in Discord. A rule WolfStar saved stays saved when
 * Discord refuses its side: the editor stays open and says why, and a save
 * again only sends Discord's side.
 */
async function save() {
	const guild = activeGuildId.value;
	const ruled = target.value;
	const state = stored.value;
	if (!guild || !ruled || !state || saving.value) return;

	const refusal = discordRefusal();
	if (refusal) {
		refuse(refusal);
		return;
	}

	saving.value = true;
	discordFailure.value = null;
	// Taken before the save, which changes the stored rule they are read against.
	const commandId = discordId.value;
	const rows = discordWrite.value;
	// Pinned: a refused save re-reads Discord, and an untouched switch follows what
	// Discord holds, so it would turn itself off and the next save would send nothing.
	discordPicked.value = discordOn.value;
	try {
		const writesDiscord = Boolean(commandId && rows);
		if (changedInWolfStar(state)) {
			if (!(await saveInWolfStar(guild, ruled, state))) return;
		} else if (writesDiscord && !(await ruleIsCurrent(guild, ruled, state))) {
			return;
		}
		if (commandId && rows && !(await saveInDiscord(commandId, rows))) return;
		toast.add({
			color: "success",
			icon: "heroicons:check-circle",
			title: ts("guild_settings.command_rules.editor.saved_title"),
			description: savedDescription(),
		});
		open.value = false;
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
		discordPicked.value = null;
		discordFailure.value = null;
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

.rule-box {
	@apply flex items-start gap-3.5 rounded-[10px] px-4 py-3.5;
	border: 1px solid var(--home-border-subtle);
	background-color: var(--console-input);
}

.rule-pair {
	@apply grid grid-cols-1 gap-3.5 md:grid-cols-2;
}

/* What the command allows and what it ignores read apart. */
.rule-allowed :deep(:is(.select-chip, .member-picker-chip)) {
	background-color: oklch(from var(--color-primary) l c h / 0.16);
}

.rule-ignored :deep(:is(.select-chip, .member-picker-chip)) {
	background-color: oklch(from var(--color-error) l c h / 0.16);
}
</style>
