<template>
	<section class="space-y-3" :aria-labelledby="headingId">
		<h4 :id="headingId" class="text-sm font-semibold">
			{{ ts("guild_settings.automod.words_editor.preview.title") }}
		</h4>

		<UFormField
			:label="ts('guild_settings.automod.words_editor.preview.field')"
			:help="
				ts('guild_settings.automod.words_editor.preview.limit', {
					count: MaximumAutomodWordPreviewLength,
				})
			"
		>
			<UTextarea
				v-model="message"
				:maxlength="MaximumAutomodWordPreviewLength"
				:placeholder="ts('guild_settings.automod.words_editor.preview.placeholder')"
				:rows="2"
				autoresize
				class="w-full"
			/>
		</UFormField>

		<p v-if="words.length === 0" class="text-[0.8125rem] text-muted">
			{{ ts("guild_settings.automod.words_editor.preview.empty") }}
		</p>
		<template v-else-if="message.length > 0">
			<!-- The message with what the filter takes marked, for sighted members; the
			     sentence under it says the same for screen readers. -->
			<p class="words-message" aria-hidden="true">
				<template v-for="(segment, index) in segments" :key="index">
					<mark v-if="segment.caught" class="words-caught">{{ segment.text }}</mark>
					<span v-else>{{ segment.text }}</span>
				</template>
			</p>
			<p class="text-[0.8125rem]" :class="statusClass" role="status">
				{{ statusMessage }}
			</p>
		</template>

		<div v-if="examples.length > 0" class="space-y-2">
			<h5 class="text-[0.8125rem] font-medium text-muted">
				{{ ts("guild_settings.automod.words_editor.preview.examples") }}
			</h5>
			<ul class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
				<li v-for="example in examples" :key="example.kind" class="words-example">
					<UIcon
						:name="example.matches ? 'ic:round-block' : 'ic:round-check'"
						class="size-4 shrink-0"
						:class="example.matches ? 'text-error' : 'text-success'"
						aria-hidden="true"
					/>
					<span class="min-w-0 grow">
						<span class="font-mono break-all">{{ example.text }}</span>
						<span class="block text-[0.75rem] text-muted">
							{{
								ts(
									`guild_settings.automod.words_editor.preview.kinds.${example.kind}`,
								)
							}}
						</span>
					</span>
					<span class="shrink-0 text-[0.75rem] font-medium">
						{{
							example.matches
								? ts("guild_settings.automod.words_editor.preview.example_caught")
								: ts("guild_settings.automod.words_editor.preview.example_passes")
						}}
					</span>
				</li>
			</ul>
		</div>
	</section>
</template>

<script setup lang="ts">
const { words, candidate = "" } = defineProps<{
	/** The words the message is matched with: the list, and the word being written. */
	words: readonly string[];
	/** The word being written, whose examples are shown. */
	candidate?: string;
}>();

const { ts } = useI18n();
const headingId = useId();
const message = ref("");

const { status, matches } = useAutomodWordPreview(
	() => words,
	() => message.value,
);

const segments = computed(() => {
	const text = message.value.slice(0, MaximumAutomodWordPreviewLength);
	const result: { text: string; caught: boolean }[] = [];
	let position = 0;
	for (const match of status.value === "done" ? matches.value : []) {
		if (match.start > position)
			result.push({ text: text.slice(position, match.start), caught: false });
		result.push({ text: text.slice(match.start, match.end), caught: true });
		position = match.end;
	}
	if (position < text.length) result.push({ text: text.slice(position), caught: false });
	return result;
});

const statusMessage = computed(() => {
	switch (status.value) {
		case "running":
		case "idle":
			return ts("guild_settings.automod.words_editor.preview.running");
		case "timeout":
			return ts("guild_settings.automod.words_editor.preview.timeout");
		case "error":
			return ts("guild_settings.automod.words_editor.preview.error");
		case "done": {
			const parts = segments.value.filter((segment) => segment.caught);
			return parts.length === 0
				? ts("guild_settings.automod.words_editor.preview.caught_none")
				: ts("guild_settings.automod.words_editor.preview.caught", {
						parts: parts.map((part) => part.text).join(", "),
					});
		}
	}
});

const statusClass = computed(() => {
	if (status.value === "timeout") return "text-warning";
	if (status.value === "error") return "text-error";
	return "text-muted";
});

// In a worker with a timeout, not on the page: see `useAutomodWordExamples()`.
const examples = useAutomodWordExamples(() => candidate);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.words-message {
	@apply rounded-[8px] p-3 text-sm break-words whitespace-pre-wrap;
	background-color: var(--field-surface);
}

.words-caught {
	@apply rounded-[3px] px-0.5;
	background-color: color-mix(in oklab, var(--color-error) 25%, transparent);
	color: inherit;
	text-decoration: underline wavy var(--color-error);
}

.words-example {
	@apply flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm;
	background-color: var(--field-surface);
}
</style>
