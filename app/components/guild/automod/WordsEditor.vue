<template>
	<div class="space-y-5">
		<p class="text-[0.8125rem] text-muted">
			{{ ts("guild_settings.automod.words_editor.help") }}
		</p>

		<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
			<GuildAutomodWordComposer
				v-model:candidate="candidate"
				:others="others"
				:editing="editingWord"
				@submit="saveWord"
				@cancel="editingIndex = null"
			/>
			<GuildAutomodWordPreview :words="previewWords" :candidate="candidateForPreview" />
		</div>

		<section class="space-y-3" :aria-labelledby="listHeadingId">
			<div class="flex flex-wrap items-center gap-2">
				<h4 :id="listHeadingId" class="grow text-sm font-semibold">
					{{
						ts("guild_settings.automod.words_editor.list.heading", {
							count: words.length,
							maximum: MaximumAutoModerationRuleListLength,
						})
					}}
				</h4>
				<UButton
					color="neutral"
					variant="outline"
					size="sm"
					icon="ic:round-upload"
					:aria-expanded="importOpen"
					@click="importOpen = !importOpen"
				>
					{{ ts("guild_settings.automod.words_editor.import.open") }}
				</UButton>
				<UButton
					color="neutral"
					variant="outline"
					size="sm"
					icon="ic:round-download"
					:disabled="words.length === 0"
					@click="exportWords"
				>
					{{ ts("guild_settings.automod.words_editor.import.export") }}
				</UButton>
			</div>

			<div v-if="importOpen" class="words-import space-y-3">
				<UFormField :label="ts('guild_settings.automod.words_editor.import.field')">
					<UTextarea
						v-model="importText"
						:rows="4"
						autoresize
						spellcheck="false"
						class="w-full font-mono"
					/>
				</UFormField>
				<div class="flex flex-wrap items-center gap-2">
					<label class="words-file">
						<UIcon name="ic:round-attach-file" class="size-4" aria-hidden="true" />
						{{ ts("guild_settings.automod.words_editor.import.file") }}
						<input
							type="file"
							accept=".txt,text/plain"
							class="sr-only"
							@change="readFile"
						/>
					</label>
					<span class="grow"></span>
					<UButton color="neutral" variant="ghost" @click="closeImport">
						{{ ts("guild_settings.automod.words_editor.import.cancel") }}
					</UButton>
					<UButton
						color="primary"
						:disabled="importText.trim().length === 0"
						@click="importWords"
					>
						{{ ts("guild_settings.automod.words_editor.import.confirm") }}
					</UButton>
				</div>
			</div>
			<div v-if="importResult" class="text-[0.8125rem]" role="status">
				<p>{{ importResult.summary }}</p>
				<ul v-if="importResult.lines.length > 0" class="mt-1 list-disc ps-5 text-muted">
					<li v-for="line in importResult.lines" :key="line">{{ line }}</li>
				</ul>
			</div>

			<UInput
				v-if="words.length > 0"
				v-model="query"
				type="search"
				icon="ic:round-search"
				:placeholder="ts('guild_settings.automod.words_editor.list.search')"
				:aria-label="ts('guild_settings.automod.words_editor.list.search')"
				class="w-full"
			/>

			<p v-if="words.length === 0" class="words-empty">
				{{ ts("guild_settings.automod.words_editor.list.empty") }}
			</p>
			<p v-else-if="visible.length === 0" class="words-empty">
				{{ ts("guild_settings.automod.words_editor.list.empty_search", { query }) }}
			</p>
			<ul v-else class="space-y-1.5">
				<li
					v-for="entry in visible"
					:key="entry.word"
					class="words-item"
					:class="{ 'words-item-active': entry.index === editingIndex }"
				>
					<div class="min-w-0 grow">
						<div class="flex flex-wrap items-center gap-2">
							<span class="font-mono text-sm break-all">{{ entry.word }}</span>
							<UBadge color="neutral" variant="subtle" size="sm">
								{{
									ts(
										`guild_settings.automod.words_editor.list.modes.${entry.mode}`,
									)
								}}
							</UBadge>
						</div>
						<p v-if="entry.coveredBy" class="mt-0.5 text-[0.75rem] text-warning">
							{{
								ts("guild_settings.automod.words_editor.list.covered", {
									other: entry.coveredBy,
								})
							}}
						</p>
					</div>
					<UButton
						color="neutral"
						variant="ghost"
						icon="ic:round-edit"
						:aria-label="
							ts('guild_settings.automod.words_editor.list.edit', {
								word: entry.word,
							})
						"
						@click="editingIndex = entry.index"
					/>
					<UButton
						color="error"
						variant="ghost"
						icon="heroicons:trash"
						:aria-label="
							ts('guild_settings.automod.words_editor.list.remove', {
								word: entry.word,
							})
						"
						@click="removeWord(entry.index)"
					/>
				</li>
			</ul>
		</section>

		<p class="sr-only" aria-live="polite">{{ announcement }}</p>
	</div>
