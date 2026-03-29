<script setup lang="ts">
import { isNullOrUndefined } from "@sapphire/utilities/isNullOrUndefined";
import { kebabCase } from "scule";

const route = useRoute();
const { copy } = useClipboard();

const [{ data: article }, { data: surround }] = await Promise.all([
	useAsyncData(kebabCase(route.path), () => queryCollection("blog").path(route.path).first()),
	useAsyncData(`${kebabCase(route.path)}-surround`, () => {
		return queryCollectionItemSurroundings("blog", route.path, {
			fields: ["description"],
		}).order("date", "DESC");
	}),
]);

if (isNullOrUndefined(article.value)) {
	throw createError({ statusCode: 404, statusMessage: "Article not found", fatal: true });
}

const title = article.value.seo?.title || article.value.title;
const description = article.value.seo?.description || article.value.description;

useSeoMeta({
	titleTemplate: "%s · Wolfstar Blog",
	title,
	description,
	ogDescription: description,
	ogTitle: `${title} · Wolfstar Blog`,
});

if (article.value.image) {
	defineOgImage({ url: article.value.image });
} else {
	defineOgImageComponent("Docs", {
		headline: "Blog",
		title,
		description,
	});
}

function formatSocialIntentQueryText(handle: string | undefined): string {
	const credit = handle ? ` by @${handle}` : "";
	const body = article.value!.title + credit;
	const link = `${getOrigin()}${article.value!.path}`;
	return encodeURIComponent(`${body}\n\n${link}`);
}

const authorHandles: { twitter?: string; bluesky?: string } = {
	twitter: article.value.authors?.[0]?.twitter,
	bluesky: article.value.authors?.[0]?.bluesky,
};

const socialLinks = computed(() =>
	!article.value
		? []
		: [
				{
					label: "Bluesky",
					icon: "i-simple-icons-bluesky",
					to: `https://bsky.app/intent/compose?text=${formatSocialIntentQueryText(authorHandles.bluesky)}`,
				},
				{
					label: "X",
					icon: "i-simple-icons-x",
					to: `https://x.com/intent/tweet?text=${formatSocialIntentQueryText(authorHandles.twitter)}`,
				},
			],
);

function copyLink() {
	copy(`${getOrigin()}${article.value?.path || "/"}`, {
		title: "Link copied to clipboard",
		icon: "i-lucide-copy-check",
	});
}

const links = [
	{
		icon: "i-lucide-pen",
		label: "Edit this article",
		to: `https://github.com/wolfstar-project/wolfstar.rocks/edit/main/content/${article.value.stem}.md`,
		target: "_blank",
	},
	{
		icon: "i-lucide-star",
		label: "Star on GitHub",
		to: "https://github.com/wolfstar-project/wolfstar.rocks",
		target: "_blank",
	},
];
</script>

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
						<span>
							{{ article.category }}
						</span>
						<span class="text-muted"
							>&middot;&nbsp;&nbsp;<time>{{
								new Date(article.date).toLocaleDateString("en", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})
							}}</time></span
						>
					</div>
				</template>

				<div class="mt-4 flex flex-wrap items-center gap-6">
					<UUser
						v-for="(author, index) in article.authors"
						:key="index"
						v-bind="author"
						:description="author.to ? `@${author.to.split('/').pop()}` : undefined"
					/>
				</div>
			</UPageHeader>

			<UPage class="lg:gap-24">
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
								<span class="sr-only">Wolfstar on {{ link.label }}</span>
							</UButton>
						</div>
					</div>

					<USeparator v-if="surround?.length" />

					<UContentSurround :surround="surround" />
				</UPageBody>

				<template #right>
					<UContentToc
						v-if="article.body && article.body.toc"
						:links="article.body.toc.links"
						title="Table of Contents"
						highlight
					>
						<template #bottom>
							<div class="hidden space-y-6 lg:block">
								<UPageLinks title="Links" :links="links" />
								<USeparator type="dashed" />
								<SocialLinks />
							</div>
						</template>
					</UContentToc>
				</template>
			</UPage>
		</UPage>
	</UContainer>
</template>
