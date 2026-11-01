<template>
	<section class="space-y-4" :aria-label="ts('guild_settings.automod.rules.title')">
		<!-- Stacked on a phone, in a row from `sm` up. -->
		<div class="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
			<UButton
				color="primary"
				class="justify-center"
				:disabled="isLoading || hasFailed || rules.length >= MaximumAutoModerationRules"
				:title="
					ts('guild_settings.automod.rules.count', {
						count: rules.length,
						max: MaximumAutoModerationRules,
					})
				"
				@click="openEditor(null)"
			>
				{{ ts("guild_settings.automod.rules.new") }}
			</UButton>
			<UButton
				color="neutral"
				variant="outline"
				class="justify-center dialog-cancel"
				@click="openDefaults('escalation')"
			>
				{{ ts("guild_settings.automod.rules.defaults.escalation_title") }}
			</UButton>
			<UButton
				color="neutral"
				variant="outline"
				class="justify-center dialog-cancel"
				@click="openDefaults('defaults')"
			>
				{{ ts("guild_settings.automod.rules.defaults.rule_title") }}
			</UButton>
			<span class="rules-count self-start sm:ml-auto sm:self-auto">
				{{
					ts("guild_settings.automod.rules.enabled_count", {
						enabled: rules.filter((rule) => rule.enabled).length,
						total: rules.length,
					})
				}}
			</span>
		</div>

		<UInput
			v-if="rules.length > 0"
			v-model="query"
			icon="ic:round-search"
			:placeholder="ts('guild_settings.automod.rules.search_placeholder')"
			:aria-label="ts('guild_settings.automod.rules.search_placeholder')"
			class="w-full"
		/>

		<div
			v-if="isLoading"
			class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
			role="status"
			:aria-label="ts('guild_settings.automod.rules.loading_aria')"
		>
			<USkeleton v-for="n in 3" :key="n" class="h-44 w-full rounded-lg" />
		</div>

		<div
			v-else-if="hasFailed"
			class="console-card flex flex-col items-center gap-3 py-10 text-center"
			role="alert"
		>
			<UIcon
				name="heroicons:exclamation-triangle"
				class="size-8 text-error"
				aria-hidden="true"
			/>
			<p class="text-toned">{{ ts("guild_settings.automod.rules.load_failed") }}</p>
			<UButton color="neutral" variant="outline" @click="refresh()">
				{{ ts("guild_settings.automod.rules.retry") }}
			</UButton>
		</div>

		<div
			v-else-if="rules.length === 0"
			class="console-card flex flex-col items-center gap-2 px-4 py-10 text-center"
		>
			<UIcon name="ic:round-shield" class="size-8 text-muted" aria-hidden="true" />
			<p class="font-semibold">
				{{ ts("guild_settings.automod.rules.empty_title") }}
			</p>
			<p class="max-w-md text-sm text-muted">
				{{ ts("guild_settings.automod.rules.empty_description") }}
			</p>
		</div>

		<p
			v-else-if="shownRules.length === 0"
			class="console-card py-8 text-center text-[0.8125rem] text-muted"
			role="status"
		>
			{{ ts("guild_settings.automod.rules.no_match") }}
		</p>

		<ul v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			<li
				v-for="rule in shownRules"
				:key="rule.id"
				class="console-card flex flex-col gap-3"
				:class="{ 'opacity-70': !rule.enabled }"
			>
				<div class="flex items-start gap-2.5">
					<span
						class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary"
						aria-hidden="true"
					>
						<UIcon :name="AUTOMOD_TYPE_ICONS[rule.type]" class="size-4.5" />
					</span>
					<div class="min-w-0 flex-1">
						<p class="truncate text-[0.9375rem] leading-tight font-semibold">
							{{ rule.name }}
						</p>
						<!-- The tile says what kind of rule it is; a screen reader hears it. -->
						<p class="sr-only">{{ ts(AUTOMOD_TYPE_NAME_KEYS[rule.type]) }}</p>
					</div>
					<USwitch
						:model-value="rule.enabled"
						:disabled="busyRuleId === rule.id"
						:aria-label="
							ts('guild_settings.automod.rules.toggle_aria', { name: rule.name })
						"
						@update:model-value="toggleRule(rule, $event)"
					/>
				</div>

				<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-[0.8125rem]">
					<dt class="text-muted">{{ ts("guild_settings.automod.rules.threshold") }}</dt>
					<dd>{{ thresholdLabel(rule) }}</dd>
					<dt class="text-muted">{{ ts("guild_settings.automod.rules.action") }}</dt>
					<dd>{{ actionLabel(rule) }}</dd>
					<dt class="text-muted">{{ ts("guild_settings.automod.rules.on_hit") }}</dt>
					<dd>{{ onHitLabel(rule) }}</dd>
				</dl>

				<ul
					v-if="exemptions(rule).length > 0"
					class="flex flex-wrap gap-1.5"
					:aria-label="ts('guild_settings.automod.rules.editor.exemptions')"
				>
					<li
						v-for="entry in exemptions(rule)"
						:key="entry"
						class="rounded-full bg-base-content/8 px-2.5 py-0.5 text-xs text-toned"
					>
						{{ entry }}
					</li>
				</ul>

				<div class="mt-auto flex gap-2 pt-1">
					<UButton
						color="neutral"
						variant="outline"
						size="sm"
						class="rule-action"
						:aria-label="
							ts('guild_settings.automod.rules.edit_aria', { name: rule.name })
						"
						@click="openEditor(rule)"
					>
						{{ ts("guild_settings.automod.rules.edit") }}
					</UButton>
					<UButton
						color="error"
						variant="outline"
						size="sm"
						class="rule-action rule-action--danger"
						:aria-label="
							ts('guild_settings.automod.rules.delete_aria', { name: rule.name })
						"
						@click="ruleToDelete = rule"
					>
						{{ ts("guild_settings.automod.rules.delete") }}
					</UButton>
				</div>
			</li>
		</ul>

		<GuildAutomodTypePicker v-model:open="typePickerOpen" @pick="createRuleOfType" />

		<GuildAutomodRuleEditor
			v-model:open="editorOpen"
			:rule="editedRule"
			:type="newRuleType"
			:mode="editorMode"
			:defaults="defaults"
			:guild="guildData"
			:saving="saving"
			:error-code="editorErrorCode"
			@save="saveRule"
			@back="pickTypeAgain"
			@save-defaults="saveDefaults"
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
						variant="outline"
						class="dialog-cancel"
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
	</section>