</template>

<script setup lang="ts">
import {
	AutoModerationRuleWordLength,
	MaximumAutoModerationRuleListLength,
} from "#shared/utils/automod-rules";
import {
	automodWordMode,
	checkAutomodWord,
	exportAutomodWords,
	importAutomodWords,
	type AutomodWordProblem,
} from "~/utils/automod-words";

/** The words of the rule, as saved. */
const words = defineModel<string[]>({ required: true });

const { ts } = useI18n();
const listHeadingId = useId();

const editingIndex = ref<number | null>(null);
const candidate = ref("");
const query = ref("");
const importOpen = ref(false);
const importText = ref("");
const importResult = ref<{ summary: string; lines: string[] } | null>(null);
const announcement = ref("");

const editingWord = computed(() =>
	editingIndex.value === null ? null : (words.value[editingIndex.value] ?? null),
);

const others = computed(() => words.value.filter((_, index) => index !== editingIndex.value));

// The word being written joins the preview once it could be saved, so the
// member sees what the list would catch with it.
const candidateForPreview = computed(() => {
	const check = checkAutomodWord(candidate.value, others.value);
	return check.problem === null ? check.word : "";
});

const previewWords = computed(() =>
	candidateForPreview.value.length > 0
		? [...others.value, candidateForPreview.value]
		: others.value,
);

const covered = useAutomodWordCoverage(() => words.value);

const visible = computed(() => {
	const needle = query.value.trim().toLowerCase();
	return words.value
		.map((word, index) => ({
			word,
			index,
			mode: automodWordMode(word),
			coveredBy: covered.value.get(word) ?? null,
		}))
		.filter((entry) => needle.length === 0 || entry.word.includes(needle));
});

// A word typed or edited but not added yet is a change the rule form would lose.
defineExpose({
	hasPending: computed(() =>
		editingIndex.value === null
			? candidate.value.trim().length > 0
			: candidate.value.trim() !== editingWord.value,
	),
});

function saveWord(word: string) {
	if (editingIndex.value === null) {
		words.value = [...words.value, word];
		announcement.value = ts("guild_settings.automod.words_editor.list.added", { word });
		return;
	}
	const next = [...words.value];
	next[editingIndex.value] = word;
	words.value = next;
	editingIndex.value = null;
	announcement.value = ts("guild_settings.automod.words_editor.list.updated", { word });
}

function removeWord(index: number) {
	const word = words.value[index];
	if (word === undefined) return;
	words.value = words.value.filter((_, position) => position !== index);
	if (editingIndex.value === index) editingIndex.value = null;
	else if (editingIndex.value !== null && editingIndex.value > index) editingIndex.value -= 1;
	announcement.value = ts("guild_settings.automod.words_editor.list.removed", { word });
}

function problemReason(problem: AutomodWordProblem) {
	return ts(`guild_settings.automod.words_editor.problems.${problem}`, {
		minimum: AutoModerationRuleWordLength.minimum,
		maximum:
			problem === "listFull"
				? MaximumAutoModerationRuleListLength
				: AutoModerationRuleWordLength.maximum,
	});
}

function importWords() {
	const { added, rejected } = importAutomodWords(importText.value, words.value);
	words.value = [...words.value, ...added];
	importResult.value = {
		summary: ts("guild_settings.automod.words_editor.import.result", {
			added: added.length,
			skipped: rejected.length,
		}),
		lines: rejected.map(({ line, problem }) =>
			ts("guild_settings.automod.words_editor.import.skipped_line", {
				line,
				reason: problemReason(problem),
			}),
		),
	};
	importText.value = "";
	importOpen.value = false;
}

function closeImport() {
	importText.value = "";
	importOpen.value = false;
}

async function readFile(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	try {
		importText.value = await file.text();
	} catch {
		importResult.value = {
			summary: ts("guild_settings.automod.words_editor.import.file_error"),
			lines: [],
		};
	} finally {
		input.value = "";
	}
}

function exportWords() {
	const blob = new Blob([exportAutomodWords(words.value)], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "words.txt";
	link.click();
	URL.revokeObjectURL(url);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.words-item {
	@apply flex items-center gap-1 rounded-[8px] py-1.5 ps-3 pe-1;
	background-color: var(--field-surface);
	border: 1px solid transparent;
}

.words-item-active {
	border-color: var(--color-primary);
}

.words-empty {
	@apply rounded-[8px] p-4 text-center text-[0.8125rem] text-muted;
	border: 1px dashed var(--field-border);
}

.words-import {
	@apply rounded-[8px] p-3;
	border: 1px solid var(--field-border);
}

.words-file {
	@apply inline-flex h-10 cursor-pointer items-center gap-2 rounded-[6px] px-3 text-sm font-medium;
	border: 1px solid var(--field-border);
}

.words-file:focus-within {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}
</style>
