<template>
	<UModal
		v-model:open="open"
		:title="title"
		:description="description"
		:dismissible="!saving"
		:ui="{ content: 'sm:max-w-205' }"
	>
		<template #body>
			<form :id="formId" class="space-y-5" novalidate @submit.prevent="submit">
				<template v-if="mode === 'rule'">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<UFormField
							:label="ts('guild_settings.automod.rules.editor.name')"
							:error="nameError"
							required
						>
							<UInput
								v-model="draft.name"
								:maxlength="MaximumAutoModerationRuleNameLength"
								:placeholder="
									ts('guild_settings.automod.rules.editor.name_placeholder')
								"
								autocomplete="off"
								class="w-full"
							/>
						</UFormField>

						<UFormField
							:label="ts('guild_settings.automod.rules.editor.type')"
							:help="ts('guild_settings.automod.rules.editor.type_locked')"
						>
							<!-- Picked before the form opens and fixed from then on, so it
						     is shown, not offered. -->
							<div class="editor-type">
								<GuildAutomodTypeIcon
									:type="draft.type"
									class="size-6! rounded-[6px]!"
								/>
								<span class="truncate">{{
									ts(AUTOMOD_TYPE_NAME_KEYS[draft.type])
								}}</span>
								<span class="ml-auto font-mono text-[0.6875rem] text-muted">
									{{ draft.type }}
								</span>
							</div>
						</UFormField>
					</div>

					<UFormField :label="ts('guild_settings.automod.rules.editor.enabled')">
						<USwitch
							v-model="draft.enabled"
							:aria-label="ts('guild_settings.automod.rules.editor.enabled')"
						/>
					</UFormField>

					<fieldset v-if="optionFields.length > 0" class="space-y-4">
						<legend class="editor-heading">
							<span>{{ ts("guild_settings.automod.rules.editor.options") }}</span>
							<span aria-hidden="true"></span>
						</legend>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<UFormField
								v-for="field in optionFields"
								:key="field.key"
								:label="field.label"
								:class="field.kind === 'list' ? 'sm:col-span-2' : undefined"
							>
								<UInputNumber
									v-if="field.kind === 'number'"
									:model-value="numberOption(field.key)"
									:min="field.minimum"
									:max="field.maximum"
									:aria-label="field.label"
									class="w-full"
									@update:model-value="draft.options[field.key] = $event ?? 0"
								/>
								<USwitch
									v-else-if="field.kind === 'boolean'"
									:model-value="draft.options[field.key] === true"
									:aria-label="field.label"
									@update:model-value="draft.options[field.key] = $event"
								/>
								<UInputTags
									v-else
									:model-value="listOption(field.key)"
									:placeholder="
										ts('guild_settings.automod.rules.editor.list_placeholder')
									"
									:aria-label="field.label"
									class="w-full"
									@update:model-value="draft.options[field.key] = $event"
								/>
							</UFormField>
						</div>
					</fieldset>
				</template>

				<fieldset v-if="mode !== 'escalation'" class="space-y-3">
					<legend class="editor-heading">
						<span>{{ ts("guild_settings.automod.rules.editor.soft_actions") }}</span>
						<span aria-hidden="true"></span>
					</legend>
					<p class="text-[0.8125rem] text-muted">
						{{ ts("guild_settings.automod.rules.editor.soft_actions_help") }}
					</p>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<USwitch
							v-model="draft.softAlert"
							:label="ts('guild_settings.automod.rules.editor.soft_alert')"
						/>
						<USwitch
							v-model="draft.softLog"
							:label="ts('guild_settings.automod.rules.editor.soft_log')"
						/>
						<USwitch
							v-model="draft.softDelete"
							:label="ts('guild_settings.automod.rules.editor.soft_delete')"
						/>
					</div>
				</fieldset>

				<fieldset v-if="mode !== 'escalation'" class="space-y-4">
					<legend class="editor-heading">
						<span>{{ ts("guild_settings.automod.rules.editor.hard_action") }}</span>
						<span aria-hidden="true"></span>
					</legend>
					<p class="text-[0.8125rem] text-muted">
						{{ ts("guild_settings.automod.rules.editor.hard_action_help") }}
					</p>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<UFormField
							:label="ts('guild_settings.automod.rules.editor.threshold_maximum')"
						>
							<UInputNumber
								v-model="draft.thresholdMaximum"
								:min="AutoModerationRuleLimits.thresholdMaximum.minimum"
								:max="AutoModerationRuleLimits.thresholdMaximum.maximum"
								:aria-label="
									ts('guild_settings.automod.rules.editor.threshold_maximum')
								"
								class="w-full"
							/>
						</UFormField>
						<UFormField
							:label="ts('guild_settings.automod.rules.editor.threshold_duration')"
						>
							<GuildAutomodDurationInput
								v-model="draft.thresholdDuration"
								:label="
									ts('guild_settings.automod.rules.editor.threshold_duration')
								"
							/>
						</UFormField>
						<UFormField :label="ts('guild_settings.automod.rules.editor.action')">
							<USelect
								v-model="draft.hardAction"
								:items="hardActionItems"
								class="w-full"
							/>
						</UFormField>
						<UFormField
							:label="ts('guild_settings.automod.rules.editor.duration')"
							:help="ts('guild_settings.automod.rules.editor.permanent_hint')"
							:error="actionError"
						>
							<GuildAutomodDurationInput
								v-model="draft.hardActionDuration"
								:label="ts('guild_settings.automod.rules.editor.duration')"
							/>
						</UFormField>
					</div>
				</fieldset>

				<fieldset v-if="mode !== 'defaults'" class="space-y-3">
					<legend class="editor-heading">
						<span>{{ ts("guild_settings.automod.rules.editor.escalation") }}</span>
						<span aria-hidden="true"></span>
					</legend>
					<p class="text-[0.8125rem] text-muted">
						{{ ts("guild_settings.automod.rules.editor.escalation_help") }}
					</p>

					<ol v-if="draft.escalation.length > 0" class="space-y-2">
						<li
							v-for="(step, index) in draft.escalation"
							:key="index"
							class="editor-step grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
						>
							<UFormField
								:label="
									ts('guild_settings.automod.rules.editor.escalation_step', {
										index: index + 1,
									})
								"
							>
								<USelect
									v-model="step.action"
									:items="hardActionItems"
									class="w-full"
								/>
							</UFormField>
							<UFormField :label="ts('guild_settings.automod.rules.editor.duration')">
								<GuildAutomodDurationInput
									v-model="step.duration"
									:label="ts('guild_settings.automod.rules.editor.duration')"
								/>
							</UFormField>
							<UButton
								color="error"
								variant="ghost"
								icon="heroicons:trash"
								:aria-label="
									ts(
										'guild_settings.automod.rules.editor.escalation_remove_aria',
										{
											index: index + 1,
										},
									)
								"
								@click="draft.escalation.splice(index, 1)"
							/>
						</li>
					</ol>

					<p v-if="escalationError" class="text-sm text-error" role="alert">
						{{ escalationError }}
					</p>

					<button
						type="button"
						class="editor-add-step"
						:disabled="
							draft.escalation.length >= MaximumAutoModerationRuleEscalationSteps
						"
						@click="draft.escalation.push({ action: 'Timeout', duration: 600_000 })"
					>
						<UIcon name="ic:round-add" class="size-4" aria-hidden="true" />
						{{ ts("guild_settings.automod.rules.editor.escalation_add") }}
					</button>

					<UFormField
						v-if="draft.escalation.length > 0"
						:label="ts('guild_settings.automod.rules.editor.escalation_duration')"
						:help="ts('guild_settings.automod.rules.editor.escalation_duration_help')"
					>
						<GuildAutomodDurationInput
							v-model="draft.escalationDuration"
							:label="ts('guild_settings.automod.rules.editor.escalation_duration')"
						/>
					</UFormField>
				</fieldset>

				<fieldset v-if="mode !== 'escalation'" class="space-y-4">
					<legend class="editor-heading">
						<span>{{ ts("guild_settings.automod.rules.editor.exemptions") }}</span>
						<span aria-hidden="true"></span>
					</legend>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SelectRoles
							v-model="draft.ignoredRoles"
							layout="chips"
							:guild="guild"
							:label="ts('guild_settings.automod.rules.editor.ignored_roles')"
							:empty-label="ts('select.none')"
						/>
						<SelectChannels
							v-model="draft.ignoredChannels"
							layout="chips"
							:guild="guild"
							:label="ts('guild_settings.automod.rules.editor.ignored_channels')"
							:empty-label="ts('select.none')"
						/>
					</div>
				</fieldset>
			</form>
		</template>

		<template #footer>
			<div class="flex w-full items-center gap-2.5">
				<UButton
					v-if="mode === 'rule' && rule === null"
					color="neutral"
					variant="ghost"
					icon="ic:round-arrow-back"
					:disabled="saving"
					@click="emit('back')"
				>
					{{ ts("guild_settings.automod.rules.editor.back") }}
				</UButton>
				<span class="grow"></span>
				<UButton
					color="neutral"
					variant="outline"
					class="dialog-cancel"
					:disabled="saving"
					@click="open = false"
				>
					{{ ts("guild_settings.automod.rules.editor.cancel") }}
				</UButton>
				<UButton type="submit" :form="formId" color="primary" :loading="saving">
					{{ saveLabel }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { DeepReadonly } from "@sapphire/utilities";
import type { AutomodRuleCreate, AutomodRuleErrorCode } from "~/composables/useAutomodRules";
import {
	AutoModerationHardActions,
	AutoModerationRuleLimits,
	AutoModerationRuleOptionLimits,
	MaximumAutoModerationRuleEscalationSteps,
	MaximumAutoModerationRuleNameLength,
	type AutoModerationRule,
	type AutoModerationRuleType,
} from "#shared/utils/automod-rules";
import {
	applyAutomodRuleDefaults,
	automodRuleDraftToBody,
	pickAutomodEscalationDefaults,
	pickAutomodRuleDefaults,
	type AutomodRuleDefaults,
	automodRuleToDraft,
	createAutomodRuleDraft,
	validateAutomodRuleName,
	type AutomodRuleDraft,
} from "~/utils/automod-rule-draft";
import {
	AUTOMOD_HARD_ACTION_KEYS,
	AUTOMOD_TYPE_DESCRIPTION_KEYS,
	AUTOMOD_TYPE_NAME_KEYS,
} from "~/utils/automod-rule-labels";

const open = defineModel<boolean>("open", { required: true });

const {
	rule = null,
	mode = "rule",
	defaults,
	type = "Words",
	guild,
	saving = false,
	errorCode = null,
} = defineProps<{
	/** The rule to edit, or `null` to create one. */
	rule?: AutoModerationRule | null;
	/**
	 * `rule` edits or creates a rule. `defaults` and `escalation` edit what new
	 * rules start from instead: their actions, threshold and exemptions, or
	 * their escalation.
	 */
	mode?: "rule" | "defaults" | "escalation";
	/** The saved defaults, laid over a new rule and shown when editing them. */
	defaults?: AutomodRuleDefaults;
	/** The kind of rule to create, picked before the form opens. */
	type?: AutoModerationRuleType;
	/** `undefined` while the guild has not loaded: the list is then empty. */
	guild:
		| DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>
		| undefined;
	saving?: boolean;
	/** Why the last save was refused, to show next to the field it is about. */
	errorCode?: AutomodRuleErrorCode | null;
}>();

const emit = defineEmits<{
	/** The form is valid and should be saved with this body. */
	save: [body: AutomodRuleCreate];
	/** A new rule's type should be picked again. */
	back: [];
	/** The defaults were edited; only the part this mode shows is set. */
	saveDefaults: [defaults: AutomodRuleDefaults];
}>();

const { ts } = useI18n();
const formId = useId();

// One label per option name. What `maximum` counts depends on the type, which
// the type's own description above the fields spells out.
const OPTION_LABEL_KEYS: Record<string, string> = {
	allowed: "guild_settings.automod.options.allowed",
	allowedCodes: "guild_settings.automod.options.allowedCodes",
	allowedGuilds: "guild_settings.automod.options.allowedGuilds",
	characters: "guild_settings.automod.options.characters",
	maximum: "guild_settings.automod.options.maximum",
	minimum: "guild_settings.automod.options.minimum",
	perChannel: "guild_settings.automod.options.perChannel",
	timePeriod: "guild_settings.automod.options.timePeriod",
	weighted: "guild_settings.automod.options.weighted",
	words: "guild_settings.automod.options.words",
};

const hardActionItems = computed(() =>
	AutoModerationHardActions.map((value) => ({
		label: ts(AUTOMOD_HARD_ACTION_KEYS[value]),
		value,
	})),
);

const draft = reactive<AutomodRuleDraft>(createAutomodRuleDraft(type));
const submitted = ref(false);

// The form is filled when the modal opens rather than when the prop changes,
// so reopening it after a cancel never shows the abandoned edit.
watch(
	open,
	(isOpen) => {
		if (!isOpen) return;
		Object.assign(
			draft,
			mode === "rule" && rule
				? automodRuleToDraft(rule)
				: applyAutomodRuleDefaults(createAutomodRuleDraft(type), defaults),
		);
		submitted.value = false;
	},
	{ immediate: true },
);

interface OptionField {
	key: string;
	label: string;
	kind: "number" | "boolean" | "list";
	minimum?: number;
	maximum?: number;
}

const optionFields = computed<OptionField[]>(() => {
	const limits = (
		AutoModerationRuleOptionLimits as Record<
			string,
			Record<string, { minimum: number; maximum: number }> | undefined
		>
	)[draft.type];

	return Object.entries(draft.options).map(([key, value]): OptionField => {
		const labelKey = OPTION_LABEL_KEYS[key];
		const label = labelKey ? ts(labelKey) : key;
		if (typeof value === "number") {
			const limit = limits?.[key];
			return { key, label, kind: "number", minimum: limit?.minimum, maximum: limit?.maximum };
		}
		return { key, label, kind: typeof value === "boolean" ? "boolean" : "list" };
	});
});

function numberOption(key: string): number {
	const value = draft.options[key];
	return typeof value === "number" ? value : 0;
}

function listOption(key: string): string[] {
	const value = draft.options[key];
	return Array.isArray(value) ? value : [];
}

const NAME_PROBLEM_KEYS = {
	digitsOnly: "guild_settings.automod.rules.errors.nameInvalid",
	empty: "guild_settings.automod.rules.errors.nameRequired",
	tooLong: "guild_settings.automod.rules.errors.nameInvalid",
} as const;

const nameError = computed(() => {
	if (errorCode === "nameTaken") return ts("guild_settings.automod.rules.errors.nameTaken");
	if (errorCode === "nameInvalid") return ts("guild_settings.automod.rules.errors.nameInvalid");
	if (!submitted.value) return undefined;
	const problem = validateAutomodRuleName(draft.name);
	return problem ? ts(NAME_PROBLEM_KEYS[problem]) : undefined;
});

// A timeout cannot be permanent: Discord takes none without an end, whether it
// is the rule's own action or a step of the escalation.
const escalationError = computed(() =>
	submitted.value &&
	draft.escalation.some((step) => step.action === "Timeout" && step.duration <= 0)
		? ts("guild_settings.automod.rules.errors.timeoutNeedsDuration")
		: undefined,
);

const actionError = computed(() =>
	submitted.value && draft.hardAction === "Timeout" && draft.hardActionDuration <= 0
		? ts("guild_settings.automod.rules.errors.timeoutNeedsDuration")
		: undefined,
);

const title = computed(() => {
	if (mode === "defaults") return ts("guild_settings.automod.rules.defaults.rule_title");
	if (mode === "escalation") return ts("guild_settings.automod.rules.defaults.escalation_title");
	return rule
		? ts("guild_settings.automod.rules.editor.edit_title", { name: rule.name })
		: ts("guild_settings.automod.rules.editor.create_title");
});

const description = computed(() =>
	mode === "rule"
		? ts(AUTOMOD_TYPE_DESCRIPTION_KEYS[draft.type])
		: ts("guild_settings.automod.rules.defaults.description"),
);

const saveLabel = computed(() => {
	if (mode !== "rule") return ts("guild_settings.automod.rules.defaults.save");
	return rule
		? ts("guild_settings.automod.rules.editor.save")
		: ts("guild_settings.automod.rules.editor.create");
});

function submit() {
	submitted.value = true;
	if (mode === "defaults") {
		if (actionError.value) return;
		emit("saveDefaults", { rule: pickAutomodRuleDefaults(draft) });
		return;
	}
	if (mode === "escalation") {
		if (escalationError.value) return;
		emit("saveDefaults", { escalation: pickAutomodEscalationDefaults(draft) });
		return;
	}
	if (
		validateAutomodRuleName(draft.name) !== null ||
		escalationError.value ||
		actionError.value
	) {
		return;
	}
	emit("save", automodRuleDraftToBody(draft));
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* A section title followed by a hairline to the edge of the form. */
.editor-heading {
	@apply mb-1 flex w-full items-center gap-3 text-[1.0625rem] font-semibold;
}

.editor-heading span:last-child {
	@apply h-px flex-1;
	background-color: var(--field-border);
}

.editor-type {
	@apply flex h-10 items-center gap-2 rounded-[6px] px-2.5 text-sm;
	background-color: var(--field-surface);
	border: 1px solid var(--field-border);
}

.editor-step {
	@apply rounded-[8px] p-3;
	background-color: var(--field-surface);
}

.editor-add-step {
	@apply flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-transparent text-sm font-medium;
	border: 1px dashed var(--field-border);
	color: var(--ui-text-toned);
}

.editor-add-step:hover:not(:disabled) {
	background-color: color-mix(in oklab, var(--field-surface) 60%, transparent);
}

.editor-add-step:disabled {
	@apply cursor-default opacity-50;
}

.editor-add-step:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -1px;
}
</style>
