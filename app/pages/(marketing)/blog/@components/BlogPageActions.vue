<template>
	<UFieldGroup>
		<UButton
			:label="ts('blog.copy_page')"
			:icon="copied ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
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
const { copy, copied } = useClipboard();

// Every page is also served as Markdown at its own address plus `.md`.
const markdownPath = computed(() => `${route.path}.md`);
const markdownUrl = computed(() => `${site.url}${markdownPath.value}`);
const copying = ref(false);

/** What an assistant is asked when the post is opened in it. */
const question = computed(() =>
	encodeURIComponent(`Read ${markdownUrl.value} so I can ask questions about it.`),
);

async function copyPage() {
	copying.value = true;
	try {
		await copy(await $fetch<string>(markdownPath.value, { responseType: "text" }), {
			icon: "i-lucide-check-circle",
			title: ts("blog.copied"),
		});
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
