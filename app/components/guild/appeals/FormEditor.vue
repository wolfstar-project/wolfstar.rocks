<template>
	<UModal
		v-model:open="open"
		:title="title"
		:description="ts('guild_settings.appeals.editor.description')"
		:dismissible="!saving"
		:content="{ onOpenAutoFocus: focusName }"
		:ui="{ content: 'sm:max-w-205' }"
	>
		<template #body>
			<form :id="formId" class="space-y-5" novalidate @submit.prevent="submit">
				<fieldset class="space-y-4">
					<legend class="editor-heading">
						<span>{{ ts("guild_settings.appeals.editor.form") }}</span>
						<span aria-hidden="true"></span>
					</legend>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
						<UFormField
							:label="ts('guild_settings.appeals.editor.name')"
							:error="nameError"
							required
						>
							<UInput
								ref="nameField"
								v-model="draft.name"
								:maxlength="AppealFormLimits.name"
								:placeholder="ts('guild_settings.appeals.editor.name_placeholder')"
								autocomplete="off"
								class="w-full"
							/>
						</UFormField>
						<UFormField
							:label="ts('guild_settings.appeals.editor.icon')"
							:help="ts('guild_settings.appeals.editor.icon_help')"
							:error="problemText('icon')"
						>
							<GuildAppealsEmojiPicker
								v-model="draft.icon"
								:servers="serverEmojis"
								:server-name="guild?.name"
								:server-icon="serverIcon"
							/>
						</UFormField>
					</div>
					<UFormField
						:label="ts('guild_settings.appeals.editor.form_description')"
						:error="problemText('description')"
						:hint="`${draft.description.trim().length}/${AppealFormLimits.description}`"
					>
						<UTextarea
							v-model="draft.description"
							:maxlength="AppealFormLimits.description"
							:placeholder="
								ts('guild_settings.appeals.editor.form_description_placeholder')
							"
							:rows="2"
							autoresize
							class="w-full"
						/>
					</UFormField>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<UFormField
							:label="ts('guild_settings.appeals.editor.enabled')"
							:help="ts('guild_settings.appeals.editor.enabled_help')"
						>
							<USwitch
								v-model="draft.enabled"
								:aria-label="ts('guild_settings.appeals.editor.enabled')"
							/>
						</UFormField>
						<UFormField
							v-if="!draft.enabled"
							:label="ts('guild_settings.appeals.editor.lock_reason')"
							:help="ts('guild_settings.appeals.editor.lock_reason_help')"
							:error="problemText('lockReason')"
						>
							<UInput
								v-model="draft.lockReason"
								:maxlength="AppealFormLimits.lockReason"
								autocomplete="off"
								class="w-full"
							/>
						</UFormField>
					</div>
				</fieldset>

				<fieldset class="space-y-4">
					<legend class="editor-heading">
						<span>{{ ts("guild_settings.appeals.editor.access") }}</span>
						<span aria-hidden="true"></span>
					</legend>
					<!-- A group of switches, not one field: a form field would give them all its one ID. -->
					<fieldset class="space-y-2">
						<legend class="text-sm font-medium text-default">
							{{ ts("guild_settings.appeals.editor.case_types") }}
						</legend>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<USwitch
								v-for="name in AppealCaseTypeNames"
								:key="name"
								:model-value="draft.types.includes(AppealCaseTypes[name])"
								:label="ts(APPEAL_CASE_TYPE_KEYS[name])"
								@update:model-value="setType(AppealCaseTypes[name], $event)"
							/>
						</div>
						<p class="text-sm text-muted">
							{{ ts("guild_settings.appeals.editor.case_types_help") }}
						</p>
					</fieldset>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<SelectRoles
							v-model="draft.requiredRoles"
							layout="chips"
							:guild="guild"
							:label="ts('guild_settings.appeals.editor.required_roles')"
							:tooltip-title="ts('guild_settings.appeals.editor.required_roles_help')"
							:empty-label="ts('guild_settings.appeals.editor.no_role')"
						/>
						<SelectRoles
							v-model="draft.restrictedRoles"
							layout="chips"
							:guild="guild"
							:label="ts('guild_settings.appeals.editor.restricted_roles')"
							:tooltip-title="
								ts('guild_settings.appeals.editor.restricted_roles_help')
							"
							:empty-label="ts('guild_settings.appeals.editor.no_role')"
						/>
					</div>
					<p v-if="problemText('roles')" class="text-sm text-error" role="alert">
						{{ problemText("roles") }}
					</p>
				</fieldset>

				<fieldset class="space-y-3">
					<legend class="editor-heading">
						<span>{{ ts("guild_settings.appeals.editor.questions") }}</span>
						<span aria-hidden="true"></span>
					</legend>
					<p class="text-[0.8125rem] text-muted">
						{{
							ts("guild_settings.appeals.editor.questions_help", {
								maximum: MaximumAppealQuestions,
							})
						}}
					</p>

					<ol v-if="draft.questions.length > 0" class="space-y-2">
						<GuildAppealsQuestionEditor
							v-for="(question, index) in draft.questions"
							:key="question.id"
							:model-value="question"
							:index="index"
							:last="index === draft.questions.length - 1"
							:problems="submitted ? appealQuestionProblems(problems, index) : {}"
							@update:model-value="draft.questions[index] = $event"
							@move="moveQuestion(index, $event)"
							@remove="draft.questions.splice(index, 1)"
						/>
					</ol>

					<p v-if="questionsError" class="text-sm text-error" role="alert">
						{{ questionsError }}
					</p>

					<UDropdownMenu
						:items="kindItems"
						:content="{ align: 'start', sideOffset: 6 }"
						:ui="{ content: 'min-w-64' }"
					>
						<button
							type="button"
							class="editor-add-step"
							:disabled="draft.questions.length >= MaximumAppealQuestions"
						>
							<UIcon name="ic:round-add" class="size-4" aria-hidden="true" />
							{{ ts("guild_settings.appeals.editor.add_question") }}
						</button>
					</UDropdownMenu>
				</fieldset>
			</form>
		</template>

		<template #footer>
			<div class="flex w-full items-center gap-2.5">
				<p v-if="generalError" class="min-w-0 flex-1 text-sm text-error" role="alert">
					{{ generalError }}
				</p>
				<span v-else class="grow"></span>
				<UButton
					color="neutral"
					variant="outline"
					class="dialog-cancel"
					:disabled="saving"
					@click="open = false"
				>
					{{ ts("guild_settings.appeals.editor.cancel") }}
				</UButton>
				<UButton type="submit" :form="formId" color="primary" :loading="saving">
					{{
						form
							? ts("guild_settings.appeals.editor.save")
							: ts("guild_settings.appeals.editor.create")
					}}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { DeepReadonly } from "@sapphire/utilities";

