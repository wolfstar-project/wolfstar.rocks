<template>
	<article
		class="flex flex-col gap-5 px-5.5 pt-5 pb-6.5"
		:aria-label="ts('marketing.commands.details_label', { command: command.name })"
	>
		<section v-if="help.usages?.length" class="flex flex-col gap-2.5">
			<h3 class="flex items-center gap-2.5 text-[0.9375rem] font-bold text-highlighted">
				<span
					class="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-(--home-blurple-soft)"
				>
					<UIcon
						name="i-heroicons-pencil-square"
						class="size-3.5 text-primary"
						aria-hidden="true"
					/>
				</span>
				{{ ts("marketing.commands.usage") }}
			</h3>
			<ul class="flex flex-col gap-2">
				<li v-for="(usage, idx) in help.usages" :key="idx">
					<code
						class="block rounded-[0.625rem] border border-(--home-border-subtle) bg-base-content/4 px-4 py-3 font-mono text-[0.8125rem] text-highlighted"
					>
						<span class="text-primary">WolfStar</span>,
						<span class="text-primary/80">{{ command.name }}</span>
						<span class="text-toned">{{ ` ${usage}` }}</span>
					</code>
				</li>
			</ul>
		</section>

		<section v-if="help.extendedHelp" class="flex flex-col gap-2.5">
			<h3 class="flex items-center gap-2.5 text-[0.9375rem] font-bold text-highlighted">
				<span
					class="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-(--home-blurple-soft)"
				>
					<UIcon
						name="i-heroicons-question-mark-circle"
						class="size-3.5 text-primary"
						aria-hidden="true"
					/>
				</span>
				{{ ts("marketing.commands.extended_help") }}
			</h3>
			<div
				class="rounded-[0.625rem] border border-(--home-border-subtle) bg-base-content/4 px-4 py-3.5 text-[0.84375rem] leading-[1.7] whitespace-pre-line text-toned"
				v-html="sanitizeAndFormat(resolveMultilineString(help.extendedHelp, true))"
			></div>
		</section>

		<section v-if="help.explainedUsage?.length" class="flex flex-col gap-2.5">
			<h3 class="text-[0.9375rem] font-bold text-highlighted">
				{{ ts("marketing.commands.explained_usage") }}
			</h3>
			<dl class="flex flex-col gap-2.5">
				<div
					v-for="([arg, desc], idx) in help.explainedUsage"
					:key="idx"
					class="rounded-r-[0.625rem] border-l-3 border-(--home-blurple-soft) bg-primary/6 px-3.5 py-2.5"
				>
					<dt class="text-[0.8125rem] font-bold text-primary">{{ arg }}</dt>
					<dd
						class="text-[0.8125rem] text-toned"
						v-html="sanitizeAndFormat(resolveMultilineString(desc))"
					></dd>
				</div>
			</dl>
		</section>

		<section v-if="help.possibleFormats?.length" class="flex flex-col gap-2.5">
			<h3 class="text-[0.9375rem] font-bold text-highlighted">
				{{ ts("marketing.commands.possible_formats") }}
			</h3>
			<dl class="flex flex-col gap-2.5">
				<div
					v-for="([type, example], idx) in help.possibleFormats"
					:key="idx"
					class="rounded-r-[0.625rem] border-l-3 border-(--home-blurple-soft) bg-primary/6 px-3.5 py-2.5"
				>
					<dt class="text-[0.8125rem] font-bold text-primary">{{ type }}</dt>
					<dd class="text-[0.8125rem] text-toned">{{ example }}</dd>
				</div>
			</dl>
		</section>

		<section v-if="help.examples?.length" class="flex flex-col gap-2.5">
			<h3 class="text-[0.9375rem] font-bold text-highlighted">
				{{ ts("marketing.commands.examples") }}
			</h3>
			<ul class="flex flex-col gap-2.5">
				<li
					v-for="(example, idx) in help.examples"
					:key="idx"
					class="flex items-start gap-2.5 rounded-[0.625rem] border border-(--home-blurple-soft) bg-primary/5 px-3.5 py-3 font-mono text-[0.78125rem] text-highlighted"
				>
					<UIcon
						name="i-heroicons-chevron-right-20-solid"
						class="mt-0.5 size-3.5 shrink-0 text-primary"
						aria-hidden="true"
					/>
					<span>
						<span class="font-bold text-primary">WolfStar</span>,
						<span class="text-primary/80">{{ command.name }}</span
						><span v-if="example">{{ ` ${example}` }}</span>
					</span>
				</li>
			</ul>
		</section>

		<section v-if="help.reminder" class="flex flex-col gap-2.5">
			<h3 class="text-[0.9375rem] font-bold text-highlighted">
				{{ ts("marketing.commands.reminder") }}
			</h3>
			<div
				class="rounded-[0.625rem] border border-(--home-blurple-soft) bg-primary/5 px-4 py-3.5 text-[0.8125rem] leading-relaxed text-toned"
				v-html="sanitizeAndFormat(help.reminder)"
			></div>
		</section>

		<CommandChips :command />

		<p v-if="!hasDetails" class="text-[0.8125rem] text-muted italic">
			{{ ts("marketing.commands.no_details") }}
		</p>
	</article>
</template>

<script lang="ts" setup>
const { command } = defineProps<{
	command: FlattenedCommand;
}>();

const { ts } = useI18n();

const help = computed(() => command.extendedHelp);

/** Commands the bot documents with nothing but a description still get a line of context. */
const hasDetails = computed(
	() =>
		Boolean(
			help.value.usages?.length ||
			help.value.extendedHelp ||
			help.value.explainedUsage?.length ||
			help.value.possibleFormats?.length ||
			help.value.examples?.length ||
			help.value.reminder,
		) ||
		command.permissionLevel > 0 ||
		command.guarded,
);

/**
 * Normalize multiline/help values into a single string for template rendering.
 * - Arrays are joined with newlines.
 * - null/undefined -> ''
 * - If preserveNewlines is false, collapse newlines into a single space.
 */
function resolveMultilineString(str: string | string[], multiline = false): string {
	return Array.isArray(str)
		? resolveMultilineString(str.join(multiline ? "\n" : "\u200B"), multiline)
		: str
				.split("\n")
				.map((line) => line.trim())
				.join(multiline ? "\n\n" : " ");
}

/**
 * Escape HTML special characters to prevent XSS when using v-html.
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * Sanitize and format text with basic markdown support.
 * Escapes HTML entities first, then converts **bold**, *italic*, `code`,
 * and [links](url) to safe HTML.
 */
function sanitizeAndFormat(text: string): string {
	return (
		escapeHtml(text)
			// Bold
			.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
			// Italic
			.replace(/\*(.+?)\*/g, "<em>$1</em>")
			// Inline code
			.replace(
				/`(.+?)`/g,
				'<code class="rounded bg-base-content/8 px-1.5 py-0.5 font-mono text-[0.8125rem]">$1</code>',
			)
			// Links — only allow http(s) protocols to prevent javascript: injection
			.replace(
				/\[(.+?)\]\((https?:\/\/.+?)\)/g,
				'<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>',
			)
	);
}
</script>
