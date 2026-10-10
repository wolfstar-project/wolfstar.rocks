<template>
	<GuildSettingsSection
		:title="ts('guild_settings.automod.rules.title')"
		:description="ts('guild_settings.automod.rules.subtitle')"
	>
		<div class="flex flex-wrap items-center gap-3">
			<UBadge color="primary" variant="subtle">
				{{
					ts("guild_settings.automod.rules.count", {
						count: rules.length,
						max: MaximumAutoModerationRules,
					})
				}}
			</UBadge>
			<UButton
				class="ml-auto"
				color="primary"
				icon="heroicons:plus"
				:disabled="isLoading || hasFailed || rules.length >= MaximumAutoModerationRules"
				@click="openEditor(null)"
			>
				{{ ts("guild_settings.automod.rules.new") }}
			</UButton>
		</div>

		<div
			v-if="isLoading"
			class="space-y-3"
			role="status"
			:aria-label="ts('guild_settings.automod.rules.loading_aria')"
		>
			<USkeleton v-for="n in 3" :key="n" class="h-20 w-full rounded-xl" />
		</div>

		<div
			v-else-if="hasFailed"
			class="flex flex-col items-center gap-3 rounded-xl border border-base-300/60 py-10 text-center"
			role="alert"
		>
			<UIcon
				name="heroicons:exclamation-triangle"
				class="size-8 text-error"
				aria-hidden="true"
			/>
			<p class="text-base-content/70">{{ ts("guild_settings.automod.rules.load_failed") }}</p>
			<UButton color="neutral" variant="outline" @click="refresh()">
				{{ ts("guild_settings.automod.rules.retry") }}
			</UButton>
		</div>

		<div
			v-else-if="rules.length === 0"
			class="flex flex-col items-center gap-2 rounded-xl border border-base-300/60 px-4 py-10 text-center"
		>
			<UIcon
				name="lucide:shield-alert"
				class="size-8 text-base-content/40"
				aria-hidden="true"
			/>
			<p class="font-semibold text-base-content">
				{{ ts("guild_settings.automod.rules.empty_title") }}
			</p>
			<p class="max-w-md text-sm text-base-content/70">
				{{ ts("guild_settings.automod.rules.empty_description") }}
			</p>
		</div>

		<ul v-else class="space-y-3" :aria-label="ts('guild_settings.automod.rules.title')">
			<li
				v-for="rule in rules"
				:key="rule.id"
				class="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-base-100 p-4 shadow-sm transition-colors"
				:class="rule.enabled ? 'border-primary/30' : 'border-base-300/60'"
			>
				<div class="min-w-0 flex-1">
					<p class="truncate font-semibold text-base-content">{{ rule.name }}</p>
					<p class="mt-1 flex flex-wrap items-center gap-2 text-sm text-base-content/70">
						<UBadge color="neutral" variant="subtle" size="sm">
							{{ ts(AUTOMOD_TYPE_NAME_KEYS[rule.type]) }}
						</UBadge>
						<span>{{ ts(AUTOMOD_HARD_ACTION_KEYS[rule.hardAction]) }}</span>
					</p>
				</div>

				<USwitch
					:model-value="rule.enabled"
					:disabled="busyRuleId === rule.id"
					:aria-label="
						ts('guild_settings.automod.rules.toggle_aria', { name: rule.name })
					"
					@update:model-value="toggleRule(rule, $event)"
				/>
				<UButton
					color="neutral"
					variant="ghost"
					size="sm"
					icon="heroicons:pencil-square"
					:aria-label="ts('guild_settings.automod.rules.edit_aria', { name: rule.name })"
					@click="openEditor(rule)"
				>
					{{ ts("guild_settings.automod.rules.edit") }}
				</UButton>
				<UButton
					color="error"
					variant="ghost"
					size="sm"
					icon="heroicons:trash"
					:aria-label="
						ts('guild_settings.automod.rules.delete_aria', { name: rule.name })
					"
					@click="ruleToDelete = rule"
				>
					{{ ts("guild_settings.automod.rules.delete") }}
				</UButton>
			</li>
		</ul>

		<GuildAutomodRuleEditor
			v-model:open="editorOpen"
			:rule="editedRule"
			:guild="guildData"
			:saving="saving"
			:error-code="editorErrorCode"
			@save="saveRule"
		/>

		<UModal
			:open="ruleToDelete !== null"
			:title="ts('guild_settings.automod.rules.delete_title')"
			:description="
				ts('guild_settings.automod.rules.delete_description', {
					name: ruleToDelete?.name ?? '',
				})
			"
			:dismissible="!saving"
			@update:open="!$event && (ruleToDelete = null)"
		>
			<template #footer>
				<div class="flex w-full justify-end gap-2">
					<UButton
						color="neutral"
						variant="ghost"
						:disabled="saving"
						@click="ruleToDelete = null"
					>
						{{ ts("guild_settings.automod.rules.editor.cancel") }}
					</UButton>
					<UButton color="error" :loading="saving" @click="confirmDelete">
						{{ ts("guild_settings.automod.rules.delete") }}
					</UButton>
				</div>
			</template>
		</UModal>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import type { AutomodRuleCreate, AutomodRuleErrorCode } from "~/composables/useAutomodRules";
