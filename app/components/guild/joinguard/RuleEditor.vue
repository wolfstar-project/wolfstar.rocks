<template>
	<UModal
		v-model:open="open"
		:title="title"
		:description="ts('guild_settings.joinguard.editor.description')"
		:dismissible="!saving"
		:ui="{ content: 'sm:max-w-150' }"
	>
		<template #body>
			<form :id="formId" class="flex flex-col gap-4.5" novalidate @submit.prevent="submit">
				<div class="flex items-end gap-3">
					<UFormField
						class="min-w-0 flex-auto"
						:label="ts('guild_settings.joinguard.editor.name')"
						required
					>
						<UInput
							v-model="draft.name"
							:maxlength="JoinGuardLimits.ruleName"
							:placeholder="ts('guild_settings.joinguard.editor.name_placeholder')"
							autocomplete="off"
							class="w-full"
						/>
					</UFormField>
					<div class="flex shrink-0 flex-col items-center gap-1.5 pb-1">
						<span :id="enabledId" class="text-xs font-semibold text-muted">
							{{ ts("guild_settings.joinguard.editor.enabled") }}
						</span>
						<USwitch v-model="draft.enabled" :aria-labelledby="enabledId" />
					</div>
				</div>

				<fieldset>
					<legend class="mb-1.5 text-sm font-medium">
						{{ ts("guild_settings.joinguard.editor.conditions") }}
					</legend>
					<div class="jg-options">
						<div class="flex flex-col gap-1.5">
							<UCheckbox
								v-model="draft.accountAge"
								variant="card"
								:label="ts('guild_settings.joinguard.editor.account_age')"
								:description="
									ts('guild_settings.joinguard.editor.account_age_help')
								"
							/>
							<div v-if="draft.accountAge" class="jg-option-field">
								<UInput
									:model-value="String(draft.accountAgeDays ?? '')"
									inputmode="numeric"
									class="w-22"
									:aria-label="ts('guild_settings.joinguard.editor.days_aria')"
									@update:model-value="
										draft.accountAgeDays = parseJoinGuardDays($event)
									"
								/>
								<span class="text-[0.8125rem] text-muted">
									{{ ts("guild_settings.joinguard.editor.days") }}
								</span>
							</div>
						</div>
						<div class="flex flex-col gap-1.5">
							<UCheckbox
								v-model="draft.nameContains"
								variant="card"
								:label="ts('guild_settings.joinguard.editor.name_contains')"
								:description="
									ts('guild_settings.joinguard.editor.name_contains_help')
								"
							/>
							<div v-if="draft.nameContains" class="jg-option-field">
								<UInput
									:model-value="draft.nameContainsText"
									:maxlength="JoinGuardLimits.nameContains"
									:placeholder="
										ts(
											'guild_settings.joinguard.editor.name_contains_placeholder',
										)
									"
									:aria-label="
										ts('guild_settings.joinguard.editor.name_contains_aria')
									"
									class="w-full"
									@update:model-value="
										draft.nameContainsText = clampJoinGuardNameText(
											String($event),
										)
									"
								/>
							</div>
						</div>
						<UCheckbox
							v-model="draft.defaultAvatar"
							variant="card"
							:label="ts('guild_settings.joinguard.editor.default_avatar')"
							:description="ts('guild_settings.joinguard.editor.default_avatar_help')"
						/>
						<UCheckbox
							v-model="draft.generatedName"
							variant="card"
							:label="ts('guild_settings.joinguard.editor.generated_name')"
							:description="ts('guild_settings.joinguard.editor.generated_name_help')"
						/>
						<UCheckbox
							v-model="draft.unverifiedBot"
							variant="card"
							:label="ts('guild_settings.joinguard.editor.unverified_bot')"
							:description="ts('guild_settings.joinguard.editor.unverified_bot_help')"
						/>
					</div>
				</fieldset>

				<fieldset>
					<legend class="mb-1.5 text-sm font-medium">
						{{ ts("guild_settings.joinguard.editor.actions") }}
					</legend>
					<div class="jg-options">
						<UCheckbox
							:model-value="draft.sendToCheckpoint"
							variant="card"
							:label="ts('guild_settings.joinguard.editor.checkpoint')"
							:description="ts('guild_settings.joinguard.editor.checkpoint_help')"
							@update:model-value="draft = toggleJoinGuardCheckpoint(draft)"
						/>
						<div class="flex flex-col gap-1.5">
							<UCheckbox
								:model-value="draft.giveRole"
								variant="card"
								:label="ts('guild_settings.joinguard.editor.role')"
								:description="ts('guild_settings.joinguard.editor.role_help')"
								@update:model-value="draft = toggleJoinGuardRole(draft)"
							/>
							<div v-if="draft.giveRole" class="jg-option-field">
								<SelectRole
									v-model="draft.roleId"
									class="w-full"
									layout="field"
									:guild="guild"
									:label="ts('guild_settings.joinguard.editor.role_aria')"
									:empty-label="ts('guild_settings.joinguard.editor.pick_role')"
								/>
							</div>
						</div>
						<UCheckbox
							v-model="draft.directMessage"
							variant="card"
							:label="ts('guild_settings.joinguard.editor.direct_message')"
							:description="ts('guild_settings.joinguard.editor.direct_message_help')"
						/>
						<div class="flex flex-col gap-1.5">
							<UCheckbox
								v-model="draft.alert"
								variant="card"
								:label="ts('guild_settings.joinguard.editor.alert')"
								:description="ts('guild_settings.joinguard.editor.alert_help')"
							/>
							<div v-if="draft.alert" class="jg-option-field">
								<SelectChannel
									v-model="draft.alertChannelId"
									class="w-full"
									layout="field"
									:guild="guild"
									:label="ts('guild_settings.joinguard.editor.alert_aria')"
									:empty-label="
										ts('guild_settings.joinguard.editor.pick_channel')
									"
								/>
							</div>
						</div>
						<UCheckbox
							:model-value="draft.hardAction === 'Kick'"
							variant="card"
							:label="ts('guild_settings.joinguard.editor.kick')"
							:description="ts('guild_settings.joinguard.editor.kick_help')"
							@update:model-value="draft = toggleJoinGuardHardAction(draft, 'Kick')"
						/>
						<UCheckbox
							:model-value="draft.hardAction === 'Ban'"
							variant="card"
							:label="ts('guild_settings.joinguard.editor.ban')"
							:description="ts('guild_settings.joinguard.editor.ban_help')"
							@update:model-value="draft = toggleJoinGuardHardAction(draft, 'Ban')"
						/>
					</div>
					<p v-if="!checkpointOn" class="mt-2 text-xs text-muted">
						{{ ts("guild_settings.joinguard.editor.checkpoint_off") }}
					</p>
				</fieldset>

				<div class="flex flex-col gap-2">
					<div
						v-if="shownProblem"
						ref="problemRef"
						class="jg-note jg-note--error"
						role="alert"
						tabindex="-1"
					>
						<UIcon
							name="ic:round-error"
							class="mt-0.5 size-4 shrink-0"
							aria-hidden="true"
						/>
						<span>{{ shownProblem }}</span>
					</div>
					<p class="jg-note jg-note--info" aria-live="polite">
						<UIcon
							name="ic:round-info"
							class="mt-0.5 size-4 shrink-0"
							aria-hidden="true"
						/>
						<span>{{ summary }}</span>
					</p>
				</div>
			</form>
		</template>

		<template #footer>
			<div class="flex w-full items-center gap-2">
				<UButton
					v-if="rule"
					color="error"
					variant="ghost"
					:disabled="saving"
					@click="emit('delete')"
				>
					{{ ts("guild_settings.joinguard.editor.delete") }}
				</UButton>
				<span class="grow"></span>
				<UButton
					color="neutral"
					variant="outline"
					class="dialog-cancel"
					:disabled="saving"
					@click="open = false"
				>
					{{ ts("guild_settings.joinguard.editor.cancel") }}
				</UButton>
				<UButton type="submit" :form="formId" color="primary" :loading="saving">
					{{
						rule
							? ts("guild_settings.joinguard.editor.save")
							: ts("guild_settings.joinguard.editor.create")
					}}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { DeepReadonly } from "@sapphire/utilities";
