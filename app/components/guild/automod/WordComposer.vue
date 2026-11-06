<template>
	<!-- Not a <form>: this sits inside the rule's own form, and a nested one would
	     submit the whole rule when a word is added. -->
	<div class="space-y-4" role="group" :aria-labelledby="headingId">
		<h4 :id="headingId" class="text-sm font-semibold">
			{{
				editing === null
					? ts("guild_settings.automod.words_editor.add_heading")
					: ts("guild_settings.automod.words_editor.edit_heading", { word: editing })
			}}
		</h4>

		<UFormField
			:label="ts('guild_settings.automod.words_editor.letters')"
			:help="
				ts('guild_settings.automod.words_editor.letters_help', {
					minimum: AutoModerationRuleWordLength.minimum,
					maximum: AutoModerationRuleWordLength.maximum,
				})
			"
			:error="simpleError"
		>
			<UInput
				ref="lettersInput"
				v-model="letters"
				:placeholder="ts('guild_settings.automod.words_editor.letters_placeholder')"
				:disabled="!simpleAvailable"
				autocomplete="off"
				autocapitalize="off"
				spellcheck="false"
				class="w-full"
				@update:model-value="syncFromSimple"
				@keydown.enter.prevent="submit"
			/>
		</UFormField>

		<URadioGroup
			v-model="mode"
			:legend="ts('guild_settings.automod.words_editor.mode.legend')"
			:items="modeItems"
			:disabled="!simpleAvailable"
			@update:model-value="syncFromSimple"
		/>

		<div class="words-note">
			<UIcon
				name="ic:round-check-circle"
				class="size-4 shrink-0 text-success"
				aria-hidden="true"
			/>
			<p>
				<span class="font-medium">{{
					ts("guild_settings.automod.words_editor.tolerance.title")
				}}</span>
				<span class="block text-muted">{{
					ts("guild_settings.automod.words_editor.tolerance.help")
				}}</span>
			</p>
		</div>

		<UCollapsible v-model:open="alternativesOpen" :disabled="!simpleAvailable">
			<UButton
				color="neutral"
				variant="ghost"
				icon="ic:round-swap-horiz"
				trailing-icon="ic:round-expand-more"
				:ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform' }"
				class="group"
			>
				{{ ts("guild_settings.automod.words_editor.alternatives.toggle") }}
			</UButton>
			<template #content>
				<div class="words-panel space-y-3">
					<p class="text-[0.8125rem] text-muted">
						{{ ts("guild_settings.automod.words_editor.alternatives.help") }}
						{{ ts("guild_settings.automod.words_editor.alternatives.example") }}
					</p>
					<p v-if="letterItems.length === 0" class="text-[0.8125rem] text-muted">
						{{ ts("guild_settings.automod.words_editor.alternatives.empty") }}
					</p>
					<div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<UFormField
							:label="ts('guild_settings.automod.words_editor.alternatives.letter')"
						>
							<USelect
								v-model="alternativePosition"
								:items="letterItems"
								class="w-full"
							/>
						</UFormField>
						<UFormField
							:label="
								ts('guild_settings.automod.words_editor.alternatives.characters')
							"
						>
							<UInput
								:model-value="alternatives[alternativePosition] ?? ''"
								:placeholder="
									ts(
										'guild_settings.automod.words_editor.alternatives.characters_placeholder',
									)
								"
								autocomplete="off"
								spellcheck="false"
								class="w-full"
								@update:model-value="setAlternatives(String($event ?? ''))"
							/>
						</UFormField>
					</div>
					<ul v-if="alternativeSummary.length > 0" class="flex flex-wrap gap-2">
						<li v-for="entry in alternativeSummary" :key="entry.position">
							<UBadge color="neutral" variant="subtle" class="gap-1">
								{{
									ts("guild_settings.automod.words_editor.alternatives.summary", {
										letter: entry.letter,
										characters: entry.characters,
									})
								}}
								<UButton
									color="neutral"
									variant="link"
									size="xs"
									icon="ic:round-close"
									:aria-label="
										ts(
											'guild_settings.automod.words_editor.alternatives.remove',
											{
												letter: entry.letter,
											},
										)
									"
									@click="removeAlternatives(entry.position)"
								/>
							</UBadge>
						</li>
					</ul>
				</div>
			</template>
		</UCollapsible>

		<UCollapsible v-model:open="advancedOpen">
			<UButton
				color="neutral"
				variant="ghost"
				icon="ic:round-code"
				trailing-icon="ic:round-expand-more"
				:ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform' }"
				class="group"
			>
				{{ ts("guild_settings.automod.words_editor.advanced.toggle") }}
			</UButton>
			<template #content>
				<div class="words-panel space-y-2">
					<p class="text-[0.8125rem] text-muted">
						{{ ts("guild_settings.automod.words_editor.advanced.help") }}
					</p>
					<UFormField
						:label="ts('guild_settings.automod.words_editor.advanced.field')"
						:error="rawError"
					>
						<UInput
							v-model="raw"
							:maxlength="AutoModerationRuleWordLength.maximum * 2"
							autocomplete="off"
							autocapitalize="off"
							spellcheck="false"
							class="w-full font-mono"
							@update:model-value="syncFromRaw"
							@keydown.enter.prevent="submit"
						/>
					</UFormField>
					<p v-if="!simpleAvailable" class="text-[0.8125rem] text-warning">
						{{ ts("guild_settings.automod.words_editor.advanced.not_simple") }}
					</p>
				</div>
			</template>
		</UCollapsible>

		<ul
			v-if="noteMessages.length > 0"
			class="space-y-1 text-[0.8125rem] text-muted"
			aria-live="polite"
		>
			<li v-for="note in noteMessages" :key="note" class="flex gap-1.5">
				<UIcon name="ic:round-info" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
				<span>{{ note }}</span>
			</li>
		</ul>

		<div class="flex flex-wrap gap-2">
			<UButton type="button" color="primary" icon="ic:round-add" @click="submit">
				{{
					editing === null
						? ts("guild_settings.automod.words_editor.add")
						: ts("guild_settings.automod.words_editor.save_edit")
				}}
			</UButton>
			<UButton
				v-if="editing !== null"
				type="button"
				color="neutral"
				variant="outline"
				@click="cancel"
			>
				{{ ts("guild_settings.automod.words_editor.cancel_edit") }}
			</UButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	AutoModerationRuleWordLength,
	MaximumAutoModerationRuleListLength,
} from "#shared/utils/automod-rules";
import {
	AUTOMOD_WORD_MODES,
	checkAutomodWord,
	checkAutomodWordLetters,
	composeAutomodWord,
	parseAutomodWord,
	type AutomodWordMode,
	type AutomodWordProblem,
} from "~/utils/automod-words";

