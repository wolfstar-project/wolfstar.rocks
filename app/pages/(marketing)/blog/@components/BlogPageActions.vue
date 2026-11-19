<template>
	<UFieldGroup>
		<UButton
			:label="ts('blog.copy_page')"
			:icon="pageCopied ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
			color="neutral"
			variant="soft"
			size="sm"
			:loading="copying"
			:ui="{ leadingIcon: 'size-3.5' }"
			@click="copyPage"
		/>
		<UDropdownMenu
			:items="items"
			size="sm"
			:content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
			:ui="{ content: 'w-52' }"
		>
			<UButton
				icon="i-lucide-chevron-down"
				:aria-label="ts('blog.copy_options')"
				color="neutral"
				variant="soft"
				size="sm"
				class="border-l border-muted pointer-coarse:size-11 pointer-coarse:justify-center"
				:ui="{ leadingIcon: 'size-3.5' }"
			/>
		</UDropdownMenu>
	</UFieldGroup>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { ts } = useI18n();
const route = useRoute();
const site = useSiteConfig();
const toast = useToast();
const { copy } = useClipboard();

// Every page is also served as Markdown at its own address plus `.md`.
const markdownPath = computed(() => `${route.path}.md`);
const markdownUrl = computed(() => `${site.url}${markdownPath.value}`);
const copying = ref(false);
const pageCopied = ref(false);
const { start: clearPageCopied } = useTimeoutFn(() => (pageCopied.value = false), 1500, {
	immediate: false,
});

/** What an assistant is asked when the post is opened in it. */
const question = computed(() =>
	encodeURIComponent(`Read ${markdownUrl.value} so I can ask questions about it.`),
);

/**
 * Safari only lets a page write to the clipboard while it handles the click,
 * and the Markdown arrives after it. A `ClipboardItem` takes the text as a
 * promise, so the write starts during the click and is filled in once the
 * Markdown is in. A browser without `ClipboardItem` gets the text after the
 * fetch, which it allows.
 */
async function writeMarkdown(markdown: Promise<string>) {
	if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
		const blob = markdown.then((text) => new Blob([text], { type: "text/plain" }));
		await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
		return;
	}
	await navigator.clipboard.writeText(await markdown);
}

async function copyPage() {
	copying.value = true;
	try {
		await writeMarkdown($fetch<string>(markdownPath.value, { responseType: "text" }));
		pageCopied.value = true;
		clearPageCopied();
		toast.add({ icon: "i-lucide-check-circle", title: ts("blog.copied") });
	} catch {
		toast.add({
			color: "error",
			description: ts("blog.copy_page_failed_description"),
			icon: "i-lucide-circle-x",
			title: ts("blog.copy_page_failed"),
		});
	} finally {
		copying.value = false;
	}
}

const items = computed<DropdownMenuItem[]>(() => [
	{
		icon: "i-lucide-link",
		label: ts("blog.copy_markdown_link"),
		onSelect: () => {
			void copy(markdownUrl.value, {
				icon: "i-lucide-check-circle",
				title: ts("blog.copied"),
			});
		},
	},
	{
		icon: "i-simple-icons-markdown",
		label: ts("blog.view_markdown"),
		target: "_blank",
		to: markdownPath.value,
	},
	{
		icon: "i-simple-icons-openai",
		label: ts("blog.open_in", { name: "ChatGPT" }),
		target: "_blank",
		to: `https://chatgpt.com/?hints=search&q=${question.value}`,
	},
	{
		icon: "i-simple-icons-anthropic",
		label: ts("blog.open_in", { name: "Claude" }),
		target: "_blank",
		to: `https://claude.ai/new?q=${question.value}`,
	},
]);
</script>
