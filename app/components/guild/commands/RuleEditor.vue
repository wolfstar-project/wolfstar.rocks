<template>
	<UModal
		v-model:open="open"
		:description="subtitle"
		:dismissible="!saving"
		:content="{ onCloseAutoFocus: returnFocus }"
		:ui="{ content: 'sm:max-w-150' }"
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
				<UButton color="neutral" variant="outline" @click="load(enabled)">
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
							{{ ts("guild_settings.command_rules.editor.enabled_hint", { name }) }}
						</p>
					</div>
					<USwitch
						:id="enabledId"
						v-model="draft.enabled"
						:disabled="saving"
						:aria-describedby="enabledHintId"
					/>
				</div>

				<SelectChannels
					v-model="draft.allowedChannels"
					:guild="guildData"
					:channel-types="channelTypes"
					:disabled="saving"
					:label="ts('guild_settings.command_rules.editor.allowed_channels')"
					:tooltip-title="ts('guild_settings.command_rules.editor.allowed_channels_hint')"
				/>
				<SelectChannels
					v-model="draft.ignoredChannels"
					:guild="guildData"
					:channel-types="channelTypes"
					:disabled="saving"
					:label="ts('guild_settings.command_rules.editor.ignored_channels')"
					:tooltip-title="ts('guild_settings.command_rules.editor.ignored_channels_hint')"
				/>
				<SelectRoles
					v-model="draft.allowedRoles"
					:guild="guildData"
					:disabled="saving"
					:label="ts('guild_settings.command_rules.editor.allowed_roles')"
					:tooltip-title="ts('guild_settings.command_rules.editor.allowed_roles_hint')"
				/>
				<SelectRoles
					v-model="draft.ignoredRoles"
					:guild="guildData"
					:disabled="saving"
					:label="ts('guild_settings.command_rules.editor.ignored_roles')"
					:tooltip-title="ts('guild_settings.command_rules.editor.ignored_roles_hint')"
				/>

				<p v-if="keptMembers > 0" class="text-[0.8125rem] text-muted">
					{{ tc("guild_settings.command_rules.editor.members_kept", keptMembers) }}
				</p>
			</form>
		</template>

		<template #footer>
			<div class="flex w-full flex-wrap items-center gap-2.5">
				<span class="font-mono text-[0.8125rem] text-muted">
					{{ tc("guild_settings.command_rules.editor.count", count) }}
				</span>
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
	countEditableCommandRuleEntries,
	type CommandRule,
	type CommandRuleSaved,
	type CommandRuleState,
	type EditableCommandRuleList,
} from "#shared/utils/command-rules";
import { ChannelType } from "discord-api-types/v10";

const open = defineModel<boolean>("open", { required: true });

const {
	command,
	enabled,
	opener = null,
} = defineProps<{
	/** The command to edit; the editor stays closed without one. */
	command: DisableableCommand | null;
	/** Whether the command is on where the editor opens from, saved or not. */
	enabled: boolean;
	/** What focus goes back to when the editor closes. */
	opener?: HTMLElement | null;
}>();

const emit = defineEmits<{
	/** The command was saved for the guild of `guildId`. */
	saved: [saved: CommandRuleSaved, guildId: string];
}>();

type Draft = { enabled: boolean } & Record<EditableCommandRuleList, string[]>;

const { ts, tc } = useI18n();
const toast = useToast();
const { activeGuildId } = useActiveGuild();
const { guildData } = useGuildData();

const formId = useId();
const enabledId = useId();
const enabledHintId = useId();

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
const count = computed(() => countEditableCommandRuleEntries(draft));
const keptMembers = computed(() =>
	stored.value
		? stored.value.rule.allowedUsers.length + stored.value.rule.ignoredUsers.length
		: 0,
);

function emptyDraft(): Draft {
	return {
		enabled: true,
		allowedChannels: [],
		ignoredChannels: [],
		allowedRoles: [],
		ignoredRoles: [],
	};
}

function fill(rule: CommandRule, isEnabled: boolean) {
	Object.assign(draft, {
		enabled: isEnabled,
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
		fill(state.rule, isEnabled ?? state.enabled);
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
		void load(enabled);
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
</style>