const open = defineModel<boolean>("open", { required: true });

const {
	form = null,
	guild,
	saving = false,
	errorCode = null,
} = defineProps<{
	/** The form to edit, or `null` to create one. */
	form?: AppealForm | null;
	/** `undefined` while the guild has not loaded: the role lists are then empty. */
	guild:
		| DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>
		| undefined;
	saving?: boolean;
	/** Why the last save was refused, to show next to the field it is about. */
	errorCode?: AppealFormErrorCode | null;
}>();

const emit = defineEmits<{
	/** The form is valid and should be saved with this body. */
	save: [body: AppealFormCreate];
}>();

const { ts } = useI18n();
const formId = useId();

// The emoji of the server come first in the picker, and are stored as Discord writes them.
const serverEmojis = computed(() => usableServerEmojis(guild?.emojis ?? []));
const serverIcon = computed(() => resolveGuildIconSrc(guild, { size: 32 }));

const nameField = useTemplateRef<{ inputRef: HTMLInputElement | null }>("nameField");

// The dialog opens on its first field, not on the close button the browser
// finds first, which would show a ring on it before anything was asked.
function focusName(event: Event) {
	event.preventDefault();
	void nextTick(() => nameField.value?.inputRef?.focus());
}

const draft = reactive<AppealFormDraft>(createAppealFormDraft());
const submitted = ref(false);

// The form is filled when the modal opens rather than when the prop changes,
// so reopening it after a cancel never shows the abandoned edit.
watch(
	open,
	(isOpen) => {
		if (!isOpen) return;
		Object.assign(draft, form ? appealFormToDraft(form) : createAppealFormDraft());
		submitted.value = false;
	},
	{ immediate: true },
);

const problems = computed(() => validateAppealFormDraft(draft));

function problemText(path: string): string | undefined {
	if (!submitted.value) return undefined;
	const problem = problems.value[path];
	return problem ? ts(APPEAL_FORM_PROBLEM_KEYS[problem]) : undefined;
}

const nameError = computed(() => {
	if (errorCode === "nameTaken") return ts("guild_settings.appeals.forms.errors.nameTaken");
	if (errorCode === "nameInvalid") return ts("guild_settings.appeals.forms.errors.nameInvalid");
	if (!submitted.value) return undefined;
	const problem = problems.value.name;
	if (problem === "required") return ts("guild_settings.appeals.forms.errors.nameRequired");
	return problem ? ts(APPEAL_FORM_PROBLEM_KEYS[problem]) : undefined;
});

const questionsError = computed(() => problemText("questions"));

// What the server refused that no field is about.
const generalError = computed(() => {
	if (errorCode === "invalid") return ts("guild_settings.appeals.forms.errors.invalid");
	if (errorCode === "limit") return ts("guild_settings.appeals.forms.errors.limit");
	if (errorCode === "unknown") return ts("guild_settings.appeals.forms.errors.unknown");
	if (errorCode === "generic") return ts("guild_settings.appeals.forms.errors.generic");
	return undefined;
});

const title = computed(() =>
	form
		? ts("guild_settings.appeals.editor.edit_title", { name: form.name })
		: ts("guild_settings.appeals.editor.create_title"),
);

const kindItems = computed<DropdownMenuItem[][]>(() => [
	AppealQuestionKinds.map(
		(kind): DropdownMenuItem => ({
			icon: APPEAL_QUESTION_KIND_ICONS[kind],
			label: ts(APPEAL_QUESTION_KIND_NAME_KEYS[kind]),
			description: ts(APPEAL_QUESTION_KIND_HELP_KEYS[kind]),
			onSelect: () => addQuestion(kind),
		}),
	),
]);

function setType(type: AppealCaseType, picked: boolean) {
	const without = draft.types.filter((entry) => entry !== type);
	draft.types = picked ? [...without, type] : without;
}

function addQuestion(kind: AppealQuestionKind) {
	if (draft.questions.length >= MaximumAppealQuestions) return;
	draft.questions.push(createAppealQuestion(kind, nextAppealId));
}

function moveQuestion(index: number, by: -1 | 1) {
	draft.questions = moveAppealQuestion(draft.questions, index, index + by);
}

function submit() {
	submitted.value = true;
	if (Object.keys(problems.value).length > 0) return;
	emit("save", appealFormDraftToBody(draft));
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
