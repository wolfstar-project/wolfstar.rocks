<template>
	<UModal
		v-model:open="open"
		:title="
			rule
				? ts('guild_settings.automod.rules.editor.edit_title', { name: rule.name })
				: ts('guild_settings.automod.rules.editor.create_title')
		"
		:description="ts('guild_settings.automod.rules.editor.description')"
		:dismissible="!saving"
		:ui="{ content: 'sm:max-w-2xl' }"
	>
		<template #body>
			<form :id="formId" class="space-y-6" novalidate @submit.prevent="submit">
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
						:help="
							rule ? ts('guild_settings.automod.rules.editor.type_locked') : undefined
						"
					>
						<USelect
							v-model="draft.type"
							:items="typeItems"
							:disabled="rule !== null"
							class="w-full"
						/>
					</UFormField>
				</div>

				<p class="text-sm text-base-content/70">
					{{ ts(AUTOMOD_TYPE_DESCRIPTION_KEYS[draft.type]) }}
				</p>

				<UFormField :label="ts('guild_settings.automod.rules.editor.enabled')">
					<USwitch
						v-model="draft.enabled"
						:aria-label="ts('guild_settings.automod.rules.editor.enabled')"
					/>
				</UFormField>

				<fieldset v-if="optionFields.length > 0" class="space-y-4">
					<legend class="text-base font-semibold text-base-content">
						{{ ts("guild_settings.automod.rules.editor.options") }}
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

				<fieldset class="space-y-3">
					<legend class="text-base font-semibold text-base-content">
						{{ ts("guild_settings.automod.rules.editor.soft_actions") }}
					</legend>
					<p class="text-sm text-base-content/70">
						{{ ts("guild_settings.automod.rules.editor.soft_actions_help") }}
					</p>
					<div class="flex flex-wrap gap-x-6 gap-y-2">
						<UCheckbox
							v-model="draft.softDelete"
							:label="ts('guild_settings.automod.rules.editor.soft_delete')"
						/>
						<UCheckbox
							v-model="draft.softLog"
							:label="ts('guild_settings.automod.rules.editor.soft_log')"
						/>
						<UCheckbox
							v-model="draft.softAlert"
							:label="ts('guild_settings.automod.rules.editor.soft_alert')"
						/>
					</div>
				</fieldset>

				<fieldset class="space-y-4">
					<legend class="text-base font-semibold text-base-content">
						{{ ts("guild_settings.automod.rules.editor.hard_action") }}
					</legend>
					<p class="text-sm text-base-content/70">
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
						>
							<GuildAutomodDurationInput
								v-model="draft.hardActionDuration"
								:label="ts('guild_settings.automod.rules.editor.duration')"
							/>
						</UFormField>
					</div>
				</fieldset>

				<fieldset class="space-y-3">
					<legend class="text-base font-semibold text-base-content">
						{{ ts("guild_settings.automod.rules.editor.escalation") }}
					</legend>
					<p class="text-sm text-base-content/70">
						{{ ts("guild_settings.automod.rules.editor.escalation_help") }}
					</p>

					<ol v-if="draft.escalation.length > 0" class="space-y-2">
						<li
							v-for="(step, index) in draft.escalation"
							:key="index"
							class="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
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

					<UButton
						color="neutral"
						variant="outline"
						size="sm"
						icon="heroicons:plus"
						:disabled="
							draft.escalation.length >= MaximumAutoModerationRuleEscalationSteps
						"
						@click="draft.escalation.push({ action: 'Timeout', duration: 600_000 })"
					>
						{{ ts("guild_settings.automod.rules.editor.escalation_add") }}
					</UButton>

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

				<fieldset class="space-y-4">
					<legend class="text-base font-semibold text-base-content">
						{{ ts("guild_settings.automod.rules.editor.exemptions") }}
					</legend>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SelectRoles
							v-model="draft.ignoredRoles"
							:guild="guild"
							:label="ts('guild_settings.automod.rules.editor.ignored_roles')"
						/>
						<SelectChannels
							v-model="draft.ignoredChannels"
							:guild="guild"
							:label="ts('guild_settings.automod.rules.editor.ignored_channels')"
						/>
					</div>
				</fieldset>
			</form>
		</template>

		<template #footer>
			<div class="flex w-full justify-end gap-2">
				<UButton color="neutral" variant="ghost" :disabled="saving" @click="open = false">
					{{ ts("guild_settings.automod.rules.editor.cancel") }}
				</UButton>
				<UButton type="submit" :form="formId" color="primary" :loading="saving">
					{{
						rule
							? ts("guild_settings.automod.rules.editor.save")
							: ts("guild_settings.automod.rules.editor.create")
					}}
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
	AutoModerationRuleTypes,
	MaximumAutoModerationRuleEscalationSteps,
	MaximumAutoModerationRuleNameLength,
	type AutoModerationRule,
} from "#shared/utils/automod-rules";
import {
	automodRuleDraftToBody,
	automodRuleToDraft,
	createAutomodRuleDraft,
	defaultAutomodRuleOptions,
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
	guild,
	saving = false,
	errorCode = null,
} = defineProps<{
	/** The rule to edit, or `null` to create one. */
	rule?: AutoModerationRule | null;
	guild: DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>;
	saving?: boolean;
	/** Why the last save was refused, to show next to the field it is about. */
	errorCode?: AutomodRuleErrorCode | null;
}>();

