<template>
	<article
		class="space-y-8 card-glass rounded-2xl hover-border-glow p-6 transition-all"
		aria-label="Command details"
	>
		<!-- Loading Skeleton -->
		<template v-if="loading">
			<!-- Command Usage Skeleton -->
			<section class="space-y-3">
				<div class="flex items-center gap-2">
					<USkeleton class="h-5 w-5" />
					<USkeleton class="h-6 w-32" />
				</div>
				<div class="space-y-2">
					<USkeleton class="h-12 w-full" />
					<USkeleton class="h-12 w-3/4" />
				</div>
			</section>

			<!-- Extended Help Skeleton -->
			<section class="space-y-3">
				<div class="flex items-center gap-2">
					<USkeleton class="h-5 w-5" />
					<USkeleton class="h-6 w-36" />
				</div>
				<div class="space-y-2">
					<USkeleton class="h-4 w-full" />
					<USkeleton class="h-4 w-full" />
					<USkeleton class="h-4 w-2/3" />
				</div>
			</section>

			<!-- Explained Usage Skeleton -->
			<section class="space-y-3">
				<div class="flex items-center gap-2">
					<USkeleton class="h-5 w-5" />
					<USkeleton class="h-6 w-40" />
				</div>
				<div class="space-y-2">
					<USkeleton class="h-5 w-full" />
					<USkeleton class="h-5 w-5/6" />
					<USkeleton class="h-5 w-4/5" />
				</div>
			</section>

			<!-- Examples Skeleton -->
			<section class="space-y-3">
				<div class="flex items-center gap-2">
					<USkeleton class="h-5 w-5" />
					<USkeleton class="h-6 w-28" />
				</div>
				<div class="space-y-2">
					<USkeleton class="h-5 w-full" />
					<USkeleton class="h-5 w-3/4" />
				</div>
			</section>

			<!-- Chips Skeleton -->
			<div class="flex flex-wrap gap-2">
				<USkeleton class="h-7 w-20" />
				<USkeleton class="h-7 w-24" />
				<USkeleton class="h-7 w-16" />
			</div>
		</template>

		<!-- Actual Content -->
		<template v-else>
			<!-- Command Usage -->
			<section v-if="command.extendedHelp.usages?.length" class="space-y-4">
				<h3 class="flex items-center gap-3 text-lg font-bold">
					<div class="flex size-8 items-center justify-center rounded-full bg-primary/30">
						<UIcon
							name="i-heroicons-pencil-square"
							class="size-5 text-primary"
							aria-hidden="true"
						/>
					</div>
					<span>Command Usage</span>
				</h3>
				<div class="space-y-2" role="list" aria-label="Command usage examples">
					<code
						v-for="(usage, idx) in command.extendedHelp.usages"
						:key="idx"
						role="listitem"
						class="block hover-lift card-glass rounded-xl border border-gray-700/50 bg-gray-800/70 px-5 py-4 font-mono text-sm text-gray-100 transition-all dark:border-gray-800/50 dark:bg-gray-900/70 dark:text-gray-200"
					>
						<span class="text-primary-400">WolfStar</span>,
						<span class="text-blue-300">{{ command.name }}</span>
						<span class="text-gray-300">{{ usage }}</span>
					</code>
				</div>
			</section>

			<!-- Extended Help -->
			<section v-if="command.extendedHelp.extendedHelp" class="space-y-4">
				<h3 class="flex items-center gap-3 text-lg font-bold">
					<div
						class="flex size-8 items-center justify-center rounded-full bg-blue-500/30"
					>
						<UIcon
							name="i-heroicons-question-mark-circle"
							class="size-5 text-blue-500"
							aria-hidden="true"
						/>
					</div>
					<span>Extended Help</span>
				</h3>
				<div
					class="card-glass rounded-xl border border-base-300/50 bg-base-200/30 px-5 py-4 dark:border-base-content/10 dark:bg-base-300/30"
				>
					<div class="prose max-w-none dark:prose-invert prose-p:leading-relaxed">
						<div
							class="text-base leading-7 whitespace-pre-line"
							v-html="
								sanitizeAndFormat(
									resolveMultilineString(command.extendedHelp.extendedHelp, true),
								)
							"
						></div>
					</div>
				</div>
			</section>

			<!-- Explained Usage -->
			<section v-if="command.extendedHelp.explainedUsage?.length" class="space-y-4">
				<h3 class="flex items-center gap-3 text-lg font-bold">
					<div
						class="flex size-8 items-center justify-center rounded-full bg-purple-500/30"
					>
						<UIcon
							name="i-heroicons-code-bracket"
							class="size-5 text-purple-500"
							aria-hidden="true"
						/>
					</div>
					<span>Explained Usage</span>
				</h3>
				<dl class="space-y-3">
					<div
						v-for="([arg, desc], idx) in command.extendedHelp.explainedUsage"
						:key="idx"
						class="hover-lift card-glass rounded-r-xl border-l-4 border-purple-500/70 bg-purple-50/50 py-3 pr-4 pl-5 transition-all dark:bg-purple-950/30"
					>
						<dt
							class="mb-1 text-base font-semibold text-purple-600 dark:text-purple-400"
						>
							{{ arg }}
						</dt>
						<dd
							class="prose max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-300 dark:prose-invert prose-p:m-0"
						>
							<div v-html="sanitizeAndFormat(resolveMultilineString(desc))"></div>
						</dd>
					</div>
				</dl>
			</section>

			<!-- Possible Formats -->
			<section v-if="command.extendedHelp.possibleFormats?.length" class="space-y-4">
				<h3 class="flex items-center gap-3 text-lg font-bold">
					<div
						class="flex size-8 items-center justify-center rounded-full bg-pink-500/30"
					>
						<UIcon
							name="i-heroicons-paint-brush"
							class="size-5 text-pink-500"
							aria-hidden="true"
						/>
					</div>
					<span>Possible Formats</span>
				</h3>
				<dl class="space-y-3">
					<div
						v-for="([type, example], idx) in command.extendedHelp.possibleFormats"
						:key="idx"
						class="hover-lift card-glass rounded-r-xl border-l-4 border-pink-500/70 bg-pink-50/50 py-3 pr-4 pl-5 transition-all dark:bg-pink-950/30"
					>
						<dt class="mb-1 text-base font-semibold text-pink-600 dark:text-pink-400">
							{{ type }}
						</dt>
						<dd class="text-sm text-gray-700 dark:text-gray-300">
							{{ example }}
						</dd>
					</div>
				</dl>
			</section>

			<!-- Examples -->
			<section v-if="command.extendedHelp.examples?.length" class="space-y-4">
				<h3 class="flex items-center gap-3 text-lg font-bold">
					<div
						class="flex size-8 items-center justify-center rounded-full bg-yellow-500/30"
					>
						<UIcon
							name="i-heroicons-light-bulb"
							class="size-5 text-yellow-500"
							aria-hidden="true"
						/>
					</div>
					<span>Examples</span>
				</h3>
				<ul class="space-y-2" aria-label="Command examples">
					<li
						v-for="(example, idx) in command.extendedHelp.examples"
						:key="idx"
						class="flex hover-lift items-start gap-3 card-glass rounded-xl border border-yellow-200/50 bg-yellow-50/70 p-4 text-sm transition-all dark:border-yellow-800/50 dark:bg-yellow-900/30"
					>
						<UIcon
							name="i-heroicons-arrow-right"
							class="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-500"
							aria-hidden="true"
						/>
						<span class="font-mono">
							<span class="font-semibold text-primary-600 dark:text-primary-400"
								>WolfStar</span
							>,
							<span class="text-blue-600 dark:text-blue-400">{{ command.name }}</span
							><span v-if="example">{{ ` ${example}` }}</span>
						</span>
					</li>
				</ul>
			</section>

			<!-- Reminder -->
			<section v-if="command.extendedHelp.reminder" class="space-y-4">
				<h3 class="flex items-center gap-3 text-lg font-bold">
					<div
						class="flex size-8 items-center justify-center rounded-full bg-orange-500/30"
					>
						<UIcon
							name="i-heroicons-bell-alert"
							class="size-5 text-orange-500"
							aria-hidden="true"
						/>
					</div>
					<span>Reminder</span>
				</h3>
				<div
					class="hover-lift card-glass rounded-xl border border-orange-200/50 bg-orange-50/70 p-5 transition-all dark:border-orange-800/50 dark:bg-orange-900/30"
				>
					<div
						class="prose max-w-none text-sm leading-relaxed text-orange-900 dark:text-orange-200 dark:prose-invert prose-p:m-0"
						v-html="sanitizeAndFormat(command.extendedHelp.reminder)"
					></div>
				</div>
			</section>

			<!-- Chips/Tags -->
			<CommandChips :command />
		</template>
	</article>
</template>

<script lang="ts" setup>
import type { FlattenedCommand } from "#shared/types";

const { command, loading } = defineProps<{
	command: FlattenedCommand;
	loading?: boolean;
}>();

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
				'<code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono">$1</code>',
			)
			// Links — only allow http(s) protocols to prevent javascript: injection
			.replace(
				/\[(.+?)\]\((https?:\/\/.+?)\)/g,
				'<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">$1</a>',
			)
	);
}
</script>
