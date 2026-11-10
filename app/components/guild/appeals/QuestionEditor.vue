<template>
	<li class="question-card" :aria-labelledby="titleId">
		<div class="flex items-center gap-2.5">
			<span class="question-kind" aria-hidden="true">
				<UIcon :name="APPEAL_QUESTION_KIND_ICONS[question.kind]" class="size-4" />
			</span>
			<p :id="titleId" class="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold">
				{{ ts("guild_settings.appeals.editor.question_title", { index: index + 1 }) }}
				<span class="font-normal text-muted">
					· {{ ts(APPEAL_QUESTION_KIND_NAME_KEYS[question.kind]) }}
				</span>
			</p>
			<UButton
				color="neutral"
				variant="ghost"
				size="sm"
				icon="ic:round-arrow-upward"
				:disabled="index === 0"
				:aria-label="ts('guild_settings.appeals.editor.move_up_aria', { index: index + 1 })"
				@click="emit('move', -1)"
			/>
			<UButton
				color="neutral"
				variant="ghost"
				size="sm"
				icon="ic:round-arrow-downward"
				:disabled="last"
				:aria-label="
					ts('guild_settings.appeals.editor.move_down_aria', { index: index + 1 })
				"
				@click="emit('move', 1)"
			/>
			<UButton
				color="error"
				variant="ghost"
				size="sm"
				icon="heroicons:trash"
				:aria-label="ts('guild_settings.appeals.editor.remove_aria', { index: index + 1 })"
				@click="emit('remove')"
			/>
		</div>

		<!-- A text block is shown and not answered, so it has no label of its own. -->
		<UFormField
			v-if="question.kind === 'display'"
			:label="ts('guild_settings.appeals.editor.content')"
			:error="problemText('content')"
			:hint="`${question.content.trim().length}/${AppealFormLimits.content}`"
			required
		>
			<UTextarea
				:model-value="question.content"
				:maxlength="AppealFormLimits.content"
				:rows="3"
				autoresize
				class="w-full"
				@update:model-value="update({ content: String($event ?? '') })"
			/>
		</UFormField>

		<template v-else>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<UFormField
					:label="ts('guild_settings.appeals.editor.label')"
					:error="problemText('label')"
					required
				>
					<UInput
						:model-value="question.label"
						:maxlength="AppealFormLimits.label"
						autocomplete="off"
						class="w-full"
						@update:model-value="update({ label: String($event ?? '') })"
					/>
				</UFormField>
				<UFormField
					:label="ts('guild_settings.appeals.editor.help')"
					:help="ts('guild_settings.appeals.editor.help_help')"
					:error="problemText('help')"
				>
					<UInput
						:model-value="question.help ?? ''"
						:maxlength="AppealFormLimits.help"
						autocomplete="off"
						class="w-full"
						@update:model-value="update({ help: String($event ?? '') })"
					/>
				</UFormField>
			</div>

			<div v-if="question.kind === 'text'" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<UFormField
					:label="ts('guild_settings.appeals.editor.placeholder')"
					:error="problemText('placeholder')"
				>
					<UInput
						:model-value="question.placeholder ?? ''"
						:maxlength="AppealFormLimits.placeholder"
						autocomplete="off"
						class="w-full"
						@update:model-value="update({ placeholder: String($event ?? '') })"
					/>
				</UFormField>
				<UFormField
					:label="ts('guild_settings.appeals.editor.max_length')"
					:help="ts('guild_settings.appeals.editor.max_length_help')"
					:error="problemText('range')"
				>
					<UInputNumber
						:model-value="question.maxLength"
						:min="AppealFormLimits.answerLength.minimum"
						:max="AppealFormLimits.answerLength.maximum"
						:aria-label="ts('guild_settings.appeals.editor.max_length')"
						class="w-full"
						@update:model-value="
							update({ maxLength: $event ?? AppealFormLimits.answerLength.maximum })
						"
					/>
				</UFormField>
				<USwitch
					:model-value="question.long"
					:label="ts('guild_settings.appeals.editor.long')"
					:description="ts('guild_settings.appeals.editor.long_help')"
					@update:model-value="update({ long: $event })"
				/>
				<USwitch
					:model-value="question.required"
					:label="ts('guild_settings.appeals.editor.required')"
					@update:model-value="update({ required: $event })"
				/>
			</div>

			<div v-else-if="question.kind === 'choice'" class="space-y-3">
				<UFormField
					:label="ts('guild_settings.appeals.editor.options')"
					:help="ts('guild_settings.appeals.editor.options_help')"
					:error="problemText('options')"
				>
					<ol class="space-y-2">
						<li
							v-for="(option, optionIndex) in question.options"
							:key="option.value"
							class="flex items-center gap-2"
						>
							<UInput
								:model-value="option.label"
								:maxlength="AppealFormLimits.optionLabel"
								:aria-label="
									ts('guild_settings.appeals.editor.option_aria', {
										index: optionIndex + 1,
									})
								"
								autocomplete="off"
								class="min-w-0 flex-1"
								@update:model-value="
									setOptionLabel(optionIndex, String($event ?? ''))
								"
							/>
							<UButton
								color="neutral"
								variant="ghost"
								size="sm"
								icon="ic:round-close"
								:disabled="
									question.options.length <= AppealFormLimits.options.minimum
								"
								:aria-label="
									ts('guild_settings.appeals.editor.remove_option_aria', {
										index: optionIndex + 1,
									})
								"
								@click="removeOption(optionIndex)"
							/>
						</li>
					</ol>
					<button
						type="button"
						class="option-add"
						:disabled="question.options.length >= AppealFormLimits.options.maximum"
						@click="addOption"
					>
						<UIcon name="ic:round-add" class="size-4" aria-hidden="true" />
						{{ ts("guild_settings.appeals.editor.add_option") }}
					</button>
				</UFormField>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<UFormField
						:label="ts('guild_settings.appeals.editor.min_choices')"
						:error="problemText('range')"
					>
						<UInputNumber
							:model-value="question.min"
							:min="1"
							:max="question.options.length"
							:aria-label="ts('guild_settings.appeals.editor.min_choices')"
							class="w-full"
							@update:model-value="update({ min: $event ?? 1 })"
						/>
					</UFormField>
					<UFormField :label="ts('guild_settings.appeals.editor.max_choices')">
						<UInputNumber
							:model-value="question.max"
							:min="1"
							:max="question.options.length"
							:aria-label="ts('guild_settings.appeals.editor.max_choices')"
							class="w-full"
							@update:model-value="update({ max: $event ?? 1 })"
						/>
					</UFormField>
				</div>
				<USwitch
					:model-value="question.required"
					:label="ts('guild_settings.appeals.editor.required')"
					@update:model-value="update({ required: $event })"
				/>
			</div>

			<div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<UFormField
					:label="ts('guild_settings.appeals.editor.min_files')"
					:help="ts('guild_settings.appeals.editor.min_files_help')"
					:error="problemText('range')"
				>
					<UInputNumber
						:model-value="question.min"
						:min="0"
						:max="AppealFormLimits.files.maximum"
						:aria-label="ts('guild_settings.appeals.editor.min_files')"
						class="w-full"
						@update:model-value="update({ min: $event ?? 0 })"
					/>
				</UFormField>
				<UFormField :label="ts('guild_settings.appeals.editor.max_files')">
					<UInputNumber
						:model-value="question.max"
						:min="1"
						:max="AppealFormLimits.files.maximum"
						:aria-label="ts('guild_settings.appeals.editor.max_files')"
						class="w-full"
						@update:model-value="update({ max: $event ?? 1 })"
					/>
				</UFormField>
				<USwitch
					:model-value="question.imagesOnly"
					:label="ts('guild_settings.appeals.editor.images_only')"
					@update:model-value="update({ imagesOnly: $event })"
				/>
			</div>
		</template>
	</li>