import { MaximumAutoModerationRules, type AutoModerationRule } from "#shared/utils/automod-rules";
import { AUTOMOD_HARD_ACTION_KEYS, AUTOMOD_TYPE_NAME_KEYS } from "~/utils/automod-rule-labels";

const { ts } = useI18n();
const toast = useToast();
const { guildData } = useGuildData();
const { activeGuildId } = useActiveGuild();

const { createRule, deleteRule, refresh, rules, status, updateRule } =
	useAutomodRules(activeGuildId);

const isLoading = computed(() => status.value === "idle" || status.value === "pending");
const hasFailed = computed(() => status.value === "error");

const ERROR_KEYS: Record<AutomodRuleErrorCode, string> = {
	generic: "guild_settings.automod.rules.errors.generic",
	invalid: "guild_settings.automod.rules.errors.invalid",
	limit: "guild_settings.automod.rules.errors.limit",
	nameInvalid: "guild_settings.automod.rules.errors.nameInvalid",
	nameTaken: "guild_settings.automod.rules.errors.nameTaken",
	unknown: "guild_settings.automod.rules.errors.unknown",
};

const editorOpen = ref(false);
const editedRule = ref<AutoModerationRule | null>(null);
const editorErrorCode = ref<AutomodRuleErrorCode | null>(null);
const ruleToDelete = ref<AutoModerationRule | null>(null);
const saving = ref(false);
const busyRuleId = ref<string | null>(null);

function openEditor(rule: AutoModerationRule | null) {
	editedRule.value = rule;
	editorErrorCode.value = null;
	editorOpen.value = true;
}

function notifyFailure(code: AutomodRuleErrorCode) {
	toast.add({
		color: "error",
		description: ts(ERROR_KEYS[code]),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.save_failed"),
	});
}

function notifySuccess(titleKey: string, name: string) {
	toast.add({
		color: "success",
		icon: "heroicons:check-circle",
		title: ts(titleKey, { name }),
	});
}

async function saveRule(body: AutomodRuleCreate) {
	saving.value = true;
	editorErrorCode.value = null;
	const target = editedRule.value;
	// The type of an existing rule cannot change, so it is not sent back.
	const { type: _type, ...changes } = body;
	const result = target ? await updateRule(target.id, changes) : await createRule(body);
	saving.value = false;

	if (!result.ok) {
		editorErrorCode.value = result.code;
		notifyFailure(result.code);
		return;
	}

	editorOpen.value = false;
	notifySuccess(
		target
			? "guild_settings.automod.rules.toasts.saved"
			: "guild_settings.automod.rules.toasts.created",
		result.value.name,
	);
}

async function toggleRule(rule: AutoModerationRule, enabled: boolean) {
	busyRuleId.value = rule.id;
	const result = await updateRule(rule.id, { enabled });
	busyRuleId.value = null;
	if (!result.ok) notifyFailure(result.code);
}

async function confirmDelete() {
	const rule = ruleToDelete.value;
	if (!rule) return;

	saving.value = true;
	const result = await deleteRule(rule.id);
	saving.value = false;
	ruleToDelete.value = null;

	if (result.ok) {
		notifySuccess("guild_settings.automod.rules.toasts.deleted", rule.name);
	} else {
		notifyFailure(result.code);
	}
}
</script>