const { others, editing = null } = defineProps<{
	/** The other words of the list, as saved. */
	others: readonly string[];
	/** The word being edited, `null` to add one. */
	editing?: string | null;
}>();

const emit = defineEmits<{
	/** A word that can be saved, normalized. */
	submit: [word: string];
	cancel: [];
}>();

/** The word as it would be saved, for the preview. */
const candidate = defineModel<string>("candidate", { default: "" });

const { ts } = useI18n();
const headingId = useId();
const lettersInput = useTemplateRef("lettersInput");

const letters = ref("");
const mode = ref<AutomodWordMode>("whole");
const alternatives = ref<Record<number, string>>({});
const alternativePosition = ref(0);
const alternativesOpen = ref(false);
const advancedOpen = ref(false);
const raw = ref("");
const simpleAvailable = ref(true);
// The wildcard and bracket restrictions of the simple field apply to what is typed there, not to a saved word the
// advanced field wrote, such as `**ab`.
const typedInSimple = ref(false);
const attempted = ref(false);

function load(word: string) {
	raw.value = word;
	syncFromRaw();
	attempted.value = false;
	advancedOpen.value = !simpleAvailable.value;
	alternativesOpen.value = Object.keys(alternatives.value).length > 0;
	alternativePosition.value = 0;
}

watch(
	() => editing,
	(word) => load(word ?? ""),
	{ immediate: true },
);
watch(raw, (word) => (candidate.value = word.trim()), { immediate: true });