</template>

<script setup lang="ts">
import type { AutomodRuleCreate, AutomodRuleErrorCode } from "~/composables/useAutomodRules";
import type { AutomodRuleDefaults } from "~/utils/automod-rule-draft";
import {
	MaximumAutoModerationRules,
	type AutoModerationRule,
	type AutoModerationRuleType,
} from "#shared/utils/automod-rules";
import { AutoModerationSoftActionBits } from "#shared/utils/automod-rules";
import {
	AUTOMOD_HARD_ACTION_KEYS,
	AUTOMOD_TYPE_ICONS,
	AUTOMOD_TYPE_NAME_KEYS,
} from "~/utils/automod-rule-labels";

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

function thresholdLabel(rule: AutoModerationRule) {
	if (rule.thresholdMaximum === 0) {
		return ts("guild_settings.automod.rules.first_infraction");
	}
	return rule.thresholdDuration > 0
		? `${rule.thresholdMaximum} / ${formatCompactDuration(rule.thresholdDuration)}`
		: String(rule.thresholdMaximum);
}

function actionLabel(rule: AutoModerationRule) {
	const action = ts(AUTOMOD_HARD_ACTION_KEYS[rule.hardAction]);
	return rule.hardActionDuration
		? `${action} · ${formatCompactDuration(rule.hardActionDuration)}`
		: action;
}

