<template>
	<UModal
		v-model:open="open"
		:title="title"
		:description="ts('guild_settings.onboarding.editor.description')"
		:dismissible="!saving"
		:ui="{ content: 'sm:max-w-150' }"
	>
		<template #body>
			<form :id="formId" class="flex flex-col gap-4.5" novalidate @submit.prevent="submit">
				<div class="flex items-end gap-3">
					<UFormField
						class="min-w-0 flex-auto"
						:label="ts('guild_settings.onboarding.editor.name')"
						required
					>
						<UInput
							v-model="draft.name"
							:maxlength="OnboardingLimits.stageName"
							:placeholder="ts('guild_settings.onboarding.editor.name_placeholder')"
							autocomplete="off"
							class="w-full"
						/>
					</UFormField>
					<div class="flex shrink-0 flex-col items-center gap-1.5 pb-1">
						<span :id="enabledId" class="text-xs font-semibold text-muted">
							{{ ts("guild_settings.onboarding.editor.enabled") }}
						</span>
						<USwitch v-model="draft.enabled" :aria-labelledby="enabledId" />
					</div>
				</div>

				<URadioGroup
					v-model="draft.trigger"
					variant="card"
					orientation="horizontal"
					:legend="ts('guild_settings.onboarding.editor.trigger')"
					:items="triggerItems"
					:ui="{ fieldset: 'ob-cards' }"
				/>

				<URadioGroup
					v-model="draft.challenge"
					variant="card"
					orientation="horizontal"
					:legend="ts('guild_settings.onboarding.editor.challenge')"
					:items="challengeItems"
					:ui="{ fieldset: 'ob-cards' }"
				/>

				<template v-if="draft.challenge === 'Question'">
					<UFormField :label="ts('guild_settings.onboarding.editor.question')" required>
						<UInput
							v-model="draft.question"
							:maxlength="OnboardingLimits.question"
							:placeholder="
								ts('guild_settings.onboarding.editor.question_placeholder')
							"
							autocomplete="off"
							class="w-full"
						/>
					</UFormField>

					<fieldset>
						<legend class="text-sm font-medium">
							{{ ts("guild_settings.onboarding.editor.answers") }}
						</legend>
						<p class="mb-1.5 text-xs text-muted">
							{{ ts("guild_settings.onboarding.editor.answers_help") }}
						</p>
						<ul class="flex flex-col gap-1.5">
							<li
								v-for="(_, index) in draft.answers"
								:key="index"
								class="flex items-center gap-1.5"
							>
								<UInput
									v-model="draft.answers[index]"
									:maxlength="OnboardingLimits.answer"
									:placeholder="
										ts('guild_settings.onboarding.editor.answer_placeholder')
									"
									:aria-label="
										ts('guild_settings.onboarding.editor.answer_aria', {
											number: index + 1,
										})
									"
									autocomplete="off"
									class="min-w-0 flex-auto"
								/>
								<UButton
									color="neutral"
									variant="ghost"
									icon="ic:round-close"
									:disabled="draft.answers.length === 1"
									:aria-label="
										ts('guild_settings.onboarding.editor.remove_answer_aria', {
											number: index + 1,
										})
									"
									@click="draft = removeOnboardingAnswer(draft, index)"
								/>
							</li>
						</ul>
						<UButton
							v-if="draft.answers.length < OnboardingLimits.answers"
							class="mt-2"
							color="neutral"
							variant="outline"
							size="sm"
							icon="ic:round-add"
							@click="draft = addOnboardingAnswer(draft)"
						>
							{{ ts("guild_settings.onboarding.editor.add_answer") }}
						</UButton>
					</fieldset>
				</template>

				<div class="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
					<UFormField
						:label="ts('guild_settings.onboarding.editor.attempts')"
						:help="ts('guild_settings.onboarding.editor.attempts_help')"
					>
						<UInputNumber
							v-model="draft.maxAttempts"
							:min="OnboardingAttempts.minimum"
							:max="OnboardingAttempts.maximum"
							:step="1"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="ts('guild_settings.onboarding.editor.time_limit')"
						:help="ts('guild_settings.onboarding.editor.time_limit_help')"
					>
						<GuildAutomodDurationInput
							v-model="draft.timeLimit"
							:label="ts('guild_settings.onboarding.editor.time_limit')"
						/>
					</UFormField>
				</div>

				<SelectRole
					v-model="draft.roleId"
					class="w-full"
					layout="field"
					:guild="guild"
					:label="ts('guild_settings.onboarding.editor.role')"
					:tooltip-title="ts('guild_settings.onboarding.editor.role_help')"
					:empty-label="ts('guild_settings.onboarding.editor.pick_role')"
				/>

				<URadioGroup
					v-model="draft.failureAction"
					variant="card"
					orientation="horizontal"
					:legend="ts('guild_settings.onboarding.editor.failure')"
					:items="failureItems"
					:ui="{ fieldset: 'ob-cards' }"
				/>

				<UFormField
					v-if="draft.failureAction === 'Timeout'"
					:label="ts('guild_settings.onboarding.editor.failure_timeout_length')"
				>
					<GuildAutomodDurationInput
						v-model="draft.failureTimeout"
						:label="ts('guild_settings.onboarding.editor.failure_timeout_length')"
					/>
				</UFormField>

				<div
					v-if="shownProblem"
					ref="problemRef"
					class="ob-note"
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
			</form>
		</template>

		<template #footer>
			<div class="flex w-full items-center gap-2">
				<UButton
					v-if="stage"
					color="error"
					variant="ghost"
					:disabled="saving || locked"
					@click="emit('delete')"
				>
					{{ ts("guild_settings.onboarding.editor.delete") }}
				</UButton>
				<span class="grow"></span>
				<UButton
					color="neutral"
					variant="outline"
					class="dialog-cancel"
					:disabled="saving"
					@click="open = false"
				>
					{{ ts("guild_settings.onboarding.editor.cancel") }}
				</UButton>
				<UButton
					type="submit"
					:form="formId"
					color="primary"
					:loading="saving"
					:disabled="locked"
				>
					{{
						stage
							? ts("guild_settings.onboarding.editor.save")
							: ts("guild_settings.onboarding.editor.create")
					}}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { OnboardingStage, OnboardingStageInput } from "#shared/utils/onboarding";
