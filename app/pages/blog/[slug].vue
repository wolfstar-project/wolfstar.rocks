<script setup lang="ts">
import { kebabCase } from "scule";

definePageMeta({
	heroBackground: "opacity-30 -z-10",
});

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

if (!article.value) {
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

function copyLink() {
	copy(`https://${getOrigin()}{article.value?.path || "/"}`, {
		title: "Link copied to clipboard",
		icon: "i-lucide-copy-check",
	});
}
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
							<!-- 		<UButton
								v-for="(link, index) in socialLinks"
								:key="index"
								v-bind="link"
								variant="ghost"
								color="neutral"
								target="_blank"
							>
								<span class="sr-only">Wolfstar on {{ link.label }}</span>
							</UButton> -->
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
								<Ads />
							</div>
						</template>
					</UContentToc>
				</template>
			</UPage>
		</UPage>
	</UContainer>
</template>
