<template>
	<UPage v-if="post">
		<UPageHeader :title="post.title" :description="post.description">
			<template #headline>
				<time class="text-muted">{{
					new Date(post.date).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})
				}}</time>
				<span class="text-muted"> · {{ post.author }}</span>
			</template>
		</UPageHeader>
		<UPageBody>
			<UPageColumns>
				<div class="prose max-w-none dark:prose-invert">
					<ContentRenderer :value="post" />
				</div>
				<template #right>
					<UContentToc :links="post.body?.toc?.links" class="sticky top-24" />
				</template>
			</UPageColumns>
			<USeparator class="my-8" />
			<UContentSurround :surround="surround ?? undefined" />
			<NuxtLink
				to="/blog"
				class="mt-4 inline-flex items-center gap-1 text-sm text-muted hover:text-primary"
			>
				<UIcon name="i-lucide-arrow-left" class="size-4" /> Back to Blog
			</NuxtLink>
		</UPageBody>
	</UPage>
</template>

<script setup lang="ts">
const route = useRoute();

const [post, surround] = await Promise.all([
	queryCollection("blog").path(route.path).first(),
	queryCollectionItemSurroundings("blog", route.path, { fields: ["description"] }).order(
		"date",
		"DESC",
	),
]);

if (!post) {
	throw createError({ statusCode: 404, statusMessage: "Post not found" });
}

useSeoMeta({
	title: post.title,
	description: post.description,
	ogTitle: post.title,
	ogDescription: post.description,
});

defineOgImage("Page", { title: post.title, description: post.description });
</script>
