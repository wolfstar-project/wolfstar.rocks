<template>
	<UContainer>
		<UPage
			v-if="article"
			:ui="{ root: 'lg:grid-cols-12', center: 'lg:col-span-9', right: 'lg:col-span-3' }"
		>
			<UPageHeader
				:title="article.title"
				:description="article.description"
				:ui="{ headline: 'flex flex-col gap-y-8 items-start' }"
			>
				<template #headline>
					<UBreadcrumb
						:items="[
							{ label: ts('nav.blog'), icon: 'i-lucide-newspaper', to: '/blog' },
							{ label: article.title },
						]"
						class="max-w-full"
					/>
					<div class="flex items-center space-x-2">
						<span>{{ article.category }}</span>
						<span class="text-muted"
							>&middot;&nbsp;&nbsp;<time>{{
								formatDateByLocale(locale, article.date)
							}}</time></span
						>
					</div>
				</template>

				<div class="mt-4 flex flex-wrap items-center gap-6">
					<UUser
						v-for="(author, index) in article.authors"
						:key="index"
						v-bind="author"
						size="sm"
						:description="
							author.to ? `@${author.to.split('/').pop()}` : author.description
						"
					/>
				</div>
			</UPageHeader>

			<UPageBody>
				<ContentRenderer v-if="article.body" :value="article" />

				<div class="not-prose mt-12 flex items-center justify-between">
					<ULink to="/blog" class="text-primary">← {{ ts("blog.back") }}</ULink>
					<UFieldGroup class="justify-end">
						<UButton
							icon="i-lucide-link"
							variant="ghost"
							color="neutral"
							@click="copyLink"
						>
							{{ ts("blog.copy_url") }}
						</UButton>
						<UButton
							v-for="(link, index) in socialLinks"
							:key="index"
							v-bind="link"
							variant="ghost"
							color="neutral"
							target="_blank"
						>
							<span class="sr-only">{{
								ts("blog.on_platform", { platform: link.label })
							}}</span>
						</UButton>
					</UFieldGroup>
				</div>

				<USeparator v-if="surround?.length" />

				<UContentSurround :surround="surround ?? undefined" />
			</UPageBody>

			<template #right>
				<UContentToc
					v-if="article.body?.toc"
					:links="article.body.toc.links"
					:title="ts('blog.toc')"
					:aria-label="ts('blog.toc')"
					highlight
				>
					<template #bottom>
						<div class="hidden space-y-6 lg:block">
							<UPageLinks
								:title="ts('blog.links')"
								:links="sidebarLinks"
								:aria-label="ts('blog.article_links')"
							/>
						</div>
					</template>
				</UContentToc>
			</template>
		</UPage>
	</UContainer>
</template>

<script setup lang="ts">
import type { BlogArticle } from "#shared/types/blog";
import { kebabCase } from "scule";

const { ts } = useI18n();
const { locale } = useAppLocale();
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
	defineOgImage("ImageBlogPost", {
		title,
		description,
		date: post.date,
		authors: post.authors.map((author) => ({
			name: author.name,
			avatar: author.avatar?.src,
		})),
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
		title: ts("blog.link_copied"),
		icon: "i-lucide-copy-check",
	});
}

const sidebarLinks = computed(() => {
	const links = [
		{
			icon: "i-lucide-star",
			label: ts("blog.star_github"),
			to: "https://github.com/wolfstar-project/wolfstar.rocks",
			target: "_blank",
		},
		{
			icon: "i-lucide-message-circle",
			label: ts("blog.join_support"),
			to: "https://chat.wolfstar.rocks",
			target: "_blank",
		},
	];

	if (post.stem) {
		links.unshift({
			icon: "i-lucide-pen",
			label: ts("blog.edit_article"),
			to: `https://github.com/wolfstar-project/wolfstar.rocks/edit/main/content/${post.stem}.md`,
			target: "_blank",
		});
	}

	return links;
});
</script>