function syncFromSimple() {
	typedInSimple.value = true;
	const length = [...letters.value].length;
	alternatives.value = Object.fromEntries(
		Object.entries(alternatives.value).filter(([position]) => Number(position) < length),
	);
	if (alternativePosition.value >= length) alternativePosition.value = 0;
	raw.value = composeAutomodWord({
		letters: letters.value.trim(),
		mode: mode.value,
		alternatives: alternatives.value,
	});
}

function syncFromRaw() {
	typedInSimple.value = false;
	const draft = parseAutomodWord(raw.value.trim());
	simpleAvailable.value = draft !== null;
	if (draft === null) return;
	letters.value = draft.letters;
	mode.value = draft.mode;
	alternatives.value = draft.alternatives;
}

function setAlternatives(characters: string) {
	alternatives.value = { ...alternatives.value, [alternativePosition.value]: characters };
	if (characters.length === 0) removeAlternatives(alternativePosition.value);
	else syncFromSimple();
}

function removeAlternatives(position: number) {
	const next = { ...alternatives.value };
	delete next[position];
	alternatives.value = next;
	syncFromSimple();
}

const modeItems = computed(() =>
	AUTOMOD_WORD_MODES.map((value) => ({
		value,
		label: ts(`guild_settings.automod.words_editor.mode.${value}`),
		description: ts(`guild_settings.automod.words_editor.mode.${value}_example`),
	})),
);

const letterItems = computed(() =>
	Array.from(letters.value.trim(), (letter, index) => ({
		value: index,
		label: ts("guild_settings.automod.words_editor.alternatives.letter_option", {
			position: index + 1,
			letter,
		}),
	})),
);

const alternativeSummary = computed(() =>
	Object.entries(alternatives.value)
		.map(([position, characters]) => ({
			position: Number(position),
			letter: [...letters.value.trim()][Number(position)] ?? "",
			characters: [...characters].join(" "),
		}))
		.filter((entry) => entry.characters.length > 0),
);

const check = computed(() => checkAutomodWord(raw.value, others));
const lettersProblem = computed(() =>
	simpleAvailable.value && typedInSimple.value ? checkAutomodWordLetters(letters.value) : null,
);

function problemMessage(problem: AutomodWordProblem) {
	const { minimum, maximum } = AutoModerationRuleWordLength;
	return ts(`guild_settings.automod.words_editor.problems.${problem}`, {
		minimum,
		maximum: problem === "listFull" ? MaximumAutoModerationRuleListLength : maximum,
	});
}

const simpleError = computed(() => {
	if (lettersProblem.value === "edgeWildcard") {
		return ts("guild_settings.automod.words_editor.problems.edgeWildcard");
	}
	if (lettersProblem.value === "brackets") {
		return ts("guild_settings.automod.words_editor.problems.letterBrackets");
	}
	if (!attempted.value || advancedOpen.value || check.value.problem === null) return undefined;
	return problemMessage(check.value.problem);
});

const rawError = computed(() =>
	attempted.value && check.value.problem !== null
		? problemMessage(check.value.problem)
		: undefined,
);

const noteMessages = computed(() =>
	raw.value.trim().length === 0
		? []
		: check.value.notes.map((note) =>
				ts(`guild_settings.automod.words_editor.notes.${note}`, { word: check.value.word }),
			),
);

function reset() {
	letters.value = "";
	alternatives.value = {};
	raw.value = "";
	simpleAvailable.value = true;
	attempted.value = false;
}

function submit() {
	attempted.value = true;
	if (lettersProblem.value !== null || check.value.problem !== null) {
		lettersInput.value?.inputRef?.focus();
		return;
	}
	emit("submit", check.value.word);
	if (editing === null) reset();
	lettersInput.value?.inputRef?.focus();
}

function cancel() {
	reset();
	emit("cancel");
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.words-note {
	@apply flex gap-2 rounded-[8px] p-3 text-[0.8125rem];
	background-color: var(--field-surface);
}

.words-panel {
	@apply mt-2 rounded-[8px] p-3;
	border: 1px solid var(--field-border);
}
</style>