const emit = defineEmits<{
	/** The form is valid and should be saved with this body. */
	save: [body: AutomodRuleCreate];
}>();

const { ts } = useI18n();
const formId = useId();

// One label per option name. What `maximum` counts depends on the type, which
// the type's own description above the fields spells out.
const OPTION_LABEL_KEYS: Record<string, string> = {
	alerts: "guild_settings.automod.options.alerts",
	allowed: "guild_settings.automod.options.allowed",
	allowedCodes: "guild_settings.automod.options.allowedCodes",
	allowedGuilds: "guild_settings.automod.options.allowedGuilds",
	characters: "guild_settings.automod.options.characters",
	maximum: "guild_settings.automod.options.maximum",
	mentionsAllowed: "guild_settings.automod.options.mentionsAllowed",
	minimum: "guild_settings.automod.options.minimum",
	timePeriod: "guild_settings.automod.options.timePeriod",
	words: "guild_settings.automod.options.words",
};

const typeItems = computed(() =>
	AutoModerationRuleTypes.map((value) => ({ label: ts(AUTOMOD_TYPE_NAME_KEYS[value]), value })),
);

const hardActionItems = computed(() =>
	AutoModerationHardActions.map((value) => ({
		label: ts(AUTOMOD_HARD_ACTION_KEYS[value]),
		value,
	})),
);

const draft = reactive<AutomodRuleDraft>(createAutomodRuleDraft("Words"));
const submitted = ref(false);

// The form is filled when the modal opens rather than when the prop changes,
// so reopening it after a cancel never shows the abandoned edit.
watch(
	open,
	(isOpen) => {
		if (!isOpen) return;
		Object.assign(draft, rule ? automodRuleToDraft(rule) : createAutomodRuleDraft("Words"));
		submitted.value = false;
	},
	{ immediate: true },
);

// The options belong to the type: a new rule that changes type starts from
// that type's defaults. An existing rule cannot change type.
watch(
	() => draft.type,
	(type, previous) => {
		if (rule === null && type !== previous) {
			draft.options = defaultAutomodRuleOptions(type);
		}
	},
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

// A timeout cannot be permanent: Discord caps it, and the bot refuses the step.
const escalationError = computed(() =>
	submitted.value &&
	draft.escalation.some((step) => step.action === "Timeout" && step.duration <= 0)
		? ts("guild_settings.automod.rules.errors.timeoutNeedsDuration")
		: undefined,
);

function submit() {
	submitted.value = true;
	if (validateAutomodRuleName(draft.name) !== null || escalationError.value) return;
	emit("save", automodRuleDraftToBody(draft));
}
</script>
