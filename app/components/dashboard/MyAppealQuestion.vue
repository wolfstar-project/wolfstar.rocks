<template>
	<p
		v-if="question.kind === 'display'"
		class="text-[0.8125rem] leading-normal whitespace-pre-line text-toned"
	>
		{{ question.content }}
	</p>

	<UFormField
		v-else-if="question.kind === 'text'"
		:label="question.label"
		:description="question.help"
		:required="question.required"
		:error="isMissing ? ts('dashboard.my_appeals.dialog.required_field') : undefined"
		:hint="`${text.length}/${question.maxLength}`"
		:ui="{ hint: 'font-mono text-xs' }"
	>
		<UTextarea
			v-if="question.long"
			v-model="text"
			:maxlength="question.maxLength"
			:placeholder="question.placeholder"
			:rows="4"
			autoresize
			class="w-full"
		/>
		<UInput
			v-else
			v-model="text"
			:maxlength="question.maxLength"
			:placeholder="question.placeholder"
			class="w-full"
		/>
	</UFormField>

	<fieldset
		v-else-if="question.kind === 'choice'"
		:aria-describedby="describedBy"
		:aria-invalid="isMissing || undefined"
	>
		<legend class="ma-label">
			{{ question.label }}
			<span v-if="question.required" class="text-error" aria-hidden="true">*</span>
		</legend>
		<p v-if="question.help" :id="helpId" class="ma-help">{{ question.help }}</p>
		<p v-if="question.max > 1" :id="hintId" class="ma-help">
			{{
				ts("dashboard.my_appeals.dialog.choice_hint", {
					min: Math.max(question.min, 1),
					max: question.max,
				})
			}}
		</p>
		<div class="mt-2 flex flex-col gap-1.5">
			<label v-for="option in question.options" :key="option.value" class="ma-choice">
				<input
					v-if="question.max === 1"
					v-model="single"
					type="radio"
					:name="groupName"
					:value="option.value"
					:required="question.required"
				/>
				<input
					v-else
					v-model="many"
					type="checkbox"
					:value="option.value"
					:disabled="isFull && !many.includes(option.value)"
				/>
				<span>{{ option.label }}</span>
			</label>
		</div>
		<p v-if="isMissing" :id="errorId" class="mt-1.5 text-[0.8125rem] text-error">
			{{ choiceError }}
		</p>
	</fieldset>

	<div v-else role="group" :aria-labelledby="labelId" :aria-describedby="describedBy">
		<p :id="labelId" class="ma-label">{{ question.label }}</p>
		<p v-if="question.help" :id="helpId" class="ma-help">{{ question.help }}</p>
		<div class="ma-drop" aria-disabled="true">
			<UIcon name="heroicons:plus" class="size-4" aria-hidden="true" />
			{{ ts("dashboard.my_appeals.dialog.drop") }}
		</div>
		<p :id="hintId" class="ma-help mt-1.5">
			{{
				question.min > 0
					? ts("dashboard.my_appeals.dialog.files_required")
					: ts("dashboard.my_appeals.dialog.files_disabled")
			}}
		</p>
	</div>
</template>

<script setup lang="ts">
/** The answer, the text typed or the values picked. */
const answer = defineModel<string | string[]>({ default: "" });

const { question, isMissing = false } = defineProps<{
	question: AppealQuestion;
	/** Whether the member tried to send without answering it. */
	isMissing?: boolean;
}>();

const { tc, ts } = useI18n();
const groupName = useId();
const labelId = useId();
const helpId = useId();
const hintId = useId();
const errorId = useId();

const text = computed({
	get: () => (typeof answer.value === "string" ? answer.value : ""),
	set: (value: string) => (answer.value = value),
});

const many = computed({
	get: () => (Array.isArray(answer.value) ? answer.value : []),
	set: (value: string[]) => (answer.value = value),
});

// A single choice is kept as a list of one, as the bot reads every choice.
const single = computed({
	get: () => many.value[0] ?? "",
	set: (value: string) => (answer.value = [value]),
});

const isFull = computed(() => question.kind === "choice" && many.value.length >= question.max);

// Some options picked, but fewer than the question asks for: say how many more.
const choiceError = computed(() => {
	const short = question.kind === "choice" ? missingChoices(question, many.value) : 0;
	return short > 0 && many.value.length > 0
		? tc("dashboard.my_appeals.dialog.choices_missing", short)
		: ts("dashboard.my_appeals.dialog.required_field");
});

const describedBy = computed(() => {
	const ids: string[] = [];
	if ("help" in question && question.help) ids.push(helpId);
	if (question.kind === "attachment" || (question.kind === "choice" && question.max > 1))
		ids.push(hintId);
	if (isMissing) ids.push(errorId);
	return ids.join(" ") || undefined;
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.ma-label {
	@apply text-sm font-bold text-highlighted;
}

.ma-help {
	@apply mt-0.5 text-xs text-muted;
}

.ma-choice {
	@apply flex min-h-9 cursor-pointer items-center gap-2.5 rounded-[6px] px-3 text-sm;
	background-color: var(--field-surface, var(--console-input));
	border: 1px solid var(--field-border, var(--console-border));
}

.ma-choice:has(input:checked) {
	border-color: var(--color-primary);
}

.ma-choice:has(input:disabled) {
	@apply cursor-not-allowed opacity-60;
}

.ma-choice input {
	@apply size-4 shrink-0;
	accent-color: var(--color-primary);
}

.ma-choice:has(input:focus-visible) {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

/* Where files would be dropped; the website cannot take them yet. */
.ma-drop {
	@apply mt-2 flex min-h-13 cursor-not-allowed items-center justify-center gap-2 rounded-[8px] text-[0.8125rem] text-muted opacity-70;
	border: 1px dashed var(--console-border, var(--ink-400));
}
</style>
