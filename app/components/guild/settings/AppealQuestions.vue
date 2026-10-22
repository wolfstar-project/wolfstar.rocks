<template>
	<UFormField name="appealsQuestions">
		<ol v-if="questions.length > 0" class="flex flex-col">
			<li
				v-for="(question, index) of questions"
				:key="`${index}:${question}`"
				class="appeal-question"
				:class="{ 'opacity-60': index >= MAXIMUM_ASKED_QUESTIONS }"
			>
				<span class="appeal-question-number" aria-hidden="true">{{ index + 1 }}</span>
				<span class="min-w-0 flex-1 text-sm break-words">{{ question }}</span>
				<UButton
					color="neutral"
					variant="ghost"
					size="sm"
					icon="ic:round-close"
					:aria-label="ts('guild_settings.appeals.remove_question', { question })"
					@click="remove(index)"
				/>
			</li>
		</ol>
		<p v-else class="text-[0.8125rem] text-muted">
			{{ ts("guild_settings.appeals.questions_empty") }}
		</p>

		<p
			v-if="questions.length > MAXIMUM_ASKED_QUESTIONS"
			class="mt-2 text-[0.8125rem] text-muted"
		>
			{{ ts("guild_settings.appeals.questions_extra") }}
		</p>

		<!-- Not a form of its own: it sits inside the settings form, and Enter adds. -->
		<div
			v-if="questions.length < MAXIMUM_ASKED_QUESTIONS"
			class="mt-3 flex flex-wrap items-center gap-2"
		>
			<UInput
				v-model="draft"
				class="min-w-0 flex-1 basis-64"
				:maxlength="MAXIMUM_QUESTION_LENGTH"
				:placeholder="ts('guild_settings.appeals.question_placeholder')"
				:aria-label="ts('guild_settings.appeals.question_aria')"
				@keydown.enter.prevent="add"
			/>
			<UButton type="button" color="primary" :disabled="!canAdd" @click="add">
				{{ ts("guild_settings.appeals.add_question") }}
			</UButton>
		</div>
		<p v-else class="mt-3 text-[0.8125rem] text-muted">
			{{ ts("guild_settings.appeals.questions_full") }}
		</p>
	</UFormField>
</template>

<script setup lang="ts">
import { MAXIMUM_ASKED_APPEAL_QUESTIONS as MAXIMUM_ASKED_QUESTIONS } from "#shared/utils/settings-choices";

/** Discord cuts the name of an embed field, where the bot shows a question, at 256 characters. */
const MAXIMUM_QUESTION_LENGTH = 256;

const questions = defineModel<string[]>({ required: true });

const { ts } = useI18n();

const draft = ref("");
const trimmed = computed(() => draft.value.trim());
// A blank question is dropped by the bot, and a copy would be asked twice.
const canAdd = computed(() => trimmed.value !== "" && !questions.value.includes(trimmed.value));

function add() {
	if (!canAdd.value || questions.value.length >= MAXIMUM_ASKED_QUESTIONS) return;
	questions.value = [...questions.value, trimmed.value];
	draft.value = "";
}

function remove(index: number) {
	questions.value = questions.value.filter((_, position) => position !== index);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.appeal-question {
	@apply flex items-center gap-3 border-t py-2.5 first:border-t-0;
	border-color: var(--home-border-subtle);
}

.appeal-question-number {
	@apply flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold;
	background-color: var(--field-surface);
}
</style>