import type { JoinGuardRuleErrorCode } from "~/composables/useJoinGuardRules";
import {
	JoinGuardLimits,
	validateJoinGuardRule,
	type JoinGuardRule,
	type JoinGuardRuleInput,
} from "#shared/utils/join-guard";

const open = defineModel<boolean>("open", { required: true });

const {
	rule = null,
	checkpointOn,
	guild,
	saving = false,
	errorCode = null,
} = defineProps<{
	/** The rule to edit, or `null` to create one. */
	rule?: JoinGuardRule | null;
	/** Whether the guild's checkpoint is on, staged or saved. */
	checkpointOn: boolean;
	/** `undefined` while the guild has not loaded: the pickers are then empty. */
	guild:
		| DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>
		| undefined;
	saving?: boolean;
	/** Why the server refused the last save, if it did. */
	errorCode?: JoinGuardRuleErrorCode | null;
}>();

const emit = defineEmits<{
	save: [body: JoinGuardRuleInput];
	delete: [];
}>();

const i18n = useI18n();
const { ts } = i18n;
const { locale } = useAppLocale();
const names = useJoinGuardNames();

const formId = useId();
const enabledId = useId();
const problemRef = useTemplateRef<HTMLElement>("problemRef");

const draft = ref<JoinGuardRuleDraft>(createJoinGuardRuleDraft(checkpointOn));
// The problems are shown once a save was tried, and follow the edits after.
const triedToSave = ref(false);