function onHitLabel(rule: AutoModerationRule) {
	const labels = [
		rule.softAction & AutoModerationSoftActionBits.Alert
			? ts("guild_settings.automod.rules.soft_alert_short")
			: null,
		rule.softAction & AutoModerationSoftActionBits.Log
			? ts("guild_settings.automod.rules.soft_log_short")
			: null,
		rule.softAction & AutoModerationSoftActionBits.Delete
			? ts("guild_settings.automod.rules.soft_delete_short")
			: null,
	].filter((label): label is string => label !== null);
	return labels.length > 0 ? labels.join(" + ") : ts("guild_settings.automod.rules.nothing");
}

/** The roles and channels a rule leaves alone, by name. */
function exemptions(rule: AutoModerationRule): string[] {
	const roles = rule.ignoredRoles.map((id) => {
		const name = guildData.value?.roles.find((role) => role.id === id)?.name;
		return name ? `@${name}` : null;
	});
	const channels = rule.ignoredChannels.map((id) => {
		const name = guildData.value?.channels.find((channel) => channel.id === id)?.name;
		return name ? `#${name}` : null;
	});
	return [...roles, ...channels].filter((entry): entry is string => entry !== null);
}

// A new rule starts with its type, which it keeps for good; the form opens on
// the type that was picked. Editing goes straight to the form.
const typePickerOpen = ref(false);
const newRuleType = ref<AutoModerationRuleType>("Words");

const editorMode = ref<"rule" | "defaults" | "escalation">("rule");
const { defaults, save: storeDefaults } = useAutomodRuleDefaults(() => guildData.value?.id);

function openDefaults(mode: "defaults" | "escalation") {
	editorMode.value = mode;
	editedRule.value = null;
	editorErrorCode.value = null;
	editorOpen.value = true;
}

function saveDefaults(patch: AutomodRuleDefaults) {
	storeDefaults(patch);
	editorOpen.value = false;
	toast.add({
		color: "success",
		icon: "heroicons:check-circle",
		title: ts("guild_settings.automod.rules.defaults.saved"),
	});
}

// Rules are matched on their name and on the name of their type.
const query = ref("");
const shownRules = computed(() => {
	const needle = query.value.trim().toLowerCase();
	if (!needle) return rules.value;
	return rules.value.filter(
		(rule) =>
			rule.name.toLowerCase().includes(needle) ||
			ts(AUTOMOD_TYPE_NAME_KEYS[rule.type]).toLowerCase().includes(needle) ||
			rule.type.toLowerCase().includes(needle),
	);
});

function openEditor(rule: AutoModerationRule | null) {
	editorMode.value = "rule";
	if (rule === null) {
		typePickerOpen.value = true;
		return;
	}
	editedRule.value = rule;
	editorErrorCode.value = null;
	editorOpen.value = true;
}

function createRuleOfType(type: AutoModerationRuleType) {
	typePickerOpen.value = false;
	editorMode.value = "rule";
	newRuleType.value = type;
	editedRule.value = null;
	editorErrorCode.value = null;
	editorOpen.value = true;
}

function pickTypeAgain() {
	editorOpen.value = false;
	typePickerOpen.value = true;
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

<style scoped>
@reference "@/assets/css/main.css";

/* The design system's soft badge: a blurple tint, the count in monospace. */
.rules-count {
	@apply inline-flex h-6.5 items-center rounded-full bg-primary/15 px-2.5 font-mono text-xs font-semibold text-primary theme-light:text-default;
}

/* A rule card's actions: compact, square-cornered and outlined. */
.rule-action {
	--btn-bg: transparent;
	--btn-shadow: none;
	@apply h-7 rounded-[5px] bg-transparent! px-3 text-xs font-medium ring-0;
	border: 1px solid var(--field-border);
	color: var(--ui-text-highlighted);
}

.rule-action:hover:not(:disabled) {
	background-color: color-mix(in oklab, var(--ui-text-highlighted) 6%, transparent) !important;
}

.rule-action--danger {
	border-color: color-mix(in oklab, var(--color-error) 60%, transparent);
	color: var(--color-error);
}

.rule-action--danger:hover:not(:disabled) {
	background-color: color-mix(in oklab, var(--color-error) 10%, transparent) !important;
}
</style>