import type { DeepReadonly } from "@sapphire/utilities";
import {
	OfferedOnboardingChallenges,
	OnboardingAttempts,
	OnboardingLimits,
	parseOnboardingStage,
} from "#shared/utils/onboarding";

const open = defineModel<boolean>("open", { required: true });

const {
	stage = null,
	guild,
	saving = false,
	locked = false,
	errorMessage = null,
} = defineProps<{
	/** The stage to edit, or `null` to create one. */
	stage?: OnboardingStage | null;
	/** `undefined` while the guild has not loaded: the picker is then empty. */
	guild:
		| DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>
		| undefined;
	saving?: boolean;
	/** Whether a write would be refused whatever it is: the page must reload first. */
	locked?: boolean;
	/** Why the server refused the last save, if it did. */
	errorMessage?: string | null;
}>();

const emit = defineEmits<{
	save: [body: OnboardingStageInput];
	delete: [];
}>();

const { ts } = useI18n();

const formId = useId();
const enabledId = useId();
const problemRef = useTemplateRef<HTMLElement>("problemRef");

const draft = ref<OnboardingStageDraft>(createOnboardingStageDraft());
// The problems are shown once a save was tried, and follow the edits after.
const triedToSave = ref(false);

// Each opening starts from the stage, or from a new one.
watch(
	open,
	(isOpen) => {
		if (!isOpen) return;
		draft.value = stage ? onboardingStageToDraft(stage) : createOnboardingStageDraft();
		triedToSave.value = false;
	},
	{ immediate: true },
);

const title = computed(() =>
	stage
		? ts("guild_settings.onboarding.editor.edit_title", { name: stage.name })
		: ts("guild_settings.onboarding.editor.new_title"),
);

const triggerItems = computed(() => [
	{
		description: ts("guild_settings.onboarding.editor.trigger_join_help"),
		label: ts("guild_settings.onboarding.chips.trigger.Join"),
		value: "Join" as const,
	},
	{
		description: ts("guild_settings.onboarding.editor.trigger_native_help"),
		label: ts("guild_settings.onboarding.chips.trigger.NativeOnboarding"),
		value: "NativeOnboarding" as const,
	},
]);

// Literal keys, one per challenge, so the i18n report sees each.
const CHALLENGE_COPY = {
	Button: {
		description: "guild_settings.onboarding.editor.challenge_button_help",
		label: "guild_settings.onboarding.chips.challenge.Button",
	},
	Captcha: {
		description: "guild_settings.onboarding.editor.challenge_captcha_help",
		label: "guild_settings.onboarding.chips.challenge.Captcha",
	},
	Emoji: {
		description: "guild_settings.onboarding.editor.challenge_emoji_help",
		label: "guild_settings.onboarding.chips.challenge.Emoji",
	},
	Question: {
		description: "guild_settings.onboarding.editor.challenge_question_help",
		label: "guild_settings.onboarding.chips.challenge.Question",
	},
} as const;

// A stage the bot's panel gave the captcha keeps showing it, so the editor
// does not change the challenge by opening.
const challengeItems = computed(() =>
	[
		...OfferedOnboardingChallenges,
		...(stage?.challenge === "Captcha" ? ["Captcha" as const] : []),
	].map((value) => ({
		description: ts(CHALLENGE_COPY[value].description),
		disabled: value === "Captcha",
		label: ts(CHALLENGE_COPY[value].label),
		value,
	})),
);

const failureItems = computed(() => [
	{
		description: ts("guild_settings.onboarding.editor.failure_none_help"),
		label: ts("guild_settings.onboarding.editor.failure_none"),
		value: "None" as const,
	},
	{
		description: ts("guild_settings.onboarding.editor.failure_kick_help"),
		label: ts("guild_settings.onboarding.editor.failure_kick"),
		value: "Kick" as const,
	},
	{
		description: ts("guild_settings.onboarding.editor.failure_timeout_help"),
		label: ts("guild_settings.onboarding.editor.failure_timeout"),
		value: "Timeout" as const,
	},
]);

const parsed = computed(() => parseOnboardingStage(onboardingDraftToInput(draft.value)));

const shownProblem = computed(() => {
	if (triedToSave.value && !parsed.value.ok) {
		return ts(ONBOARDING_PROBLEM_KEYS[parsed.value.problem]);
	}
	return errorMessage;
});

async function submit() {
	triedToSave.value = true;
	if (!parsed.value.ok) {
		await nextTick();
		problemRef.value?.focus();
		return;
	}
	emit("save", parsed.value.value);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The cards of a choice side by side from the width where each still reads in a few lines. */
:deep(.ob-cards) {
	@apply grid grid-cols-1 gap-2 sm:grid-cols-2;
}

.ob-note {
	@apply flex items-start gap-2 rounded-lg px-3 py-2.5 text-[0.8125rem] leading-normal;
	background-color: color-mix(in oklab, var(--color-error) 12%, transparent);
	border: 1px solid color-mix(in oklab, var(--color-error) 40%, transparent);
}

.ob-note:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.ob-note :deep(svg) {
	color: var(--color-error);
}
</style>