// Each opening starts from the rule, or from a new one.
watch(
	open,
	(isOpen) => {
		if (!isOpen) return;
		draft.value = rule ? joinGuardRuleToDraft(rule) : createJoinGuardRuleDraft(checkpointOn);
		triedToSave.value = false;
	},
	{ immediate: true },
);

const title = computed(() =>
	rule
		? ts("guild_settings.joinguard.editor.edit_title", { name: rule.name })
		: ts("guild_settings.joinguard.editor.new_title"),
);

const input = computed(() => joinGuardDraftToInput(draft.value));
const problem = computed(() => validateJoinGuardRule(input.value, { checkpointOn }));

const shownProblem = computed(() => {
	if (triedToSave.value && problem.value) return ts(JOIN_GUARD_PROBLEM_KEYS[problem.value]);
	return errorCode ? ts(joinGuardRuleErrorKey(errorCode)) : null;
});

const summary = computed(() => joinGuardRuleSummary(input.value, i18n, names, locale.value));

async function submit() {
	triedToSave.value = true;
	if (problem.value) {
		await nextTick();
		problemRef.value?.focus();
		return;
	}
	emit("save", input.value);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.jg-options {
	@apply grid grid-cols-1 items-start gap-2 sm:grid-cols-2;
}

/* The field of a ticked box sits under its label, past the box. */
.jg-option-field {
	@apply flex items-center gap-2.5 pb-0.5 pl-7.5;
}

.jg-note {
	@apply flex items-start gap-2 rounded-lg px-3 py-2.5 text-[0.8125rem] leading-normal;
}

.jg-note:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.jg-note--error {
	background-color: color-mix(in oklab, var(--color-error) 12%, transparent);
	border: 1px solid color-mix(in oklab, var(--color-error) 40%, transparent);
}

.jg-note--error :deep(svg) {
	color: var(--color-error);
}

.jg-note--info {
	background-color: color-mix(in oklab, var(--color-primary) 12%, transparent);
	border: 1px solid color-mix(in oklab, var(--color-primary) 40%, transparent);
}

.jg-note--info :deep(svg) {
	color: var(--color-primary);
}
</style>
