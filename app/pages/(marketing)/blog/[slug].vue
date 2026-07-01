<template>
	<UContainer>
		<UPage v-if="article">
			<UPageHeader
				:title="article.title"
				:description="article.description"
				:ui="{ headline: 'flex flex-col gap-y-8 items-start' }"
			>
				<template #headline>
					<UBreadcrumb
						:items="[
							{ label: 'Blog', icon: 'i-lucide-newspaper', to: '/blog' },
							{ label: article.title },
						]"
						class="max-w-full"
					/>
					<div class="flex items-center space-x-2">
						<span>{{ article.category }}</span>
						<span class="text-muted"
							>&middot;&nbsp;&nbsp;<time>{{
								formatDateByLocale("en", article.date)
							}}</time></span
						>
					</div>
				</template>

				<div class="mt-4 flex flex-wrap items-center gap-6">
					<UUser
						v-for="(author, index) in article.authors"
						:key="index"
						v-bind="author"
						:description="
							author.to ? `@${author.to.split('/').pop()}` : author.description
						"
					/>
				</div>
			</UPageHeader>

			<UPage
				:ui="{ root: 'lg:grid-cols-12', center: 'lg:col-span-9', right: 'lg:col-span-3' }"
			>
				<UPageBody>
					<ContentRenderer v-if="article.body" :value="article" />

					<div class="not-prose mt-12 flex items-center justify-between">
						<ULink to="/blog" class="text-primary"> ← Back to blog </ULink>
						<div class="flex items-center justify-end gap-1.5">
							<UButton
								icon="i-lucide-link"
								variant="ghost"
								color="neutral"
								@click="copyLink"
							>
								<span class="sr-only">Copy URL</span>
								Copy URL
							</UButton>
							<UButton
								v-for="(link, index) in socialLinks"
								:key="index"
								v-bind="link"
								variant="ghost"
								color="neutral"
								target="_blank"
							>
								<span class="sr-only">WolfStar on {{ link.label }}</span>
							</UButton>
						</div>
					</div>

					<USeparator v-if="surround?.length" />

					<UContentSurround :surround="surround ?? undefined" />
				</UPageBody>

				<template #right>
					<UContentToc
						v-if="article.body?.toc"
						:links="article.body.toc.links"
						title="Table of Contents"
						aria-label="Table of contents"
						highlight
					>
						<template #bottom>
							<div class="hidden space-y-6 lg:block">
								<UPageLinks
									title="Links"
									:links="sidebarLinks"
									aria-label="Article links"
								/>
							</div>
						</template>
					</UContentToc>
				</template>
			</UPage>
		</UPage>
	</UContainer>
</template>

<script setup lang="ts">
import type { BlogArticle } from "#shared/types/blog";
import { kebabCase } from "scule";

const route = useRoute();
const site = useSiteConfig();
const { copy } = useClipboard();

const [{ data: article }, { data: surround }] = await Promise.all([
	useAsyncData(kebabCase(route.path), () => queryCollection("blog").path(route.path).first()),
	useAsyncData(`${kebabCase(route.path)}-surround`, () =>
		queryCollectionItemSurroundings("blog", route.path, { fields: ["description"] }).order(
			"date",
			"DESC",
		),
	),
]);

if (!article.value) {
	throw createError({ statusCode: 404, statusMessage: "Article not found", fatal: true });
}

const post = article.value as BlogArticle;
const title = post.title;
const description = post.description;

useSeoMeta({
	titleTemplate: "%s · WolfStar Blog",
	title,
	description,
	ogDescription: description,
	ogTitle: `${title} · WolfStar Blog`,
	...(post.image ? { ogImage: `${site.url}${post.image}` } : {}),
});

if (!post.image) {
	defineOgImage("Page", {
		title,
		description,
	});
}

function formatSocialIntentQueryText(handle: string | undefined): string {
	const credit = handle ? ` by @${handle}` : "";
	const body = `${post.title}${credit}`;
	const link = `${site.url}${post.path}`;
	return encodeURIComponent(`${body}\n\n${link}`);
}

const authorHandles = {
	twitter: post.authors?.[0]?.twitter,
};

const socialLinks = computed(() => [
	{
		label: "LinkedIn",
		icon: "i-simple-icons-linkedin",
		to: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${site.url}${post.path}`)}`,
	},
	{
		label: "X",
		icon: "i-simple-icons-x",
		to: `https://x.com/intent/tweet?text=${formatSocialIntentQueryText(authorHandles.twitter)}`,
	},
]);

function copyLink() {
	copy(`${site.url}${post.path}`, {
		title: "Link copied to clipboard",
		icon: "i-lucide-copy-check",
	});
}

const sidebarLinks = computed(() => {
	const links = [
		{
			icon: "i-lucide-star",
			label: "Star on GitHub",
			to: "https://github.com/wolfstar-project/wolfstar.rocks",
			target: "_blank",
		},
		{
			icon: "i-lucide-message-circle",
			label: "Join Support Server",
			to: "https://chat.wolfstar.rocks",
			target: "_blank",
		},
	];

	if (post.stem) {
		links.unshift({
			icon: "i-lucide-pen",
			label: "Edit this article",
			to: `https://github.com/wolfstar-project/wolfstar.rocks/edit/main/content/${post.stem}.md`,
			target: "_blank",
		});
	}

	return links;
});
</script>