</template>

<script setup lang="ts">
const question = defineModel<AppealQuestion>({ required: true });

const {
	index,
	last = false,
	problems = {},
} = defineProps<{
	/** Where the question is in the form, counted from 0. */
	index: number;
	/** Whether it is the last one, so it cannot move down. */
	last?: boolean;
	/** What is wrong with it, by field, once the form was submitted. */
	problems?: Partial<Record<string, AppealFormProblem>>;
}>();

const emit = defineEmits<{
	/** The question should move by one place: `-1` up, `1` down. */
	move: [by: -1 | 1];
	remove: [];
}>();

const { ts } = useI18n();
const titleId = useId();

function problemText(field: string): string | undefined {
	const problem = problems[field];
	return problem ? ts(APPEAL_FORM_PROBLEM_KEYS[problem]) : undefined;
}

// Each change replaces the question, so the parent's list sees it: a
// property written on the model would not reach a `v-for` of plain objects.
function update(patch: Partial<AppealQuestion>) {
	question.value = { ...question.value, ...patch } as AppealQuestion;
}

function setOptionLabel(optionIndex: number, label: string) {
	if (question.value.kind !== "choice") return;
	update({
		options: question.value.options.map((option, position) =>
			position === optionIndex ? { ...option, label } : option,
		),
	});
}

// An option's value is its ID: generated here, never typed, and kept while
// its label changes, so the answers keep what was picked.
function addOption() {
	if (question.value.kind !== "choice") return;
	update({ options: [...question.value.options, { label: "", value: nextAppealId() }] });
}

function removeOption(optionIndex: number) {
	if (question.value.kind !== "choice") return;
	const options = question.value.options.filter((_, position) => position !== optionIndex);
	update({
		options,
		min: Math.min(question.value.min, options.length),
		max: Math.min(question.value.max, options.length),
	});
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* A veil on the dialog, as the console's step rows are: the fields inside it
   keep the field surface and read as inset, not as one with the card. */
.question-card {
	@apply flex flex-col gap-3 rounded-[8px] bg-base-content/8 p-3;
}

/* Adding an option: the dashed add button of the editors, in a smaller size. */
.option-add {
	@apply mt-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] bg-transparent px-3 text-[0.8125rem] font-semibold;
	border: 1px dashed var(--field-border);
	color: var(--ui-text-toned);
}

.option-add:hover:not(:disabled) {
	background-color: color-mix(in oklab, var(--field-surface) 60%, transparent);
}

.option-add:disabled {
	@apply cursor-default opacity-50;
}

.option-add:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -1px;
}

.question-kind {
	@apply flex size-7 shrink-0 items-center justify-center rounded-[7px] bg-primary/15 text-primary;
}
</style>
