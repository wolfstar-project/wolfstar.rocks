<template>
  <article class="p-6 space-y-8 bg-base-50 dark:bg-base-900/20 rounded-lg" aria-label="Command details">
    <!-- Loading Skeleton -->
    <template v-if="loading">
      <!-- Command Usage Skeleton -->
      <section class="space-y-3">
        <div class="flex items-center gap-2">
          <USkeleton class="w-5 h-5" />
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
          <USkeleton class="w-5 h-5" />
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
          <USkeleton class="w-5 h-5" />
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
          <USkeleton class="w-5 h-5" />
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
      <section v-if="command.extendedHelp.usages?.length" class="space-y-3">
        <h3 class="flex items-center gap-3 text-lg font-semibold">
          <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 text-primary-500" aria-hidden="true" />
          <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
          <span>Command Usage</span>
        </h3>
        <div class="space-y-2" role="list" aria-label="Command usage examples">
          <code
            v-for="(usage, idx) in command.extendedHelp.usages"
            :key="idx"
            role="listitem"
            class="block bg-gray-800 dark:bg-gray-900 text-gray-100 dark:text-gray-200 px-4 py-3 rounded-lg text-sm font-mono border border-gray-700 dark:border-gray-800 shadow-sm"
          >
            <span class="text-primary-400">WolfStar</span>, <span class="text-blue-300">{{ command.name }}</span> <span class="text-gray-300">{{ usage }}</span>
          </code>
        </div>
      </section>

      <!-- Extended Help -->
      <section v-if="command.extendedHelp.extendedHelp" class="space-y-3">
        <h3 class="flex items-center gap-3 text-lg font-semibold">
          <UIcon name="i-heroicons-question-mark-circle" class="w-5 h-5 text-blue-500" aria-hidden="true" />
          <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
          <span>Extended Help</span>
        </h3>
        <div class="prose dark:prose-invert max-w-none prose-p:leading-relaxed">
          <div class="whitespace-pre-line text-base leading-7" v-html="sanitizeAndFormat(resolveMultilineString(command.extendedHelp.extendedHelp, true))"></div>
        </div>
      </section>

      <!-- Explained Usage -->
      <section v-if="command.extendedHelp.explainedUsage?.length" class="space-y-3">
        <h3 class="flex items-center gap-3 text-lg font-semibold">
          <UIcon name="i-heroicons-code-bracket" class="w-5 h-5 text-purple-500" aria-hidden="true" />
          <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
          <span>Explained Usage</span>
        </h3>
        <dl class="space-y-3">
          <div
            v-for="([arg, desc], idx) in command.extendedHelp.explainedUsage"
            :key="idx"
            class="border-l-4 border-purple-500/30 pl-4 py-2 bg-base-100 dark:bg-base-800/30 rounded-r"
          >
            <dt class="font-semibold text-base mb-1 text-purple-600 dark:text-purple-400">
              {{ arg }}
            </dt>
            <dd class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none prose-p:m-0">
              <div v-html="sanitizeAndFormat(resolveMultilineString(desc))"></div>
            </dd>
          </div>
        </dl>
      </section>

      <!-- Possible Formats -->
      <section v-if="command.extendedHelp.possibleFormats?.length" class="space-y-3">
        <h3 class="flex items-center gap-3 text-lg font-semibold">
          <UIcon name="i-heroicons-paint-brush" class="w-5 h-5 text-pink-500" aria-hidden="true" />
          <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
          <span>Possible Formats</span>
        </h3>
        <dl class="space-y-3">
          <div
            v-for="([type, example], idx) in command.extendedHelp.possibleFormats"
            :key="idx"
            class="border-l-4 border-pink-500/30 pl-4 py-2 bg-base-100 dark:bg-base-800/30 rounded-r"
          >
            <dt class="font-semibold text-base mb-1 text-pink-600 dark:text-pink-400">
              {{ type }}
            </dt>
            <dd class="text-sm text-gray-700 dark:text-gray-300">
              {{ example }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- Examples -->
      <section v-if="command.extendedHelp.examples?.length" class="space-y-3">
        <h3 class="flex items-center gap-3 text-lg font-semibold">
          <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-yellow-500" aria-hidden="true" />
          <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
          <span>Examples</span>
        </h3>
        <ul class="space-y-2" aria-label="Command examples">
          <li
            v-for="(example, idx) in command.extendedHelp.examples"
            :key="idx"
            class="flex items-start gap-2 text-sm bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800/30"
          >
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-500 shrink-0" aria-hidden="true" />
            <span class="font-mono">
              <span class="text-primary-600 dark:text-primary-400 font-semibold">WolfStar</span>, <span class="text-blue-600 dark:text-blue-400">{{ command.name }}</span><span v-if="example"> {{ example }}</span>
            </span>
          </li>
        </ul>
      </section>

      <!-- Reminder -->
      <section v-if="command.extendedHelp.reminder" class="space-y-3">
        <h3 class="flex items-center gap-3 text-lg font-semibold">
          <UIcon name="i-heroicons-bell-alert" class="w-5 h-5 text-orange-500" aria-hidden="true" />
          <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
          <span>Reminder</span>
        </h3>
        <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 rounded-lg p-4">
          <div class="text-sm text-orange-900 dark:text-orange-200 leading-relaxed prose dark:prose-invert max-w-none prose-p:m-0" v-html="sanitizeAndFormat(command.extendedHelp.reminder)"></div>
        </div>
      </section>

      <!-- Chips/Tags -->
      <CommandChips :command />
    </template>
  </article>
</template>

<script lang="ts" setup>
import type { FlattenedCommand } from "#shared/types/discord";

defineProps<{
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
 * Sanitize and format text with basic markdown support
 * Converts **bold**, *italic*, `code`, and [links](url) to HTML
 */
function sanitizeAndFormat(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`(.+?)`/g, "<code class=\"px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono\">$1</code>")
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-primary-600 dark:text-primary-400 hover:underline\">$1</a>");
}
</script>
